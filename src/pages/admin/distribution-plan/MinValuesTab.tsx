import React, { useEffect, useState } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import api from "../../../services/api";
import type { MinValuesRecord } from "./DistributionPlan";
// import { MasterItem } from "../master-items/MasterItemsList";

interface MinValuesTabProps {
    minValues: MinValuesRecord;
    setMinValues: React.Dispatch<React.SetStateAction<MinValuesRecord>>;
}

const MinValuesTab: React.FC<MinValuesTabProps> = ({ minValues, setMinValues }) => {
    const [items, setItems] = useState<any[]>([]);
    const [locations, setLocations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        try {
            const response = await api.get("/master-item");
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch master items", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLocations = async () => {
        try {
            const response = await api.get("/warehouse");
            if (response.data.success) {
                setLocations(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch locations", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        fetchLocations()
    }, []);

    console.log(locations)

    const handleChange = (itemCode: string, warehouseKey: keyof MinValuesRecord[string], value: string) => {
        const numValue = value === "" ? 0 : parseInt(value, 10);
        if (isNaN(numValue)) return;

        setMinValues((prev) => {
            const currentItem = prev[itemCode] || locations.reduce((acc, location) => {
                acc[location.warehouseCode] = 0;
                return acc;
            }, {} as MinValuesRecord[string]);

            return {
                ...prev,
                [itemCode]: {
                    ...currentItem,
                    [warehouseKey]: numValue,
                },
            };
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Set Minimum Values</Typography>
            <TableContainer sx={{ maxHeight: "500px", width: "100%", maxWidth: "70vw", overflowX: "auto", overflowY: "auto" }}>
                <Table size="small" >
                    <TableHead sx={{ bgcolor: "background.default" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Item Code</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Item Name</TableCell>
                            {
                                locations.map((location) => (
                                    <TableCell sx={{ fontWeight: "bold" }}>{location.warehouseName}</TableCell>
                                ))
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">No items found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => {
                                const currentVals = minValues[item.itemCode] || locations.reduce((acc, location) => {
                                    acc[location.warehouseCode] = 0;
                                    return acc;
                                }, {} as MinValuesRecord[string]);

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.itemCode}</TableCell>
                                        <TableCell sx={{ fontSize: "12px" }}>{item.itemName}</TableCell>
                                        {locations?.map((location) => {
                                            const wKey = location.warehouseCode as keyof MinValuesRecord[string];
                                            return (
                                                <TableCell key={location.warehouseCode}>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={currentVals[wKey] || ""}
                                                        onChange={(e) => handleChange(item.itemCode, wKey, e.target.value)}
                                                        inputProps={{ min: 0 }}
                                                        sx={{ width: 100 }}
                                                    />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default MinValuesTab;
