// layouts/WarehouseLayout.jsx

import { Box } from "@mui/material";

import WarehouseHeader from "../components/layout/WarehouseHeader";

const WarehouseLayout = ({ children }) => {
    return (
        <Box>
            <WarehouseHeader />

            <Box
                sx={{
                    p: 3,
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default WarehouseLayout;