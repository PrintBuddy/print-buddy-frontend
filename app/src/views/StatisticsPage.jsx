import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
    Card,
    CardContent,
    Paper,
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

import { getUserStats } from "../api/stats";
import { getPrinters } from "../api/printer";


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

function SectionTitle({ children }) {
    return (
        <Typography variant="h6" fontWeight="bold" mb={2} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            {children}
        </Typography>
    );
}

function ResponsivePrinterChart({ data, height, isMobile }) {
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


// ─── Main page ────────────────────────────────────────────────────────────────

export default function StatisticsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const queryClient = useQueryClient();

    const { data: stats, isLoading } = useQuery({
        queryKey: ["user-stats"],
        queryFn: getUserStats,
        retry: false,
        staleTime: 1000 * 60 * 2,
    });

    const { data: allPrinters = [] } = useQuery({
        queryKey: ["printers"],
        queryFn: getPrinters,
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    const refresh = () => queryClient.invalidateQueries({ queryKey: ["user-stats"] });

    const labelFn = isMobile ? shortLabelMobile : shortLabel;

    const statsByPrinterName = Object.fromEntries(
        (stats?.by_printer ?? []).map((p) => [p.printer_name, p])
    );

    const printerChartData = allPrinters.map((p) => {
        const s = statsByPrinterName[p.name];
        return {
            name: labelFn(p.name),
            fullName: p.name,
            "B/W": s?.bw_pages ?? 0,
            Color: s?.color_pages ?? 0,
        };
    });

    const chartHeight = isMobile ? 220 : 260;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, sm: 3 } }}>

            {/* ── Header ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: "1.15rem", sm: "1.5rem" } }}>
                    My Statistics
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

            {/* ── Spending summary ── */}
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <SectionTitle>Spending summary</SectionTitle>
                <Box
                    sx={{
                        p: { xs: 2, sm: 2.5 },
                        borderRadius: 2,
                        backgroundColor: "error.main",
                        color: "white",
                        display: "inline-flex",
                        flexDirection: "column",
                        minWidth: { xs: "100%", sm: 260 },
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <EuroIcon fontSize="small" />
                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                            Total spent on printing (after refunds)
                        </Typography>
                    </Stack>
                    {isLoading ? (
                        <Skeleton width="40%" height={36} sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />
                    ) : (
                        <Typography fontWeight="bold" sx={{ fontSize: { xs: "1.6rem", sm: "2rem" } }}>
                            €{(stats?.total_spent ?? 0).toFixed(2)}
                        </Typography>
                    )}
                    <Typography variant="caption" sx={{ opacity: 0.75 }}>
                        Sum of completed print jobs minus approved refunds
                    </Typography>
                </Box>
            </Paper>

            {/* ── Pages by printer chart ── */}
            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
                <SectionTitle>Pages by Printer</SectionTitle>
                {isLoading ? (
                    <Skeleton variant="rectangular" height={chartHeight} />
                ) : printerChartData.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                        No print data available yet.
                    </Typography>
                ) : (
                    <ResponsivePrinterChart
                        data={printerChartData}
                        height={chartHeight}
                        isMobile={isMobile}
                    />
                )}
            </Paper>

        </Box>
    );
}
