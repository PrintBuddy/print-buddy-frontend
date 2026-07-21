import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Box,
    Button,
    Chip,
    IconButton,
    Tabs,
    Tab,
    Tooltip,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import TuneIcon from "@mui/icons-material/Tune";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "../hooks/useSnackbar";

import { useAdmin } from "../context/AdminContext";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";
import PendingQueueTable from "../components/adminComponents/PendingQueueTable";
import LogExpenseModal from "../components/adminComponents/LogExpenseModal";
import CreateInventoryItemModal from "../components/adminComponents/CreateInventoryItemModal";
import RestockModal from "../components/adminComponents/RestockModal";
import AdjustStockModal from "../components/adminComponents/AdjustStockModal";
import ProductModal from "../components/adminComponents/ProductModal";
import ConfirmDialog from "../components/utils/ConfirmDialog";
import RowActionsMenu from "../components/utils/RowActionsMenu";

const EXPENSE_CATEGORY_COLOR = { toner: "secondary", paper: "primary", maintenance: "warning", other: "default" };

function TabToolbar({ children }) {
    return <Box sx={{ display: "flex", justifyContent: "flex-end", mb: -1 }}>{children}</Box>;
}

function InventoryTab() {
    const { inventoryItems, inventoryItemsLoading, createInventoryItem, updateInventoryItem, adjustStock, restockItem } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [modalState, setModalState] = useState({ open: false, item: null });
    const [restockTarget, setRestockTarget] = useState(null);
    const [adjustTarget, setAdjustTarget] = useState(null);
    const [deactivateTarget, setDeactivateTarget] = useState(null);
    const [deactivating, setDeactivating] = useState(false);

    const handleSubmit = async (itemId, data) => {
        if (itemId) {
            await updateInventoryItem(itemId, data);
            enqueueSnackbar("Inventory item updated.", { variant: "success" });
        } else {
            await createInventoryItem(data);
            enqueueSnackbar("Inventory item created.", { variant: "success" });
        }
    };

    const handleRestock = async (itemId, quantity) => {
        await restockItem(itemId, quantity);
        enqueueSnackbar("Stock updated.", { variant: "success" });
    };

    const handleAdjust = async (itemId, delta, notes) => {
        await adjustStock(itemId, delta, notes);
        enqueueSnackbar("Stock adjusted.", { variant: "success" });
    };

    const handleDeactivate = async () => {
        if (!deactivateTarget) return;
        setDeactivating(true);
        try {
            await updateInventoryItem(deactivateTarget.id, { is_active: false });
            enqueueSnackbar(`"${deactivateTarget.name}" deactivated.`, { variant: "success" });
        } catch {
            enqueueSnackbar("Failed to deactivate item.", { variant: "error" });
        } finally {
            setDeactivating(false);
            setDeactivateTarget(null);
        }
    };

    return (
        <>
            <TabToolbar>
                <Button startIcon={<AddIcon />} variant="contained" onClick={() => setModalState({ open: true, item: null })}>
                    New Item
                </Button>
            </TabToolbar>

            <AdminSurface title="Stock Levels" description="Items at or below their low-stock threshold are flagged. Inactive items keep their movement history but stay out of the way.">
                <PendingQueueTable
                    data={inventoryItems}
                    isLoading={inventoryItemsLoading}
                    emptyMessage="No inventory items yet."
                    getRowSx={(item) => ({ opacity: item.is_active ? 1 : 0.6 })}
                    columns={[
                        {
                            header: "Name",
                            render: (item) => (
                                <>
                                    <Typography variant="body2" fontWeight="medium">{item.name}</Typography>
                                    {item.reorder_supplier && (
                                        <Typography variant="caption" color="text.secondary">via {item.reorder_supplier}</Typography>
                                    )}
                                </>
                            ),
                        },
                        { header: "Category", render: (item) => <Box sx={{ textTransform: "capitalize" }}>{item.category.replace("_", " ")}</Box> },
                        { header: "Stock", render: (item) => `${Number(item.current_stock).toFixed(0)} ${item.unit}` },
                        { header: "Threshold", render: (item) => Number(item.low_stock_threshold).toFixed(0) },
                        {
                            header: "Status",
                            render: (item) => !item.is_active ? (
                                <Chip label="Inactive" color="default" size="small" />
                            ) : (
                                <Chip
                                    label={item.is_low_stock ? "Low stock" : "OK"}
                                    color={item.is_low_stock ? "error" : "success"}
                                    size="small"
                                />
                            ),
                        },
                    ]}
                    renderActions={(item) => (
                        <>
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => setModalState({ open: true, item })} aria-label="Edit item">
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Restock">
                                <IconButton size="small" onClick={() => setRestockTarget(item)} aria-label="Restock">
                                    <Inventory2Icon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Adjust stock">
                                <IconButton size="small" onClick={() => setAdjustTarget(item)} aria-label="Adjust stock">
                                    <TuneIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            {item.is_active && (
                                <Tooltip title="Deactivate">
                                    <IconButton size="small" color="error" onClick={() => setDeactivateTarget(item)} aria-label="Deactivate item">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </>
                    )}
                    renderMobileRow={(item) => ({
                        primary: item.name,
                        secondary: `${item.category.replace("_", " ")} • ${Number(item.current_stock).toFixed(0)} ${item.unit}`,
                        trailing: (
                            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                                {!item.is_active ? (
                                    <Chip label="Inactive" color="default" size="small" />
                                ) : (
                                    <Chip
                                        label={item.is_low_stock ? "Low stock" : "OK"}
                                        color={item.is_low_stock ? "error" : "success"}
                                        size="small"
                                    />
                                )}
                                <RowActionsMenu
                                    actions={[
                                        { label: "Edit", icon: <EditIcon fontSize="small" />, onClick: () => setModalState({ open: true, item }) },
                                        { label: "Restock", icon: <Inventory2Icon fontSize="small" />, onClick: () => setRestockTarget(item) },
                                        { label: "Adjust stock", icon: <TuneIcon fontSize="small" />, onClick: () => setAdjustTarget(item) },
                                        {
                                            label: "Deactivate", icon: <DeleteIcon fontSize="small" />, color: "error",
                                            onClick: () => setDeactivateTarget(item), hidden: !item.is_active,
                                        },
                                    ]}
                                />
                            </Box>
                        ),
                    })}
                />
            </AdminSurface>

            <CreateInventoryItemModal
                open={modalState.open}
                onClose={() => setModalState({ open: false, item: null })}
                item={modalState.item}
                onSubmit={handleSubmit}
            />
            <RestockModal open={Boolean(restockTarget)} onClose={() => setRestockTarget(null)} item={restockTarget} onSubmit={handleRestock} />
            <AdjustStockModal open={Boolean(adjustTarget)} onClose={() => setAdjustTarget(null)} item={adjustTarget} onSubmit={handleAdjust} />

            <ConfirmDialog
                open={Boolean(deactivateTarget)}
                title="Deactivate inventory item?"
                message={`Deactivate "${deactivateTarget?.name}"? It will be hidden from active use but its stock-movement history is kept, and you can reactivate it later.`}
                onClose={() => setDeactivateTarget(null)}
                onConfirm={handleDeactivate}
                loading={deactivating}
            />
        </>
    );
}

function ExpensesTab() {
    const { expenses, expensesLoading, createExpense, users } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [modalOpen, setModalOpen] = useState(false);
    const total = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0);
    const usersById = new Map((users ?? []).map((u) => [u.id, u]));
    const sortedExpenses = [...(expenses ?? [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const handleSubmit = async (category, amount, description, paidByAdminId) => {
        await createExpense(category, amount, description, paidByAdminId);
        enqueueSnackbar("Expense logged.", { variant: "success" });
    };

    return (
        <>
            <TabToolbar>
                <Button startIcon={<AddIcon />} variant="contained" onClick={() => setModalOpen(true)}>
                    Log Expense
                </Button>
            </TabToolbar>

            <AdminSurface title="Expense Log" description={`Most recent first. Total logged: €${total.toFixed(2)}`}>
                <PendingQueueTable
                    data={sortedExpenses}
                    isLoading={expensesLoading}
                    emptyMessage="No expenses logged yet."
                    mobilePrimaryHeader="Expense"
                    mobileTrailingHeader="Amount (€)"
                    columns={[
                        {
                            header: "Category",
                            render: (expense) => <Chip label={expense.category} color={EXPENSE_CATEGORY_COLOR[expense.category] ?? "default"} size="small" />,
                        },
                        { header: "Amount (€)", render: (expense) => Number(expense.amount).toFixed(2) },
                        {
                            header: "Description",
                            render: (expense) => (
                                <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                    {expense.description ?? "—"}
                                </Typography>
                            ),
                        },
                        {
                            header: "Paid by",
                            render: (expense) => {
                                const payer = usersById.get(expense.paid_by_admin_id);
                                return (
                                    <Typography variant="body2" noWrap>
                                        {payer ? `@${payer.username}` : "—"}
                                    </Typography>
                                );
                            },
                        },
                        {
                            header: "Date",
                            render: (expense) => (
                                <Typography variant="caption">{new Date(expense.created_at).toLocaleString()}</Typography>
                            ),
                        },
                    ]}
                    renderMobileRow={(expense) => {
                        const payer = usersById.get(expense.paid_by_admin_id);
                        return {
                            primary: `${expense.category} — ${expense.description ?? "no description"}`,
                            secondary: `${payer ? `@${payer.username}` : "unknown payer"} • ${new Date(expense.created_at).toLocaleDateString()}`,
                            trailing: (
                                <Typography variant="body2" fontWeight="medium">
                                    {Number(expense.amount).toFixed(2)}
                                </Typography>
                            ),
                        };
                    }}
                />
            </AdminSurface>

            <LogExpenseModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
        </>
    );
}

function ProductsTab() {
    const { products, productsLoading, inventoryItems, createProduct, updateProduct, deleteProduct } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [modalState, setModalState] = useState({ open: false, product: null });
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleSubmit = async (productId, data) => {
        if (productId) {
            await updateProduct(productId, data);
            enqueueSnackbar("Product updated.", { variant: "success" });
        } else {
            await createProduct(data);
            enqueueSnackbar("Product created.", { variant: "success" });
        }
    };

    const handleToggleActive = async (product) => {
        await updateProduct(product.id, { is_active: !product.is_active });
        enqueueSnackbar(product.is_active ? "Product deactivated." : "Product activated.", { variant: "info" });
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteProduct(deleteTarget.id);
            enqueueSnackbar(`"${deleteTarget.name}" deleted.`, { variant: "success" });
        } catch {
            enqueueSnackbar("Failed to delete product.", { variant: "error" });
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    return (
        <>
            <TabToolbar>
                <Button startIcon={<AddIcon />} variant="contained" onClick={() => setModalState({ open: true, product: null })}>
                    New Product
                </Button>
            </TabToolbar>

            <AdminSurface title="All Products" description="Inactive products stay hidden from the Extras page but keep their purchase history.">
                <PendingQueueTable
                    data={products}
                    isLoading={productsLoading}
                    emptyMessage="No products yet."
                    columns={[
                        { header: "Name", render: (product) => product.name },
                        { header: "Price (€)", render: (product) => Number(product.price).toFixed(2) },
                        {
                            header: "Status",
                            render: (product) => (
                                <Chip
                                    label={product.is_active ? "Active" : "Inactive"}
                                    color={product.is_active ? "success" : "default"}
                                    size="small"
                                    onClick={() => handleToggleActive(product)}
                                    sx={{ cursor: "pointer" }}
                                />
                            ),
                        },
                    ]}
                    renderActions={(product) => (
                        <>
                            <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => setModalState({ open: true, product })} aria-label="Edit product">
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => setDeleteTarget(product)} aria-label="Delete product">
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                    renderMobileRow={(product) => ({
                        primary: product.name,
                        secondary: `€${Number(product.price).toFixed(2)}`,
                        trailing: (
                            <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                                <Chip
                                    label={product.is_active ? "Active" : "Inactive"}
                                    color={product.is_active ? "success" : "default"}
                                    size="small"
                                    onClick={() => handleToggleActive(product)}
                                    sx={{ cursor: "pointer" }}
                                />
                                <RowActionsMenu
                                    actions={[
                                        { label: "Edit", icon: <EditIcon fontSize="small" />, onClick: () => setModalState({ open: true, product }) },
                                        { label: "Delete", icon: <DeleteIcon fontSize="small" />, color: "error", onClick: () => setDeleteTarget(product) },
                                    ]}
                                />
                            </Box>
                        ),
                    })}
                />
            </AdminSurface>

            <ProductModal
                open={modalState.open}
                onClose={() => setModalState({ open: false, product: null })}
                product={modalState.product}
                inventoryItems={inventoryItems}
                onSubmit={handleSubmit}
            />

            <ConfirmDialog
                open={Boolean(deleteTarget)}
                title="Delete product?"
                message={`Delete "${deleteTarget?.name}"? This cannot be undone. Any past purchases keep their own record of the name and price.`}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                loading={deleting}
            />
        </>
    );
}

const TABS = ["inventory", "expenses", "products"];

export default function AdminSuppliesPage() {
    const { refreshAll } = useAdmin();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get("tab");
    // Inventory defaults first — low stock is the most actionable of the three.
    const tab = TABS.includes(tabParam) ? tabParam : "inventory";

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <AdminPageHero
                title="Supplies"
                description="Inventory, expenses, and purchasable Extras products in one place. Restocking and logging an expense are separate steps — log the purchase whenever it's paid, restock whenever the package actually arrives."
                action={(
                    <Button
                        startIcon={<RefreshIcon />}
                        variant="contained"
                        size="medium"
                        onClick={refreshAll}
                        color="primary"
                        sx={{ width: { xs: "100%", md: "auto" } }}
                    >
                        Refresh
                    </Button>
                )}
            />

            <Tabs
                value={tab}
                onChange={(_, value) => setSearchParams({ tab: value })}
                sx={{ borderBottom: 1, borderColor: "divider" }}
            >
                <Tab label="Inventory" value="inventory" />
                <Tab label="Expenses" value="expenses" />
                <Tab label="Products" value="products" />
            </Tabs>

            {tab === "inventory" && <InventoryTab />}
            {tab === "expenses" && <ExpensesTab />}
            {tab === "products" && <ProductsTab />}
        </Box>
    );
}
