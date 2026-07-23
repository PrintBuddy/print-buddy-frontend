import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";


export default function ResolveRechargeRequestModal({ open, onClose, request, onResolve, readOnly = false }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleResolve = async (status) => {
        setLoading(true);
        setError("");
        try {
            await onResolve(request.id, status);
            onClose();
        } catch (err) {
            const detail = err?.response?.data?.detail;
            setError(detail ?? "Failed to resolve the recharge request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={readOnly ? "Recharge Request Details" : "Resolve Recharge Request"}
            maxWidth="sm"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                            User
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            @{request?.username}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                            Amount
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            €{Number(request?.amount ?? 0).toFixed(2)} ({request?.method ?? "—"})
                        </Typography>
                    </Box>

                    {request?.message && (
                        <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                                Message
                            </Typography>
                            <Typography variant="body2">{request.message}</Typography>
                        </Box>
                    )}

                    {readOnly && request?.resolved_by_username && (
                        <Typography variant="caption" color="text.disabled">
                            Resolved by <strong>@{request.resolved_by_username}</strong>
                        </Typography>
                    )}
                    {readOnly && (
                        <Box>
                            <Typography variant="caption" color="text.disabled" display="block">
                                Submitted: {request?.created_at ? new Date(request.created_at).toLocaleString() : "—"}
                            </Typography>
                            {request?.status !== "pending" && (
                                <Typography variant="caption" color="text.disabled" display="block">
                                    Resolved: {request?.updated_at ? new Date(request.updated_at).toLocaleString() : "—"}
                                </Typography>
                            )}
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
                readOnly ? (
                    <Button onClick={onClose}>Close</Button>
                ) : (
                    <>
                        <Button onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button color="error" variant="outlined" disabled={loading} onClick={() => handleResolve("rejected")}>
                            Reject
                        </Button>
                        <Button color="success" variant="contained" disabled={loading} onClick={() => handleResolve("approved")}>
                            Approve
                        </Button>
                    </>
                )
            }
        />
    );
}
