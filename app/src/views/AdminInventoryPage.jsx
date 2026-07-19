import { useState } from "react";
import {
    Box,
    Button,
    Chip,
    IconButton,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { useSnackbar } from "notistack";

import { useAdmin } from "../context/AdminContext";
import CreateInventoryItemModal from "../components/adminComponents/CreateInventoryItemModal";
import RestockModal from "../components/adminComponents/RestockModal";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";

export default function AdminInventoryPage() {
    const { inventoryItems, inventoryItemsLoading, createInventoryItem, restockItem, refreshAll } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [restockTarget, setRestockTarget] = useState(null);

    const handleCreate = async (data) => {
        await createInventoryItem(data);
        enqueueSnackbar("Inventory item created.", { variant: "success" });
    };

    const handleRestock = async (itemId, quantity, expenseCategory, expenseAmount, expenseDescription) => {
        await restockItem(itemId, quantity, expenseCategory, expenseAmount, expenseDescription);
        enqueueSnackbar("Restocked and expense logged.", { variant: "success" });
    };

    const skeletonRows = Array.from({ length: 5 });

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <AdminPageHero
                title="Inventory"
                description="Paper and toner stock. Paper decrements automatically as print jobs complete; restocking logs the expense in the same step."
                action={(
                    <Box sx={{ display: "flex", gap: 1, flexDirection: { xs: "column", md: "row" } }}>
                        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setCreateModalOpen(true)}>
                            New Item
                        </Button>
                        <Button startIcon={<RefreshIcon />} variant="outlined" onClick={refreshAll}>
                            Refresh
                        </Button>
                    </Box>
                )}
            />

            <AdminSurface title="Stock Levels" description="Items at or below their low-stock threshold are flagged.">
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        maxHeight: "calc(80vh - 180px)",
                        overflowY: "auto",
                        borderRadius: 2.5,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "none",
                        bgcolor: "rgba(255,255,255,0.75)"
                    }}
                >
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Stock</TableCell>
                                <TableCell align="right">Threshold</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inventoryItemsLoading ? (
                                skeletonRows.map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={6}><Skeleton /></TableCell></TableRow>
                                ))
                            ) : !inventoryItems?.length ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="body2" color="text.secondary">No inventory items yet.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inventoryItems.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">{item.name}</Typography>
                                            {item.reorder_supplier && (
                                                <Typography variant="caption" color="text.secondary">via {item.reorder_supplier}</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ textTransform: "capitalize" }}>{item.category.replace("_", " ")}</TableCell>
                                        <TableCell align="right">{Number(item.current_stock).toFixed(0)} {item.unit}</TableCell>
                                        <TableCell align="right">{Number(item.low_stock_threshold).toFixed(0)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.is_low_stock ? "Low stock" : "OK"}
                                                color={item.is_low_stock ? "error" : "success"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Restock">
                                                <IconButton size="small" onClick={() => setRestockTarget(item)} aria-label="Restock">
                                                    <Inventory2Icon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </AdminSurface>

            <CreateInventoryItemModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreate}
            />
            <RestockModal
                open={Boolean(restockTarget)}
                onClose={() => setRestockTarget(null)}
                item={restockTarget}
                onSubmit={handleRestock}
            />
        </Box>
    );
}
