import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";

const STATUS_COLOR = {
    pending: "warning",
    approved: "success",
    rejected: "error",
};

function DetailRow({ label, value }) {
    return (
        <Box display="flex" justifyContent="space-between" gap={2}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="body2" fontWeight="medium" textAlign="right">{value}</Typography>
        </Box>
    );
}

export default function RechargeRequestDetailModal({ request, open, onClose }) {
    if (!request) return null;

    const targetAdmin = request.target_admin_username
        ? `${request.target_admin_name} ${request.target_admin_surname} (@${request.target_admin_username})`
        : "—";

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title="Recharge Request"
            maxWidth="xs"
            content={
                <Stack spacing={1.5} sx={{ mt: 0.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6">€{Number(request.amount).toFixed(2)}</Typography>
                        <Chip
                            label={request.status}
                            color={STATUS_COLOR[request.status] ?? "default"}
                            size="small"
                        />
                    </Box>
                    <Divider />
                    <DetailRow label="Method" value={request.method ? request.method[0].toUpperCase() + request.method.slice(1) : "—"} />
                    <DetailRow label="Sent to" value={targetAdmin} />
                    <DetailRow label="Resolved by" value={request.resolved_by_username ? `@${request.resolved_by_username}` : "—"} />
                    <DetailRow label="Requested" value={new Date(request.created_at).toLocaleString()} />
                    <DetailRow label="Last updated" value={new Date(request.updated_at).toLocaleString()} />
                    {request.message && (
                        <>
                            <Divider />
                            <Typography variant="body2" color="text.secondary">Message</Typography>
                            <Typography variant="body2">{request.message}</Typography>
                        </>
                    )}
                </Stack>
            }
        />
    );
}
