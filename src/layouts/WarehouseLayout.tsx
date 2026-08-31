import { type ReactNode, useEffect, useState } from "react";
import { Box, Toolbar, Typography, Paper } from "@mui/material";
import { StorefrontOutlined } from "@mui/icons-material";
import WarehouseSidebar from "../components/layout/WarehouseSidebar";
import WarehouseHeader from "../components/layout/WarehouseHeader";
import api from "../services/api";

const WarehouseLayout = ({ children }: { children: ReactNode }) => {
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

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            <WarehouseHeader />
            <WarehouseSidebar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    transition: "all 0.3s ease-in-out"
                }}
            >
                <Toolbar />

                {warehouseDetails?.warehouseName && (
                    <Paper
                        elevation={0}
                        sx={{
                            mb: 3,
                            p: 2,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1.5,
                            bgcolor: 'primary.50',
                            border: '1px solid #c4c4c4ff',

                            borderRadius: 2
                        }}
                    >
                        <StorefrontOutlined sx={{ color: 'primary.main', fontSize: 28 }} />
                        <Box>
                            <Typography sx={{ color: 'text.secondary', fontWeight: 400, fontSize: "8px", textTransform: 'uppercase', letterSpacing: 1 }}>
                                Active Location
                            </Typography>
                            <Typography sx={{ color: 'primary.dark', fontWeight: 700, fontSize: "16px", lineHeight: 1.2 }}>
                                {warehouseDetails.warehouseName} Warehouse
                            </Typography>
                        </Box>
                    </Paper>
                )}

                {children}
            </Box>
        </Box>
    );
};

export default WarehouseLayout;
