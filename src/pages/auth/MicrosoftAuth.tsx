import { useAuth } from "../../context/AuthContext";
import { Button } from "@mui/material";

export default function MicrosoftLogin() {
    const { loginWithMicrosoft, loading } = useAuth();

    const handleLogin = async () => {
        try {
            await loginWithMicrosoft();
        } catch (error) {
            console.error("Microsoft login redirect failed:", error);
        }
    };

    return (
        <Button
            fullWidth
            variant="outlined"
            onClick={handleLogin}
            disabled={loading}
            sx={{ py: 1.5, fontSize: "1.1rem" }}
        >
            {loading ? "Signing In..." : "Login with Microsoft"}
        </Button>
    );
}