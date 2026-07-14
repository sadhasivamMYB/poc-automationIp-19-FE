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
                // No data for this date, fetch master items to display names
                setHasData(false);
                const itemsResponse = await api.get("/master-item");
                if (itemsResponse.data.success) {
                    const masterItems = itemsResponse.data.data.map((item: any) => ({
                        id: item.id,
                        itemCode: item.itemCode,
                        itemName: item.itemName,
                        bottlePerCase: item.bottlePerCase,
                    }));
                    setRows(masterItems);
                } else {
                    setRows([]);
                }
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

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <TextField
                    size="small"
                    type="date"
                    label="Select Date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ max: today }}
                    sx={{ width: 200 }}
                />

                <TextField
                    size="small"
                    placeholder="Search by Item Code or Item Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: 500 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchOutlined sx={{ fontSize: 24, color: "#9ca3af" }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Box>

            {selectedDate && (
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
                            {rows?.filter(row =>
                                row.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                row.itemName?.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((row) => (
                                <TableRow key={row.id} hover sx={{ "&:nth-of-type(even)": { bgcolor: "grey.50" } }}>
                                    <TableCell>{row.itemCode}</TableCell>
                                    <TableCell>{row.itemName}</TableCell>
                                    <TableCell align="center">{row.bottlePerCase}</TableCell>

                                    {!hasData ? (
                                        <TableCell colSpan={8} align="center" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                                            No data on that date
                                        </TableCell>
                                    ) : (
                                        <>
                                            <TableCell align="center">{row.openingCases}</TableCell>
                                            <TableCell align="center">{row.openingBottles}</TableCell>
                                            <TableCell align="center">{row.receivedCases}</TableCell>
                                            <TableCell align="center">{row.receivedBottles}</TableCell>
                                            <TableCell align="center">{row.issuedCases}</TableCell>
                                            <TableCell align="center">{row.issuedBottles}</TableCell>
                                            <TableCell align="center">{row.closingCases || 0}</TableCell>
                                            <TableCell align="center">{row.closingBottles || 0}</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            ))}
                            {rows?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">
                                        No items found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default CustomDateLog;