import { useEffect, useState } from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    InputAdornment,
    Typography,
    CircularProgress,
    Alert,
} from "@mui/material";
import { SearchOutlined } from "@mui/icons-material";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const CustomDateLog = () => {
    const { user } = useAuth();
    const [rows, setRows] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasData, setHasData] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const today = new Date().toISOString().split("T")[0];

    const fetchData = async (date: string) => {
        if (!date) return;
        setLoading(true);
        setErrorMessage(null);
        try {
            const response = await api.get("/daily-stock/history", {
                params: {
                    warehouseId: user?.warehouseId,
                    date: date,
                }
            });

            if (response.data.success && response.data.data && response.data.data.length > 0) {
                setRows(response.data.data);
                setHasData(true);
                setErrorMessage(null);
            } else {
                setHasData(false);
                setRows([]);
                setErrorMessage(response.data.message || "No items found for the selected date.");
            }
        } catch (error: any) {
            console.error("Failed to fetch custom date log", error);
            const msg = error?.response?.data?.message || "Failed to fetch log for the selected date";
            toast.error(msg);
            setRows([]);
            setHasData(false);
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDate) {
            fetchData(selectedDate);
        } else {
            setRows([]);
            setHasData(true);
            setErrorMessage(null);
        }
    }, [selectedDate, user?.warehouseId]);


    const filterdData = rows.filter(row =>
        row.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.itemName?.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
        <Box>
            <Paper elevation={0} sx={{ p: 2, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: "error.main", fontWeight: 500, fontSize: "12px" }}>
                            Select a date to see logs *
                        </Typography>
                        <TextField
                            size="small"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            slotProps={{
                                inputLabel: { shrink: true },
                                htmlInput: { max: today }
                            }}
                            sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                    </Box>

                    <TextField
                        size="small"
                        placeholder="Search by Item Code or Item Name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ width: 450, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'grey.50' } }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchOutlined sx={{ fontSize: 20, color: "text.secondary" }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>
            </Paper>

            {!selectedDate ? (
                <Box sx={{ mt: 3, p: 4, bgcolor: "#f8fafc", color: "#475569", borderRadius: 2, border: "1px dashed #cbd5e1", textAlign: "center" }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>Please select a date to view Stock.</Typography>
                </Box>
            ) : loading ? (
                <Box sx={{ mt: 3, p: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", bgcolor: "#fff", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                    <CircularProgress disableShrink size={40} thickness={4} />
                    <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>Fetching Data...</Typography>
                </Box>
            ) : errorMessage ? (
                <Alert
                    severity="error"
                    sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "error.light",
                        alignItems: "center",
                        "& .MuiAlert-icon": {
                            fontSize: 24,
                            alignSelf: "center",
                        },
                        "& .MuiAlert-message": {
                            fontWeight: 500,
                            fontSize: "14px",
                        },
                    }}
                >
                    {errorMessage}
                </Alert>
            ) : (
                hasData && (
                    <TableContainer
                        component={Paper}
                        elevation={3}
                        sx={{ borderRadius: 2, overflow: "auto" }}
                    >
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ "& th": { bgcolor: "#5659ffff", color: "white", fontWeight: 400, textAlign: "center" } }}>
                                    <TableCell rowSpan={2}>Item Code</TableCell>
                                    <TableCell rowSpan={2}>Item Name</TableCell>
                                    <TableCell rowSpan={2}>Bottle / Case</TableCell>
                                    <TableCell colSpan={2}>Opening Stock</TableCell>
                                    <TableCell colSpan={2}>Received Stock</TableCell>
                                    <TableCell colSpan={2}>Issued Stock</TableCell>
                                    <TableCell colSpan={2}>Closing Stock</TableCell>
                                </TableRow>
                                <TableRow sx={{ "& th": { bgcolor: "grey.100", fontWeight: 400, textAlign: "center" } }}>
                                    <TableCell>Cases</TableCell>
                                    <TableCell>Bottles</TableCell>
                                    <TableCell>Cases</TableCell>
                                    <TableCell>Bottles</TableCell>
                                    <TableCell>Cases</TableCell>
                                    <TableCell>Bottles</TableCell>
                                    <TableCell>Cases</TableCell>
                                    <TableCell>Bottles</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filterdData?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center" sx={{ py: 18 }}>
                                            <Typography color="text.secondary">No items to display.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filterdData?.map((row) => (
                                        <TableRow key={row.id} hover sx={{ "&:nth-of-type(even)": { bgcolor: "grey.50" } }}>
                                            <TableCell>{row.itemCode}</TableCell>
                                            <TableCell>{row.itemName}</TableCell>
                                            <TableCell align="center">{row.bottlePerCase}</TableCell>

                                            <TableCell align="center">{row.openingCases}</TableCell>
                                            <TableCell align="center">{row.openingBottles}</TableCell>
                                            <TableCell align="center">{row.receivedCases}</TableCell>
                                            <TableCell align="center">{row.receivedBottles}</TableCell>
                                            <TableCell align="center">{row.issuedCases}</TableCell>
                                            <TableCell align="center">{row.issuedBottles}</TableCell>
                                            <TableCell align="center">{row.closingCases || 0}</TableCell>
                                            <TableCell align="center">{row.closingBottles || 0}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
            )}
        </Box>
    );
};

export default CustomDateLog;