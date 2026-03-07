import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
    Card,
    CardContent,
    Paper,
    Skeleton,
    Stack,
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
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import { getStatsOverview } from "../api/stats";


// ─── Constants ────────────────────────────────────────────────────────────────

const BW_COLOR = "#78909c";
const COLOR_COLOR = "#ed6c02";

function shortLabel(label, maxLen = 14) {
    if (!label) return "";
    return label.length > maxLen ? label.slice(0, maxLen - 1) + "…" : label;
}

function shortLabelMobile(label, maxLen = 9) {
    if (!label) return "";
    return label.length > maxLen ? label.slice(0, maxLen - 1) + "…" : label;
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, accentColor, loading, subtitle }) {
    return (
        <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Box
                        sx={{
                            p: { xs: 0.75, sm: 1 },
                            borderRadius: 2,
                            backgroundColor: `${accentColor}22`,
                            color: accentColor,
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        lineHeight={1.3}
                        sx={{ fontSize: { xs: "0.72rem", sm: "0.875rem" } }}
                    >
                        {label}
                    </Typography>
                </Stack>
                {loading ? (
                    <Skeleton width="55%" height={36} />
                ) : (
                    <Typography
                        fontWeight="bold"
                        sx={{ fontSize: { xs: "1.4rem", sm: "1.75rem", md: "2.125rem" } }}
                    >
                        {value}
                    </Typography>
                )}
                {subtitle && (
                    <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: { xs: "none", sm: "block" } }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

function FinanceBreakdownItem({ icon, label, value, color, subtitle, loading }) {
    return (
        <Box
            sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                flex: 1,
                minWidth: 0,
            }}
        >
            <Stack direction="row" alignItems="center" spacing={0.7} mb={0.5}>
                <Box sx={{ color, display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</Box>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" }, lineHeight: 1.3 }}
                >
                    {label}
                </Typography>
            </Stack>
            {loading ? (
                <Skeleton width="65%" height={26} />
            ) : (
                <Typography
                    fontWeight="bold"
                    color={color}
                    sx={{ fontSize: { xs: "1rem", sm: "1.3rem" } }}
                >
                    {value}
                </Typography>
            )}
            {subtitle && (
                <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: { xs: "none", sm: "block" } }}
                >
                    {subtitle}
                </Typography>
            )}
        </Box>
    );
}

function SectionTitle({ children }) {
    return (
        <Typography variant="h6" fontWeight="bold" mb={2} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            {children}
        </Typography>
    );
}

function SkeletonRows({ cols, rows = 4 }) {
    return Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
            {Array.from({ length: cols }).map((_, j) => (
                <TableCell key={j}>
                    <Skeleton />
                </TableCell>
            ))}
        </TableRow>
    ));
}

// Horizontal bar chart used on mobile (readable with long category names)
function ResponsiveBarChart({ data, height, isMobile }) {
    if (isMobile) {
        // Horizontal layout: category on Y axis, values on X axis
        const mobileData = data.map((d) => ({ ...d, name: shortLabelMobile(d.fullName) }));
        const barSize = Math.max(10, Math.min(20, Math.floor(220 / (data.length || 1))));
        return (
            <ResponsiveContainer width="100%" height={Math.max(height, data.length * 44 + 60)}>
                <BarChart
                    data={mobileData}
                    layout="vertical"
                    margin={{ top: 5, right: 16, left: 4, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={72} />
                    <Tooltip
                        formatter={(value, name) => [value.toLocaleString(), name]}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="B/W" fill={BW_COLOR} radius={[0, 3, 3, 0]} barSize={barSize} />
                    <Bar dataKey="Color" fill={COLOR_COLOR} radius={[0, 3, 3, 0]} barSize={barSize} />
                </BarChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                    formatter={(value, name) => [value.toLocaleString(), name]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                />
                <Legend />
                <Bar dataKey="B/W" fill={BW_COLOR} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Color" fill={COLOR_COLOR} radius={[3, 3, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}


function RevenueBarChart({ data, height, isMobile }) {
    const fmtEuro = (v) => `€${v.toFixed(2)}`;
    if (isMobile) {
        const mobileData = data.map((d) => ({ ...d, name: shortLabelMobile(d.fullName) }));
        const barSize = Math.max(10, Math.min(20, Math.floor(220 / (data.length || 1))));
        return (
            <ResponsiveContainer width="100%" height={Math.max(height, data.length * 44 + 60)}>
                <BarChart
                    data={mobileData}
                    layout="vertical"
                    margin={{ top: 5, right: 16, left: 4, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={fmtEuro} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={72} />
                    <Tooltip
                        formatter={(value) => [`€${value.toFixed(2)}`, "Revenue"]}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                    />
                    <Bar dataKey="Revenue" fill="#2e7d32" radius={[0, 3, 3, 0]} barSize={barSize} />
                </BarChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={fmtEuro} />
                <Tooltip
                    formatter={(value) => [`€${value.toFixed(2)}`, "Revenue"]}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName ?? ""}
                />
                <Bar dataKey="Revenue" fill="#2e7d32" radius={[3, 3, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}


// ─── Main page ────────────────────────────────────────────────────────────────

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

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-stats"] });

    const labelFn = isMobile ? shortLabelMobile : shortLabel;

    const printerChartData = (stats?.by_printer ?? []).map((p) => ({
        name: labelFn(p.printer_name),
        fullName: p.printer_name,
        "B/W": p.bw_pages,
        Color: p.color_pages,
    }));

    const printerRevenueChartData = (stats?.by_printer ?? []).map((p) => ({
        name: labelFn(p.printer_name),
        fullName: p.printer_name,
        Revenue: p.total_cost,
    }));

    const topUserChartData = (stats?.by_user ?? []).slice(0, 10).map((u) => ({
        name: labelFn(u.username),
        fullName: u.username,
        "B/W": u.bw_pages,
        Color: u.color_pages,
    }));

    const finance = stats?.finance;
    const f = finance ?? {};
    const adjustmentsPositive = (f.total_adjustments ?? 0) >= 0;

    const computedSum = (f.total_current_balance ?? 0)
        + (f.total_spent_on_print ?? 0)
        - (f.total_refunded ?? 0)
        - (f.total_adjustments ?? 0);
    const discrepancy = Math.abs((f.total_recharged ?? 0) - computedSum) > 0.02;

    const chartHeight = isMobile ? 220 : 260;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}>

            {/* ── Header ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: "1.15rem", sm: "1.5rem" } }}>
                    Statistics
                </Typography>
                <Button startIcon={<RefreshIcon />} variant="outlined" size="small" onClick={refresh}>
                    Refresh
                </Button>
            </Stack>

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
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <SectionTitle>Finance Overview</SectionTitle>

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
            </Paper>

            {/* ── Charts ── */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                    gap: { xs: 2, sm: 3 },
                }}
            >
                {/* Pages by printer */}
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                    <SectionTitle>Pages by Printer</SectionTitle>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={chartHeight} />
                    ) : printerChartData.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                            No print data available.
                        </Typography>
                    ) : (
                        <ResponsiveBarChart
                            data={printerChartData}
                            height={chartHeight}
                            isMobile={isMobile}
                        />
                    )}
                </Paper>

                {/* Top 10 users by pages */}
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                    <SectionTitle>Top 10 Users by Pages</SectionTitle>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={chartHeight} />
                    ) : topUserChartData.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                            No print data available.
                        </Typography>
                    ) : (
                        <ResponsiveBarChart
                            data={topUserChartData}
                            height={chartHeight}
                            isMobile={isMobile}
                        />
                    )}
                </Paper>

                {/* Revenue by printer */}
                <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                    <SectionTitle>Revenue by Printer</SectionTitle>
                    {isLoading ? (
                        <Skeleton variant="rectangular" height={chartHeight} />
                    ) : printerRevenueChartData.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                            No print data available.
                        </Typography>
                    ) : (
                        <RevenueBarChart
                            data={printerRevenueChartData}
                            height={chartHeight}
                            isMobile={isMobile}
                        />
                    )}
                </Paper>
            </Box>

            {/* ── Printer table ── */}
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <SectionTitle>Pages per Printer</SectionTitle>
                <TableContainer sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 300 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Printer</b></TableCell>
                                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                    <b>{isMobile ? "Total" : "Total Pages"}</b>
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                    <b>B/W</b>
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                    <b>{isMobile ? "Color" : "Color Pages"}</b>
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                    <b>Sheets</b>
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                    <b>Revenue</b>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <SkeletonRows cols={6} rows={3} />
                            ) : (stats?.by_printer ?? []).length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Typography color="text.secondary">No data available.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (stats?.by_printer ?? []).map((p) => (
                                    <TableRow key={p.printer_name} hover>
                                        <TableCell sx={{ maxWidth: { xs: 110, sm: "none" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {p.printer_name}
                                        </TableCell>
                                        <TableCell align="right">{p.total_pages.toLocaleString()}</TableCell>
                                        <TableCell align="right">{p.bw_pages.toLocaleString()}</TableCell>
                                        <TableCell align="right">{p.color_pages.toLocaleString()}</TableCell>
                                        <TableCell align="right">{p.total_sheets.toLocaleString()}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: "bold", color: "success.dark" }}>
                                            €{p.total_cost.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* ── User table ── */}
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <SectionTitle>Pages per User</SectionTitle>
                <TableContainer sx={{ overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 300 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Username</b></TableCell>
                                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                    <b>{isMobile ? "Total" : "Total Pages"}</b>
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                    <b>B/W</b>
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                    <b>{isMobile ? "Color" : "Color Pages"}</b>
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                    <b>Sheets</b>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <SkeletonRows cols={5} rows={5} />
                            ) : (stats?.by_user ?? []).length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <Typography color="text.secondary">No data available.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (stats?.by_user ?? []).map((u) => (
                                    <TableRow key={u.user_id} hover>
                                        <TableCell sx={{ maxWidth: { xs: 100, sm: "none" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {u.username}
                                        </TableCell>
                                        <TableCell align="right">{u.total_pages.toLocaleString()}</TableCell>
                                        <TableCell align="right">{u.bw_pages.toLocaleString()}</TableCell>
                                        <TableCell align="right">{u.color_pages.toLocaleString()}</TableCell>
                                        <TableCell align="right">{u.total_sheets.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

        </Box>
    );
}
