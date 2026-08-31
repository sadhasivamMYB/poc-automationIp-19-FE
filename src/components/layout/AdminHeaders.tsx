import React, { useState } from "react";
import { AppBar, Toolbar, Typography, Box, Avatar, Menu, MenuItem, Divider, IconButton, Tooltip } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { LogOut, User } from "lucide-react";

const AdminHeader = () => {
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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
                            padding: "1px"
                        }}
                    >
                        SM
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Stock Management System
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", alignItems: "flex-end", mr: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333', lineHeight: 1.2 }}>
                            {user?.fullName || "Admin User"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                            {user?.role || "ADMIN"}
                        </Typography>
                    </Box>

                    <Tooltip title="Account settings">
                        <IconButton
                            onClick={handleClick}
                            size="small"
                            aria-controls={open ? 'account-menu' : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            sx={{
                                padding: 0.5,
                                border: '2px solid transparent',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    bgcolor: 'transparent'
                                }
                            }}
                        >
                            <Avatar sx={{ width: 40, height: 40, bgcolor: "primary.main", color: "white", fontWeight: "bold" }}>
                                {user?.fullName?.charAt(0).toUpperCase() || "A"}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={anchorEl}
                        id="account-menu"
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 4px 20px rgba(0,0,0,0.1))',
                                mt: 1.5,
                                minWidth: 220,
                                borderRadius: 3,
                                '&::before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 20,
                                    width: 10,
                                    height: 10,
                                    bgcolor: 'background.paper',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Box sx={{ px: 2.5, py: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                                {user?.fullName || "Admin User"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem', fontWeight: 600 }}>
                                {user?.role || "ADMIN"}
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 0 }} />
                        <MenuItem onClick={logout} sx={{ color: "error.main", py: 1.5, px: 2.5, '&:hover': { bgcolor: 'error.50' } }}>
                            <LogOut size={18} style={{ marginRight: '12px' }} />
                            <Typography sx={{ fontWeight: 600 }}>Logout</Typography>
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default AdminHeader;