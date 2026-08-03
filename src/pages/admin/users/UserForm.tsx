import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    CircularProgress,
    MenuItem,
    Autocomplete,
    Backdrop,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import api from "../../../services/api";
import { toast } from "sonner";
import { userFormSchema, type UserFormValues } from "../../../zod";

const UserForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = id !== "new" && id !== undefined;

    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [mailLoading, setMailLoading] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors },
    } = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema) as any,
        defaultValues: {
            fullName: "",
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
                            fullName: user.fullName,
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
                setMailLoading(true);
                await api.put(`/users/${id}`, payload);
                toast.success("User updated successfully");
            } else {
                setMailLoading(true);
                await api.post("/invitations/invite", {
                    email: payload.email,
                    fullName: payload.fullName,
                    role: payload.role,
                    warehouseId: payload.warehouseId || undefined,
                });
                toast.success("User created and invitation email sent successfully!");
            }
            setMailLoading(false);
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
        <Box sx={{ maxWidth: 800, mx: "auto", position: "relative" }}>

            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: "rgba(0, 0, 0, 0.7)",
                }}
                open={mailLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
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
                    <Typography variant="h4" sx={{ fontWeight: "bold" }} color="primary.main">
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
                    label="Full Name"
                    fullWidth
                    {...register("fullName")}
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                />

                <TextField
                    label="Email"
                    fullWidth
                    type="email"
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                />

                {isEditMode && (
                    <TextField
                        label="Password"
                        fullWidth
                        type="password"
                        {...register("password")}
                        error={!!errors.password}
                        helperText={errors.password?.message || "Leave blank to keep current password"}
                        placeholder="********"
                    />
                )}


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
