import { useState } from "react";
import { Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";

const CATEGORIES = [
    { value: "paper", label: "Paper" },
    { value: "toner_bw", label: "Toner (B&W)" },
    { value: "toner_color", label: "Toner (Color)" },
    { value: "binding_supply", label: "Binding Supply" },
    { value: "other", label: "Other" },
];

export default function CreateInventoryItemModal({ open, onClose, onSubmit }) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("paper");
    const [unit, setUnit] = useState("");
    const [initialStock, setInitialStock] = useState("");
    const [threshold, setThreshold] = useState("");
    const [reorderSupplier, setReorderSupplier] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const reset = () => {
        setName(""); setCategory("paper"); setUnit(""); setInitialStock("");
        setThreshold(""); setReorderSupplier(""); setError("");
    };

    const handleClose = () => { reset(); onClose(); };

    const handleSubmit = async () => {
        if (!name.trim()) { setError("Enter a name."); return; }
        if (!unit.trim()) { setError("Enter a unit (e.g. sheets, cartridges)."); return; }
        setLoading(true);
        setError("");
        try {
            await onSubmit({
                name: name.trim(),
                category,
                unit: unit.trim(),
                initial_stock: parseFloat(initialStock) || 0,
                low_stock_threshold: parseFloat(threshold) || 0,
                reorder_supplier: reorderSupplier || null,
            });
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to create the item.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={handleClose}
            title="New Inventory Item"
            maxWidth="sm"
            content={
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" />
                    <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth size="small">
                        {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                    </TextField>
                    <TextField label="Unit (e.g. sheets, cartridges)" value={unit} onChange={(e) => setUnit(e.target.value)} fullWidth size="small" />
                    <TextField label="Initial stock" type="number" value={initialStock} onChange={(e) => setInitialStock(e.target.value)} fullWidth size="small" />
                    <TextField label="Low-stock threshold" type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} fullWidth size="small" />
                    <TextField label="Reorder supplier (optional)" value={reorderSupplier} onChange={(e) => setReorderSupplier(e.target.value)} fullWidth size="small" />
                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                </Stack>
            }
            actions={
                <>
                    <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>Create</Button>
                </>
            }
        />
    );
}
