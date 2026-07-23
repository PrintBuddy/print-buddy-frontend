import { useEffect, useState } from "react";
import { Button, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";

const CATEGORIES = [
    { value: "paper", label: "Paper" },
    { value: "toner_bw", label: "Toner (B&W)" },
    { value: "toner_color", label: "Toner (Color)" },
    { value: "binding_supply", label: "Binding Supply" },
    { value: "other", label: "Other" },
];

// Also serves as the Edit modal — when `item` is passed, fields prefill
// and stock-affecting fields (initial stock) are hidden since stock only
// changes via Restock/Adjust, never a plain field edit.
export default function CreateInventoryItemModal({ open, onClose, item, onSubmit }) {
    const isEdit = Boolean(item);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("paper");
    const [unit, setUnit] = useState("");
    const [initialStock, setInitialStock] = useState("");
    const [threshold, setThreshold] = useState("");
    const [reorderSupplier, setReorderSupplier] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (item) {
            setName(item.name);
            setCategory(item.category);
            setUnit(item.unit);
            setThreshold(String(item.low_stock_threshold));
            setReorderSupplier(item.reorder_supplier ?? "");
            setIsActive(item.is_active);
        } else {
            setName(""); setCategory("paper"); setUnit(""); setInitialStock("");
            setThreshold(""); setReorderSupplier(""); setIsActive(true);
        }
        setError("");
    }, [item, open]);

    const handleClose = () => { onClose(); };

    const handleSubmit = async () => {
        if (!name.trim()) { setError("Enter a name."); return; }
        if (!unit.trim()) { setError("Enter a unit (e.g. sheets, cartridges)."); return; }
        setLoading(true);
        setError("");
        try {
            if (isEdit) {
                await onSubmit(item.id, {
                    name: name.trim(),
                    category,
                    unit: unit.trim(),
                    low_stock_threshold: parseFloat(threshold) || 0,
                    reorder_supplier: reorderSupplier || null,
                    is_active: isActive,
                });
            } else {
                await onSubmit(null, {
                    name: name.trim(),
                    category,
                    unit: unit.trim(),
                    initial_stock: parseFloat(initialStock) || 0,
                    low_stock_threshold: parseFloat(threshold) || 0,
                    reorder_supplier: reorderSupplier || null,
                });
            }
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to save the item.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={handleClose}
            title={isEdit ? "Edit Inventory Item" : "New Inventory Item"}
            maxWidth="sm"
            content={
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth size="small" />
                    <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth size="small">
                        {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                    </TextField>
                    <TextField label="Unit (e.g. sheets, cartridges)" value={unit} onChange={(e) => setUnit(e.target.value)} fullWidth size="small" />
                    {!isEdit && (
                        <TextField label="Initial stock" type="number" value={initialStock} onChange={(e) => setInitialStock(e.target.value)} fullWidth size="small" />
                    )}
                    <TextField label="Low-stock threshold" type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} fullWidth size="small" />
                    <TextField label="Reorder supplier (optional)" value={reorderSupplier} onChange={(e) => setReorderSupplier(e.target.value)} fullWidth size="small" />
                    {isEdit && (
                        <FormControlLabel
                            control={<Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                            label="Active"
                        />
                    )}
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
