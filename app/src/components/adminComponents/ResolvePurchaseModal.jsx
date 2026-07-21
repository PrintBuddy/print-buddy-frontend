import { useState } from "react";
import { Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";


export default function ResolvePurchaseModal({ open, onClose, purchase, user, onResolve, readOnly = false }) {
    const [adminMessage, setAdminMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleResolve = async (action) => {
        setLoading(true);
        setError("");
        try {
            await onResolve(purchase.id, action, adminMessage || null);
            onClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to resolve purchase.");
        } finally {
            setLoading(false);
        }
    };

    if (!purchase) return null;

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={readOnly ? "Purchase Details" : "Resolve Purchase"}
            maxWidth="sm"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                            User
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {user ? `${user.name} ${user.surname}` : purchase.username}
                        </Typography>
                        {user && (
                            <Typography variant="body2" color="text.secondary">@{user.username}</Typography>
                        )}
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                            Item
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                            {purchase.quantity}x {purchase.product_name}
                        </Typography>
                        <Typography variant="body2" color="primary.main" fontWeight="bold">
                            €{Number(purchase.total_amount).toFixed(2)}
                        </Typography>
                    </Box>

                    {purchase.message && (
                        <>
                            <Divider />
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                                    User's message
                                </Typography>
                                <Typography variant="body2">{purchase.message}</Typography>
                            </Box>
                        </>
                    )}

                    {readOnly && (
                        <>
                            <Divider />
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                                    Admin note
                                </Typography>
                                <Typography variant="body2" color={purchase.admin_message ? "text.primary" : "text.disabled"} fontStyle={purchase.admin_message ? "normal" : "italic"}>
                                    {purchase.admin_message || "No message left."}
                                </Typography>
                            </Box>
                            {purchase.resolved_by_username && (
                                <Typography variant="caption" color="text.disabled">
                                    Resolved by <strong>@{purchase.resolved_by_username}</strong>
                                </Typography>
                            )}
                        </>
                    )}

                    {error && <Typography color="error" variant="body2">{error}</Typography>}

                    {!readOnly && (
                        <TextField
                            label="Admin message (optional)"
                            multiline
                            rows={2}
                            value={adminMessage}
                            onChange={(e) => setAdminMessage(e.target.value)}
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
                        <Button onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button
                            color="error"
                            variant="outlined"
                            disabled={loading}
                            onClick={() => handleResolve("reject")}
                        >
                            Reject &amp; Refund
                        </Button>
                        <Button
                            color="success"
                            variant="contained"
                            disabled={loading}
                            onClick={() => handleResolve("fulfill")}
                        >
                            Given
                        </Button>
                    </>
                )
            }
        />
    );
}
