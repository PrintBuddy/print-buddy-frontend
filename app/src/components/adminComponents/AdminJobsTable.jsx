import { useState } from "react";
import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, Paper, Skeleton, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Typography, useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";


const STATUS_COLOR = {
    completed: "success",
    aborted: "error",
    cancelled: "error",
    pending: "warning",
    printing: "info",
    held: "warning",
    stopped: "warning",
};

function StatusChip({ status }) {
    return <Chip label={status} color={STATUS_COLOR[status] ?? "default"} size="small" />;
}

function JobDetailDialog({ job, userById, onClose }) {
    if (!job) return null;
    const user = userById?.[job.user_id];
    return (
        <Dialog open onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ pb: 0.5 }}>
                <Typography fontWeight="bold" noWrap>{job.file_name}</Typography>
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={1.5} mt={0.5}>
                    <Box display="flex" gap={1} flexWrap="wrap">
                        <StatusChip status={job.status} />
                        <Chip label={`${job.pages} page${job.pages !== 1 ? "s" : ""}`} size="small" variant="outlined" />
                        <Chip label={job.color ? "Color" : "B&W"} size="small" variant="outlined" color={job.color ? "secondary" : "default"} />
                        <Chip label={`€${job.cost?.toFixed(2)}`} size="small" variant="outlined" color="primary" />
                    </Box>
                    <Divider />
                    <Typography variant="body2"><strong>Printer:</strong> {job.printer_name}</Typography>
                    <Typography variant="body2">
                        <strong>User:</strong>{" "}
                        {user
                            ? `${user.name} ${user.surname} (@${user.username})`
                            : job.user_id?.slice(0, 8) + "…"}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Created:</strong> {new Date(job.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Completed:</strong>{" "}
                        {job.completed_at ? new Date(job.completed_at).toLocaleString() : "—"}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default function AdminJobsTable({ jobs, isLoading, userById = {} }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [selectedJob, setSelectedJob] = useState(null);
    const skeletonRows = Array.from({ length: 6 });

    return (
        <>
            <TableContainer
                component={Paper}
                sx={{ mt: 2, maxHeight: "calc(80vh - 250px)", overflowY: "auto", overflowX: "hidden" }}
            >
                <Table size="small" sx={isMobile ? { tableLayout: "fixed", width: "100%" } : {}}>
                    {!isMobile && (
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ maxWidth: 180, width: 180 }}>File</TableCell>
                                <TableCell>Printer</TableCell>
                                <TableCell>User</TableCell>
                                <TableCell>Pages</TableCell>
                                <TableCell>Color</TableCell>
                                <TableCell>Cost</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell>Completed</TableCell>
                            </TableRow>
                        </TableHead>
                    )}
                    <TableBody>
                        {isLoading
                            ? skeletonRows.map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={isMobile ? 2 : 9}><Skeleton /></TableCell>
                                </TableRow>
                            ))
                            : !jobs?.length
                            ? (
                                <TableRow>
                                    <TableCell colSpan={isMobile ? 2 : 9} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No print jobs found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )
                            : jobs.map((job) => {
                                const user = userById[job.user_id];
                                if (isMobile) {
                                    return (
                                        <TableRow
                                            key={job.id}
                                            hover
                                            onClick={() => setSelectedJob(job)}
                                            sx={{ cursor: "pointer" }}
                                        >
                                            <TableCell sx={{ overflow: "hidden", pr: 0.5 }}>
                                                <Typography variant="body2" fontWeight="medium" noWrap>
                                                    {job.file_name ?? "—"}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {job.printer_name}
                                                    {user ? ` · @${user.username}` : ""}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right" sx={{ width: 90, pl: 0, verticalAlign: "top", whiteSpace: "nowrap" }}>
                                                <StatusChip status={job.status} />
                                                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                                    {job.color ? "Color" : "B&W"} · {job.pages}p
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    €{job.cost?.toFixed(2)}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" display="block">
                                                    {new Date(job.created_at).toLocaleDateString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                                return (
                                    <TableRow key={job.id} hover>
                                        <TableCell sx={{ maxWidth: 180, overflow: "hidden" }}>
                                            <Typography variant="body2" noWrap title={job.file_name}>
                                                {job.file_name ?? "—"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{job.printer_name}</TableCell>
                                        <TableCell>
                                            {user
                                                ? <Typography variant="body2">{user.username}</Typography>
                                                : <Typography variant="caption" color="text.secondary">{job.user_id?.slice(0, 8)}…</Typography>
                                            }
                                        </TableCell>
                                        <TableCell>{job.pages}</TableCell>
                                        <TableCell>{job.color ? "Color" : "B&W"}</TableCell>
                                        <TableCell>€{job.cost?.toFixed(2)}</TableCell>
                                        <TableCell><StatusChip status={job.status} /></TableCell>
                                        <TableCell>{new Date(job.created_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {job.completed_at ? new Date(job.completed_at).toLocaleString() : "—"}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        }
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedJob && (
                <JobDetailDialog
                    job={selectedJob}
                    userById={userById}
                    onClose={() => setSelectedJob(null)}
                />
            )}
        </>
    );
}
