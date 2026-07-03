import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    CircularProgress,
    FormControlLabel,
    Switch,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import api from "../../../services/api";
import { toast } from "sonner";

const itemSchema = z.object({
    itemCode: z.string().min(1, "Item Code is required"),
    itemName: z.string().min(1, "Item Name is required"),
    bottlePerCase: z.coerce.number().min(1, "Must be at least 1"),
    isActive: z.boolean().default(true),
});

type ItemFormValues = z.infer<typeof itemSchema>;

const MasterItemForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = id !== "new" && id !== undefined;

    const [loadingData, setLoadingData] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ItemFormValues>({
        resolver: zodResolver(itemSchema) as any,
        defaultValues: {
            isActive: true,
        }
    });

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const response = await api.get(`/master-item/${id}`);
                if (response.data.success) {
                    reset(response.data.data);
                }
            } catch (error) {
                console.error("Error fetching item", error);
                toast.error("Failed to load item details.");
                navigate("/admin/master-items");
            } finally {
                setLoadingData(false);
            }
        };

        if (isEditMode) {
            fetchItem();
        }
    }, [id, isEditMode, reset, navigate]);

    const onSubmit = async (data: ItemFormValues) => {
        setSubmitting(true);
        try {
            if (isEditMode) {
                await api.put(`/master-item/${id}`, data);
                toast.success("Item updated successfully");
            } else {
                await api.post("/master-item", data);
                toast.success("Item created successfully");
            }
            navigate("/admin/master-items");
        } catch (error: any) {
            console.error("Error saving item", error);
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
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate("/admin/master-items")}
                sx={{ mb: 3 }}
            >
                Back to Master Items
            </Button>

            <Paper elevation={0} sx={{ p: 4, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {isEditMode ? "Edit Master Item" : "Create Master Item"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    {isEditMode
                        ? "Update the details for this inventory item below."
                        : "Fill out the details below to add a new item to the master inventory list."}
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, mb: 3 }}>
                        <TextField
                            required
                            fullWidth
                            id="itemCode"
                            label="Item Code"
                            disabled={isEditMode} // Usually item code shouldn't be changed, but up to requirements
                            {...register("itemCode")}
                            error={!!errors.itemCode}
                            helperText={errors.itemCode?.message}
                        />
                        <TextField
                            required
                            fullWidth
                            id="itemName"
                            label="Item Name"
                            {...register("itemName")}
                            error={!!errors.itemName}
                            helperText={errors.itemName?.message}
                        />
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, mb: 4, alignItems: "center" }}>
                        <TextField
                            required
                            fullWidth
                            id="bottlePerCase"
                            label="Bottles Per Case"
                            type="number"
                            {...register("bottlePerCase")}
                            error={!!errors.bottlePerCase}
                            helperText={errors.bottlePerCase?.message}
                        />
                        <Box sx={{ fullWidth: true, flexGrow: 1, pl: 2 }}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        color="primary"
                                        {...register("isActive")}
                                        defaultChecked={!isEditMode || true}
                                    />
                                }
                                label="Active Status"
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => navigate("/admin/master-items")}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting}
                            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {isEditMode ? "Save Changes" : "Create Item"}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default MasterItemForm;
