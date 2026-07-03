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
import type { MasterItem } from "../master-items/MasterItemsList";

// Fetch warehouses from the backend



const stockSchema = z.object({
    warehouseId: z.coerce.number().min(1, "Warehouse is required"),
    itemId: z.coerce.number().min(1, "Item is required"),
    openingCases: z.coerce.number().min(0, "Cannot be negative"),
    openingBottles: z.coerce.number().min(0, "Cannot be negative"),
});

type StockFormValues = z.infer<typeof stockSchema>;

const InitialStockForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = id !== "new" && id !== undefined;

    const [warehouselist, setWarehouseList] = useState()


    const fetchWarehouses = async () => {
        const response = await api.get("/warehouse");
        if (response.data.success) {
            setWarehouseList(response.data.data);
        }
        return [];
    }

    useEffect(() => {
        console.log(fetchWarehouses())
    }, [])

    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [masterItems, setMasterItems] = useState<MasterItem[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<StockFormValues>({
        resolver: zodResolver(stockSchema),
        defaultValues: {
            openingCases: 0,
            openingBottles: 0,
            warehouseId: "", // Let user select
            itemId: "", // Let user select
        } as any
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch Master Items for dropdown
                const itemsResponse = await api.get("/master-item");
                if (itemsResponse.data.success) {
                    setMasterItems(itemsResponse.data.data.filter((item: MasterItem) => item.isActive));
                }

                // If edit mode, fetch the specific stock entry
                if (isEditMode) {
                    // There isn't a getById for initial stock in controller out of the box...
                    // Wait, let's fetch all and find it, or if it doesn't exist, we just fail gracefully.
                    // The backend does not have getById for initial-stock! (Checked controller earlier).
                    // We will fetch getAll and filter.
                    const stockResponse = await api.get("/initial-stock");
                    if (stockResponse.data.success) {
                        const stock = stockResponse.data.data.find((s: any) => s.id === Number(id));
                        if (stock) {
                            reset({
                                warehouseId: stock.warehouseId,
                                itemId: stock.itemId,
                                openingCases: stock.openingCases,
                                openingBottles: stock.openingBottles,
                            });
                        } else {
                            toast.error("Stock entry not found.");
                            navigate("/admin/initial-stock");
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading data", error);
                toast.error("Failed to load necessary data.");
            } finally {
                setLoadingData(false);
            }
        };

        loadInitialData();
    }, [id, isEditMode, reset, navigate]);

    const onSubmit = async (data: StockFormValues) => {
        setSubmitting(true);
        try {
            if (isEditMode) {
                await api.put(`/initial-stock/${id}`, data);
                toast.success("Initial stock updated successfully");
            } else {
                await api.post("/initial-stock", data);
                toast.success("Initial stock created successfully");
            }
            navigate("/admin/initial-stock");
        } catch (error: any) {
            console.error("Error saving stock", error);
            // Error toast is handled by api interceptor
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
                onClick={() => navigate("/admin/initial-stock")}
                sx={{ mb: 3 }}
            >
                Back to Initial Stock
            </Button>

            <Paper elevation={0} sx={{ p: 4, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {isEditMode ? "Edit Initial Stock" : "Create Initial Stock"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    {isEditMode
                        ? "Update the opening cases and bottles for this warehouse entry."
                        : "Initialize the stock levels for a specific warehouse and item."}
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, mb: 3 }}>
                        <Controller
                            name="warehouseId"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) => {
                                const selectedItem = warehouselist?.find((item) => item.id === (value ? Number(value) : null)) || null;
                                return (
                                    <Autocomplete
                                        options={warehouselist}
                                        getOptionLabel={(option) => `${option.warehouseName}`}
                                        value={selectedItem}
                                        onChange={(_, newValue) => {
                                            onChange(newValue ? newValue.id : "");
                                        }}
                                        disabled={isEditMode}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                required
                                                label="Warehouse"
                                                error={!!error}
                                                helperText={error?.message}
                                            />
                                        )}
                                        fullWidth
                                    />
                                );
                            }}
                        />

                        <Controller
                            name="itemId"
                            control={control}
                            render={({ field: { onChange, value }, fieldState: { error } }) => {
                                const selectedItem = masterItems.find((item) => item.id === (value ? Number(value) : null)) || null;
                                return (
                                    <Autocomplete
                                        options={masterItems}
                                        getOptionLabel={(option) => `${option.itemName} (${option.itemCode})`}
                                        value={selectedItem}
                                        onChange={(_, newValue) => {
                                            onChange(newValue ? newValue.id : "");
                                        }}
                                        disabled={isEditMode}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                required
                                                label="Master Item"
                                                error={!!error}
                                                helperText={error?.message}
                                            />
                                        )}
                                        fullWidth
                                    />
                                );
                            }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 3, mb: 4 }}>
                        <TextField
                            required
                            fullWidth
                            id="openingCases"
                            label="Opening Cases"
                            type="number"
                            {...register("openingCases")}
                            error={!!errors.openingCases}
                            helperText={errors.openingCases?.message}
                        />
                        <TextField
                            required
                            fullWidth
                            id="openingBottles"
                            label="Opening Bottles"
                            type="number"
                            {...register("openingBottles")}
                            error={!!errors.openingBottles}
                            helperText={errors.openingBottles?.message}
                        />
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => navigate("/admin/initial-stock")}
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
                            {isEditMode ? "Save Changes" : "Create Entry"}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default InitialStockForm;
