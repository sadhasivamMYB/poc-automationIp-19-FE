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

interface DebouncedTextFieldProps {
    value: number | string;
    onChange: (value: string) => void;
}

const DebouncedTextField: React.FC<DebouncedTextFieldProps> = ({ value, onChange }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleBlur = () => {
        if (localValue !== value) {
            onChange(String(localValue));
        }
    };

    return (
        <TextField
            size="small"
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            sx={{
                width: 100,
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                    display: 'none',
                },
                '& input[type=number]': {
                    MozAppearance: 'textfield',
                },
            }}
        />
    );
};

interface MemoizedRowProps {
    item: any;
    locations: any[];
    currentVals?: Record<string, number>;
    onChange: (itemCode: string, warehouseKey: string, value: string) => void;
}

const MemoizedRow = React.memo(({ item, locations, currentVals, onChange }: MemoizedRowProps) => {
    return (
        <TableRow>
            <TableCell sx={{ position: "sticky", left: 0, zIndex: 1, bgcolor: "background.paper", borderRight: "1px solid rgba(224, 224, 224, 1)" }}>{item.itemCode}</TableCell>
            <TableCell sx={{ position: "sticky", left: 120, zIndex: 1, bgcolor: "background.paper", borderRight: "2px solid rgba(224, 224, 224, 1)", fontSize: "12px" }}>{item.itemName}</TableCell>
            {locations?.map((location) => {
                const wKey = location.warehouseCode;
                const val = currentVals ? currentVals[wKey] : 0;
                return (
                    <TableCell key={wKey}>
                        <DebouncedTextField
                            value={val || ""}
                            onChange={(newVal) => onChange(item.itemCode, wKey, newVal)}
                        />
                    </TableCell>
                );
            })}
        </TableRow>
    );
}, (prevProps, nextProps) => {
    return prevProps.currentVals === nextProps.currentVals && prevProps.locations === nextProps.locations;
});

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

    const handleChange = React.useCallback((itemCode: string, warehouseKey: string, value: string) => {
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
    }, [setMinValues, locations]);


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
                <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ position: "sticky", left: 0, zIndex: 3, width: 120, minWidth: 120, fontWeight: "bold", bgcolor: "background.default", borderRight: "1px solid rgba(224, 224, 224, 1)" }}>Item Code</TableCell>
                            <TableCell sx={{ position: "sticky", left: 120, zIndex: 3, width: 250, minWidth: 250, fontWeight: "bold", bgcolor: "background.default", borderRight: "2px solid rgba(224, 224, 224, 1)" }}>Item Name</TableCell>
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
                            items.map((item) => (
                                <MemoizedRow
                                    key={item.id}
                                    item={item}
                                    locations={locations}
                                    currentVals={minValues[item.itemCode]}
                                    onChange={handleChange}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default MinValuesTab;
