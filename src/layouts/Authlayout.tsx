import { type ReactNode } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";

const AuthLayout = ({ children }: { children: ReactNode }) => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                background: "linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)",
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    display: { xs: "none", md: "flex" },
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
                    color: "white",
                    p: 4,
                }}
            >
                <Typography variant="h2" sx={{ fontWeight: "bold" }} gutterBottom>
                    Stock Automation
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.8 }}>
                    daily stocks update
                </Typography>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 3,
                }}
            >
                <Container maxWidth="sm">
                    <Paper
                        elevation={24}
                        sx={{
                            p: { xs: 4, md: 6 },
                            borderRadius: 4,
                            backdropFilter: "blur(10px)",
                            bgcolor: "rgba(255, 255, 255, 0.95)",
                        }}
                    >
                        {children}
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
};

export default AuthLayout;