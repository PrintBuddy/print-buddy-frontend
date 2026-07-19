import { useState } from "react";
import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";

const CATEGORIES = [
    { value: "toner", label: "Toner" },
    { value: "paper", label: "Paper" },
    { value: "maintenance", label: "Maintenance" },
    { value: "other", label: "Other" },
];

export default function RestockModal({ open, onClose, item, onSubmit }) {
    const [quantity, setQuantity] = useState("");
    const [expenseCategory, setExpenseCategory] = useState("paper");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseDescription, setExpenseDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const reset = () => {
        setQuantity(""); setExpenseCategory("paper"); setExpenseAmount("");
        setExpenseDescription(""); setError("");
    };

    const handleClose = () => { reset(); onClose(); };

    const handleSubmit = async () => {
        const qty = parseFloat(quantity);
        const amount = parseFloat(expenseAmount);
        if (!qty || qty <= 0) { setError("Enter a quantity greater than 0."); return; }
        if (!amount || amount <= 0) { setError("Enter the amount spent."); return; }
        setLoading(true);
        setError("");
        try {
            await onSubmit(item.id, qty, expenseCategory, amount, expenseDescription || null);
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to restock.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={handleClose}
            title={`Restock ${item?.name ?? ""}`}
            maxWidth="sm"
            content={
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Logs this purchase as an expense and increases stock in one step.
                    </Typography>
                    <TextField
                        label={`Quantity (${item?.unit ?? "units"})`}
                        type="number"
                        value={quantity}
                        onChange={(e) => { setQuantity(e.target.value); if (error) setError(""); }}
                        fullWidth
                        size="small"
                    />
                    <TextField select label="Expense category" value={expenseCategory} onChange={(e) => setExpenseCategory(e.target.value)} fullWidth size="small">
                        {CATEGORIES.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                    </TextField>
                    <TextField
                        label="Amount spent (€)"
                        type="number"
                        value={expenseAmount}
                        onChange={(e) => { setExpenseAmount(e.target.value); if (error) setError(""); }}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Description (optional)"
                        value={expenseDescription}
                        onChange={(e) => setExpenseDescription(e.target.value)}
                        fullWidth
                        size="small"
                    />
                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                </Stack>
            }
            actions={
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>Restock</Button>
                </Box>
            }
        />
    );
}
