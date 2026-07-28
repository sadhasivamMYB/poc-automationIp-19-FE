// layouts/WarehouseLayout.jsx

import { Box } from "@mui/material";
import type { ReactNode } from "react";
import WarehouseHeader from "../components/layout/WarehouseHeader";

const WarehouseLayout = ({ children }: { children: ReactNode }) => {
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