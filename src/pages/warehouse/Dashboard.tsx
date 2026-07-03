// import { useState } from "react";
// import {
//   Box,
//   Button,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TextField,
//   Typography,
// } from "@mui/material";

// export default function ItemMaster() {
//   const [rows, setRows] = useState<any>([]);

//   // Add New Row
//   const handleAddRow = () => {
//     setRows([
//       ...rows,
//       {
//         id: Date.now(),
//         itemCode: "",
//         itemName: "",
//         bottlePerCase: "",
//         openingStock: "",
//       },
//     ]);
//   };

//   // Handle Input Change
//   const handleChange = (id: any, field: any, value: any) => {
//     setRows((prevRows: any) =>
//       prevRows.map((row: any) =>
//         row.id === id ? { ...row, [field]: value } : row
//       )
//     );
//   };

//   // Save Data
//   const handleSave = () => {
//     console.log(rows);

//     // Example API Call
//     // axios.post("/api/items", rows)
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       {/* Header */}
//       <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
//       >
//         <Typography variant="h5">
//           Item Master
//         </Typography>

//         <Box sx={{ display: "flex", gap: 3 }}>
//           <Button
//             variant="contained"
//             onClick={handleAddRow}
//           >
//             + Add Item
//           </Button>

//           {/* Save Button */}
//           <Box mt={3} display="flex" justifyContent="flex-end">
//             <Button
//               variant="contained"
//               color="success"
//               onClick={handleSave}
//             >
//               Save
//             </Button>
//           </Box>
//         </Box>
//       </Box>

//       {/* Table */}
//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell><b>Item Code</b></TableCell>
//               <TableCell><b>Item Name</b></TableCell>
//               <TableCell><b>Bottle / Case</b></TableCell>
//               <TableCell><b>Opening Stock</b></TableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {rows.map((row) => (
//               <TableRow key={row.id}>
//                 <TableCell>
//                   <TextField
//                     size="small"
//                     fullWidth
//                     value={row.itemCode}
//                     onChange={(e) =>
//                       handleChange(
//                         row.id,
//                         "itemCode",
//                         e.target.value
//                       )
//                     }
//                   />
//                 </TableCell>

//                 <TableCell>
//                   <TextField
//                     size="small"
//                     fullWidth
//                     value={row.itemName}
//                     onChange={(e) =>
//                       handleChange(
//                         row.id,
//                         "itemName",
//                         e.target.value
//                       )
//                     }
//                   />
//                 </TableCell>

//                 <TableCell>
//                   <TextField
//                     size="small"
//                     fullWidth
//                     type="number"
//                     value={row.bottlePerCase}
//                     onChange={(e) =>
//                       handleChange(
//                         row.id,
//                         "bottlePerCase",
//                         e.target.value
//                       )
//                     }
//                   />
//                 </TableCell>

//                 <TableCell>
//                   <TextField
//                     size="small"
//                     fullWidth
//                     type="number"
//                     value={row.openingStock}
//                     onChange={(e) =>
//                       handleChange(
//                         row.id,
//                         "openingStock",
//                         e.target.value
//                       )
//                     }
//                   />
//                 </TableCell>
//               </TableRow>
//             ))}

//             {rows.length === 0 && (
//               <TableRow>
//                 <TableCell align="center" colSpan={4}>
//                   No Items Added
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>


//     </Box >

//   );
// }