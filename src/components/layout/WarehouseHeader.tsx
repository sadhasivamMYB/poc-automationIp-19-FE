// components/layout/WarehouseHeader.jsx

import {
    AppBar,
    Toolbar,
    Typography,
    Button,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { HomeMaxOutlined, HomeOutlined, WarehouseOutlined } from "@mui/icons-material";

const WarehouseHeader = () => {


    const [warehouseDetails, setWarehouseDetails] = useState<any>();


    const fetchItems = async () => {
        try {
            const response = await api.get("/daily-stock/today");
            if (response.data.success) {
                setWarehouseDetails(response.data.warehouseDetail);
            }
        } catch (error) {
            console.error("Failed to fetch items", error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);


    const { logout } = useAuth();

    return (
        <AppBar sx={{ marginBottom: 3, p: 0, bgcolor: "transparent", boxShadow: "none" }} position="static">
            <Toolbar
                sx={{
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h6" sx={{ color: "black", display: "flex", justifyContent: "center" }}>
                    <WarehouseOutlined sx={{ mx: 1, bgcolor: "#d5e8ffff", borderRadius: 1, color: "#123580ff" }} />
                    {warehouseDetails?.warehouseName} Warehouse
                </Typography>



                <Button
                    color="error"
                    variant="outlined"
                    size="small"
                    onClick={logout}
                    startIcon={<LogOut size={16} />}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                >
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default WarehouseHeader;