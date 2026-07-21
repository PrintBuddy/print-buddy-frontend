import { useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";

export default function RestockModal({ open, onClose, item, onSubmit }) {
    const [quantity, setQuantity] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const reset = () => { setQuantity(""); setError(""); };
    const handleClose = () => { reset(); onClose(); };

    const handleSubmit = async () => {
        const qty = parseFloat(quantity);
        if (!qty || qty <= 0) { setError("Enter a quantity greater than 0."); return; }
        setLoading(true);
        setError("");
        try {
            await onSubmit(item.id, qty);
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
                        Records new stock arriving. If you haven't already, log the
                        purchase cost separately via "Log Expense".
                    </Typography>
                    <TextField
                        label={`Quantity received (${item?.unit ?? "units"})`}
                        type="number"
                        value={quantity}
                        onChange={(e) => { setQuantity(e.target.value); if (error) setError(""); }}
                        fullWidth
                        size="small"
                        autoFocus
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
