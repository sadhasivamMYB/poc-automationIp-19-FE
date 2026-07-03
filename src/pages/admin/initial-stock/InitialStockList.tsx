import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    CircularProgress,
} from "@mui/material";
import { Edit, Add, UploadOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import ExcelUploadButton from "../../../components/ExcelFileUploadButton";

export interface InitialStock {
    id: number;
    warehouseId: number;
    itemId: number;
    openingCases: number;
    openingBottles: number;
    warehouse?: { name: string };
    item?: { itemName: string; itemCode: string; bottlePerCase: number };
}

const InitialStockList = () => {
    const [stocks, setStocks] = useState<InitialStock[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [openExcel, setOpenExcel] = useState(false);

    const fetchStocks = async () => {
        try {
            const response = await api.get("/initial-stock");
            if (response.data.success) {
                setStocks(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch initial stocks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {
                openExcel && <ExcelUploadButton
                    open={openExcel}
                    handleClose={() => setOpenExcel(false)}
                    uploadUrl="/excel/upload/inital-stock"
                    templateHeaders={["warehouse code", "warehouse name", "item code", "item name", "cases", "bottles"]}
                    templateWidths={[{ wpx: 150 }, { wpx: 200 }, { wpx: 150 }, { wpx: 200 }, { wpx: 100 }, { wpx: 100 }]}
                    templateFileName="initial_stock_template.xlsx"
                />
            }
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Initial Stock
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage the opening stock quantities for warehouses.
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: "5px", flexDirection: "row" }}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate("/admin/initial-stock/new")}
                    >
                        Add Stock Entry
                    </Button>

                    <Button
                        sx={{ cursor: "pointer", background: "#479759ff", color: "white" }}
                        variant="outlined"
                        startIcon={<UploadOutlined />}
                        onClick={() => setOpenExcel(true)}

                    >
                        Upload
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: "background.default" }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Warehouse</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Item Code</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Item Name</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }} align="right">Cases</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }} align="right">Bottles</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {stocks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">No initial stock entries found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            stocks.map((stock) => (
                                <TableRow key={stock.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                    <TableCell>
                                        <b>{stock.warehouse?.warehouseName}</b> <br />
                                        {`ID: ${stock.warehouseId}`}
                                    </TableCell>
                                    <TableCell>{stock.item?.itemCode || `Item ID: ${stock.itemId}`}</TableCell>
                                    <TableCell>{stock.item?.itemName}</TableCell>
                                    <TableCell align="right">{stock.openingCases}</TableCell>
                                    <TableCell align="right">{stock.openingBottles}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => navigate(`/admin/initial-stock/${stock.id}`)}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
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

export default InitialStockList;
