import { useState } from "react";
import { Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";

const CATEGORIES = [
    { value: "toner", label: "Toner" },
    { value: "paper", label: "Paper" },
    { value: "maintenance", label: "Maintenance" },
    { value: "other", label: "Other" },
];

export default function LogExpenseModal({ open, onClose, onSubmit }) {
    const [category, setCategory] = useState("toner");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const reset = () => {
        setCategory("toner");
        setAmount("");
        setDescription("");
        setError("");
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            setError("Enter a valid amount greater than 0.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onSubmit(category, parsedAmount, description || null);
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to log the expense.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={handleClose}
            title="Log an Expense"
            maxWidth="sm"
            content={
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <TextField
                        select
                        label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        fullWidth
                        size="small"
                    >
                        {CATEGORIES.map((c) => (
                            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Amount (€)"
                        type="number"
                        value={amount}
                        onChange={(e) => { setAmount(e.target.value); if (error) setError(""); }}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        label="Description (optional)"
                        multiline
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        size="small"
                    />

                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                </Stack>
            }
            actions={
                <>
                    <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>Log Expense</Button>
                </>
            }
        />
    );
}
