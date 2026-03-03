import { useState } from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";


export default function RequestRefundModal({ open, onClose, job, onSubmit }) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await onSubmit(job.id, message || null);
            setMessage("");
            onClose();
        } catch (err) {
            const detail = err?.response?.data?.detail;
            setError(detail ?? "Failed to submit refund request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={() => {
                setMessage("");
                setError("");
                onClose();
            }}
            title="Request Refund"
            isForm
            maxWidth="sm"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {job && (
                        <Typography variant="body2" color="text.secondary">
                            File: <strong>{job.file_name}</strong> — Cost: <strong>€{job.cost?.toFixed(2)}</strong>
                        </Typography>
                    )}
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                    <TextField
                        label="Reason for refund (optional)"
                        multiline
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="Describe why you are requesting a refund…"
                    />
                </Stack>
            }
            actions={
                <>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? "Submitting…" : "Submit Request"}
                    </Button>
                </>
            }
        />
    );
}
