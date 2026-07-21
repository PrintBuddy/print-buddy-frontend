import { useEffect, useState } from "react";
import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CustomModal from "../utils/CustomModal";

export default function PurchaseProductModal({ open, product, onClose, onSubmit }) {
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setQuantity(1);
            setMessage("");
            setError("");
        }
    }, [open]);

    if (!product) return null;

    const total = product.price * quantity;

    const handleQuantityChange = (delta) => {
        setQuantity((q) => Math.max(1, q + delta));
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError("");
        try {
            await onSubmit(product.id, quantity, message.trim() || null);
            onClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Purchase failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={`Buy ${product.name}`}
            maxWidth="xs"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        This will be deducted from your balance right away. An admin will confirm
                        once the item is handed over — if it's rejected, you'll be refunded automatically.
                    </Typography>

                    <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
                        <IconButton onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} aria-label="Decrease quantity">
                            <RemoveIcon />
                        </IconButton>
                        <Typography variant="h6" sx={{ minWidth: 32, textAlign: "center" }}>{quantity}</Typography>
                        <IconButton onClick={() => handleQuantityChange(1)} aria-label="Increase quantity">
                            <AddIcon />
                        </IconButton>
                    </Box>

                    <TextField
                        label="Message to admins (optional)"
                        multiline
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        fullWidth
                        size="small"
                    />

                    <Box display="flex" justifyContent="space-between" alignItems="baseline">
                        <Typography variant="body2" color="text.secondary">Total</Typography>
                        <Typography variant="h6" color="primary.main">€{total.toFixed(2)}</Typography>
                    </Box>

                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                </Stack>
            }
            actions={
                <>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirm} disabled={loading}>
                        Confirm Purchase
                    </Button>
                </>
            }
        />
    );
}
