import React from "react";
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Box,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import CompareIcon from "@mui/icons-material/Compare";
import PeopleIcon from "@mui/icons-material/People";

import { Link, useLocation } from "react-router-dom";

const drawerWidth = 260;

const menus = [
    {
        title: "Dashboard",
        icon: <DashboardIcon />,
        path: "/admin",
    },
    {
        title: "Master Items",
        icon: <InventoryIcon />,
        path: "/admin/master-items",
    },
    {
        title: "Initial Stock",
        icon: <WarehouseIcon />,
        path: "/admin/initial-stock",
    },
    {
        title: "Users",
        icon: <PeopleIcon />,
        path: "/admin/users",
    },
    {
        title: "Compare",
        icon: <CompareIcon />,
        path: "/admin/compare",
    },
];

const AdminSidebar = () => {
    const location = useLocation();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    borderRight: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                },
            }}
        >
            <Toolbar />
            <Box sx={{ overflow: "auto", mt: 2, px: 2 }}>
                <List spacing={1}>
                    {menus.map((menu) => {
                        const isActive = location.pathname === menu.path ||
                            (menu.path !== "/admin" && location.pathname.startsWith(menu.path));

                        return (
                            <ListItemButton
                                key={menu.title}
                                component={Link}
                                to={menu.path}
                                sx={{
                                    mb: 1,
                                    borderRadius: 2,
                                    bgcolor: isActive ? "primary.light" : "transparent",
                                    color: isActive ? "primary.dark" : "text.secondary",
                                    "&:hover": {
                                        bgcolor: isActive ? "primary.light" : "rgba(0,0,0,0.04)",
                                    },
                                    transition: "all 0.2s ease-in-out",
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActive ? "primary.main" : "inherit",
                                        minWidth: 40
                                    }}
                                >
                                    {menu.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={menu.title}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 500,
                                        fontSize: "0.95rem"
                                    }}
                                />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Box>
        </Drawer>
    );
};

export default AdminSidebar;