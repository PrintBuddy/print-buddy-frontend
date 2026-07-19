import { useEffect, useState } from "react";
import { Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";

export default function ProductModal({ open, onClose, product, inventoryItems, onSubmit }) {
    const isEdit = Boolean(product);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [inventoryItemId, setInventoryItemId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (product) {
            setName(product.name);
            setPrice(String(product.price));
            setInventoryItemId(product.inventory_item_id ?? "");
        } else {
            setName(""); setPrice(""); setInventoryItemId("");
        }
        setError("");
    }, [product, open]);

    const handleClose = () => { onClose(); };

    const handleSubmit = async () => {
        if (!name.trim()) { setError("Enter a name."); return; }
        const parsedPrice = parseFloat(price);
        if (!parsedPrice || parsedPrice <= 0) { setError("Enter a valid price."); return; }

        setLoading(true);
        setError("");
        try {
            if (isEdit) {
                await onSubmit(product.id, {
                    name: name.trim(),
                    price: parsedPrice,
                    inventory_item_id: inventoryItemId || null,
                });
            } else {
                await onSubmit(null, {
                    name: name.trim(),
                    price: parsedPrice,
                    inventory_item_id: inventoryItemId || null,
                });
            }
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to save the product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={handleClose}
            title={isEdit ? "Edit Product" : "New Product"}
            maxWidth="sm"
            content={
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" />
                    <TextField label="Price (€)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} fullWidth size="small" />
                    <TextField
                        select
                        label="Linked inventory item (optional)"
                        value={inventoryItemId}
                        onChange={(e) => setInventoryItemId(e.target.value)}
                        fullWidth
                        size="small"
                    >
                        <MenuItem value="">None</MenuItem>
                        {(inventoryItems ?? []).map((item) => (
                            <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                        ))}
                    </TextField>
                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                </Stack>
            }
            actions={
                <>
                    <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                        {isEdit ? "Save" : "Create"}
                    </Button>
                </>
            }
        />
    );
}
