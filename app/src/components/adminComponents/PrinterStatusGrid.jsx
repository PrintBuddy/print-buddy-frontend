import {
    Box,
    Card,
    CardContent,
    Chip,
    Collapse,
    Grid,
    IconButton,
    LinearProgress,
    Skeleton,
    Tooltip,
    Typography,
    Divider
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getTonerLevels } from "../../api/printer";


const STATUS_COLOR = {
    idle: "success",
    printing: "info",
    stopped: "error",
};

// Maps CUPS printer-state-reasons strings to a human-readable label and MUI chip color.
// Severity "error" = red chip, "warning" = orange chip.
const REASON_MAP = {
    "media-empty":                   { label: "Out of paper",  color: "error" },
    "media-low":                     { label: "Low paper",     color: "warning" },
    "toner-empty":                   { label: "Out of toner",  color: "error" },
    "toner-low":                     { label: "Low toner",     color: "warning" },
    "marker-supply-empty-warning":   { label: "Supply empty",  color: "warning" },
    "marker-supply-empty-error":     { label: "Supply empty",  color: "error" },
    "marker-supply-low-warning":     { label: "Supply low",    color: "warning" },
    "marker-supply-low-error":       { label: "Supply low",    color: "error" },
    "offline-report":                { label: "Offline",       color: "error" },
    "door-open":                     { label: "Door open",     color: "warning" },
    "cover-open":                    { label: "Cover open",    color: "warning" },
};

function ReasonChips({ reasons }) {
    if (!reasons?.length) return null;
    return (
        <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
            {reasons.map((reason) => {
                const mapped = REASON_MAP[reason];
                return (
                    <Chip
                        key={reason}
                        label={mapped?.label ?? reason}
                        color={mapped?.color ?? "default"}
                        size="small"
                        variant="outlined"
                    />
                );
            })}
        </Box>
    );
}

