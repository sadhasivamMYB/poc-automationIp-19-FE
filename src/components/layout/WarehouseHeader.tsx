// components/layout/WarehouseHeader.jsx

import {
    AppBar,
    Toolbar,
    Typography,
    Button,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";

const WarehouseHeader = () => {


    const { logout } = useAuth();

    return (
        <AppBar sx={{ marginBottom: 3, p: 0, bgcolor: "transparent", boxShadow: "none" }} position="static">
            <Toolbar
                sx={{
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h6" sx={{ color: "black" }}>
                    Lagos Warehouse
                </Typography>



                <Button
                    color="error"
                    variant="outlined"
                    size="small"
                    onClick={logout}
                    startIcon={<LogOut size={16} />}
                    sx={{ textTransform: "none", borderRadius: 2 }}
                >
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default WarehouseHeader;