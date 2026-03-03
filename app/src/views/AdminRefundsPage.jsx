import { useState, useMemo } from "react";
import {
    Box,
    Button,
    Chip,
    IconButton,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import GavelIcon from "@mui/icons-material/Gavel";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "notistack";

import { useAdmin } from "../context/AdminContext";
import ResolveRefundModal from "../components/adminComponents/ResolveRefundModal";


const STATUS_COLOR = {
    pending: "warning",
    approved: "success",
    denied: "error",
};

export default function AdminRefundsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { refunds, refundsLoading, resolveRefund, refreshAll, users, allJobs } = useAdmin();

    const userById = useMemo(() => {
        const map = {};
        (users ?? []).forEach((u) => { map[u.id] = u; });
        return map;
    }, [users]);

    const jobById = useMemo(() => {
        const map = {};
        (allJobs ?? []).forEach((j) => { map[j.id] = j; });
        return map;
    }, [allJobs]);
    const { enqueueSnackbar } = useSnackbar();
    const [selectedRefund, setSelectedRefund] = useState(null);

    const handleResolve = async (refundId, status, adminMessage) => {
        await resolveRefund(refundId, status, adminMessage);
        enqueueSnackbar(
            status === "approved" ? "Refund approved — balance credited." : "Refund denied.",
            { variant: status === "approved" ? "success" : "info" }
        );
    };

    const skeletonRows = Array.from({ length: 5 });

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">Refund Requests</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Review and resolve user refund requests.
                    </Typography>
                </Box>
                <Button
                    startIcon={<RefreshIcon />}
                    variant="outlined"
                    size="small"
                    onClick={refreshAll}
                >
                    Refresh
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: "calc(80vh - 180px)", overflowY: "auto" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {isMobile ? (
                                <>
                                    <TableCell>Request</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell>User</TableCell>
                                    <TableCell>File</TableCell>
                                    <TableCell>Message</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Admin note</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {refundsLoading
                            ? skeletonRows.map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={isMobile ? 2 : 7}><Skeleton /></TableCell>
                                </TableRow>
                            ))
                            : !refunds?.length
                            ? (
                                <TableRow>
                                    <TableCell colSpan={isMobile ? 2 : 7} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No refund requests found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )
                            : refunds.map((refund) => {
                                const user = userById[refund.user_id];
                                const job = jobById[refund.print_job_id];
                                const openModal = () => setSelectedRefund({ ...refund, _user: user, _job: job });

                                if (isMobile) {
                                    return (
                                        <TableRow
                                            key={refund.id}
                                            hover
                                            onClick={openModal}
                                            sx={{ cursor: "pointer" }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {user ? `${user.name} ${user.surname}` : "—"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: "40vw", display: "block" }}>
                                                    {job?.file_name ?? "—"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={refund.status}
                                                    color={STATUS_COLOR[refund.status] ?? "default"}
                                                    size="small"
                                                />
                                                <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
                                                    {new Date(refund.created_at).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }

                                return (
                                <TableRow key={refund.id} hover sx={{ cursor: "pointer" }} onClick={openModal}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {user ? `${user.name} ${user.surname}` : refund.user_id?.slice(0, 8) + "…"}
                                        </Typography>
                                        {user && (
                                            <Typography variant="caption" color="text.secondary">
                                                @{user.username}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                                            {job?.file_name ?? refund.print_job_id?.slice(0, 8) + "…"}
                                        </Typography>
                                        {job && (
                                            <Typography variant="caption" color="text.secondary">
                                                {job.pages}p · {job.color ? "Color" : "B&W"} · €{job.cost?.toFixed(2)}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                            {refund.message ?? "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={refund.status}
                                            color={STATUS_COLOR[refund.status] ?? "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 180 }} color="text.secondary">
                                            {refund.admin_message ?? "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {new Date(refund.created_at).toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        {refund.status === "pending" && (
                                            <Tooltip title="Resolve request">
                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); openModal(); }}>
                                                    <GavelIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                                );
                            })
                        }
                    </TableBody>
                </Table>
            </TableContainer>

            <ResolveRefundModal
                open={Boolean(selectedRefund)}
                onClose={() => setSelectedRefund(null)}
                refund={selectedRefund}
                user={selectedRefund?._user}
                job={selectedRefund?._job}
                onResolve={handleResolve}
                readOnly={selectedRefund?.status !== "pending"}
            />
        </Box>
    );
}
