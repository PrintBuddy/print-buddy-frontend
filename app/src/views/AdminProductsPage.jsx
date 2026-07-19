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
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "notistack";

import { useAdmin } from "../context/AdminContext";
import ProductModal from "../components/adminComponents/ProductModal";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";

export default function AdminProductsPage() {
    const { products, productsLoading, inventoryItems, createProduct, updateProduct, refreshAll } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [modalState, setModalState] = useState({ open: false, product: null });

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

    const skeletonRows = Array.from({ length: 3 });

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <AdminPageHero
                title="Products"
                description="Purchasable extras shown on users' Extras page — spiral binding today, anything else (lamination, etc.) later without a schema change."
                action={(
                    <Box sx={{ display: "flex", gap: 1, flexDirection: { xs: "column", md: "row" } }}>
                        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setModalState({ open: true, product: null })}>
                            New Product
                        </Button>
                        <Button startIcon={<RefreshIcon />} variant="outlined" onClick={refreshAll}>
                            Refresh
                        </Button>
                    </Box>
                )}
            />

            <AdminSurface title="All Products" description="Inactive products stay hidden from the Extras page but keep their purchase history.">
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
                                <TableCell align="right">Price (€)</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {productsLoading ? (
                                skeletonRows.map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={4}><Skeleton /></TableCell></TableRow>
                                ))
                            ) : !products?.length ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography variant="body2" color="text.secondary">No products yet.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id} hover>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell align="right">{Number(product.price).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={product.is_active ? "Active" : "Inactive"}
                                                color={product.is_active ? "success" : "default"}
                                                size="small"
                                                onClick={() => handleToggleActive(product)}
                                                sx={{ cursor: "pointer" }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton size="small" onClick={() => setModalState({ open: true, product })} aria-label="Edit product">
                                                    <EditIcon fontSize="small" />
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

            <ProductModal
                open={modalState.open}
                onClose={() => setModalState({ open: false, product: null })}
                product={modalState.product}
                inventoryItems={inventoryItems}
                onSubmit={handleSubmit}
            />
        </Box>
    );
}
