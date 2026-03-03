import { Box, Button, Chip, Divider, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";

const STATUS_COLOR = {
    completed: "success", aborted: "error", cancelled: "error",
    pending: "warning", printing: "info", held: "warning", stopped: "error",
};
const REFUND_COLOR = { pending: "warning", approved: "success", denied: "error" };

export default function JobDetailsModal({ job, onClose, refund, onRefundRequest }) {
    if (!job) return null;

    return (
        <CustomModal
            open={!!job}
            onClose={onClose}
            title={job.file_name || "Job details"}
            maxWidth="xs"
            content={
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 0.5 }}>
                    {/* Status + detail chips */}
                    <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip label={job.status} color={STATUS_COLOR[job.status] ?? "default"} size="small" />
                        {job.pages != null && (
                            <Chip label={`${job.pages} page${job.pages !== 1 ? "s" : ""}`} size="small" variant="outlined" />
                        )}
                        {job.color != null && (
                            <Chip label={job.color ? "Color" : "B&W"} size="small" variant="outlined" color={job.color ? "secondary" : "default"} />
                        )}
                        {job.cost != null && (
                            <Chip label={`€${job.cost.toFixed(2)}`} size="small" variant="outlined" color="primary" />
                        )}
                    </Box>

                    <Divider />

                    <Typography variant="body2">
                        <strong>Printer:</strong> {job.printer_name || "—"}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Created:</strong>{" "}
                        {job.created_at ? new Date(job.created_at).toLocaleString() : "—"}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Completed:</strong>{" "}
                        {job.completed_at ? new Date(job.completed_at).toLocaleString() : "—"}
                    </Typography>

                    {/* Refund section */}
                    {refund && (
                        <>
                            <Divider />
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                                    Refund
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                    <Chip label={refund.status} color={REFUND_COLOR[refund.status] ?? "default"} size="small" />
                                </Box>
                                {refund.message && (
                                    <Typography variant="body2" mt={0.5}>
                                        <strong>Your reason:</strong> {refund.message}
                                    </Typography>
                                )}
                                {refund.admin_message && (
                                    <Typography variant="body2">
                                        <strong>Admin reply:</strong> {refund.admin_message}
                                    </Typography>
                                )}
                                {refund.status !== "pending" && refund.resolved_by_username && (
                                    <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                                        Resolved by <strong>@{refund.resolved_by_username}</strong>
                                    </Typography>
                                )}
                                <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                                    Submitted: {new Date(refund.created_at).toLocaleString()}
                                </Typography>
                                {refund.status !== "pending" && (
                                    <Typography variant="caption" color="text.disabled" display="block">
                                        Resolved: {new Date(refund.updated_at).toLocaleString()}
                                    </Typography>
                                )}
                            </Box>
                        </>
                    )}
                </Box>
            }
            actions={
                <>
                    {onRefundRequest && (
                        <Button color="warning" onClick={onRefundRequest}>
                            {refund?.status === "denied" ? "Re-request Refund" : "Request Refund"}
                        </Button>
                    )}
                    <Button onClick={onClose}>Close</Button>
                </>
            }
        />
    );
}