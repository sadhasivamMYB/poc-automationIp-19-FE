import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    Paper,
} from "@mui/material";
import { DeleteOutlined } from "@mui/icons-material";
import MinValuesTab from "./MinValuesTab";
import DistributionTab from "./DistributionTab";

export interface MinValuesRecord {
    [itemCode: string]: {
        any: number;
    };
}

export interface PhyValuesRecord {
    [itemCode: string]: {
        any: number;
    };
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const DistributionPlan = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [minValues, setMinValues] = useState<MinValuesRecord>({});
    const [phyValues, setPhyValues] = useState<PhyValuesRecord>({});

    // Load from local storage on mount
    useEffect(() => {
        const storedMin = localStorage.getItem("distribution_minValues");
        const storedPhy = localStorage.getItem("distribution_phyValues");
        if (storedMin) {
            try {
                setMinValues(JSON.parse(storedMin));
            } catch (e) {
                console.error("Failed to parse minValues from local storage");
            }
        }
        if (storedPhy) {
            try {
                setPhyValues(JSON.parse(storedPhy));
            } catch (e) {
                console.error("Failed to parse phyValues from local storage");
            }
        }
    }, []);

    // Save to local storage when state changes
    useEffect(() => {
        localStorage.setItem("distribution_minValues", JSON.stringify(minValues));
    }, [minValues]);

    useEffect(() => {
        localStorage.setItem("distribution_phyValues", JSON.stringify(phyValues));
    }, [phyValues]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const handleClearData = () => {
        if (window.confirm("Are you sure you want to clear all temporary data (Min values and uploaded Physical stock)?")) {
            setMinValues({});
            setPhyValues({});
            localStorage.removeItem("distribution_minValues");
            localStorage.removeItem("distribution_phyValues");
        }
    };

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                        Distribution Plan
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage minimum stock values and calculate distribution status (Temporary tool).
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteOutlined />}
                    onClick={handleClearData}
                >
                    Clear Data
                </Button>
            </Box>

            <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} aria-label="distribution plan tabs">
                        <Tab label="Min Values Setup" />
                        <Tab label="Distribution Plan" />
                    </Tabs>
                </Box>

                <CustomTabPanel value={tabIndex} index={0}>
                    <MinValuesTab minValues={minValues} setMinValues={setMinValues} />
                </CustomTabPanel>

                <CustomTabPanel value={tabIndex} index={1}>
                    <DistributionTab
                        minValues={minValues}
                        phyValues={phyValues}
                        setPhyValues={setPhyValues}
                    />
                </CustomTabPanel>
            </Paper>
        </Box>
    );
};

export default DistributionPlan;
