import { Button, Box, Stack, Typography, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Tooltip } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';

import { usePrinter } from '../../../context/PrinterContext'
import LoadingList from '../../utils/LoadingList';

const ERROR_REASONS = new Set([
    "media-empty", "toner-empty", "marker-supply-empty-error", "offline-report",
]);
const WARNING_REASONS = new Set([
    "media-low", "toner-low", "marker-supply-empty-warning",
    "marker-supply-low-warning", "marker-supply-low-error", "door-open", "cover-open",
]);

const REASON_LABELS = {
    "media-empty":                 "Out of paper",
    "media-low":                   "Low paper",
    "toner-empty":                 "Out of toner",
    "toner-low":                   "Low toner",
    "marker-supply-empty-warning": "Supply empty",
    "marker-supply-empty-error":   "Supply empty",
    "marker-supply-low-warning":   "Supply low",
    "marker-supply-low-error":     "Supply low",
    "offline-report":              "Offline",
    "door-open":                   "Door open",
    "cover-open":                  "Cover open",
};

function PrinterWarningIcon({ reasons }) {
    if (!reasons?.length) return null;

    const hasError = reasons.some((r) => ERROR_REASONS.has(r));
    const labels = reasons.map((r) => REASON_LABELS[r] ?? r).join(", ");

    if (hasError) {
        return (
            <Tooltip title={labels}>
                <ErrorIcon color="error" fontSize="small" sx={{ mr: 1 }} />
            </Tooltip>
        );
    }
    return (
        <Tooltip title={labels}>
            <WarningAmberIcon color="warning" fontSize="small" sx={{ mr: 1 }} />
        </Tooltip>
    );
}


export default function StepPrinter({ onNext, onPrev }) {
    const { 
        printers, isLoading, 
        selectedPrinter, selectPrinter 
    } = usePrinter();

    const handleNext = () => {
        if (!selectedPrinter) return ;
        onNext?.();
    }

    const handleBack = () => {
        onPrev?.();
    }

    return (
        <Box sx={{ width: "100%" }}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    mb: 2
                }}
            >
                <Box>
                    <Typography variant="h6">
                        Select Printer
                    </Typography>
                    <Typography variant="body1">
                        Click on the printer you want to print on.
                    </Typography>
                </Box>
                
            </Stack>

            <Box
                sx={{
                    maxHeight: "calc(80vh - 200px)",
                    overflowY: "auto",
                    marginBottom: 2
                }}
            >
                {isLoading? (
                    <LoadingList />
                ) : (!printers || printers?.length == 0 ) ? (
                    <List>
                    <ListItem>
                        <ListItemText primary="No printers found." secondary="Check your connection and try again later, or contact support." />
                    </ListItem>
                </List>
                ) : (
                <List>
                    {printers?.map(p => {
                        const hasIssue = p.state_reasons?.length > 0;
                        const hasError = p.state_reasons?.some(r => ERROR_REASONS.has(r));
                        const colorSuffix = p.admits_color ? "B/W & Color" : "B/W only";
                        const secondary = hasIssue
                            ? `${p.location} · ${colorSuffix} · ⚠ ${p.state_reasons.map(r => REASON_LABELS[r] ?? r).join(", ")}`
                            : `${p.location} · ${colorSuffix}`;

                        return (
                        <ListItem key={p.name} disablePadding>
                            <ListItemButton
                                selected={selectedPrinter?.name == p.name}
                                onClick={() => selectPrinter(p)}
                            >

                                <ListItemIcon>
                                    <PrintIcon color={hasError ? "error" : "inherit"} />
                                </ListItemIcon>
                                
                                <ListItemText
                                    primary={p.name}
                                    secondary={secondary}
                                    secondaryTypographyProps={hasError ? { color: "error" } : hasIssue ? { color: "warning.main" } : {}}
                                />

                                <PrinterWarningIcon reasons={p.state_reasons} />

                                {(selectedPrinter?.name == p.name) && (
                                    <CheckCircleIcon
                                        color="primary"
                                        sx={{ position: "absolute", right: 30 }}
                                    />
                                )}

                            </ListItemButton>
                        </ListItem>
                        );
                    })}
                </List>
            )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack} 
                >
                    Back
                </Button>

                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!selectedPrinter}
                    endIcon={<ArrowForwardIcon />}
                >
                    Next
                </Button>
            </Box>

        </Box>
    )
}