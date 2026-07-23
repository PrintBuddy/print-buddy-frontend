import { useState } from "react";
import {
    Box,
    FormControl,
    FormControlLabel,
    FormLabel,
    InputAdornment,
    MenuItem,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
    Button,
} from "@mui/material";
import CustomModal from "../utils/CustomModal";


export default function RequestRechargeModal({ open, onClose, eligibleAdmins, onSubmit }) {
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("cash");
    const [adminId, setAdminId] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const reset = () => {
        setAmount("");
        setMethod("cash");
        setAdminId("");
        setMessage("");
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
        if (!adminId) {
            setError("Select which admin you paid.");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await onSubmit(parsedAmount, method, adminId, message || null);
            handleClose();
        } catch (err) {
            const detail = err?.response?.data?.detail;
            setError(detail ?? "Failed to submit the recharge request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={handleClose}
            title="Request a Recharge"
            maxWidth="sm"
            content={
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Already paid an admin in cash or via transfer? Tell us who and how much —
                        they'll get notified on Telegram and approve it from there or from the admin panel.
                    </Typography>

                    <TextField
                        label="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => { setAmount(e.target.value); if (error) setError(""); }}
                        fullWidth
                        size="small"
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                            },
                        }}
                    />

                    <FormControl>
                        <FormLabel id="recharge-method-label">Method</FormLabel>
                        <RadioGroup
                            row
                            aria-labelledby="recharge-method-label"
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                        >
                            <FormControlLabel value="cash" control={<Radio size="small" />} label="Cash" />
                            <FormControlLabel value="transfer" control={<Radio size="small" />} label="Transfer" />
                        </RadioGroup>
                    </FormControl>

                    <TextField
                        select
                        label="Which admin did you pay?"
                        value={adminId}
                        onChange={(e) => { setAdminId(e.target.value); if (error) setError(""); }}
                        fullWidth
                        size="small"
                    >
                        {(eligibleAdmins ?? []).map((admin) => (
                            <MenuItem key={admin.telegram_admin_id} value={admin.telegram_admin_id}>
                                {admin.name} {admin.surname} (@{admin.username})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Message (optional)"
                        multiline
                        rows={2}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        fullWidth
                        size="small"
                    />

                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                </Stack>
            }
            actions={
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                        Submit Request
                    </Button>
                </Box>
            }
        />
    );
}
