import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
    Divider,
    Skeleton,
    Stack,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import LayersIcon from "@mui/icons-material/Layers";
import InvertColorsIcon from "@mui/icons-material/InvertColors";
import InvertColorsOffIcon from "@mui/icons-material/InvertColorsOff";
import PrintIcon from "@mui/icons-material/Print";
import EuroIcon from "@mui/icons-material/Euro";
import TuneIcon from "@mui/icons-material/Tune";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import StorefrontIcon from "@mui/icons-material/Storefront";

import { getStatsOverview } from "../api/stats";
import { getPrinters } from "../api/printer";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";
import StatCard from "../components/adminComponents/StatCard";
import FinanceBreakdownItem from "../components/adminComponents/FinanceBreakdownItem";
import StatsBarChart from "../components/adminComponents/StatsBarChart";
import StatsBreakdownTable from "../components/adminComponents/StatsBreakdownTable";
import PeriodFilter from "../components/utils/PeriodFilter";
import useStatisticsData from "../hooks/useStatisticsData";

const BW_COLOR = "#78909c";
const COLOR_COLOR = "#ed6c02";

export default function AdminStatisticsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const queryClient = useQueryClient();
    const [range, setRange] = useState({ start: null, end: null });

    // "All Time" (the default) reuses AdminContext's own all-time
    // ["admin-stats"] query key — the same one AdminDashboardPage's Finance
    // Snapshot fetches — so the two stay deduped/cache-shared exactly like
    // before this page had period filtering. Only an actual period
    // selection gets its own distinct cache entry.
    const queryKey = (range.start || range.end)
        ? ["admin-stats", range.start, range.end]
        : ["admin-stats"];

    const { data: stats, isLoading } = useQuery({
        queryKey,
        queryFn: () => getStatsOverview(range),
        retry: false,
        staleTime: 1000 * 60 * 2,
    });

    const { data: allPrinters = [] } = useQuery({
        queryKey: ["printers"],
        queryFn: getPrinters,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    const refresh = () => queryClient.invalidateQueries({ queryKey });

    const {
        printerChartData,
        finance: { f, adjustmentsPositive, netCashChange },
        printerRows,
        userRows,
    } = useStatisticsData(stats, allPrinters, isMobile);

    const chartHeight = isMobile ? 220 : 260;
    const netPositive = netCashChange >= 0;
    const revenueFromUsers = (f.total_spent_on_print ?? 0) + (f.total_product_purchases ?? 0);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.75, sm: 2.25 } }}>

            <AdminPageHero
                title="Statistics"
                description="Review printing volume, revenue, and cash-flow metrics for the selected time window."
                action={(
                    <Button
                        startIcon={<RefreshIcon />}
                        variant="contained"
                        size="medium"
                        onClick={refresh}
                        color="primary"
                        sx={{ width: { xs: "100%", md: "auto" } }}
                    >
                        Refresh
                    </Button>
                )}
            />

            <PeriodFilter onChange={setRange} />

            {/* ── Summary cards ── */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr 1fr",
                        md: "1fr 1fr 1fr 1fr 1fr",
                    },
                    gap: { xs: 1.5, sm: 2 },
                }}
            >
                <StatCard
                    icon={<LayersIcon />}
                    label="Total Pages"
                    subtitle="Completed jobs only"
                    value={stats?.total_pages?.toLocaleString() ?? "0"}
                    accentColor="#1976d2"
                    loading={isLoading}
                />
                <StatCard
                    icon={<InvertColorsOffIcon />}
                    label="B/W Pages"
                    value={stats?.bw_pages?.toLocaleString() ?? "0"}
                    accentColor={BW_COLOR}
                    loading={isLoading}
                />
                <StatCard
                    icon={<InvertColorsIcon />}
                    label="Color Pages"
                    value={stats?.color_pages?.toLocaleString() ?? "0"}
                    accentColor={COLOR_COLOR}
                    loading={isLoading}
                />
                <StatCard
                    icon={<ContentCopyIcon />}
                    label="Sheets Used"
                    subtitle="Physical paper sheets"
                    value={stats?.total_sheets?.toLocaleString() ?? "0"}
                    accentColor="#00796b"
                    loading={isLoading}
                />
                <StatCard
                    icon={<PrintIcon />}
                    label="Completed Jobs"
                    value={stats?.total_jobs?.toLocaleString() ?? "0"}
                    accentColor="#7b1fa2"
                    loading={isLoading}
                />
            </Box>

            {/* ── Finance card ── */}
            <AdminSurface title="Finance Overview" description="Selected time window, except Balance Held (always as of now)." sx={{ p: { xs: 2, sm: 3 } }}>

                {/* Net cash change — the one number that reflects real money in/out */}
                <Box
                    sx={{
                        p: { xs: 2, sm: 2.5 },
                        mb: 2,
                        borderRadius: 2,
                        backgroundColor: netPositive ? "success.main" : "error.main",
                        color: "white",
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <EuroIcon fontSize="small" />
                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                            Net Cash Change
                        </Typography>
                    </Stack>
                    {isLoading ? (
                        <Skeleton width="40%" height={36} sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />
                    ) : (
                        <Typography fontWeight="bold" sx={{ fontSize: { xs: "1.6rem", sm: "2rem" } }}>
                            {netPositive ? "+" : ""}€{netCashChange.toFixed(2)}
                        </Typography>
                    )}
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                        Recharged − Expenses — the only two flows that actually move real cash
                    </Typography>
                </Box>

                <Typography variant="overline" color="text.secondary" fontWeight="bold">
                    Real Cash Flow
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 1, mb: 2.5 }}>
                    <FinanceBreakdownItem
                        icon={<EuroIcon fontSize="small" />}
                        label="Recharged (in)"
                        value={`€${(f.total_recharged ?? 0).toFixed(2)}`}
                        color="#2e7d32"
                        subtitle="Real cash/transfer received from users"
                        loading={isLoading}
                    />
                    <FinanceBreakdownItem
                        icon={<ReceiptLongIcon fontSize="small" />}
                        label="Expenses (out)"
                        value={`€${(f.total_expenses ?? 0).toFixed(2)}`}
                        color="#c62828"
                        subtitle="Toner, paper, maintenance actually purchased"
                        loading={isLoading}
                    />
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="overline" color="text.secondary" fontWeight="bold">
                    Internal Ledger Activity
                </Typography>
                <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 1 }}>
                    Credit moving within the app — not real-world cash. Refunds give users back credit, they don't return cash already received.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1.5, sm: 2 }} flexWrap="wrap" useFlexGap>
                    <FinanceBreakdownItem
                        icon={<StorefrontIcon fontSize="small" />}
                        label="Print/Purchase Revenue"
                        value={`€${revenueFromUsers.toFixed(2)}`}
                        color="#6a1b9a"
                        subtitle="Credit consumed on prints + Extras"
                        loading={isLoading}
                    />
                    <FinanceBreakdownItem
                        icon={<AssignmentReturnIcon fontSize="small" />}
                        label="Refunds Issued"
                        value={`€${(f.total_refunded ?? 0).toFixed(2)}`}
                        color="#0277bd"
                        subtitle="Credit returned to users via refunds"
                        loading={isLoading}
                    />
                    <FinanceBreakdownItem
                        icon={<TuneIcon fontSize="small" />}
                        label="Net Adjustments"
                        value={`${adjustmentsPositive ? "+" : ""}€${(f.total_adjustments ?? 0).toFixed(2)}`}
                        color={adjustmentsPositive ? "#2e7d32" : "#c62828"}
                        subtitle="Admin balance adjustments"
                        loading={isLoading}
                    />
                    <FinanceBreakdownItem
                        icon={<AccountBalanceWalletIcon fontSize="small" />}
                        label="Balance Held (as of now)"
                        value={`€${(f.total_current_balance ?? 0).toFixed(2)}`}
                        color="primary.main"
                        subtitle="Sum of current credit across all accounts"
                        loading={isLoading}
                    />
                </Stack>
            </AdminSurface>

            {/* ── Chart ── */}
            <AdminSurface title="Pages by Printer" sx={{ p: { xs: 2, sm: 3 } }}>
                {isLoading ? (
                    <Skeleton variant="rectangular" height={chartHeight} />
                ) : printerChartData.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                        No print data available for this period.
                    </Typography>
                ) : (
                    <StatsBarChart
                        data={printerChartData}
                        height={chartHeight}
                        isMobile={isMobile}
                        series={[{ dataKey: "B/W", color: BW_COLOR }, { dataKey: "Color", color: COLOR_COLOR }]}
                        allowDecimals={false}
                    />
                )}
            </AdminSurface>

            {/* ── Printer table ── */}
            <AdminSurface title="Pages per Printer" sx={{ p: { xs: 2, sm: 3 } }}>
                <StatsBreakdownTable
                    nameHeader="Printer"
                    rows={printerRows}
                    isLoading={isLoading}
                    isMobile={isMobile}
                    showRevenue
                />
            </AdminSurface>

            {/* ── User table ── */}
            <AdminSurface title="Pages per User" sx={{ p: { xs: 2, sm: 3 } }}>
                <StatsBreakdownTable
                    nameHeader="Username"
                    rows={userRows}
                    isLoading={isLoading}
                    isMobile={isMobile}
                />
            </AdminSurface>

        </Box>
    );
}
