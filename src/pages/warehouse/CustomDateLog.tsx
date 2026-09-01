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

    const today = new Date().toISOString().split("T")[0];

    const fetchData = async (date: string) => {
        if (!date) return;
        setLoading(true);
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
            } else {
                setHasData(false);
                setRows([]);
            }
        } catch (error) {
            console.error("Failed to fetch custom date log", error);
            toast.error("Failed to fetch log for the selected date");
            setRows([]);
            setHasData(false);
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

            {!selectedDate && (
                <Box sx={{ mt: 3, p: 4, bgcolor: "#f8fafc", color: "#475569", borderRadius: 2, border: "1px dashed #cbd5e1", textAlign: "center" }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>Please select a date to view Stock.</Typography>
                </Box>
            )}

            {selectedDate && hasData && (
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center" sx={{ py: 10 }}>
                                        <CircularProgress disableShrink size={40} thickness={4} />
                                        <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>Fetching Data...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filterdData?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center" sx={{ py: 18 }}>
                                        <Typography color="text.secondary">No items to display.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) :
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
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default CustomDateLog;