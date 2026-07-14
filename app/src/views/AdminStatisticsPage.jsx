import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
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

import { getStatsOverview } from "../api/stats";
import { getPrinters } from "../api/printer";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";
import StatCard from "../components/adminComponents/StatCard";
import FinanceBreakdownItem from "../components/adminComponents/FinanceBreakdownItem";
import StatsBarChart from "../components/adminComponents/StatsBarChart";
import StatsBreakdownTable from "../components/adminComponents/StatsBreakdownTable";
import useStatisticsData from "../hooks/useStatisticsData";

const BW_COLOR = "#78909c";
const COLOR_COLOR = "#ed6c02";
const euroFormatter = (v) => `€${v.toFixed(2)}`;

export default function AdminStatisticsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const queryClient = useQueryClient();

    const { data: stats, isLoading } = useQuery({
        queryKey: ["admin-stats"],
        queryFn: getStatsOverview,
        retry: false,
        staleTime: 1000 * 60 * 2,
    });

    const { data: allPrinters = [] } = useQuery({
        queryKey: ["printers"],
        queryFn: getPrinters,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-stats"] });

    const {
        printerChartData,
        printerRevenueChartData,
        topUserChartData,
        finance: { f, adjustmentsPositive, discrepancy },
        printerRows,
        userRows,
    } = useStatisticsData(stats, allPrinters, isMobile);

    const chartHeight = isMobile ? 220 : 260;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.75, sm: 2.25 } }}>

            <AdminPageHero
                title="Statistics"
                description="Review printing volume, revenue, and balance metrics in a cleaner analytics workspace."
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
            <AdminSurface title="Finance Overview" sx={{ p: { xs: 2, sm: 3 } }}>

                {/* Total recharged — primary metric */}
                <Box
                    sx={{
                        p: { xs: 2, sm: 2.5 },
                        mb: 2,
                        borderRadius: 2,
                        backgroundColor: "success.main",
                        color: "white",
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <EuroIcon fontSize="small" />
                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                            Total Credit Recharged
                        </Typography>
                    </Stack>
                    {isLoading ? (
                        <Skeleton width="40%" height={36} sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />
                    ) : (
                        <Typography fontWeight="bold" sx={{ fontSize: { xs: "1.6rem", sm: "2rem" } }}>
                            €{(f.total_recharged ?? 0).toFixed(2)}
                        </Typography>
                    )}
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                        Sum of all recharge transactions
                    </Typography>
                </Box>

                {/* Equation label */}
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                        = Current balance + Spent on print − Refunds − Adjustments
                    </Typography>
                    {!isLoading && discrepancy && (
                        <Typography variant="caption" color="warning.main">
                            (rounding or pending transactions may cause a small difference)
                        </Typography>
                    )}
                </Stack>

                {/* Breakdown row */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 1.5, sm: 2 }}
                >
                    <FinanceBreakdownItem
                        icon={<AccountBalanceWalletIcon fontSize="small" />}
                        label="Current balance (all users)"
                        value={`€${(f.total_current_balance ?? 0).toFixed(2)}`}
                        color="primary.main"
                        subtitle="Sum of current credit across all accounts"
                        loading={isLoading}
                    />
                    <FinanceBreakdownItem
                        icon={<PrintIcon fontSize="small" />}
                        label="Spent on print"
                        value={`€${(f.total_spent_on_print ?? 0).toFixed(2)}`}
                        color="#c62828"
                        subtitle="Total cost of completed print jobs"
                        loading={isLoading}
                    />
                    <FinanceBreakdownItem
                        icon={<AssignmentReturnIcon fontSize="small" />}
                        label="Refunds issued"
                        value={`€${(f.total_refunded ?? 0).toFixed(2)}`}
                        color="#0277bd"
                        subtitle="Credit returned to users via refunds"
                        loading={isLoading}
                    />
                    <FinanceBreakdownItem
                        icon={<TuneIcon fontSize="small" />}
                        label="Net adjustments"
                        value={`${adjustmentsPositive ? "+" : ""}€${(f.total_adjustments ?? 0).toFixed(2)}`}
                        color={adjustmentsPositive ? "#2e7d32" : "#c62828"}
                        subtitle="Admin balance adjustments"
                        loading={isLoading}
                    />
                </Stack>
            </AdminSurface>

            {/* ── Charts ── */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                    gap: { xs: 1.75, sm: 2.25 },
                }}
            >
                {/* Pages by printer */}
                <AdminSurface title="Pages by Printer" sx={{ p: { xs: 2, sm: 3 } }}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={chartHeight} />
                    ) : printerChartData.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                            No print data available.
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

                {/* Top 10 users by pages */}
                <AdminSurface title="Top 10 Users by Pages" sx={{ p: { xs: 2, sm: 3 } }}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={chartHeight} />
                    ) : topUserChartData.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                            No print data available.
                        </Typography>
                    ) : (
                        <StatsBarChart
                            data={topUserChartData}
                            height={chartHeight}
                            isMobile={isMobile}
                            series={[{ dataKey: "B/W", color: BW_COLOR }, { dataKey: "Color", color: COLOR_COLOR }]}
                            allowDecimals={false}
                        />
                    )}
                </AdminSurface>

                {/* Revenue by printer */}
                <AdminSurface title="Revenue by Printer" sx={{ p: { xs: 2, sm: 3 } }}>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={chartHeight} />
                    ) : printerRevenueChartData.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                            No print data available.
                        </Typography>
                    ) : (
                        <StatsBarChart
                            data={printerRevenueChartData}
                            height={chartHeight}
                            isMobile={isMobile}
                            series={[{ dataKey: "Revenue", color: "#2e7d32" }]}
                            valueFormatter={euroFormatter}
                            tickFormatter={euroFormatter}
                            showLegend={false}
                            desktopMargin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                        />
                    )}
                </AdminSurface>
            </Box>

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
