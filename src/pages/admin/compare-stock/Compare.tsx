import { Box, Button, InputAdornment, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, CircularProgress, Chip } from "@mui/material"
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { Add, SearchOutlined, UploadOutlined, CheckCircleOutlined, ErrorOutlined } from "@mui/icons-material";
import ExcelUploadButton from "../../../components/ExcelFileUploadButton";

export const calculateDifference = (stock: any): number => {
    const num = (val: any) => {
        if (val === null || val === undefined || val === '') return 0;
        const parsed = Number(val);
        return Number.isNaN(parsed) ? 0 : parsed;
    };
    return (
        (num(stock.physicalStock) + num(stock.manual)) -
        (num(stock.systemStock) + num(stock.pendingSupply) + num(stock.blocked) - num(stock.damages)) +
        num(stock.stoPending) -
        num(stock.grnPending) -
        num(stock.salesReturn)
    );
};

const Compare = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [openExcel, setOpenExcel] = useState(false);
    const [loading, setLoading] = useState(false);

    const [warehouses, setWarehouses] = useState<any[]>([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
    const [masterItems, setMasterItems] = useState<any[]>([]);

    // Data states
    const [dailyStocks, setDailyStocks] = useState<any[]>([]); // Array of all daily stocks for date
    const [excelData, setExcelData] = useState<any[]>(() => {
        try {
            const saved = localStorage.getItem('compareExcelData');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [excelFileName, setExcelFileName] = useState<string>(() => {
        return localStorage.getItem('compareExcelFileName') || "";
    });
    const [savedData, setSavedData] = useState<any[]>([]); // Data from /compare-stock API if exists

    // Edits
    const [edits, setEdits] = useState<Record<string, any>>({});
    const [visitedWarehouses, setVisitedWarehouses] = useState<Set<string>>(new Set());
    const [openSummary, setOpenSummary] = useState(false);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const maxDate = yesterday.toISOString().split("T")[0];

    const fetchWarehouses = async () => {
        try {
            const response = await api.get("/warehouse");
            if (response.data?.success) {
                setWarehouses(response.data.warehouseDetails || response.data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch warehouses", error);
        }

    }
    const fetchMasterItems = async () => {
        try {
            const response = await api.get("/master-item");
            if (response.data?.success) {
                setMasterItems(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch master items", error);
        }
    }

    useEffect(() => {

        fetchWarehouses();
        fetchMasterItems();

    }, [])

    console.log(warehouses)

    useEffect(() => {
        if (selectedWarehouse) {
            setVisitedWarehouses(prev => {
                const next = new Set(prev);
                next.add(selectedWarehouse);
                return next;
            });
        }
    }, [selectedWarehouse]);

    // Default to user's warehouse if available
    useEffect(() => {
        if (!selectedWarehouse && warehouses?.length > 0) {
            setSelectedWarehouse(user?.warehouseId || warehouses[0]?.id);
        }
    }, [user, warehouses, selectedWarehouse]);

    const fetchData = async (date: string) => {
        if (!date) return;
        setLoading(true);
        setDailyStocks([]);
        setSavedData([]);

        try {
            // // Check if saved data exists
            // let hasSavedData = false;
            try {
                const compareRes = await api.get("/compare", { params: { date } });
                if (compareRes.data?.success && compareRes.data?.data?.length > 0) {
                    setSavedData(compareRes.data.data);
                    // hasSavedData = true;
                    toast.success("Loaded saved comparison data.");
                }
            } catch (e) {
                console.log("No saved comparison data for this date.");
            }

            // Fetch daily stock for ALL warehouses individually to provide warehouseId
            const dsPromises = warehouses?.map(wh =>
                api.get("/daily-stock/history", { params: { date, warehouseId: wh.id } })
                    .then(res => ({ res, warehouseId: wh.id, warehouseCode: wh.warehouseCode || wh.name }))
                    .catch(() => null)
            );

            const dsResponses = await Promise.all(dsPromises);
            const allDs = dsResponses.flatMap(item => {
                if (item?.res?.data?.success && item.res.data.data) {
                    return item.res.data.data.map((ds: any) => ({
                        ...ds,
                        warehouseId: item.warehouseId,
                        warehouseCode: item.warehouseCode
                    }));
                }
                return [];
            });
            setDailyStocks(allDs);

        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to fetch data for the selected date");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDate) {
            fetchData(selectedDate);
        } else {
            setDailyStocks([]);
            setSavedData([]);
            setEdits({});
        }
    }, [selectedDate]);

    console.log(excelData)

    const handleLocalUpload = (parsedData: any[], fileName?: string) => {
        let normalizedData: any[] = [];
        if (parsedData.length > 0) {
            const firstRow = parsedData[0];
            if ("warehouse_code" in firstRow || "warehouse_code" in (parsedData[1] || {})) {
                normalizedData = parsedData;
            } else {
                parsedData.forEach(row => {
                    const itemName = row["Storage Location"] || row["ITEM NAME"] || row["Item Name"];
                    const itemCode = row["itemCode"] || row["Item Code"] || row["item code"] || row["ITEM CODE"] || row["Material"];
                    if (!itemName || itemName === "ITEM NAME") return;
                    Object.keys(row).forEach(key => {
                        if (key.includes("EMPTY") || key === "Storage Location" || key === "Item Code" || key === "ITEM NAME" || key === "Material" || key === "item code" || key === "itemCode" || key === "ITEM CODE" || key === "Total") return;
                        const stock = Number(row[key]);
                        if (!isNaN(stock)) {
                            normalizedData.push({
                                warehouse_code: key,
                                itemCode: itemCode ? String(itemCode) : undefined,
                                itemName: itemName ? String(itemName) : undefined,
                                system_stock: stock
                            });
                        }
                    });
                });
            }
        }
        setExcelData(normalizedData);
        localStorage.setItem('compareExcelData', JSON.stringify(normalizedData));
        if (fileName) {
            setExcelFileName(fileName);
            localStorage.setItem('compareExcelFileName', fileName);
        }
        toast.success(`Successfully parsed records from Excel.`);
    };

    const handleClearExcelData = () => {
        setExcelData([]);
        setExcelFileName("");
        localStorage.removeItem('compareExcelData');
        localStorage.removeItem('compareExcelFileName');
        toast.success("Cleared Excel data successfully.");
    };

    const handleEditChange = (warehouseCode: string, itemCode: string, field: string, value: string) => {
        const key = `${warehouseCode}_${itemCode}`;
        setEdits(prev => ({
            ...prev,
            [key]: {
                ...(prev[key] || {}),
                [field]: value
            }
        }));
    };

    // Derived merged data
    const mergedData = useMemo(() => {
        const result: any[] = [];

        if (!selectedWarehouse) return result;

        // Find warehouse code (assuming warehouses have warehouseCode or name)
        const whObj = warehouses?.find(w => w.id === selectedWarehouse || w.warehouseCode === selectedWarehouse || w.name === selectedWarehouse);
        const whCode = whObj?.warehouseCode || whObj?.name || whObj?.id;


        // Filter daily stocks for this warehouse
        const dsForWh = dailyStocks.filter(ds =>
            ds.warehouseId === selectedWarehouse ||
            ds.warehouse?.id === selectedWarehouse ||
            ds.warehouseCode === whCode
        );

        // Filter excel for this warehouse
        const exForWh = excelData.filter(e => e.warehouse_code === whCode);

        const exMapByCode = new Map();
        const exMapByName = new Map();
        exForWh.forEach(ex => {
            if (ex.itemCode) exMapByCode.set(ex.itemCode, ex);
            if (ex.itemName) exMapByName.set(ex.itemName, ex);
        });


        // Merge rules:
        // 1. Both exist -> display both
        // 2. Daily only -> System stock = 0
        // 3. Excel only -> Ignore

        // Saved data overrides? If we have saved data, we just display that for the warehouse.
        const sdForWh = savedData.filter(sd => sd.warehouseId === selectedWarehouse || sd.warehouseCode === whCode);

        const baseMap = new Map();
        masterItems.forEach(mi => {
            baseMap.set(mi.itemCode, {
                itemCode: mi.itemCode,
                itemName: mi.itemName,
                physicalStock: 0,
                isSaved: false
            });
        });

        if (sdForWh.length > 0) {
            sdForWh.forEach(sd => {
                baseMap.set(sd.itemCode, { ...sd, isSaved: true });
            });
        } else {
            dsForWh.forEach(ds => {
                const physicalStock = Number(((ds.openingCases || 0) * (ds.bottlePerCase || 1) + (ds.openingBottles || 0)) / (ds.bottlePerCase || 1));
                baseMap.set(ds.itemCode, {
                    ...baseMap.get(ds.itemCode),
                    itemCode: ds.itemCode,
                    itemName: ds.itemName,
                    physicalStock,
                    isSaved: false
                });
            });
        }

        baseMap.forEach((baseItem, itemCode) => {
            const ex = exMapByCode.get(itemCode) || exMapByName.get(baseItem.itemName);

            const systemStock = ex ? Number(ex.system_stock || 0) : (baseItem.isSaved ? Number(baseItem.systemStock || 0) : 0);

            const key = `${whCode}_${itemCode}`;
            const edit = edits[key] || {};

            const sanitize = (val: any) => {
                if (val === null || val === undefined) return '';
                if (Number.isNaN(Number(val))) return '';
                return val;
            };

            result.push({
                ...baseItem,
                warehouseCode: whCode,
                systemStock,
                manual: edit.manual !== undefined ? edit.manual : (baseItem.isSaved ? sanitize(baseItem.manual) : ''),
                salesReturn: edit.salesReturn !== undefined ? edit.salesReturn : (baseItem.isSaved ? sanitize(baseItem.salesReturn) : ''),
                blocked: edit.blocked !== undefined ? edit.blocked : (baseItem.isSaved ? sanitize(baseItem.blocked) : ''),
                stoPending: edit.stoPending !== undefined ? edit.stoPending : (baseItem.isSaved ? sanitize(baseItem.stoPending) : ''),
                grnPending: edit.grnPending !== undefined ? edit.grnPending : (baseItem.isSaved ? sanitize(baseItem.grnPending) : ''),
                damages: edit.damages !== undefined ? edit.damages : (baseItem.isSaved ? sanitize(baseItem.damages) : ''),
                pendingSupply: edit.pendingSupply !== undefined ? edit.pendingSupply : (baseItem.isSaved ? sanitize(baseItem.pendingSupply) : ''),
            });
        });

        // Search filter
        return result.filter(r =>
            !searchQuery ||
            r.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.itemName?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    }, [selectedWarehouse, dailyStocks, excelData, savedData, edits, searchQuery, warehouses]);

    const handleSaveInit = () => {
        if (!selectedDate) {
            toast.error("Please select a date first.");
            return;
        }
        setOpenSummary(true);
    };


    // function stockDiff(stock: any) {
    //     console.log(Number((stock.physicalStock + stock.manual) - (stock.systemStock + Number(stock.pendingSupply || 0) + stock.blocked - stock.damages) + stock.stoPending - stock.grnPending - stock.salesReturn))

    // }



    const handleConfirmSave = async () => {
        setLoading(true);
        try {
            // Build payload for ALL warehouses
            const payload: any[] = [];

            // Iterate over all warehouses to build full payload
            warehouses?.forEach(wh => {
                const whCode = wh.warehouseCode || wh.name || wh.id;

                // If saved data exists for this warehouse, maybe we just include it as is or update it
                const dsForWh = dailyStocks.filter(ds => ds.warehouseId === wh.id || ds.warehouse?.id === wh.id || ds.warehouseCode === whCode);
                const sdForWh = savedData.filter(sd => sd.warehouseId === wh.id || sd.warehouseCode === whCode);
                const exForWh = excelData.filter(ex => ex.warehouse_code === whCode);

                const exMapByCode = new Map();
                const exMapByName = new Map();
                exForWh.forEach(ex => {
                    if (ex.itemCode) exMapByCode.set(ex.itemCode, ex);
                    if (ex.itemName) exMapByName.set(ex.itemName, ex);
                });

                const sdMapByCode = new Map();
                sdForWh.forEach(sd => {
                    if (sd.itemCode) sdMapByCode.set(sd.itemCode, sd);
                });

                const baseMap = new Map();
                masterItems.forEach(mi => {
                    baseMap.set(mi.itemCode, {
                        itemCode: mi.itemCode,
                        itemName: mi.itemName,
                        physicalStock: 0
                    });
                });

                dsForWh.forEach(ds => {
                    const physicalStock = Number(((ds.openingCases || 0) * (ds.bottlePerCase || 1) + (ds.openingBottles || 0)) / (ds.bottlePerCase || 1));
                    baseMap.set(ds.itemCode, {
                        ...baseMap.get(ds.itemCode),
                        itemCode: ds.itemCode,
                        itemName: ds.itemName,
                        physicalStock
                    });
                });

                baseMap.forEach((baseItem, itemCode) => {
                    const ex = exMapByCode.get(itemCode) || exMapByName.get(baseItem.itemName);
                    const sd = sdMapByCode.get(itemCode);
                    const physicalStock = baseItem.physicalStock;
                    const systemStock = ex ? Number(ex.system_stock || 0) : (sd ? Number(sd.systemStock) : 0);

                    const key = `${whCode}_${itemCode}`;
                    const edit = edits[key] || {};

                    const payloadItem = {
                        id: sd ? sd.id : undefined,
                        warehouseId: wh.id,
                        warehouseCode: whCode,
                        date: selectedDate,
                        itemCode: itemCode,
                        itemName: baseItem.itemName,
                        physicalStock,
                        systemStock,
                        manual: edit.manual !== undefined ? Number(edit.manual) : (sd ? Number(sd.manual) : 0),
                        salesReturn: edit.salesReturn !== undefined ? Number(edit.salesReturn) : (sd ? Number(sd.salesReturn) : 0),
                        blocked: edit.blocked !== undefined ? Number(edit.blocked) : (sd ? Number(sd.blocked) : 0),
                        stoPending: edit.stoPending !== undefined ? Number(edit.stoPending) : (sd ? Number(sd.stoPending) : 0),
                        grnPending: edit.grnPending !== undefined ? Number(edit.grnPending) : (sd ? Number(sd.grnPending) : 0),
                        damages: edit.damages !== undefined ? Number(edit.damages) : (sd ? Number(sd.damages) : 0),
                        pendingSupply: edit.pendingSupply !== undefined ? Number(edit.pendingSupply) : (sd ? Number(sd.pendingSupply) : 0),
                    };

                    payload.push({
                        ...payloadItem,
                        difference: calculateDifference(payloadItem)
                    });
                });

            });

            const res = await api.post("/compare/bulk", {
                date: selectedDate,
                data: payload
            });

            if (res.data?.success) {
                toast.success("Successfully saved comparison for all warehouses.");
                setOpenSummary(false);
                localStorage.removeItem("compareExcelData");
                localStorage.removeItem("compareExcelFileName");
                setExcelFileName("");

                fetchData(selectedDate); // reload saved data
            } else {
                toast.error(res.data?.message || "Failed to save.");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <Box sx={{ p: 1, height: "100vh" }}>
            {openExcel && (
                <ExcelUploadButton
                    open={openExcel}
                    handleClose={() => setOpenExcel(false)}
                    templateFileName={"compare-stock.xlsx"}
                    templateHeaders={["warehouse_code", "itemCode", "itemName", "system_stock",]}
                    templateWidths={[{ wpx: 100 }, { wpx: 150 }, { wpx: 300 }, { wpx: 150 }]}
                    onLocalUpload={handleLocalUpload}
                />
            )}

            {/* Validation Summary Dialog */}
            <Dialog open={openSummary} onClose={() => setOpenSummary(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Validation Summary</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>Please review the status of each warehouse before saving.</Typography>
                    <List>
                        {warehouses?.map(wh => {
                            const whCode = wh.warehouseCode || wh.name || wh.id;
                            const isVisited = visitedWarehouses.has(wh.id);
                            // Check if Excel has data for this warehouse
                            const hasExcel = excelData.some(ex => ex.warehouse_code === whCode);
                            // Check if Daily Stock has data for this warehouse
                            const hasDS = dailyStocks.some(ds => ds.warehouseId === wh.id || ds.warehouse?.id === wh.id || ds.warehouseCode === whCode);

                            const isComplete = isVisited && hasExcel && hasDS;

                            return (
                                <ListItem key={wh.id} sx={{ borderBottom: '1px solid #eee' }}>
                                    <ListItemIcon>
                                        {isComplete ? <CheckCircleOutlined color="success" /> : <ErrorOutlined color="warning" />}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={wh.name || wh.warehouseCode || wh.id}
                                        secondary={
                                            (!hasDS ? "Missing Daily Stock. " : "") +
                                            (!hasExcel ? "Missing Excel Data. " : "") +
                                            (!isVisited ? "Not Reviewed." : "")
                                        }
                                    />
                                </ListItem>
                            )
                        })}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSummary(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirmSave} disabled={loading}>Confirm Save</Button>
                </DialogActions>
            </Dialog>

            <Paper sx={{ p: 2, height: "100%", display: 'flex', flexDirection: 'column' }}>
                {/* header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField
                            size="small"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            slotProps={{
                                htmlInput: {
                                    max: maxDate,
                                },
                                inputLabel: {
                                    shrink: true
                                }
                            }}
                            sx={{ width: 200 }}
                        />

                        <TextField
                            size="small"
                            placeholder="Search by Item Code or Item Name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ width: 400 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchOutlined sx={{ fontSize: 24, color: "#9ca3af" }} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    </Box>

                    {excelFileName && (
                        <Chip
                            label={excelFileName}
                            onDelete={handleClearExcelData}
                            color="primary"
                            variant="outlined"
                            sx={{ mr: 2, fontWeight: 500 }}
                        />
                    )}

                    <Box>
                        <Box sx={{ display: "flex", gap: "5px", flexDirection: "row" }}>
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleSaveInit}
                            >
                                Save All
                            </Button>

                            <Button
                                size="small"
                                sx={{ cursor: "pointer", background: "#479759ff", color: "white" }}
                                variant="outlined"
                                startIcon={<UploadOutlined />}
                                onClick={() => setOpenExcel(true)}
                            >
                                Upload Excel
                            </Button>
                        </Box>
                    </Box>
                </Box>

                {/* Location Selection */}
                <Box>
                    <Select onChange={(e) => setSelectedWarehouse(e.target.value)} value={selectedWarehouse} displayEmpty>
                        <MenuItem value={""} disabled>Select Warehouse</MenuItem>
                        {
                            warehouses?.map((w: any) => (
                                <MenuItem key={w.id} value={w.id}>{w.warehouseName || w.warehouseCode || w.id}</MenuItem>
                            ))
                        }
                    </Select>
                </Box>

                {!selectedDate ? (
                    <Box sx={{ mt: 3, p: 4, bgcolor: "#f8fafc", color: "#475569", borderRadius: 2, border: "1px dashed #cbd5e1", textAlign: "center" }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>Please select a date to view or compare stock.</Typography>
                    </Box>
                ) : dailyStocks.length === 0 && !loading ? (
                    <Box sx={{ mt: 3, p: 2, bgcolor: "#fff3cd", color: "#856404", borderRadius: 1, border: "1px solid #ffeeba", textAlign: "center" }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>No stock generated for the selected date.</Typography>
                    </Box>
                ) : (
                    <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, mt: 3, flexGrow: 1 }}>
                        <Table sx={{ minWidth: 650, height: "100%" }} stickyHeader>
                            <TableHead>
                                <TableRow>
                                    {
                                        ["Item Code", "Item Name", "Physical Stock", "System Stock", "Manual", "Pending Supply", "Sales Return", "Blocked", "STO Pending", "GRN Pending", "Damages", "Difference"].map((e: string) => (
                                            <TableCell key={e} sx={{ fontWeight: "bold", bgcolor: "background.default" }}>{e}</TableCell>
                                        ))
                                    }
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center" sx={{ py: 10 }}>
                                            <CircularProgress size={40} thickness={4} />
                                            <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>Fetching Data...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : mergedData?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                                            <Typography color="text.secondary">No items to display. Please select a Date, upload Excel, and select a Warehouse.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    mergedData?.map((stock) => (
                                        <TableRow key={stock.itemCode} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                            <TableCell>{stock?.itemCode}</TableCell>
                                            <TableCell>{stock?.itemName}</TableCell>
                                            <TableCell align="center">{Number(stock?.physicalStock || 0).toFixed(4)}</TableCell>
                                            <TableCell align="center">{stock?.systemStock}</TableCell>


                                            <TableCell align="center">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={stock.manual !== undefined ? stock.manual : ""}
                                                    onChange={(e) => handleEditChange(stock.warehouseCode, stock.itemCode, 'manual', e.target.value)}
                                                    sx={{ width: 90 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={stock.pendingSupply !== undefined ? stock.pendingSupply : ""}
                                                    onChange={(e) => handleEditChange(stock.warehouseCode, stock.itemCode, 'pendingSupply', e.target.value)}
                                                    sx={{ width: 90 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={stock.salesReturn !== undefined ? stock.salesReturn : ""}
                                                    onChange={(e) => handleEditChange(stock.warehouseCode, stock.itemCode, 'salesReturn', e.target.value)}
                                                    sx={{ width: 90 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={stock.blocked !== undefined ? stock.blocked : ""}
                                                    onChange={(e) => handleEditChange(stock.warehouseCode, stock.itemCode, 'blocked', e.target.value)}
                                                    sx={{ width: 90 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={stock.stoPending !== undefined ? stock.stoPending : ""}
                                                    onChange={(e) => handleEditChange(stock.warehouseCode, stock.itemCode, 'stoPending', e.target.value)}
                                                    sx={{ width: 90 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={stock.grnPending !== undefined ? stock.grnPending : ""}
                                                    onChange={(e) => handleEditChange(stock.warehouseCode, stock.itemCode, 'grnPending', e.target.value)}
                                                    sx={{ width: 90 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={stock.damages !== undefined ? stock.damages : ""}
                                                    onChange={(e) => handleEditChange(stock.warehouseCode, stock.itemCode, 'damages', e.target.value)}
                                                    sx={{ width: 90 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right" >{calculateDifference(stock)}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    )
}

export default Compare
