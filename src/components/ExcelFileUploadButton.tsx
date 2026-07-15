import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Paper,
    Divider,
    Collapse,
    Alert,
} from "@mui/material";

import {
    CloudUpload,
    Download,
    Description,
    InfoOutlined,
} from "@mui/icons-material";

import * as XLSX from "xlsx";
import api from "../services/api";
import { toast } from "sonner";



interface ExcelUploadButtonProps {
    open: boolean;
    handleClose: () => void;
    uploadUrl?: string;
    templateHeaders?: string[];
    templateWidths?: { wpx: number }[];
    templateFileName?: string;
    onLocalUpload?: (parsedData: any[], fileName?: string) => void;
}

export default function ExcelUploadButton({
    open,
    handleClose,
    uploadUrl = "/master-item/upload/excel",
    templateHeaders = ["ItemCode", "ItemName", "BottlePerCase", "IsActive"],
    templateWidths = [{ wpx: 150 }, { wpx: 300 }, { wpx: 150 }, { wpx: 100 }],
    templateFileName = "master_item_template.xlsx",
    onLocalUpload
}: ExcelUploadButtonProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [excelError, setExcelError] = useState("");

    // Download template (empty file for users)
    const handleDownloadTemplate = () => {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();

        // Create empty worksheet with required headers
        const worksheet = XLSX.utils.aoa_to_sheet([
            templateHeaders,
        ]);

        // Set column widths for better readability
        worksheet["!cols"] = templateWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

        // Generate and download the Excel file
        XLSX.writeFile(workbook, templateFileName);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            alert("Please select a file.");
            return;
        }

        if (onLocalUpload) {
            try {
                const data = await selectedFile.arrayBuffer();
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                onLocalUpload(jsonData, selectedFile.name);
                handleClose();
            } catch (error) {
                console.error("Local parsing error:", error);
                setExcelError("Failed to parse Excel file locally.");
            }
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile); // ✅ Actual file

        try {
            const response = await api.post(
                uploadUrl,
                formData
            );

            console.log(response.data);
            if (response.data?.success) {
                handleClose();
                toast.success(response.data?.message);
            }
        } catch (error: any) {
            setExcelError(error?.response?.data?.message);
        }
    };





    // Handle file selection
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validTypes = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        if (!validTypes.includes(file.type)) {
            alert("Please upload a valid Excel file (.xls or .xlsx)");
            event.target.value = "";
            setSelectedFile(null);
            setFileName("");
            return;
        }

        setSelectedFile(file);      // ✅ Store the actual File object
        setFileName(file.name);     // Only for display

        console.log(file);
    };

    return (

        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: "#1976d2",
                    color: "#fff",
                    fontWeight: 600,
                }}
            >
                <Description />
                Upload Excel File
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>

                <Typography variant="body2" color="text.secondary" mb={3}>
                    Upload an Excel (.xls/.xlsx) file using the provided template.
                    The uploaded file must follow the required column structure.
                </Typography>

                {/* Download Template */}
                <Button
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleDownloadTemplate}
                    sx={{ mb: 3 }}
                >
                    Download Template
                </Button>

                {/* Upload Box */}
                <Paper
                    variant="outlined"
                    sx={{
                        border: "2px dashed #90caf9",
                        p: 4,
                        textAlign: "center",
                        borderRadius: 2,
                        bgcolor: "#fafafa",
                    }}
                >
                    <CloudUpload
                        sx={{
                            fontSize: 60,
                            color: "#1976d2",
                            mb: 1,
                        }}
                    />

                    <Typography variant="h6">
                        Upload Excel File
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={2}
                    >
                        Supported formats: .xls, .xlsx
                    </Typography>

                    <input
                        accept=".xls,.xlsx"
                        id="excel-upload"
                        type="file"
                        hidden
                        onChange={handleFileChange}
                    />

                    <label htmlFor="excel-upload">
                        <Button
                            variant="contained"
                            component="span"
                            startIcon={<CloudUpload />}
                        >
                            Choose File
                        </Button>
                    </label>

                    {fileName && (
                        <Typography
                            sx={{
                                mt: 2,
                                color: "success.main",
                                fontWeight: 600,
                            }}
                        >
                            Selected: {fileName}
                        </Typography>
                    )}
                </Paper>

                <Divider sx={{ my: 1 }} />

                {/* Error Messages */}
                <Collapse in={!!excelError}>
                    <Alert
                        severity="error"
                        variant="filled"
                        sx={{
                            mt: 2,
                            borderRadius: 2,
                            alignItems: "center",
                        }}
                    >
                        {excelError}
                    </Alert>
                </Collapse>

                <Divider sx={{ my: 1 }} />
                {/* Instructions */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "flex-start",
                    }}
                >
                    <InfoOutlined color="info" />

                    <Box>
                        <Typography fontWeight={600}>
                            Instructions
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            • Only .xls and .xlsx files are allowed.
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            • Download and use the provided template.
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            • Do not modify the column names or order.
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            • Invalid files will be rejected.
                        </Typography>
                    </Box>


                </Box>

            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    disabled={!fileName}
                    onClick={handleUpload}
                >
                    Upload
                </Button>
            </DialogActions>
        </Dialog>
    );
}


