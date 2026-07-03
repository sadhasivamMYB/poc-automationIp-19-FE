// components/layout/WarehouseHeader.jsx

import {
    AppBar,
    Toolbar,
    Typography,
    Button,
} from "@mui/material";

const WarehouseHeader = () => {
    const today = new Date().toLocaleDateString();

    return (
        <AppBar position="static">
            <Toolbar
                sx={{
                    justifyContent: "space-between",
                }}
            >
                <Typography variant="h6">
                    Lagos Warehouse
                </Typography>

                <Typography>
                    {today}
                </Typography>

                <Button color="inherit">
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default WarehouseHeader;