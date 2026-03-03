import { useState, useMemo } from "react";
import {
    Paper,
    Typography,
    Box,
    Chip,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import ReplayIcon from "@mui/icons-material/Replay";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { usePrint } from "../context/PrintContext";
import { getMyRefunds, requestRefund } from "../api/refund";
import RequestRefundModal from "../components/historyJobComponents/RequestRefundModal";
import JobDetailsModal from "../components/historyJobComponents/JobDetailsModal";
import RefundDetailsModal from "../components/historyJobComponents/RefundDetailsModal";
import SkeletonRow from "../components/historyJobComponents/SkeletonRow";


const COMPLETED_STATUS = ["completed"];
const ERROR_STATUS = ["aborted", "cancelled"];

function renderStatusIcon(status) {
    if (COMPLETED_STATUS.includes(status)) return <CheckIcon color="success" />;
    if (ERROR_STATUS.includes(status)) return <CloseIcon color="error" />;
    return <HourglassBottomIcon color="action" />;
}

const REFUND_STATUS_COLOR = { pending: "warning", approved: "success", denied: "error" };


export default function HistoryPage() {
    const { jobs, isLoading } = usePrint();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedJobRefund, setSelectedJobRefund] = useState(null);
    const [refundJob, setRefundJob] = useState(null);
    const [viewRefund, setViewRefund] = useState(null);

    // Load user's refund requests
    const { data: myRefunds = [] } = useQuery({
        queryKey: ["my-refunds"],
        queryFn: getMyRefunds,
        staleTime: 1000 * 60,
        retry: false
    });

    // Map jobId → refund for quick lookup
    const refundByJobId = useMemo(() => {
        const map = {};
        for (const r of myRefunds) {
            map[r.print_job_id] = r;
        }
        return map;
    }, [myRefunds]);

    const sortedJobs = useMemo(() => {
        return [...(jobs || [])].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }, [jobs]);

    const handleRefundSubmit = async (jobId, message) => {
        await requestRefund(jobId, message);
        await queryClient.invalidateQueries(["my-refunds"]);
        enqueueSnackbar("Refund request submitted successfully.", { variant: "success" });
    };

    const skeletonRows = Array.from({ length: 5 });

    return (
        <Paper sx={{ p: 3, gap: 2 }}>
            <Typography variant="h5">Print History</Typography>
            <Typography variant="body1">
                Last print jobs sent and their status. Completed jobs can be refunded.
            </Typography>

            <TableContainer
                component={Paper}
                sx={{ mt: 2, maxHeight: "calc(80vh - 200px)", overflowY: "auto", overflowX: "hidden" }}
            >
                <Table sx={isMobile ? { tableLayout: "fixed", width: "100%" } : {}}>
                    {!isMobile && (
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>File Name</TableCell>
                                <TableCell>Printer</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Cost</TableCell>
                                <TableCell>Created at</TableCell>
                                <TableCell>Completed at</TableCell>
                                <TableCell>Refund</TableCell>
                            </TableRow>
                        </TableHead>
                    )}
                    <TableBody>
                        {isLoading ? (
                            skeletonRows.map((_, i) => <SkeletonRow key={i} isMobile={isMobile} desktopColumns={8} />)
                        ) : !sortedJobs?.length ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        No jobs found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedJobs.map((job) => {
                                const existingRefund = refundByJobId[job.id];
                                const isCompleted = job.status === "completed";

                                const refundCell = isCompleted
                                    ? existingRefund
                                        ? <Box display="flex" alignItems="center" gap={0.5}>
                                            <Tooltip title="Click to see details">
                                                <Chip
                                                    label={existingRefund.status}
                                                    color={REFUND_STATUS_COLOR[existingRefund.status] ?? "default"}
                                                    size="small"
                                                    onClick={() => setViewRefund(existingRefund)}
                                                    sx={{ cursor: "pointer" }}
                                                />
                                            </Tooltip>
                                            {existingRefund.status === "denied" && (
                                                <Tooltip title="Re-submit refund request">
                                                    <IconButton
                                                        size="small"
                                                        color="warning"
                                                        onClick={() => setRefundJob(job)}
                                                    >
                                                        <ReplayIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                          </Box>
                                        : (
                                            <Tooltip title="Request refund">
                                                <IconButton
                                                    size="small"
                                                    color="warning"
                                                    onClick={() => setRefundJob(job)}
                                                >
                                                    <ReplayIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )
                                    : null;

                                if (isMobile) {
                                    return (
                                        <TableRow
                                            key={job.id}
                                            hover
                                            onClick={() => { setSelectedJob(job); setSelectedJobRefund(existingRefund ?? null); }}
                                            sx={{ cursor: "pointer" }}
                                        >
                                            <TableCell sx={{ width: 36, pl: 1, pr: 0 }}>
                                                {renderStatusIcon(job.status)}
                                            </TableCell>
                                            <TableCell sx={{ overflow: "hidden", pr: 0.5 }}>
                                                <Typography variant="body2" fontWeight="medium" noWrap>
                                                    {job.file_name || "—"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {job.printer_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell
                                                align="right"
                                                sx={{ width: 76, pl: 0, verticalAlign: "top", whiteSpace: "nowrap" }}
                                            >
                                                <Typography variant="body2" fontWeight="medium" sx={{ fontSize: "0.82rem" }}>
                                                    €{job.cost?.toFixed(2) ?? "—"}
                                                </Typography>
                                                {existingRefund ? (
                                                    <Chip
                                                        label={existingRefund.status}
                                                        color={REFUND_STATUS_COLOR[existingRefund.status] ?? "default"}
                                                        size="small"
                                                        sx={{ mt: 0.25, fontSize: "0.65rem", height: 20 }}
                                                    />
                                                ) : isCompleted && (
                                                    <Typography variant="caption" color="warning.main" display="block">
                                                        Refundable
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }

                                return (
                                    <TableRow key={job.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                {renderStatusIcon(job.status)}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "10vw" }}>
                                            {job.file_name || "—"}
                                        </TableCell>
                                        <TableCell>{job.printer_name || "—"}</TableCell>
                                        <TableCell>{job.status.toUpperCase()}</TableCell>
                                        <TableCell>€{job.cost?.toFixed(2) ?? "—"}</TableCell>
                                        <TableCell>
                                            {job.created_at ? new Date(job.created_at).toLocaleString() : "—"}
                                        </TableCell>
                                        <TableCell>
                                            {job.completed_at ? new Date(job.completed_at).toLocaleString() : "—"}
                                        </TableCell>
                                        <TableCell>{refundCell}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <JobDetailsModal
                job={selectedJob}
                onClose={() => { setSelectedJob(null); setSelectedJobRefund(null); }}
                refund={selectedJobRefund}
                onRefundRequest={
                    selectedJob?.status === "completed" &&
                    (!selectedJobRefund || selectedJobRefund.status === "denied")
                        ? () => { setSelectedJob(null); setSelectedJobRefund(null); setRefundJob(selectedJob); }
                        : undefined
                }
            />

            <RefundDetailsModal
                open={Boolean(viewRefund)}
                onClose={() => setViewRefund(null)}
                refund={viewRefund}
            />

            <RequestRefundModal
                open={Boolean(refundJob)}
                onClose={() => setRefundJob(null)}
                job={refundJob}
                onSubmit={handleRefundSubmit}
            />
        </Paper>
    );
}