import React from "react";
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Box,
    Typography,
} from "@mui/material";

import InventoryIcon from "@mui/icons-material/Inventory";
import WarehouseIcon from "@mui/icons-material/Warehouse";


import { Link, useLocation } from "react-router-dom";

const drawerWidth = 260;

const menus = [

    {
        title: "Today Log",
        icon: <InventoryIcon />,
        path: "/warehouse/log",
    },
    {
        title: "Custom Log",
        icon: <WarehouseIcon />,
        path: "/warehouse/custom-date-log",
    },
];

const WarehouseSidebar = () => {
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
            <Typography sx={{ p: 3, fontWeight: "bold", color: "black" }}>
                Stock Automation
            </Typography>

            <Toolbar />
            <Box sx={{ overflow: "auto", mt: 2 }}>

                <List sx={{ py: 2 }}>
                    {menus.map((menu) => {
                        const isActive = location.pathname === menu.path ||
                            (menu.path !== "/warehouse" && location.pathname.startsWith(menu.path));

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
                                    sx={{
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

export default WarehouseSidebar;