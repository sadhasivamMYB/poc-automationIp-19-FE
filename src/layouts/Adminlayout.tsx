import React, { ReactNode } from "react";
import { Box, Toolbar } from "@mui/material";

import AdminHeader from "../components/layout/AdminHeaders";
import AdminSidebar from "../components/layout/AdminSidebar";

const AdminLayout = ({ children }: { children: ReactNode }) => {
    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            <AdminHeader />

            <AdminSidebar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    transition: "all 0.3s ease-in-out"
                }}
            >
                <Toolbar />

                {children}
            </Box>
        </Box>
    );
};

export default AdminLayout;