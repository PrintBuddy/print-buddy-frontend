import { useState } from "react";
import {
    Box,
    Button,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CustomModal from "../utils/CustomModal";

// Manual stock correction, either direction — damaged goods, a miscount,
// stock found in storage, etc. Not tied to a purchase or a print job
// (that's Restock and print consumption, respectively).
export default function AdjustStockModal({ open, onClose, item, onSubmit }) {
    const [sign, setSign] = useState("+");
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const parsed = parseFloat(amount) || 0;
    const delta = sign === "+" ? parsed : -parsed;
    const currentStock = item?.current_stock ?? 0;
    const newStock = currentStock + delta;

    const reset = () => { setSign("+"); setAmount(""); setNotes(""); setError(""); };
    const handleClose = () => { reset(); onClose(); };

    const handleSubmit = async () => {
        if (!amount || isNaN(parsed) || parsed <= 0) {
            setError("Enter a valid positive amount.");
            return;
        }
        if (!notes.trim()) {
            setError("Enter a note explaining this correction.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onSubmit(item.id, delta, notes.trim());
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to adjust stock.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={handleClose}
            title={`Adjust Stock — ${item?.name ?? ""}`}
            maxWidth="sm"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">Current stock</Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {currentStock.toFixed(0)} {item?.unit}
                        </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                        Manual correction — not tied to a purchase or a print job.
                    </Typography>

                    <Box display="flex" gap={1} alignItems="center">
                        <ToggleButtonGroup
                            value={sign}
                            exclusive
                            onChange={(_, v) => v && setSign(v)}
                            size="small"
                            sx={{ flexShrink: 0 }}
                        >
                            <ToggleButton value="+" color="success" sx={{ px: 1.5 }}>
                                <AddIcon fontSize="small" />
                            </ToggleButton>
                            <ToggleButton value="-" color="error" sx={{ px: 1.5 }}>
                                <RemoveIcon fontSize="small" />
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <TextField
                            label={`Quantity (${item?.unit ?? "units"})`}
                            type="number"
                            value={amount}
                            onChange={(e) => { setAmount(e.target.value); if (error) setError(""); }}
                            fullWidth
                            size="small"
                            slotProps={{ input: { inputProps: { min: 0, step: 1 } } }}
                        />
                    </Box>

                    {parsed > 0 && (
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ bgcolor: "action.hover", borderRadius: 1, px: 1.5, py: 1 }}
                        >
                            <Typography variant="body2" color="text.secondary">New stock</Typography>
                            <Typography variant="body2" fontWeight="bold" color={sign === "+" ? "success.main" : "error.main"}>
                                {newStock.toFixed(0)} {item?.unit}
                            </Typography>
                        </Box>
                    )}

                    <TextField
                        label="Notes"
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); if (error) setError(""); }}
                        fullWidth
                        size="small"
                        placeholder="e.g. damaged box, stock count correction"
                    />

                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                </Stack>
            }
            actions={
                <>
                    <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                        {loading ? "Saving…" : "Apply"}
                    </Button>
                </>
            }
        />
    );
}
