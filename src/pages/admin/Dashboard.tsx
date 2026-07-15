
import { Box, Typography, Grid, Paper } from "@mui/material";
import { Inventory, Warehouse, People } from "@mui/icons-material";
import api from "../../services/api";
import { useEffect, useState } from "react";

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
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: "bold" }}>
                {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                {value}
            </Typography>
        </Box>
    </Paper>
);

const Dashboard = () => {

    const [statsData, setStatsData] = useState<any>({ totalMasterItems: 0, totalWarehouses: 0, totalUsers: 0 })

    async function fetchDashboardStats() {

        const result = await api.get('dashboard-stats')
        if (result.data.success) {
            setStatsData(result.data.data)

        }

    }
    useEffect(() => {
        fetchDashboardStats()
    }, [])


    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Dashboard Overview
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome to the Admin Portal. Here's what's happening today.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="Total Master Items"
                        value={statsData?.totalMasterItems ?? 0}
                        icon={<Inventory fontSize="large" />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="Active Warehouses"
                        value={statsData?.totalWarehouses ?? 0}
                        icon={<Warehouse fontSize="large" />}
                        color="secondary"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <StatCard
                        title="Total Users"
                        value={statsData?.totalUsers ?? 0}
                        icon={<People fontSize="large" />}
                        color="info"
                    />
                </Grid>

            </Grid>
        </Box>
    );
};

export default Dashboard;