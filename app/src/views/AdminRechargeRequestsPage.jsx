import { useState } from "react";
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
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import GavelIcon from "@mui/icons-material/Gavel";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "notistack";

import { useAdmin } from "../context/AdminContext";
import ResolveRechargeRequestModal from "../components/adminComponents/ResolveRechargeRequestModal";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";

const STATUS_COLOR = {
    pending: "warning",
    approved: "success",
    rejected: "error",
};

export default function AdminRechargeRequestsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { pendingRechargeRequests, pendingRechargeRequestsLoading, resolveRechargeRequest, refreshAll } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [selectedRequest, setSelectedRequest] = useState(null);

    const handleResolve = async (requestId, status) => {
        await resolveRechargeRequest(requestId, status);
        enqueueSnackbar(
            status === "approved" ? "Recharge approved — balance credited." : "Recharge request rejected.",
            { variant: status === "approved" ? "success" : "info" }
        );
    };

    const skeletonRows = Array.from({ length: 5 });

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <AdminPageHero
                title="Recharge Requests"
                description="Requests submitted from the app for cash or transfer recharges made directly to an admin. Any admin can resolve — not just the one targeted."
                action={(
                    <Button
                        startIcon={<RefreshIcon />}
                        variant="contained"
                        size="medium"
                        onClick={refreshAll}
                        color="primary"
                        sx={{ width: { xs: "100%", md: "auto" } }}
                    >
                        Refresh
                    </Button>
                )}
            />

            <AdminSurface title="Pending Queue" description="Approve once you've confirmed the money was actually received.">
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        maxHeight: "calc(80vh - 180px)",
                        overflowY: "auto",
                        borderRadius: 2.5,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "none",
                        bgcolor: "rgba(255,255,255,0.75)"
                    }}
                >
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                {isMobile ? (
                                    <>
                                        <TableCell>Request</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell>User</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Method</TableCell>
                                        <TableCell>Message</TableCell>
                                        <TableCell>Created</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingRechargeRequestsLoading ? (
                                skeletonRows.map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={isMobile ? 2 : 6}><Skeleton /></TableCell>
                                    </TableRow>
                                ))
                            ) : !pendingRechargeRequests?.length ? (
                                <TableRow>
                                    <TableCell colSpan={isMobile ? 2 : 6} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No pending recharge requests.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pendingRechargeRequests.map((request) => {
                                    const openModal = () => setSelectedRequest(request);

                                    if (isMobile) {
                                        return (
                                            <TableRow key={request.id} hover onClick={openModal} sx={{ cursor: "pointer" }}>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        @{request.username}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        €{Number(request.amount).toFixed(2)} · {request.method}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip label={request.status} color={STATUS_COLOR[request.status]} size="small" />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    }

                                    return (
                                        <TableRow key={request.id} hover sx={{ cursor: "pointer" }} onClick={openModal}>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">@{request.username}</Typography>
                                            </TableCell>
                                            <TableCell>€{Number(request.amount).toFixed(2)}</TableCell>
                                            <TableCell sx={{ textTransform: "capitalize" }}>{request.method}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                    {request.message ?? "—"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="caption">
                                                    {new Date(request.created_at).toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Resolve request">
                                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); openModal(); }} aria-label="Resolve request">
                                                        <GavelIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </AdminSurface>

            <ResolveRechargeRequestModal
                open={Boolean(selectedRequest)}
                onClose={() => setSelectedRequest(null)}
                request={selectedRequest}
                onResolve={handleResolve}
            />
        </Box>
    );
}
