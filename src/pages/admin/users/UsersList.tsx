import { useEffect, useState } from "react";
import {
    Backdrop,
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    IconButton,
    CircularProgress,
    Chip,
} from "@mui/material";
import { Edit, Add, Send } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { toast } from "sonner";

import { type User } from "../../../zod";

const UsersList = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [mailLoading, setMailLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const response = await api.get("/users");
            if (response.data.success) {
                setUsers(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", position: "relative" }}>
            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: "rgba(0, 0, 0, 0.7)",
                }}
                open={mailLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            {/* Header Section */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 4,
                }}
            >
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }} color="primary.main">
                        User Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        Manage users, roles, and warehouse assignments.
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => navigate("/admin/users/new")}
                        sx={{
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
                        }}
                    >
                        Add New User
                    </Button>
                </Box>
            </Box>

            {/* Table Section */}
            <Paper
                elevation={0}
                sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >
                <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ bgcolor: "background.default" }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, py: 2 }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2 }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2 }}>Warehouse</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            No users found. Click "Add New User" to create one.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => {
                                    const status = user.status || "ACTIVE";
                                    return (
                                        <TableRow
                                            key={user.id}
                                            hover
                                            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                                        >
                                            <TableCell>{user.id}</TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{user.fullName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.role}
                                                    size="small"
                                                    color={user.role === "ADMIN" ? "secondary" : "primary"}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {user.warehouse?.warehouseName || (
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                                        -
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={status}
                                                    size="small"
                                                    color={
                                                        status === "ACTIVE"
                                                            ? "success"
                                                            : status === "INVITED"
                                                                ? "warning"
                                                                : "error"
                                                    }
                                                    variant={status === "INVITED" ? "outlined" : "filled"}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                                                    {status === "INVITED" && (
                                                        <IconButton
                                                            color="warning"
                                                            title="Resend Invitation"
                                                            onClick={async () => {
                                                                try {
                                                                    setMailLoading(true);

                                                                    const res = await api.post(`/invitations/resend/${user.id}`);
                                                                    if (res.data?.success) {
                                                                        toast.success("Invitation email resent successfully!");
                                                                        setMailLoading(false);
                                                                    } else {
                                                                        toast.error(res.data?.message || "Failed to resend");
                                                                    }
                                                                } catch (err: any) {
                                                                    toast.error(err.response?.data?.message || "Failed to resend invitation");
                                                                } finally {
                                                                    setMailLoading(false);
                                                                }
                                                            }}
                                                            sx={{
                                                                "&:hover": { bgcolor: "warning.light", color: "warning.dark" },
                                                            }}
                                                        >
                                                            <Send fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => navigate(`/admin/users/${user.id}`)}
                                                        sx={{
                                                            "&:hover": { bgcolor: "primary.light", color: "primary.dark" },
                                                        }}
                                                    >
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default UsersList;
