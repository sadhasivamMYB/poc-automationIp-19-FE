import React, { useState } from "react";
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    Chip,
} from "@mui/material";
import { UploadOutlined, Download } from "@mui/icons-material";
import ExcelJS from "exceljs";
import type { MinValuesRecord, PhyValuesRecord } from "./DistributionPlan";
// import { MasterItem } from "../master-items/MasterItemsList";
import ExcelUploadButton from "../../../components/ExcelFileUploadButton";

interface DistributionTabProps {
    minValues: MinValuesRecord;
    phyValues: PhyValuesRecord;
    setPhyValues: React.Dispatch<React.SetStateAction<PhyValuesRecord>>;
    items: any[];
    locations: any[];
    loading: boolean;
}

const getStatus = (min: number, phy: number) => {
    if (min === 0 && phy === 0) return { label: null, color: "default" as const };
    else if (min * 2 < phy) return { label: "High", color: "warning" as const }; // high stock
    else if (min > phy) return { label: "Low", color: "error" as const }; // low stock
    else return { label: "Ok", color: "success" as const };
};

const DistributionTab: React.FC<DistributionTabProps> = ({ minValues, phyValues, setPhyValues, items, locations, loading }) => {
    const [openExcel, setOpenExcel] = useState(false);

    const handleLocalUpload = (parsedData: any[]) => {

        const newPhyValues: PhyValuesRecord = { ...phyValues };


        parsedData.forEach(row => {
            // Support both item_code and ItemCode as keys from excel
            const code = row["item_code"] || row["ItemCode"] || row["itemCode"];

            if (code) {
                const itemCode = String(code).trim();
                newPhyValues[itemCode] = locations?.reduce<any>((acc, loc) => {
                    acc[loc.warehouseCode] = Number(row[loc.warehouseCode]).toFixed(3) || 0;
                    return acc;
                }, {} as any);
            }
        });
        setPhyValues(newPhyValues);
    };

    const handleExport = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Distribution Plan");

        // Define headers
        const headerRow1 = [
            "Item Code", "Item Name",
            ...locations?.flatMap(loc => [loc.warehouseName, "", ""])
        ];
        const headerRow2 = [
            "", "",
            ...locations?.flatMap((_e) => ["Phy stock", "Min stock", "Status"])
        ];

        worksheet.addRow(headerRow1);
        worksheet.addRow(headerRow2);

        // Merge headers
        worksheet.mergeCells('A1:A2');
        worksheet.mergeCells('B1:B2');
        locations?.forEach((_loc, index) => {
            worksheet.mergeCells(`${String.fromCharCode(67 + (index * 3))}1:${String.fromCharCode(67 + (index * 3) + 2)}1`);
        });
        // Style headers
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(2).font = { bold: true };
        worksheet.getRow(1).alignment = { horizontal: 'center' };
        worksheet.getRow(2).alignment = { horizontal: 'center' };

        // Add Data
        items.forEach(item => {
            const rowData: any[] = [item.itemCode, item.itemName];
            const itemMin = minValues[item.itemCode] || locations?.reduce<MinValuesRecord[string]>((acc, loc) => {
                acc[loc.warehouseCode] = 0;
                return acc;
            }, {} as MinValuesRecord[string]);
            const itemPhy = phyValues[item.itemCode] || locations?.reduce<PhyValuesRecord[string]>((acc, loc) => {
                acc[loc.warehouseCode] = 0;
                return acc;
            }, {} as PhyValuesRecord[string]);

            locations?.forEach(loc => {
                const wKey = loc.warehouseCode as keyof MinValuesRecord[string];
                const min = itemMin[wKey];
                const phy = itemPhy[wKey];

                rowData.push(phy);
                rowData.push(min);
                rowData.push(getStatus(min, phy).label);
            });
            const row = worksheet.addRow(rowData);

            locations?.forEach((loc, index) => {
                const wKey = loc.warehouseCode as keyof MinValuesRecord[string];
                const min = itemMin[wKey];
                const phy = itemPhy[wKey];

                if (phy < min) {
                    const statusCell = row.getCell(5 + (index * 3));
                    statusCell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "FFFF0000" }, // Red background
                    };
                    statusCell.font = {
                        color: { argb: "FFFFFFFF" }, // White text
                        bold: true,
                    };
                }
            });
        });

        // Set column widths
        worksheet.columns.forEach(column => {
            column.width = 25;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "distribution_plan_export.xlsx";
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <CircularProgress disableShrink size={40} />
            </Box>
        );
    }

    return (
        <Box>
            {openExcel && (
                <ExcelUploadButton
                    open={openExcel}
                    handleClose={() => setOpenExcel(false)}
                    templateHeaders={["itemCode", "itemName", "warehouse1", "warehouse2", "warehouse3", "warehouse4", "warehouse5"]}
                    templateWidths={[{ wpx: 150 }, { wpx: 250 }, { wpx: 100 }, { wpx: 100 }, { wpx: 100 }, { wpx: 100 }, { wpx: 100 }]}
                    templateFileName="distributionPlanTemplate.xlsx"
                    onLocalUpload={handleLocalUpload}
                />
            )}

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">Distribution Table</Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                        variant="outlined"
                        sx={{ background: "#479759ff", fontSize: "10px", color: "white", "&:hover": { background: "#3d824c" } }}
                        startIcon={<UploadOutlined />}
                        onClick={() => setOpenExcel(true)}
                    >
                        Upload Physical Stock
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ fontSize: "10px", }}
                        startIcon={<Download />}
                        onClick={handleExport}
                    >
                        Export Plan
                    </Button>
                </Box>
            </Box>

            <TableContainer sx={{ maxHeight: "600px", width: "100%", maxWidth: "70vw", overflowX: "auto", overflowY: "auto" }}>
                <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
                    <TableHead >
                        <TableRow>
                            <TableCell rowSpan={2} sx={{ position: "sticky", left: 0, zIndex: 3, width: 120, minWidth: 120, fontWeight: "bold", bgcolor: "background.default", borderRight: "1px solid rgba(224, 224, 224, 1)" }}>Item Code</TableCell>
                            <TableCell rowSpan={2} sx={{ position: "sticky", left: 120, zIndex: 3, width: 250, minWidth: 250, fontWeight: "bold", bgcolor: "background.default", borderRight: "2px solid rgba(224, 224, 224, 1)" }}>Item Name</TableCell>
                            {locations.map((location) => (
                                <TableCell
                                    key={location.warehouseCode}
                                    colSpan={3}
                                    align="center"
                                    sx={{ fontWeight: "bold", bgcolor: "background.default", borderRight: "1px solid rgba(224, 224, 224, 1)" }}
                                >
                                    {location.warehouseName}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow>
                            {locations.map((location) => (
                                <React.Fragment key={location.warehouseCode}>
                                    <TableCell sx={{ fontWeight: "bold", fontSize: "12px", bgcolor: "background.default", width: "200px" }}>Physical Stock</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", fontSize: "12px", bgcolor: "background.default", width: "200px" }}>Min Stock</TableCell>
                                    <TableCell sx={{ fontWeight: "bold", fontSize: "12px", bgcolor: "background.default", borderRight: "1px solid rgba(224, 224, 224, 1)", width: "200px" }}>Status</TableCell>
                                </React.Fragment>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={17} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">No items found.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => {
                                const itemMin = minValues[item.itemCode] || locations.reduce((acc, location) => {
                                    acc[location.warehouseCode] = 0;
                                    return acc;
                                }, {} as MinValuesRecord[string]);

                                const itemPhy = phyValues[item.itemCode] || locations.reduce((acc, location) => {
                                    acc[location.warehouseCode] = 0;
                                    return acc;
                                }, {} as PhyValuesRecord[string]);

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell sx={{ position: "sticky", left: 0, zIndex: 1, bgcolor: "background.paper", borderRight: "1px solid rgba(224, 224, 224, 1)", width: '100px' }}>{item.itemCode}</TableCell>
                                        <TableCell sx={{ position: "sticky", left: 120, zIndex: 1, bgcolor: "background.paper", borderRight: "2px solid rgba(224, 224, 224, 1)", fontSize: '12px' }}>{item.itemName}</TableCell>

                                        {locations?.map((location) => {
                                            const wKey = location.warehouseCode as keyof MinValuesRecord[string];
                                            const min = itemMin[wKey];
                                            const phy = itemPhy[wKey];
                                            const statusObj = getStatus(min, phy);

                                            return (
                                                <React.Fragment key={location.warehouseCode}>
                                                    <TableCell>{phy}</TableCell>
                                                    <TableCell>{min}</TableCell>
                                                    <TableCell sx={{ borderRight: "1px solid rgba(224, 224, 224, 1)" }}>
                                                        {statusObj.label !== "-" ? (
                                                            <Chip
                                                                label={statusObj.label}
                                                                color={statusObj.color}
                                                                size="small"
                                                                sx={{ fontWeight: "bold", minWidth: 60 }}
                                                            />
                                                        ) : "-"}
                                                    </TableCell>
                                                </React.Fragment>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DistributionTab;
