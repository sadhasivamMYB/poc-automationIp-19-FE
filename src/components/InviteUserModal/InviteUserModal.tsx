import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Box,
    Alert,
} from "@mui/material";
import api from "../../services/api";
import { toast } from "sonner";

interface InviteUserModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    warehouses?: Array<{ id: number; name: string }>;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({
    open,
    onClose,
    onSuccess,
    warehouses = [],
}) => {
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("USER");
    const [warehouseId, setWarehouseId] = useState<number | "">("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await api.post("/invitations/invite", {
                email,
                fullName: fullName || undefined,
                role,
                warehouseId: warehouseId ? Number(warehouseId) : undefined,
            });

            if (response.data?.success) {
                toast.success("User invitation sent successfully!");
                setEmail("");
                setFullName("");
                setRole("USER");
                setWarehouseId("");
                onClose();
                if (onSuccess) onSuccess();
            } else {
                setError(response.data?.message || "Failed to send invitation");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || "Failed to send invitation");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Invite New User</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {error && (
                        <Box sx={{ mb: 2 }}>
                            <Alert severity="error">{error}</Alert>
                        </Box>
                    )}
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Full Name (Optional)"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        select
                        label="Role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        margin="normal"
                    >
                        <MenuItem value="USER">User</MenuItem>
                        <MenuItem value="MANAGER">Manager</MenuItem>
                        <MenuItem value="ADMIN">Admin</MenuItem>
                    </TextField>
                    {warehouses.length > 0 && (
                        <TextField
                            fullWidth
                            select
                            label="Warehouse (Optional)"
                            value={warehouseId}
                            onChange={(e) => setWarehouseId(e.target.value ? Number(e.target.value) : "")}
                            margin="normal"
                        >
                            <MenuItem value="">None</MenuItem>
                            {warehouses.map((w) => (
                                <MenuItem key={w.id} value={w.id}>
                                    {w.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={loading}>
                        {loading ? "Sending..." : "Send Invitation"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
