import { Button, Box, Chip, List, ListItem, ListItemButton, Paper, Stack, Typography } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { usePrinter } from '../../../context/PrinterContext'
import LoadingList from '../../utils/LoadingList';


export default function StepPrinter({ onNext, onPrev }) {
    const { 
        printers, isLoading, 
        selectedPrinter, selectPrinter, resetState
    } = usePrinter();

    const handleNext = () => {
        if (!selectedPrinter) return ;
        onNext?.();
    }

    const handleBack = () => {
        onPrev?.();
    }

    const handleSelectPrinter = (printer) => {
        if (selectedPrinter?.name === printer.name) {
            resetState();
            return;
        }

        selectPrinter(printer);
    }

    return (
        <Box sx={{ width: "100%" }}>
            <Stack spacing={3}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                        Pick a printer
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Choose where to send this print job.
                    </Typography>
                </Box>
            </Stack>

            <Box
                sx={{
                    mt: 3,
                    maxHeight: "calc(80vh - 250px)",
                    overflowY: "auto",
                    mb: 3,
                }}
            >
                {isLoading? (
                    <LoadingList />
                ) : (!printers || printers?.length == 0 ) ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            textAlign: "center",
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Typography variant="subtitle1" fontWeight={700}>
                            No printers found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Check your connection and try again later, or contact support.
                        </Typography>
                    </Paper>
                ) : (
                <List sx={{ display: "flex", flexDirection: "column", gap: 1.25, p: 0.5 }}>
                    {printers?.map(p => {
                        const colorSuffix = p.admits_color ? "B/W & Color" : "B/W only";
                        const duplexSuffix = p.supports_duplex ? "Duplex" : "No duplex";
                        const isSelected = selectedPrinter?.name == p.name;

                        return (
                        <ListItem key={p.name} disablePadding sx={{ display: "block" }}>
                            <ListItemButton
                                onClick={() => handleSelectPrinter(p)}
                                selected={isSelected}
                                sx={{
                                    px: 2,
                                    py: 1.5,
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: isSelected ? "primary.main" : "divider",
                                    backgroundColor: isSelected ? "rgba(25,118,210,0.06)" : "background.paper",
                                    transition: "all 0.18s ease",
                                    "&:hover": {
                                        borderColor: "primary.main",
                                        backgroundColor: "rgba(25,118,210,0.05)",
                                    },
                                }}
                            >
                                <Stack sx={{ width: "100%" }} spacing={1}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    display: "grid",
                                                    placeItems: "center",
                                                    borderRadius: 2.5,
                                                    backgroundColor: "rgba(15,23,42,0.06)",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <PrintIcon />
                                            </Box>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography variant="body1" fontWeight={700} noWrap>
                                                    {p.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    {p.location}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        {isSelected && <CheckCircleIcon color="primary" sx={{ flexShrink: 0 }} />}
                                    </Stack>

                                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                                        <Chip size="small" label={colorSuffix} sx={{ borderRadius: 999 }} />
                                        <Chip size="small" label={duplexSuffix} sx={{ borderRadius: 999 }} />
                                    </Stack>
                                </Stack>
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
                    sx={{ borderRadius: 999 }}
                >
                    Back
                </Button>

                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!selectedPrinter}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ borderRadius: 999, px: 3 }}
                >
                    Next
                </Button>
            </Box>

        </Box>
    )
}
