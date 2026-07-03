

import React from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { Inventory, Warehouse, People, Assessment } from "@mui/icons-material";

const StatCard = ({ title, value, icon, color }: any) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 2,
            transition: "transform 0.2s",
            "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            }
        }}
    >
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: `${color}.light`,
                color: `${color}.dark`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {icon}
        </Box>
        <Box>
            <Typography variant="body2" color="text.secondary" fontWeight="bold">
                {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
                {value}
            </Typography>
        </Box>
    </Paper>
);

const Dashboard = () => {
    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Dashboard Overview
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome to the Admin Portal. Here's what's happening today.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Total Master Items" 
                        value="142" 
                        icon={<Inventory fontSize="large" />} 
                        color="primary" 
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Active Warehouses" 
                        value="8" 
                        icon={<Warehouse fontSize="large" />} 
                        color="secondary" 
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Total Users" 
                        value="24" 
                        icon={<People fontSize="large" />} 
                        color="info" 
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard 
                        title="Discrepancies (SAP)" 
                        value="3" 
                        icon={<Assessment fontSize="large" />} 
                        color="error" 
                    />
                </Grid>
            </Grid>
            
            {/* We will add more charts or data grids here later */}
        </Box>
    );
};

export default Dashboard;