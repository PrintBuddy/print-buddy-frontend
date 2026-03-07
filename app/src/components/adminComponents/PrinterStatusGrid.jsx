import {
    Box,
    Card,
    CardContent,
    Chip,
    Grid,
    IconButton,
    Skeleton,
    Tooltip,
    Typography,
    Divider
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import SettingsIcon from "@mui/icons-material/Settings";


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

function PrinterCard({ printer, onEdit }) {
    const statusColor = STATUS_COLOR[printer.status] ?? "default";
    const statusLabel = printer.status ?? "unknown";

    return (
        <Card variant="outlined">
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box display="flex" gap={1} alignItems="center">
                        <PrintIcon color="action" />
                        <Typography variant="subtitle1" fontWeight="bold">
                            {printer.name}
                        </Typography>
                    </Box>
                    <Box display="flex" gap={0.5} alignItems="center">
                        <Chip label={statusLabel} color={statusColor} size="small" />
                        {onEdit && (
                            <Tooltip title="Edit prices">
                                <IconButton size="small" onClick={() => onEdit(printer)}>
                                    <SettingsIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
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
                <ReasonChips reasons={printer.state_reasons} />
            </CardContent>
        </Card>
    );
}


export default function PrinterStatusGrid({ printers, isLoading, onEdit }) {
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
                    <PrinterCard printer={printer} onEdit={onEdit} />
                </Grid>
            ))}
        </Grid>
    );
}
