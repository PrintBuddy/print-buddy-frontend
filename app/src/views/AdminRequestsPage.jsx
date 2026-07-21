import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Badge, Box, Button, Chip, IconButton, Tabs, Tab, Tooltip, Typography } from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "../hooks/useSnackbar";

import { useAdmin } from "../context/AdminContext";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";
import PendingQueueTable from "../components/adminComponents/PendingQueueTable";
import StatusFilterToggle from "../components/adminComponents/StatusFilterToggle";
import { matchesStatusFilter } from "../utils/statusFilter";
import ResolveRefundModal from "../components/adminComponents/ResolveRefundModal";
import ResolveRechargeRequestModal from "../components/adminComponents/ResolveRechargeRequestModal";
import ResolvePurchaseModal from "../components/adminComponents/ResolvePurchaseModal";

const REFUND_STATUS_COLOR = { pending: "warning", approved: "success", denied: "error" };
const RECHARGE_STATUS_COLOR = { pending: "warning", approved: "success", rejected: "error" };
const PURCHASE_STATUS_COLOR = { pending: "warning", fulfilled: "success", rejected: "error" };

const TABS = ["refunds", "recharge", "purchases"];

function RefundsTab() {
    const { refunds, refundsLoading, resolveRefund, users, allJobs } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredRefunds = useMemo(
        () => (refunds ?? []).filter((r) => matchesStatusFilter(r.status, statusFilter, { accepted: "approved", rejected: "denied" })),
        [refunds, statusFilter]
    );

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

    const handleResolve = async (refundId, status, adminMessage) => {
        await resolveRefund(refundId, status, adminMessage);
        enqueueSnackbar(
            status === "approved" ? "Refund approved — balance credited." : "Refund denied.",
            { variant: status === "approved" ? "success" : "info" }
        );
    };

    const columns = [
        {
            header: "User", render: (r) => {
                const user = userById[r.user_id];
                return (
                    <>
                        <Typography variant="body2" fontWeight="medium">
                            {user ? `${user.name} ${user.surname}` : r.user_id?.slice(0, 8) + "…"}
                        </Typography>
                        {user && <Typography variant="caption" color="text.secondary">@{user.username}</Typography>}
                    </>
                );
            }
        },
        {
            header: "File", render: (r) => {
                const job = jobById[r.print_job_id];
                return (
                    <>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                            {job?.file_name ?? r.print_job_id?.slice(0, 8) + "…"}
                        </Typography>
                        {job && (
                            <Typography variant="caption" color="text.secondary">
                                {job.pages}p · {job.color ? "Color" : "B&W"} · €{job.cost?.toFixed(2)}
                            </Typography>
                        )}
                    </>
                );
            }
        },
        { header: "Message", render: (r) => <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{r.message ?? "—"}</Typography> },
        { header: "Status", render: (r) => <Chip label={r.status} color={REFUND_STATUS_COLOR[r.status] ?? "default"} size="small" /> },
        { header: "Admin note", render: (r) => <Typography variant="body2" noWrap sx={{ maxWidth: 180 }} color="text.secondary">{r.admin_message ?? "—"}</Typography> },
        { header: "Created", render: (r) => <Typography variant="caption">{new Date(r.created_at).toLocaleString()}</Typography> },
    ];

    return (
        <AdminSurface title="Refund Queue" description="Open a request to review the job details, user note, and resolution status.">
            <StatusFilterToggle value={statusFilter} onChange={setStatusFilter} />
            <PendingQueueTable
                columns={columns}
                data={filteredRefunds}
                isLoading={refundsLoading}
                emptyMessage="No refund requests found."
                onRowClick={(r) => setSelectedRefund({ ...r, _user: userById[r.user_id], _job: jobById[r.print_job_id] })}
                renderMobileRow={(r) => {
                    const user = userById[r.user_id];
                    const job = jobById[r.print_job_id];
                    return {
                        primary: user ? `${user.name} ${user.surname}` : "—",
                        secondary: job?.file_name ?? "—",
                        trailing: <Chip label={r.status} color={REFUND_STATUS_COLOR[r.status] ?? "default"} size="small" />,
                    };
                }}
                renderActions={(r) => r.status === "pending" && (
                    <Tooltip title="Resolve request">
                        <IconButton size="small" onClick={() => setSelectedRefund({ ...r, _user: userById[r.user_id], _job: jobById[r.print_job_id] })} aria-label="Resolve request">
                            <GavelIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            />

            <ResolveRefundModal
                open={Boolean(selectedRefund)}
                onClose={() => setSelectedRefund(null)}
                refund={selectedRefund}
                user={selectedRefund?._user}
                job={selectedRefund?._job}
                onResolve={handleResolve}
                readOnly={selectedRefund?.status !== "pending"}
            />
        </AdminSurface>
    );
}

function RechargeRequestsTab() {
    const { allRechargeRequests, allRechargeRequestsLoading, resolveRechargeRequest } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");

    const filteredRequests = useMemo(
        () => (allRechargeRequests ?? []).filter((r) => matchesStatusFilter(r.status, statusFilter, { accepted: "approved", rejected: "rejected" })),
        [allRechargeRequests, statusFilter]
    );

    const handleResolve = async (requestId, status) => {
        await resolveRechargeRequest(requestId, status);
        enqueueSnackbar(
            status === "approved" ? "Recharge approved — balance credited." : "Recharge request rejected.",
            { variant: status === "approved" ? "success" : "info" }
        );
    };

    const columns = [
        { header: "User", render: (r) => <Typography variant="body2" fontWeight="medium">@{r.username}</Typography> },
        { header: "Amount", render: (r) => `€${Number(r.amount).toFixed(2)}` },
        { header: "Method", render: (r) => <span style={{ textTransform: "capitalize" }}>{r.method}</span> },
        { header: "Message", render: (r) => <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{r.message ?? "—"}</Typography> },
        { header: "Status", render: (r) => <Chip label={r.status} color={RECHARGE_STATUS_COLOR[r.status] ?? "default"} size="small" /> },
        { header: "Created", render: (r) => <Typography variant="caption">{new Date(r.created_at).toLocaleString()}</Typography> },
    ];

    return (
        <AdminSurface title="Recharge Requests" description="Approve once you've confirmed the money was actually received.">
            <StatusFilterToggle value={statusFilter} onChange={setStatusFilter} />
            <PendingQueueTable
                columns={columns}
                data={filteredRequests}
                isLoading={allRechargeRequestsLoading}
                emptyMessage="No recharge requests found."
                onRowClick={setSelectedRequest}
                renderMobileRow={(r) => ({
                    primary: `@${r.username}`,
                    secondary: `€${Number(r.amount).toFixed(2)} · ${r.method}`,
                    trailing: <Chip label={r.status} color={RECHARGE_STATUS_COLOR[r.status]} size="small" />,
                })}
                renderActions={(r) => r.status === "pending" && (
                    <Tooltip title="Resolve request">
                        <IconButton size="small" onClick={() => setSelectedRequest(r)} aria-label="Resolve request">
                            <GavelIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            />

            <ResolveRechargeRequestModal
                open={Boolean(selectedRequest)}
                onClose={() => setSelectedRequest(null)}
                request={selectedRequest}
                onResolve={handleResolve}
                readOnly={selectedRequest?.status !== "pending"}
            />
        </AdminSurface>
    );
}

function PurchasesTab() {
    const { allPurchases, allPurchasesLoading, resolvePurchase, users } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");

    const userById = useMemo(() => {
        const map = {};
        (users ?? []).forEach((u) => { map[u.id] = u; });
        return map;
    }, [users]);

    const filteredPurchases = useMemo(
        () => (allPurchases ?? []).filter((r) => matchesStatusFilter(r.status, statusFilter, { accepted: "fulfilled", rejected: "rejected" })),
        [allPurchases, statusFilter]
    );

    const handleResolve = async (purchaseId, action, adminMessage) => {
        await resolvePurchase(purchaseId, action, adminMessage);
        enqueueSnackbar(
            action === "fulfill" ? "Purchase marked as given." : "Purchase rejected — balance refunded.",
            { variant: action === "fulfill" ? "success" : "info" }
        );
    };

    const columns = [
        {
            header: "User", render: (r) => {
                const user = userById[r.user_id];
                return (
                    <>
                        <Typography variant="body2" fontWeight="medium">
                            {user ? `${user.name} ${user.surname}` : r.username}
                        </Typography>
                        {user && <Typography variant="caption" color="text.secondary">@{user.username}</Typography>}
                    </>
                );
            }
        },
        { header: "Item", render: (r) => <Typography variant="body2">{r.quantity}x {r.product_name}</Typography> },
        { header: "Total (€)", render: (r) => Number(r.total_amount).toFixed(2) },
        { header: "Message", render: (r) => <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{r.message ?? "—"}</Typography> },
        { header: "Status", render: (r) => <Chip label={r.status} color={PURCHASE_STATUS_COLOR[r.status] ?? "default"} size="small" /> },
        { header: "Created", render: (r) => <Typography variant="caption">{new Date(r.created_at).toLocaleString()}</Typography> },
    ];

    return (
        <AdminSurface title="Purchases" description="Open a purchase to see the user's message and resolve it.">
            <StatusFilterToggle value={statusFilter} onChange={setStatusFilter} />
            <PendingQueueTable
                columns={columns}
                data={filteredPurchases}
                isLoading={allPurchasesLoading}
                emptyMessage="No purchases found."
                onRowClick={(r) => setSelectedPurchase({ ...r, _user: userById[r.user_id] })}
                renderMobileRow={(r) => {
                    const user = userById[r.user_id];
                    return {
                        primary: user ? `${user.name} ${user.surname}` : r.username,
                        secondary: `${r.quantity}x ${r.product_name}`,
                        trailing: <Chip label={r.status} color={PURCHASE_STATUS_COLOR[r.status] ?? "default"} size="small" />,
                    };
                }}
                renderActions={(r) => r.status === "pending" && (
                    <Tooltip title="Resolve purchase">
                        <IconButton size="small" onClick={() => setSelectedPurchase({ ...r, _user: userById[r.user_id] })} aria-label="Resolve purchase">
                            <GavelIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            />

            <ResolvePurchaseModal
                open={Boolean(selectedPurchase)}
                onClose={() => setSelectedPurchase(null)}
                purchase={selectedPurchase}
                user={selectedPurchase?._user}
                onResolve={handleResolve}
                readOnly={selectedPurchase?.status !== "pending"}
            />
        </AdminSurface>
    );
}

function TabLabel({ text, count }) {
    return (
        <Badge badgeContent={count} color="error" sx={{ mr: count > 0 ? 1 : 0 }}>
            <Box component="span" sx={{ pr: count > 0 ? 2 : 0 }}>{text}</Box>
        </Badge>
    );
}

export default function AdminRequestsPage() {
    const { refreshAll, refunds, pendingRechargeRequests, pendingPurchases } = useAdmin();
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get("tab");
    const tab = TABS.includes(tabParam) ? tabParam : "refunds";

    const pendingRefundsCount = (refunds ?? []).filter((r) => r.status === "pending").length;
    const pendingRechargeCount = pendingRechargeRequests?.length ?? 0;
    const pendingPurchasesCount = pendingPurchases?.length ?? 0;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <AdminPageHero
                title="Requests"
                description="Refund, recharge, and Extras-purchase requests — full history, newest first. Filter by status; any admin can resolve any pending one."
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

            <Tabs
                value={tab}
                onChange={(_, value) => setSearchParams({ tab: value })}
                sx={{ borderBottom: 1, borderColor: "divider" }}
            >
                <Tab label={<TabLabel text="Refunds" count={pendingRefundsCount} />} value="refunds" />
                <Tab label={<TabLabel text="Recharge Requests" count={pendingRechargeCount} />} value="recharge" />
                <Tab label={<TabLabel text="Purchases" count={pendingPurchasesCount} />} value="purchases" />
            </Tabs>

            {tab === "refunds" && <RefundsTab />}
            {tab === "recharge" && <RechargeRequestsTab />}
            {tab === "purchases" && <PurchasesTab />}
        </Box>
    );
}
