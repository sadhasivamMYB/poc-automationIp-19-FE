import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
} from "@mui/material";
import api from "../../services/api";
import { toast } from "sonner";

export const ActivateAccount: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!token) {
        return (
            <Container maxWidth="xs" sx={{ mt: 8 }}>
                <Paper sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="h5" color="error" gutterBottom>
                        Invalid Invitation Link
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        No invitation token was found in the link. Please check your email or contact an administrator.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/login")}>
                        Go to Login
                    </Button>
                </Paper>
            </Container>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Password and Confirm Password do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/activate-account", {
                token,
                password,
            });

            if (response.data?.success) {
                toast.success("Account activated successfully! You can now log in.");
                navigate("/login");
            } else {
                setError(response.data?.message || "Account activation failed.");
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Failed to activate account.";
            if (msg.includes("expired")) {
                setError("Invitation link has expired. Please contact your administrator for a new invitation link.");
            } else if (msg.includes("used")) {
                setError("This invitation has already been used. Please try logging in.");
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h5" align="center" sx={{ fontWeight: "bold" }} gutterBottom>
                    Activate Your Account
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                    Please enter a secure password to complete your account setup.
                </Typography>

                {error && (
                    <Box sx={{ mb: 2 }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        margin="normal"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? "Activating..." : "Create Password & Activate"}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};
