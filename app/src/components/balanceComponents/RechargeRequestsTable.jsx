import { useState } from "react";
import {
    Chip,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import RechargeRequestDetailModal from "./RechargeRequestDetailModal";

const STATUS_COLOR = {
    pending: "warning",
    approved: "success",
    rejected: "error",
};

function targetAdminLabel(request) {
    if (!request.target_admin_username) return "—";
    return `${request.target_admin_name} ${request.target_admin_surname}`;
}

export default function RechargeRequestsTable({ requests, isLoading }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const skeletonRows = Array.from({ length: 3 });
    const [selectedRequest, setSelectedRequest] = useState(null);

    const sortedRequests = [...(requests || [])].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    return (
        <>
            <TableContainer component={Paper} sx={{ mt: 1, maxHeight: "calc(60vh - 160px)", overflowY: "auto" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Amount (€)</TableCell>
                            {!isMobile && <TableCell>Method</TableCell>}
                            <TableCell>Status</TableCell>
                            {!isMobile && <TableCell>Sent to</TableCell>}
                            <TableCell align="right">Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            skeletonRows.map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={isMobile ? 3 : 5}><Skeleton /></TableCell>
                                </TableRow>
                            ))
                        ) : sortedRequests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={isMobile ? 3 : 5} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        No recharge requests yet.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sortedRequests.map((request) => (
                                <TableRow
                                    key={request.id}
                                    hover
                                    onClick={() => setSelectedRequest(request)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell>{Number(request.amount).toFixed(2)}</TableCell>
                                    {!isMobile && (
                                        <TableCell sx={{ textTransform: "capitalize" }}>
                                            {request.method ?? "—"}
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Chip
                                            label={request.status}
                                            color={STATUS_COLOR[request.status] ?? "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    {!isMobile && (
                                        <TableCell>{targetAdminLabel(request)}</TableCell>
                                    )}
                                    <TableCell align="right">
                                        <Typography variant="caption">
                                            {new Date(request.created_at).toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <RechargeRequestDetailModal
                request={selectedRequest}
                open={Boolean(selectedRequest)}
                onClose={() => setSelectedRequest(null)}
            />
        </>
    );
}
