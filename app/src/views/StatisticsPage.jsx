import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Box,
    Button,
    Chip,
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

import { getUserStats } from "../api/stats";
import { getPrinters } from "../api/printer";
import UserPageHero from "../components/userViewComponents/UserPageHero";
import UserSurface from "../components/userViewComponents/UserSurface";
import PeriodFilter from "../components/utils/PeriodFilter";
import StatCard from "../components/adminComponents/StatCard";
import StatsBarChart from "../components/adminComponents/StatsBarChart";

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

export default function StatisticsPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const queryClient = useQueryClient();
    const [range, setRange] = useState({ start: null, end: null });

    const queryKey = (range.start || range.end)
        ? ["user-stats", range.start, range.end]
        : ["user-stats"];

    const { data: stats, isLoading } = useQuery({
        queryKey,
        queryFn: () => getUserStats(range),
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

    const printersWithCost = (stats?.by_printer ?? []).filter((p) => p.total_cost > 0);

    const chartHeight = isMobile ? 220 : 260;

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.75, sm: 2.25 } }}>
            <UserPageHero
                title="My Statistics"
                description="See how much you print, how your pages are split between color and black and white, and where your usage goes."
                action={(
                    <Button startIcon={<RefreshIcon />} variant="contained" color="primary" size="medium" onClick={refresh} sx={{ width: { xs: "100%", md: "auto" } }}>
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
            <Typography variant="caption" color="text.secondary">
                "Pages" counts each printed side; "Sheets" counts physical paper — a 2-sided job uses half as many sheets as pages.
            </Typography>

            {/* ── Spending summary ── */}
            <UserSurface title="Spending Summary" sx={{ p: { xs: 2, sm: 3 } }}>
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
                            Spent on printing this period (after refunds)
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
                        Sum of completed print jobs minus approved refunds, for the selected window
                    </Typography>
                </Box>
            </UserSurface>

            <UserSurface title="Pages by Printer" sx={{ p: { xs: 2, sm: 3 } }}>
                {isLoading ? (
                    <Skeleton variant="rectangular" height={chartHeight} />
                ) : printerChartData.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                        No print data available for this period.
                    </Typography>
                ) : (
                    <>
                        <StatsBarChart
                            data={printerChartData}
                            height={chartHeight}
                            isMobile={isMobile}
                            series={[{ dataKey: "B/W", color: BW_COLOR }, { dataKey: "Color", color: COLOR_COLOR }]}
                            allowDecimals={false}
                        />
                        {printersWithCost.length > 0 && (
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                                {printersWithCost.map((p) => (
                                    <Chip
                                        key={p.printer_name}
                                        label={`${p.printer_name}: €${p.total_cost.toFixed(2)}`}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                    />
                                ))}
                            </Stack>
                        )}
                    </>
                )}
            </UserSurface>

        </Box>
    );
}
