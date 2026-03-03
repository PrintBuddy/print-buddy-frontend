import { Box, Chip, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";

const STATUS_COLOR = { pending: "warning", approved: "success", denied: "error" };

export default function RefundDetailsModal({ open, onClose, refund }) {
    if (!refund) return null;

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title="Refund Request Details"
            maxWidth="xs"
            content={
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2"><strong>Status:</strong></Typography>
                        <Chip
                            label={refund.status}
                            color={STATUS_COLOR[refund.status] ?? "default"}
                            size="small"
                        />
                    </Box>

                    <Box>
                        <Typography variant="body2"><strong>Your message:</strong></Typography>
                        <Typography variant="body2" color="text.secondary">
                            {refund.message || "—"}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="body2"><strong>Admin reply:</strong></Typography>
                        <Typography variant="body2" color="text.secondary">
                            {refund.admin_message || "—"}
                        </Typography>
                    </Box>

                    <Typography variant="caption" color="text.disabled">
                        Submitted: {new Date(refund.created_at).toLocaleString()}
                    </Typography>
                    {refund.status !== "pending" && (
                        <>
                            <Typography variant="caption" color="text.disabled">
                                Resolved: {new Date(refund.updated_at).toLocaleString()}
                            </Typography>
                            {refund.resolved_by_username && (
                                <Typography variant="caption" color="text.disabled">
                                    Resolved by <strong>@{refund.resolved_by_username}</strong>
                                </Typography>
                            )}
                        </>
                    )}
                </Box>
            }
        />
    );
}
