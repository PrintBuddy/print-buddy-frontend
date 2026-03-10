import { Button, Box, Stack, Typography, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { usePrinter } from '../../../context/PrinterContext'
import LoadingList from '../../utils/LoadingList';


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
                        const colorSuffix = p.admits_color ? "B/W & Color" : "B/W only";
                        const duplexSuffix = p.supports_duplex ? "Duplex" : "No duplex";
                        const secondary = `${p.location} · ${colorSuffix} · ${duplexSuffix}`;

                        return (
                        <ListItem key={p.name} disablePadding>
                            <ListItemButton
                                selected={selectedPrinter?.name == p.name}
                                onClick={() => selectPrinter(p)}
                            >

                                <ListItemIcon>
                                    <PrintIcon />
                                </ListItemIcon>
                                
                                <ListItemText
                                    primary={p.name}
                                    secondary={secondary}
                                />

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