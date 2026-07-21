import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PeopleIcon from "@mui/icons-material/People";
import PrintIcon from "@mui/icons-material/Print";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EuroIcon from "@mui/icons-material/Euro";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

import { useAdmin } from "../context/AdminContext";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";
import StatCard from "../components/adminComponents/StatCard";
import { ActivityEntry } from "./AdminActivityPage";


function LinkedStatCard({ to, ...cardProps }) {
    return (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Link to={to} style={{ textDecoration: "none", color: "inherit", display: "block", height: "100%" }}>
                <StatCard {...cardProps} />
            </Link>
        </Grid>
    );
}

export default function AdminDashboardPage() {
    const {
        users, usersLoading,
        printers, printersLoading,
        refunds, refundsLoading,
        pendingRechargeRequests, pendingRechargeRequestsLoading,
        pendingPurchases, pendingPurchasesLoading,
        inventoryItems, inventoryItemsLoading,
        outstandingFloats, outstandingFloatsLoading,
        stats, statsLoading,
        recentActivity, recentActivityLoading,
        refreshAll, isSuperAdmin,
    } = useAdmin();

    const pendingRequestsCount = useMemo(() => {
        const pendingRefunds = (refunds ?? []).filter((r) => r.status === "pending").length;
        return pendingRefunds + (pendingRechargeRequests?.length ?? 0) + (pendingPurchases?.length ?? 0);
    }, [refunds, pendingRechargeRequests, pendingPurchases]);
    const pendingRequestsLoading = refundsLoading || pendingRechargeRequestsLoading || pendingPurchasesLoading;

    const lowStockCount = useMemo(
        () => (inventoryItems ?? []).filter((i) => i.is_low_stock).length,
        [inventoryItems]
    );

    const printersOnline = useMemo(
        () => (printers ?? []).filter((p) => p.status !== "stopped").length,
        [printers]
    );

    const outstandingFloatTotal = useMemo(
        () => (outstandingFloats ?? []).reduce((sum, o) => sum + o.outstanding_amount, 0),
        [outstandingFloats]
    );

    const recentEntries = (recentActivity ?? []).slice(0, 5);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <AdminPageHero
                title="Dashboard"
                description="What needs your attention right now — click any card for the full picture."
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

            <Grid container spacing={2}>
                <LinkedStatCard
                    to="/admin/requests"
                    icon={<AssignmentReturnIcon />}
                    label="Pending Requests"
                    value={pendingRequestsCount}
                    accentColor="#1976d2"
                    loading={pendingRequestsLoading}
                    subtitle="Refunds, recharges & purchases"
                />
                <LinkedStatCard
                    to="/admin/supplies"
                    icon={<Inventory2Icon />}
                    label="Low Stock Items"
                    value={lowStockCount}
                    accentColor={lowStockCount > 0 ? "#d32f2f" : "#2e7d32"}
                    loading={inventoryItemsLoading}
                    subtitle="Inventory below threshold"
                />
                <LinkedStatCard
                    to="/admin/users"
                    icon={<PeopleIcon />}
                    label="Total Users"
                    value={users?.length ?? 0}
                    accentColor="#0288d1"
                    loading={usersLoading}
                />
                <LinkedStatCard
                    to="/admin/printers"
                    icon={<PrintIcon />}
                    label="Printers Online"
                    value={`${printersOnline}/${printers?.length ?? 0}`}
                    accentColor={printersOnline === (printers?.length ?? 0) ? "#2e7d32" : "#ed6c02"}
                    loading={printersLoading}
                />
                {isSuperAdmin && (
                    <LinkedStatCard
                        to="/admin/collections"
                        icon={<PriceCheckIcon />}
                        label="Outstanding Cash Float"
                        value={`€${outstandingFloatTotal.toFixed(2)}`}
                        accentColor="#7b1fa2"
                        loading={outstandingFloatsLoading}
                        subtitle="Awaiting collection"
                    />
                )}
            </Grid>

            <AdminSurface
                title="Finance Snapshot"
                description="All-time totals — see the Statistics page for a full breakdown."
            >
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard
                            icon={<AccountBalanceWalletIcon />}
                            label="Current Balance (all users)"
                            value={`€${(stats?.finance?.total_current_balance ?? 0).toFixed(2)}`}
                            accentColor="#0288d1"
                            loading={statsLoading}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard
                            icon={<TrendingDownIcon />}
                            label="Spent on Print"
                            value={`€${(stats?.finance?.total_spent_on_print ?? 0).toFixed(2)}`}
                            accentColor="#ed6c02"
                            loading={statsLoading}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <StatCard
                            icon={<EuroIcon />}
                            label="Total Recharged"
                            value={`€${(stats?.finance?.total_recharged ?? 0).toFixed(2)}`}
                            accentColor="#2e7d32"
                            loading={statsLoading}
                        />
                    </Grid>
                </Grid>
            </AdminSurface>

            <AdminSurface title="Recent Activity" description="The last few admin-initiated actions.">
                <Stack spacing={1}>
                    {recentActivityLoading ? (
                        <Typography color="text.secondary">Loading…</Typography>
                    ) : recentEntries.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No activity recorded yet.</Typography>
                    ) : (
                        recentEntries.map((entry) => <ActivityEntry key={entry.id} entry={entry} />)
                    )}
                    <Box>
                        <Button component={Link} to="/admin/activity" size="small">
                            View all activity
                        </Button>
                    </Box>
                </Stack>
            </AdminSurface>
        </Box>
    );
}
