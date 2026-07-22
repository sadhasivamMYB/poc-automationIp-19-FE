import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    Select,
    MenuItem,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
} from "@mui/material";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "sonner";

interface MasterItem {
    id: number;
    itemCode: string;
    itemName: string;
    bottlePerCase: number;
    isActive: boolean;
}

interface SummaryData {
    itemCode: string;
    itemName: string;
    totalReceived: number; // raw bottles
    totalIssued: number;   // raw bottles
}

const MONTHS = [
    { label: "JAN", value: 1 },
    { label: "FEB", value: 2 },
    { label: "MAR", value: 3 },
    { label: "APR", value: 4 },
    { label: "MAY", value: 5 },
    { label: "JUN", value: 6 },
    { label: "JLY", value: 7 },
    { label: "AUG", value: 8 },
    { label: "SEP", value: 9 },
    { label: "OCT", value: 10 },
    { label: "NOV", value: 11 },
    { label: "DEC", value: 12 },
];

const Summary = () => {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();

    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonths, setSelectedMonths] = useState<number[]>([]); // [start, end] or [single]
    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>(user?.warehouseId || "");

    const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
    const [summaryData, setSummaryData] = useState<SummaryData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const itemsRes = await api.get("/master-item");
                if (itemsRes.data?.success) {
                    setMasterItems(itemsRes.data.data || []);
                }

                if (user?.role === "ADMIN") {
                    const whRes = await api.get("/warehouse");
                    if (whRes.data?.success) {
                        setWarehouses(whRes.data.warehouseDetails || whRes.data.data || []);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch initial data", error);
            }
        };
        if (user) {
            fetchInitialData();
        }
    }, [user]);

    useEffect(() => {
        if (!selectedWarehouse && warehouses?.length > 0) {
            setSelectedWarehouse(user?.warehouseId || warehouses[0]?.id);
        }
    }, [user, warehouses, selectedWarehouse]);

    const handleMonthClick = (monthVal: number) => {
        if (selectedMonths.length === 0 || selectedMonths.length === 2) {
            setSelectedMonths([monthVal]);
        } else if (selectedMonths.length === 1) {
            const start = selectedMonths[0];
            const end = monthVal;
            setSelectedMonths([Math.min(start, end), Math.max(start, end)]);
        }
    };

    const isMonthSelected = (monthVal: number) => {
        if (selectedMonths.length === 0) return false;
        if (selectedMonths.length === 1) return selectedMonths[0] === monthVal;
        const [start, end] = selectedMonths;
        return monthVal >= start && monthVal <= end;
    };

    const fetchSummary = async () => {
        if (!selectedWarehouse) {
            return;
        }
        if (selectedMonths.length === 0) {
            return;
        }

        setLoading(true);
        try {
            const startMonth = selectedMonths[0];
            const endMonth = selectedMonths.length === 2 ? selectedMonths[1] : startMonth;

            const startDate = new Date(selectedYear, startMonth - 1, 1).toISOString().split('T')[0];
            const endDate = new Date(selectedYear, endMonth, 0).toISOString().split('T')[0]; // last day of end month

            const response = await api.get("/summary", {
                params: {
                    warehouseId: selectedWarehouse,
                    startDate,
                    endDate
                }
            });

            if (response.data?.success) {
                setSummaryData(response.data.data || []);
            } else {
                setSummaryData([]);
            }
        } catch (error) {
            console.error("Failed to fetch summary data", error);
            toast.error("Failed to fetch summary data. API might not be ready yet.");
            setSummaryData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedWarehouse && selectedMonths.length > 0 && selectedYear) {
            fetchSummary();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedWarehouse, selectedMonths, selectedYear]);


    // const formatToCases = (rawTotal: number, itemCode: string) => {
    //     const item = masterItems.find(mi => mi.itemCode === itemCode);
    //     const bottlePerCase = item?.bottlePerCase || 1;
    //     const cases = rawTotal / bottlePerCase;
    //     return cases.toFixed(4);
    // };

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: "bold" }} >Summary</Typography>
                    <Typography variant="body2" color="text.secondary">
                        View received and issued stock summary.
                    </Typography>
                </Box>
            </Box>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 2, border: "1px solid", borderColor: "divider" }} elevation={0}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                    <Select
                        size="small"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        sx={{ minWidth: 120, fontWeight: "bold", borderRadius: 2 }}
                    >
                        {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                            <MenuItem key={y} value={y}>{y}</MenuItem>
                        ))}
                    </Select>

                    {
                        user.role !== "ADMIN" ? <></>
                            :
                            <Select
                                size="small"
                                value={selectedWarehouse}
                                onChange={(e) => setSelectedWarehouse(e.target.value)}
                                displayEmpty
                                disabled={user?.role !== "ADMIN"}
                                sx={{ minWidth: 200, fontWeight: "bold", borderRadius: 2 }}
                            >

                                <MenuItem value={""} disabled>Select Location</MenuItem>
                                {warehouses?.map((w: any) => (
                                    <MenuItem key={w.id} value={w.id}>{w.warehouseName || w.warehouseCode || w.name || w.id}</MenuItem>
                                ))}


                            </Select>
                    }
                </Box>

                <Box sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
                    gap: 2,
                    mb: 3,
                    p: 2,

                }}>
                    {MONTHS.map((m) => (
                        <Button
                            key={m.value}
                            variant={isMonthSelected(m.value) ? "contained" : "outlined"}
                            onClick={() => handleMonthClick(m.value)}
                            sx={{
                                bgcolor: isMonthSelected(m.value) ? "#fff6cbff" : "#f0f0f0",
                                color: "#000",
                                fontWeight: "bold",
                                border: "none",
                                borderRadius: 2,
                                "&:hover": {
                                    bgcolor: isMonthSelected(m.value) ? "#1b37e8" : ""
                                }
                            }}
                        >
                            {m.label}
                        </Button>
                    ))}
                </Box>
            </Paper>

            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>Summary of the Month</Typography>

            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Item Code</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Item Name</TableCell>
                            <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Total Received (Cases)</TableCell>
                            <TableCell sx={{ fontWeight: "bold", textAlign: "right" }}>Total Issued (Cases)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                    <CircularProgress size={40} thickness={4} />
                                    <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>Fetching Data...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : summaryData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">No summary data available.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            summaryData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ fontWeight: 500 }}>{row.itemCode}</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{row.itemName}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                                        {row.totalReceived.toFixed(4)}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                                        {row.totalIssued.toFixed(4)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

        </Box>
    );
};

export default Summary;
