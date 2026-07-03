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
    Chip,
    CircularProgress,
} from "@mui/material";
import { Edit, Add, UploadOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { toast } from "sonner";
import ExcelUploadButton from "../../../components/ExcelFileUploadButton";

export interface MasterItem {
    id: number;
    itemCode: string;
    itemName: string;
    bottlePerCase: number;
    isActive: boolean;
}

const MasterItemsList = () => {
    const [items, setItems] = useState<MasterItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [openExcel, setOpenExcel] = useState(false);

    const navigate = useNavigate();

    const fetchItems = async () => {
        try {
            const response = await api.get("/master-item");
            if (response.data.success) {
                setItems(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch items", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
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
                openExcel && <ExcelUploadButton open={openExcel} handleClose={() => setOpenExcel(false)} />
            }
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Master Items
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your warehouse inventory items and conversion rates.
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: "5px", flexDirection: "row" }}>


                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate("/admin/master-items/new")}
                    >
                        Add Item
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
                            <TableCell sx={{ fontWeight: "bold" }}>Item Code</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Item Name</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Bottles Per Case</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">No items found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                    <TableCell component="th" scope="row">
                                        {item.itemCode}
                                    </TableCell>
                                    <TableCell>{item.itemName}</TableCell>
                                    <TableCell>{item.bottlePerCase}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.isActive ? "Active" : "Inactive"}
                                            color={item.isActive ? "success" : "default"}
                                            size="small"
                                            sx={{ fontWeight: "bold" }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => navigate(`/admin/master-items/${item.id}`)}
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

export default MasterItemsList;
