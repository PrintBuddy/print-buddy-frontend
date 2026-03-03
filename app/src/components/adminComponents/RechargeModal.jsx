import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Chip,
    Divider,
    InputAdornment,
    Stack,
    Tab,
    Tabs,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TuneIcon from "@mui/icons-material/Tune";
import CustomModal from "../utils/CustomModal";

const RECHARGE_PRESETS = [0.5, 1, 2, 5, 10];

// ─── Recharge tab ─────────────────────────────────────────────────────────────
// Adds a positive amount to the current balance → recorded as RECHARGE

function RechargeTab({ user, onRecharge, onClose }) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const currentBalance = user?.balance ?? 0;
    const parsed = parseFloat(amount) || 0;
    const newBalance = currentBalance + parsed;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(parsed) || parsed <= 0) {
            setError("Enter a valid positive amount.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onRecharge(user.id, parsed);
            onClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to recharge.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack spacing={2} sx={{ mt: 1 }} component="form" onSubmit={handleSubmit}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Current balance</Typography>
                <Typography variant="body2" fontWeight="bold">€{currentBalance.toFixed(2)}</Typography>
            </Box>

            <Divider />

            <TextField
                label="Amount to add"
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(""); }}
                fullWidth
                size="small"
                autoFocus
                slotProps={{
                    input: {
                        startAdornment: <InputAdornment position="start">+€</InputAdornment>,
                        inputProps: { min: 0.01, step: 0.01 },
                    },
                }}
            />

            {/* Quick-pick presets */}
            <Box display="flex" gap={0.75} flexWrap="wrap">
                {RECHARGE_PRESETS.map((p) => (
                    <Chip
                        key={p}
                        label={`+€${p}`}
                        size="small"
                        variant={parsed === p ? "filled" : "outlined"}
                        color="success"
                        onClick={() => { setAmount(String(p)); setError(""); }}
                        sx={{ cursor: "pointer" }}
                    />
                ))}
            </Box>

            {/* Preview */}
            {parsed > 0 && (
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ bgcolor: "action.hover", borderRadius: 1, px: 1.5, py: 1 }}
                >
                    <Typography variant="body2" color="text.secondary">New balance</Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                        €{newBalance.toFixed(2)}
                    </Typography>
                </Box>
            )}

            {error && <Typography color="error" variant="body2">{error}</Typography>}

            <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    disabled={loading || !amount || parsed <= 0}
                >
                    {loading ? "Saving…" : "Recharge"}
                </Button>
            </Stack>
        </Stack>
    );
}

// ─── Adjust tab ───────────────────────────────────────────────────────────────
// Corrects the balance by a delta → recorded as ADJUSTMENT

function AdjustTab({ user, onSave, onClose }) {
    const [sign, setSign] = useState("+");
    const [delta, setDelta] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const currentBalance = user?.balance ?? 0;
    const parsed = parseFloat(delta) || 0;
    const adjustment = sign === "+" ? parsed : -parsed;
    const newBalance = currentBalance + adjustment;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!delta || isNaN(parsed) || parsed <= 0) {
            setError("Enter a valid positive amount.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onSave(user.id, newBalance);
            onClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to adjust balance.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack spacing={2} sx={{ mt: 1 }} component="form" onSubmit={handleSubmit}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">Current balance</Typography>
                <Typography variant="body2" fontWeight="bold">€{currentBalance.toFixed(2)}</Typography>
            </Box>

            <Typography variant="caption" color="text.secondary">
                Manually correct the balance. Recorded as an adjustment, not a recharge.
            </Typography>

            <Divider />

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
                            inputProps: { min: 0, step: 0.01 },
                        },
                    }}
                />
            </Box>

            {/* Preview */}
            {delta && parsed > 0 && (
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ bgcolor: "action.hover", borderRadius: 1, px: 1.5, py: 1 }}
                >
                    <Typography variant="body2" color="text.secondary">New balance</Typography>
                    <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={newBalance < 0 ? "error.main" : "success.main"}
                    >
                        €{newBalance.toFixed(2)}
                    </Typography>
                </Box>
            )}

            {error && <Typography color="error" variant="body2">{error}</Typography>}

            <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    type="submit"
                    variant="contained"
                    color={sign === "+" ? "success" : "error"}
                    disabled={loading || !delta || parsed <= 0}
                >
                    {loading ? "Saving…" : sign === "+" ? "Add Credit" : "Subtract Credit"}
                </Button>
            </Stack>
        </Stack>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function RechargeModal({ open, onClose, user, onSave, onRecharge }) {
    const [tab, setTab] = useState(0); // 0 = recharge, 1 = adjust

    useEffect(() => {
        if (open) setTab(0);
    }, [open]);

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={`Credit — ${user?.username ?? ""}`}
            maxWidth="xs"
            content={
                <Box sx={{ mt: 0.5 }}>
                    <Tabs
                        value={tab}
                        onChange={(_, v) => setTab(v)}
                        variant="fullWidth"
                        sx={{ mb: 1, borderBottom: 1, borderColor: "divider" }}
                    >
                        <Tab
                            icon={<AccountBalanceWalletIcon fontSize="small" />}
                            iconPosition="start"
                            label="Recharge"
                            sx={{ minHeight: 40, fontSize: "0.8rem" }}
                        />
                        <Tab
                            icon={<TuneIcon fontSize="small" />}
                            iconPosition="start"
                            label="Adjust"
                            sx={{ minHeight: 40, fontSize: "0.8rem" }}
                        />
                    </Tabs>

                    {tab === 0 ? (
                        <RechargeTab user={user} onRecharge={onRecharge} onClose={onClose} />
                    ) : (
                        <AdjustTab user={user} onSave={onSave} onClose={onClose} />
                    )}
                </Box>
            }
        />
    );
}
