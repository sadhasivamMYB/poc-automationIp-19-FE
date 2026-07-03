import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Avatar } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";

const AdminHeader = () => {
    const { user, logout } = useAuth();

    return (
        <AppBar
            position="fixed"
            elevation={1}
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                bgcolor: "background.paper",
                color: "text.primary",
                borderBottom: "1px solid",
                borderColor: "divider",
            }}
        >
            <Toolbar sx={{ justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                        }}
                    >
                        IS
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                        Inventory System
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.light" }}>
                            {user?.name?.charAt(0) || "A"}
                        </Avatar>
                        <Box sx={{ display: { xs: "none", sm: "block" } }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                                {user?.name || "Admin User"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user?.role || "ADMIN"}
                            </Typography>
                        </Box>
                    </Box>
                    
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
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default AdminHeader;