function TonerBar({ name, color, level, lowLevel }) {
    const isUnknown = level === -1;
    const isLow = !isUnknown && level < lowLevel;
    const barColor = isLow ? undefined : (color ?? "#888888");

    return (
        <Box sx={{ mb: 0.75 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.25}>
                <Typography variant="caption" color={isLow ? "error" : "text.secondary"} fontWeight={isLow ? "bold" : "normal"}>
                    {name}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                    {isLow && <WarningAmberIcon color="error" sx={{ fontSize: 13 }} />}
                    <Typography variant="caption" color={isLow ? "error" : "text.secondary"}>
                        {isUnknown ? "N/A" : `${level}%`}
                    </Typography>
                </Box>
            </Box>
            <LinearProgress
                variant="determinate"
                value={isUnknown ? 0 : level}
                sx={{
                    height: 6,
                    borderRadius: 1,
                    backgroundColor: "grey.200",
                    "& .MuiLinearProgress-bar": {
                        backgroundColor: isLow ? "error.main" : barColor,
                    },
                }}
            />
        </Box>
    );
}

const INK_TONER_TYPES = new Set(["toner", "ink"]);

function TonerSection({ printerName }) {
    const [othersOpen, setOthersOpen] = useState(false);

    const { data: markers, isLoading, isError } = useQuery({
        queryKey: ["toner", printerName],
        queryFn: () => getTonerLevels(printerName),
        staleTime: 1000 * 30,
        retry: false,
    });

    const hasData = !isError && markers?.length > 0;

    const tonerMarkers = hasData
        ? markers.filter((m) => INK_TONER_TYPES.has(m.marker_type?.toLowerCase()))
        : [];

    // "others" = non-toner/ink markers that have a name
    const otherMarkers = hasData
        ? markers.filter((m) => !INK_TONER_TYPES.has(m.marker_type?.toLowerCase()) && m.name)
        : [];

    return (
        <Box mt={1.5}>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" letterSpacing={0.5}>
                Ink / Toner
            </Typography>
            {isLoading ? (
                <Skeleton variant="rounded" height={40} sx={{ mt: 0.75 }} />
            ) : tonerMarkers.length > 0 ? (
                <Box mt={0.75}>
                    {tonerMarkers.map((t) => (
                        <TonerBar
                            key={t.name}
                            name={t.name}
                            color={t.color}
                            level={t.level}
                            lowLevel={t.low_level}
                        />
                    ))}
                </Box>
            ) : (
                <Typography variant="caption" color="text.disabled" fontStyle="italic" display="block" mt={0.5}>
                    No ink/toner data reported by this printer.
                </Typography>
            )}

            {otherMarkers.length > 0 && (
                <Box mt={1}>
                    <Box
                        display="flex"
                        alignItems="center"
                        gap={0.5}
                        sx={{ cursor: "pointer", userSelect: "none" }}
                        onClick={() => setOthersOpen((v) => !v)}
                    >
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" letterSpacing={0.5}>
                            Other Supplies
                        </Typography>
                        {othersOpen ? (
                            <ExpandLessIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        ) : (
                            <ExpandMoreIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        )}
                    </Box>
                    <Collapse in={othersOpen}>
                        <Box mt={0.75}>
                            {otherMarkers.map((t) => (
                                <TonerBar
                                    key={t.name}
                                    name={t.name}
                                    color={t.color}
                                    level={t.level}
                                    lowLevel={t.low_level}
                                />
                            ))}
                        </Box>
                    </Collapse>
                </Box>
            )}
        </Box>
    );
}

function PrinterCard({ printer, onEdit, onDelete }) {
    const statusColor = STATUS_COLOR[printer.status] ?? "default";
    const statusLabel = printer.status ?? "unknown";

    return (
        <Card variant="outlined" sx={{ opacity: printer.is_active ? 1 : 0.6 }}>
            <CardContent>
                <Box>
                    <Box display="flex" alignItems="center" minWidth={0} justifyContent="space-between">
                        <Box display="flex" gap={1} alignItems="center" minWidth={0}>
                            <PrintIcon color={printer.is_active ? "action" : "disabled"} sx={{ flexShrink: 0 }} />
                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                {printer.name}
                            </Typography>
                        </Box>
                        <Box display="flex" gap={0.5} alignItems="center">
                            {onEdit && (
                                <Tooltip title="Edit printer">
                                    <IconButton size="small" onClick={() => onEdit(printer)}>
                                        <SettingsIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {onDelete && (
                                <Tooltip title="Delete printer">
                                    <IconButton size="small" color="error" onClick={() => onDelete(printer)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={0.5} alignItems="center" sx={{ mt: 1 }}>
                        {!printer.is_active && (
                            <Chip label="Inactive" color="default" size="small" sx={{ fontSize: '0.72rem', height: 22, px: 0.7 }} />
                        )}
                        {printer.is_restricted && (
                            <Chip label="Restricted" color="warning" size="small" sx={{ fontSize: '0.72rem', height: 22, px: 0.7 }} />
                        )}
                        <Chip label={statusLabel} color={statusColor} size="small" sx={{ fontSize: '0.72rem', height: 22, px: 0.7 }} />
                    </Box>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Typography variant="body2" color="text.secondary">
                    Location: {printer.location ?? "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    B&W: €{printer.price_per_page_bw?.toFixed(3)} / page
                </Typography>
                {printer.admits_color && (
                    <Typography variant="body2" color="text.secondary">
                        Color: €{printer.price_per_page_color?.toFixed(3)} / page
                    </Typography>
                )}
                {!printer.admits_color && (
                    <Typography variant="body2" color="text.disabled" fontStyle="italic">
                        No color support
                    </Typography>
                )}
                <Typography variant="body2" color={printer.supports_duplex ? "text.secondary" : "text.disabled"} fontStyle={printer.supports_duplex ? "normal" : "italic"}>
                    {printer.supports_duplex ? "Duplex (2-sided) supported" : "No duplex support"}
                </Typography>
                <ReasonChips reasons={printer.state_reasons} />
                <TonerSection printerName={printer.name} />
            </CardContent>
        </Card>
    );
}


export default function PrinterStatusGrid({ printers, isLoading, onEdit, onDelete }) {
    if (isLoading) {
        return (
            <Grid container spacing={2} sx={{ mt: 1 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <Skeleton variant="rounded" height={120} />
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (!printers?.length) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No printers found.
            </Typography>
        );
    }

    return (
        <Grid container spacing={2} sx={{ mt: 1 }}>
            {printers.map((printer) => (
                <Grid key={printer.id ?? printer.name} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <PrinterCard printer={printer} onEdit={onEdit} onDelete={onDelete} />
                </Grid>
            ))}
        </Grid>
    );
}
