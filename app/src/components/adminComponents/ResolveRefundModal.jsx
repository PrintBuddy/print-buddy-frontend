import { useState } from "react";
import { Box, Button, Chip, Divider, Stack, TextField, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";


export default function ResolveRefundModal({ open, onClose, refund, user, job, onResolve, readOnly = false }) {
    const [adminMessage, setAdminMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleResolve = async (newStatus) => {
        if (newStatus === "denied" && !adminMessage.trim()) {
            setError("Please provide a reason for denial.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onResolve(refund.id, newStatus, adminMessage || null);
            onClose();
        } catch (err) {
            const detail = err?.response?.data?.detail;
            setError(detail ?? "Failed to resolve refund request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={readOnly ? "Refund Request Details" : "Resolve Refund Request"}
            maxWidth="sm"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {/* User info */}
                    {user ? (
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                                User
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                                {user.name} {user.surname}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                @{user.username} · {user.email}
                            </Typography>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            User ID: {refund?.user_id}
                        </Typography>
                    )}

                    <Divider />

                    {/* Job info */}
                    {job ? (
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                                Print Job
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" noWrap>
                                {job.file_name}
                            </Typography>
                            <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                                <Chip label={`${job.pages} page${job.pages !== 1 ? "s" : ""}`} size="small" variant="outlined" />
                                <Chip label={job.color ? "Color" : "B&W"} size="small" variant="outlined" color={job.color ? "secondary" : "default"} />
                                <Chip label={`€${job.cost?.toFixed(2)}`} size="small" variant="outlined" color="primary" />
                                <Chip label={job.printer_name} size="small" variant="outlined" />
                            </Box>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            Job ID: {refund?.print_job_id}
                        </Typography>
                    )}

                    <Divider />

                    {/* User refund message */}
                    {refund?.message && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                                User's reason
                            </Typography>
                            <Typography variant="body2">
                                {refund.message}
                            </Typography>
                        </Box>
                    )}

                    {/* Admin reply — only in read-only (resolved) view */}
                    {readOnly && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                                Admin reply
                            </Typography>
                            <Typography variant="body2" color={refund?.admin_message ? "text.primary" : "text.disabled"} fontStyle={refund?.admin_message ? "normal" : "italic"}>
                                {refund?.admin_message || "No message left."}
                            </Typography>
                        </Box>
                    )}

                    {/* Resolved by + dates */}
                    {readOnly && refund?.resolved_by_username && (
                        <Typography variant="caption" color="text.disabled">
                            Resolved by <strong>@{refund.resolved_by_username}</strong>
                        </Typography>
                    )}
                    {readOnly && (
                        <Box>
                            <Typography variant="caption" color="text.disabled" display="block">
                                Submitted: {refund?.created_at ? new Date(refund.created_at).toLocaleString() : "—"}
                            </Typography>
                            {refund?.status !== "pending" && (
                                <Typography variant="caption" color="text.disabled" display="block">
                                    Resolved: {refund?.updated_at ? new Date(refund.updated_at).toLocaleString() : "—"}
                                </Typography>
                            )}
                        </Box>
                    )}

                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                    {/* Admin message field — only when resolving */}
                    {!readOnly && (
                        <TextField
                            label="Admin message (optional for approve, required for deny)"
                            multiline
                            rows={3}
                            value={adminMessage}
                            onChange={(e) => {
                                setAdminMessage(e.target.value);
                                if (error) setError("");
                            }}
                            fullWidth
                            size="small"
                        />
                    )}
                </Stack>
            }
            actions={
                readOnly ? (
                    <Button onClick={onClose}>Close</Button>
                ) : (
                    <>
                        <Button onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            color="error"
                            variant="outlined"
                            disabled={loading}
                            onClick={() => handleResolve("denied")}
                        >
                            Deny
                        </Button>
                        <Button
                            color="success"
                            variant="contained"
                            disabled={loading}
                            onClick={() => handleResolve("approved")}
                        >
                            Approve
                        </Button>
                    </>
                )
            }
        />
    );
}

