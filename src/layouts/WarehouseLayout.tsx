import React, { ReactNode } from "react";
import { Box, AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { LogOut, Package } from "lucide-react";

const WarehouseLayout = ({ children }: { children: ReactNode }) => {
    const { user, logout } = useAuth();

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <AppBar position="static" elevation={2} sx={{ bgcolor: "white", color: "text.primary" }}>
                <Toolbar>
                    <Package style={{ marginRight: 12, color: "#2563eb" }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
                        {user?.warehouseName || "Warehouse"}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mr: 3, opacity: 0.8 }}>
                        {user?.name}
                    </Typography>
                    
                    <Button 
                        color="inherit" 
                        onClick={logout}
                        startIcon={<LogOut size={18} />}
                        sx={{ 
                            textTransform: "none",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.05)" }
                        }}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>
            
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {children}
            </Container>
        </Box>
    );
};

export default WarehouseLayout;
