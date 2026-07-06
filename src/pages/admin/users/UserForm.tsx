import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    CircularProgress,
    MenuItem,
    Autocomplete,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import api from "../../../services/api";
import { toast } from "sonner";

const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().optional(),
    role: z.enum(["ADMIN", "USER"]),
    warehouseId: z.coerce.number().optional().nullable(),
}).superRefine((data, ctx) => {
    if (data.role === 'USER' && !data.warehouseId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Warehouse is required for USER role",
            path: ["warehouseId"]
        });
    }
});

type UserFormValues = z.infer<typeof userSchema>;

const UserForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = id !== "new" && id !== undefined;

    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "USER",
            warehouseId: null,
        },
    });

    const role = watch("role");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [warehouseRes] = await Promise.all([
                    api.get("/warehouse"),
                ]);

                if (warehouseRes.data.success) {
                    setWarehouses(warehouseRes.data.data);
                }

                if (isEditMode) {
                    const userRes = await api.get(`/users/${id}`);
                    if (userRes.data.success) {
                        const user = userRes.data.data;
                        reset({
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            warehouseId: user.warehouseId || null,
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load form data", error);
                toast.error("Failed to load data");
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [id, isEditMode, reset]);

    const onSubmit = async (data: UserFormValues) => {
        setSubmitting(true);
        try {
            const payload = { ...data };
            if (role === "ADMIN") {
                payload.warehouseId = null; // Admins don't need a warehouse
            }
            if (isEditMode && !payload.password) {
                delete payload.password; // Don't send empty password if editing
            }

            if (isEditMode) {
                await api.put(`/users/${id}`, payload);
                toast.success("User updated successfully");
            } else {
                await api.post("/users", payload);
                toast.success("User created successfully");
            }
            navigate("/admin/users");
        } catch (error: any) {
            console.error("Submission error", error);
            const msg = error.response?.data?.message || "Failed to save user";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 4, gap: 2 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/admin/users")}
                    color="inherit"
                    sx={{ borderRadius: 2 }}
                >
                    Back
                </Button>
                <Box>
                    <Typography variant="h4" fontWeight="700" color="primary.main">
                        {isEditMode ? "Edit User" : "Add New User"}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {isEditMode
                            ? "Update user details and access rights."
                            : "Create a new user and assign a warehouse."}
                    </Typography>
                </Box>
            </Box>

            <Paper
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                }}
            >
                <TextField
                    label="Name"
                    fullWidth
                    {...register("name")}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                />

                <TextField
                    label="Email"
                    fullWidth
                    type="email"
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                />

                <TextField
                    label="Password"
                    fullWidth
                    type="password"
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message || (isEditMode ? "Leave blank to keep current password" : "")}
                    placeholder={isEditMode ? "********" : ""}
                />

                <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            select
                            label="Role"
                            fullWidth
                            error={!!errors.role}
                            helperText={errors.role?.message}
                        >
                            <MenuItem value="ADMIN">Admin</MenuItem>
                            <MenuItem value="USER">Warehouse User</MenuItem>
                        </TextField>
                    )}
                />

                {role === "USER" && (
                    <Controller
                        name="warehouseId"
                        control={control}
                        render={({ field: { onChange, value, ref } }) => {
                            const selectedItem = warehouses?.find((item) => item.id === (value ? Number(value) : null)) || null;

                            return (
                                <Autocomplete
                                    options={warehouses}
                                    getOptionLabel={(option) => `${option.warehouseName}`}
                                    value={selectedItem}
                                    onChange={(_, newValue) => {
                                        onChange(newValue ? newValue.id : null);
                                    }}
                                    isOptionEqualToValue={(option, value) => option.id === value?.id}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Warehouse"
                                            error={!!errors.warehouseId}
                                            helperText={errors.warehouseId?.message}
                                            inputRef={ref}
                                        />
                                    )}
                                />
                            );
                        }}
                    />
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={() => navigate("/admin/users")}
                        sx={{ borderRadius: 2 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : "Save User"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default UserForm;
