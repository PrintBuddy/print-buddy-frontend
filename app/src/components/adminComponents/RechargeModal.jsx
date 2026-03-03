import { useState, useEffect } from "react";
import {
    Box,
    Button,
    ButtonGroup,
    Chip,
    Divider,
    InputAdornment,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CustomModal from "../utils/CustomModal";

const PRESETS = [0.5, 1, 2, 5, 10];

export default function RechargeModal({ open, onClose, user, onSave }) {
    const [sign, setSign] = useState("+");
    const [delta, setDelta] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setSign("+");
            setDelta("");
            setError("");
        }
    }, [open]);

    const parsedDelta = parseFloat(delta) || 0;
    const currentBalance = user?.balance ?? 0;
    const adjustment = sign === "+" ? parsedDelta : -parsedDelta;
    const newBalance = currentBalance + adjustment;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!delta || isNaN(parseFloat(delta)) || parseFloat(delta) <= 0) {
            setError("Enter a valid positive amount.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onSave(user.id, newBalance);
            onClose();
        } catch (err) {
            const detail = err?.response?.data?.detail;
            setError(detail ?? "Failed to update balance.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={`Adjust Credit — ${user?.username ?? ""}`}
            isForm
            maxWidth="xs"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {/* Current / preview */}
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            Current balance
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                            €{currentBalance.toFixed(2)}
                        </Typography>
                    </Box>

                    <Divider />

                    {/* Sign toggle + amount field */}
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
                            label="Amount"
                            type="number"
                            value={delta}
                            onChange={(e) => { setDelta(e.target.value); setError(""); }}
                            fullWidth
                            size="small"
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                    inputProps: { min: 0, step: 0.01 }
                                }
                            }}
                        />
                    </Box>

                    {/* Quick-pick presets */}
                    <Box display="flex" gap={0.75} flexWrap="wrap">
                        {PRESETS.map((p) => (
                            <Chip
                                key={p}
                                label={`${sign}€${p}`}
                                size="small"
                                variant={parseFloat(delta) === p ? "filled" : "outlined"}
                                color={sign === "+" ? "success" : "error"}
                                onClick={() => { setDelta(String(p)); setError(""); }}
                                sx={{ cursor: "pointer" }}
                            />
                        ))}
                    </Box>

                    {/* Result preview */}
                    {delta && parseFloat(delta) > 0 && (
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                                bgcolor: "action.hover",
                                borderRadius: 1,
                                px: 1.5,
                                py: 1
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                New balance
                            </Typography>
                            <Typography
                                variant="body2"
                                fontWeight="bold"
                                color={newBalance < 0 ? "error.main" : "success.main"}
                            >
                                €{newBalance.toFixed(2)}
                            </Typography>
                        </Box>
                    )}

                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </Stack>
            }
            actions={
                <>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color={sign === "+" ? "success" : "error"}
                        disabled={loading || !delta || parseFloat(delta) <= 0}
                        onClick={handleSubmit}
                    >
                        {loading ? "Saving…" : sign === "+" ? "Add Credit" : "Subtract Credit"}
                    </Button>
                </>
            }
        />
    );
}
