import { type ReactNode } from "react";
import { Box } from "@mui/material";
// import { useAuth } from "../context/AuthContext";
// import { LogOut, Package } from "lucide-react";
import WarehouseSidebar from "../components/layout/WarehouseSidebar";
import WarehouseHeader from "../components/layout/WarehouseHeader";

const WarehouseLayout = ({ children }: { children: ReactNode }) => {
    // const { user, logout } = useAuth();

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>


            <WarehouseSidebar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    transition: "all 0.3s ease-in-out"
                }}
            >  <WarehouseHeader />

                {children}
            </Box>
        </Box>
    );
};

export default WarehouseLayout;
