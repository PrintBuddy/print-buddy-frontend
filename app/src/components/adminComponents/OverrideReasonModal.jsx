import { useState } from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";

export default function OverrideReasonModal({ open, onClose, title, description, actionLabel, onSubmit }) {
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleClose = () => {
        setReason("");
        setError("");
        onClose();
    };

    const handleSubmit = async () => {
        if (!reason.trim()) {
            setError("A reason is required — this is logged permanently.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onSubmit(reason.trim());
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Action failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={handleClose}
            title={title}
            maxWidth="sm"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {description && (
                        <Typography variant="body2" color="text.secondary">{description}</Typography>
                    )}
                    <TextField
                        label="Reason (required)"
                        multiline
                        rows={3}
                        value={reason}
                        onChange={(e) => { setReason(e.target.value); if (error) setError(""); }}
                        fullWidth
                        size="small"
                        autoFocus
                    />
                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                </Stack>
            }
            actions={
                <>
                    <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" color="warning" onClick={handleSubmit} disabled={loading}>
                        {actionLabel}
                    </Button>
                </>
            }
        />
    );
}
