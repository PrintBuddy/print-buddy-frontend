import { 
    Box, Button, Chip, Stack, Typography, 
} from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { usePrinter } from "../../../context/PrinterContext"
import { useFile } from "../../../context/FileContext";
import { usePrint } from "../../../context/PrintContext";

import LoadingList from "../../utils/LoadingList";
import FilesPrintOptions from "../FilesPrintOptions";
import { useEffect } from "react";


export default function StepPrintPrefs({ onNext, onPrev }) {
    const { selectedPrinter } = usePrinter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    
    const {
        printerOptionsByFile, setPreferencesByFile, 
        validByFile, setFileValid, initialOptions
    } = usePrint()

    const { files, selectedIds, isLoading } = useFile();

    const selectedFiles = files?.filter(f => selectedIds.includes(f.id)) || [];
    const allValid = selectedFiles.every(f => !validByFile.hasOwnProperty(f.id) || validByFile[f.id]);

    const handleBack = () => {
        onPrev?.();
    }

    const handleNext = () => {
        onNext?.();
    }

    useEffect(() => {
        initialOptions(selectedIds);
    }, [])

    return (
        <Box sx={{ 
            width: "100%"
        }}>
            <Stack spacing={2.5}>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                        Fine-tune the print settings
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Set the print options for each file.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip
                        label={isMobile
                            ? `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"}`
                            : `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} in this job`
                        }
                        color="primary"
                        sx={{ borderRadius: 999, fontWeight: 600 }}
                    />
                    {selectedPrinter && (
                        <Chip
                            variant="outlined"
                            label={isMobile ? selectedPrinter.name : `Printer: ${selectedPrinter.name}`}
                            sx={{
                                borderRadius: 999,
                                maxWidth: { xs: "100%", sm: "none" },
                                "& .MuiChip-label": {
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                },
                            }}
                        />
                    )}
                </Stack>
            </Stack>

            <Box sx={{
                width: '100%',
                pt: 3,
                pb: 1,
                overflow: "hidden",
                }}>

                {isLoading ? (
                    <LoadingList count={3} />
                    ) : (
                    <FilesPrintOptions 
                        files={selectedFiles}
                        optionsByFile={printerOptionsByFile}
                        onChange={setPreferencesByFile}
                        colorDisabled={selectedPrinter?.admits_color}
                        duplexDisabled={!selectedPrinter?.supports_duplex}
                        validByFile={validByFile}
                        setValid={setFileValid}
                    />
                )}

            </Box>

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 1,
                    flexDirection: { xs: "column-reverse", sm: "row" },
                    alignItems: { xs: "stretch", sm: "center" },
                }}
            >
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack} 
                    sx={{ borderRadius: 999, width: { xs: "100%", sm: "auto" } }}
                >
                    Back
                </Button>

                <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={!allValid}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ borderRadius: 999, px: 3, width: { xs: "100%", sm: "auto" } }}
                >
                    Next
                </Button>
            </Box>

        </Box>
    )
} 
