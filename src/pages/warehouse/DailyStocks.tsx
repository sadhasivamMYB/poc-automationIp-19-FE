import { useEffect, useState } from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Button,
    InputAdornment,
    CircularProgress,
    Typography

} from "@mui/material";
import api from "../../services/api";
import { toast } from "sonner";
import { ConformationDialog } from "../../components/ConformationDialog";
import { SearchOutlined } from "@mui/icons-material";



const DailyStock = () => {

    const [rows, setRows] = useState<any>();
    // const [warehouseDetails, setWarehouseDetails] = useState<any>();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [loading, setLoading] = useState<any>()

    console.log()

    const fetchItems = async () => {
        try {
            const response = await api.get("/daily-stock/today");
            if (response.data.success) {
                setRows(response.data.data);

            }
        } catch (error) {
            console.error("Failed to fetch items", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    console.log(rows)

    const filterdData = rows?.filter(row =>
        row.itemCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.itemName?.toLowerCase().includes(searchQuery.toLowerCase())
    )


    const calculateClosing = (row) => {
        const bottlePerCase = row.bottlePerCase;

        const opening =
            row.openingCases * bottlePerCase +
            row.openingBottles;

        const received =
            row.receivedCases * bottlePerCase +
            row.receivedBottles;

        const issued =
            row.issuedCases * bottlePerCase +
            row.issuedBottles;

        const total = opening + received - issued;

        return {
            closingCases: Math.floor(total / bottlePerCase),
            closingBottles: total % bottlePerCase,
        };
    };

    const handleChange = (id, field, value) => {
        const number = Number(value) || 0;

        setRows((prev) =>
            prev?.map((row) => {

                if (row.id !== id) return row;

                const updatedRow = {
                    ...row,
                    [field]: number,
                };

                const closing = calculateClosing(updatedRow);

                return {
                    ...updatedRow,
                    closingCases: closing.closingCases,
                    closingBottles: closing.closingBottles,
                };
            })
        );
    };

    const handleSave = async () => {
        setDialogOpen(true)

    };

    const handleConformationSubmit = async () => {

        const payload = {
            stocks: rows?.map((row) => ({
                id: row.id,
                itemId: row?.itemId,

                receivedCases: row.receivedCases,
                receivedBottles: row.receivedBottles,

                issuedCases: row.issuedCases,
                issuedBottles: row.issuedBottles,
            })),
        };


        // console.log(payload);

        try {
            const response = await api.put("/daily-stock/bulk", payload)
            if (response.data.success) {
                toast.success(response.data.message);
                setDialogOpen(false)
            }

        }
        catch (err) {
            toast.error(err.message);
            setDialogOpen(false)
        }


    }

    return (
        <Box>

            {dialogOpen && <ConformationDialog open={dialogOpen} handleClose={() => setDialogOpen(false)} handleSubmit={handleConformationSubmit} />
            }

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }} >

                {/* <Box>
                    <Typography >
                        Warehouse : <span style={{ fontWeight: "700", }}>{warehouseDetails && warehouseDetails?.warehouseName}</span> <br></br>
                        Id : {warehouseDetails && warehouseDetails?.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Date : {new Date().toISOString().split("T")[0]}
                    </Typography>
                </Box > */}

                {/* Search box */}
                <TextField
                    size="small"
                    placeholder="Search by Item Code or Item Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: 500 }}
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

                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={rows?.length > 0 && rows[0].status === "LOCKED"}
                >
                    Save
                </Button>
            </Box>

            <TableContainer
                component={Paper}
                elevation={3}
                sx={{
                    borderRadius: 2,
                    overflow: "auto",
                }}
            >
                <Table size="small">
                    <TableHead>
                        {/* Main Header */}
                        <TableRow
                            sx={{
                                "& th": {
                                    bgcolor: "#5659ffff",
                                    color: "white",
                                    fontWeight: 400,
                                    textAlign: "center",
                                },
                            }}
                        >
                            <TableCell rowSpan={2}>Item Code</TableCell>
                            <TableCell rowSpan={2}>Item Name</TableCell>
                            <TableCell rowSpan={2}>Bottle / Case</TableCell>

                            <TableCell colSpan={2}>Opening Stock</TableCell>
                            <TableCell colSpan={2}>Received Stock</TableCell>
                            <TableCell colSpan={2}>Issued Stock</TableCell>
                            <TableCell colSpan={2}>Closing Stock</TableCell>
                        </TableRow>

                        {/* Sub Header */}
                        <TableRow
                            sx={{
                                "& th": {
                                    bgcolor: "grey.100",
                                    fontWeight: 400,
                                    textAlign: "center",
                                },
                            }}
                        >
                            <TableCell>Cases</TableCell>
                            <TableCell>Bottles</TableCell>

                            <TableCell>Cases</TableCell>
                            <TableCell>Bottles</TableCell>

                            <TableCell>Cases</TableCell>
                            <TableCell>Bottles</TableCell>

                            <TableCell>Cases</TableCell>
                            <TableCell>Bottles</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {
                            loading ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center" sx={{ py: 10 }}>
                                        <CircularProgress size={40} thickness={4} />
                                        <Typography color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>Fetching Data...</Typography>
                                    </TableCell>
                                </TableRow>

                            ) : filterdData?.length == 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                                        <Typography color="text.secondary">No items to display.</Typography>
                                    </TableCell>
                                </TableRow>
                            )
                                : filterdData?.map((row) => (
                                    <TableRow
                                        hover
                                        key={row.id}
                                        sx={{
                                            "&:nth-of-type(even)": {
                                                bgcolor: "grey.50",
                                            },
                                        }}
                                    >
                                        <TableCell>{row.itemCode}</TableCell>

                                        <TableCell>{row.itemName}</TableCell>

                                        <TableCell align="center">
                                            {row.bottlePerCase}
                                        </TableCell>

                                        {/* Opening */}
                                        <TableCell align="center">
                                            {row.openingCases}
                                        </TableCell>

                                        <TableCell align="center">
                                            {row.openingBottles}
                                        </TableCell>

                                        {/* Received */}
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={row.receivedCases}
                                                disabled={row.status === "LOCKED"}
                                                onChange={(e) =>
                                                    handleChange(row.id, "receivedCases", e.target.value)
                                                }
                                                sx={{ width: 90 }}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={row.receivedBottles}
                                                disabled={row.status === "LOCKED"}
                                                onChange={(e) =>
                                                    handleChange(row.id, "receivedBottles", e.target.value)
                                                }
                                                sx={{ width: 90 }}
                                            />
                                        </TableCell>

                                        {/* Issued */}
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={row.issuedCases}
                                                disabled={row.status === "LOCKED"}
                                                onChange={(e) =>
                                                    handleChange(row.id, "issuedCases", e.target.value)
                                                }
                                                sx={{ width: 90 }}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <TextField
                                                size="small"
                                                type="number"
                                                value={row.issuedBottles}
                                                disabled={row.status === "LOCKED"}
                                                onChange={(e) =>
                                                    handleChange(row.id, "issuedBottles", e.target.value)
                                                }
                                                sx={{ width: 90 }}
                                            />
                                        </TableCell>

                                        {/* Closing */}
                                        <TableCell>
                                            {row.closingCases || 0}
                                        </TableCell>

                                        <TableCell>

                                            {row.closingBottles || 0}

                                        </TableCell>
                                    </TableRow>

                                )
                                )
                        }


                    </TableBody>
                </Table>
            </TableContainer>


        </Box>
    );
}

export default DailyStock;