import {
    Box, Button, Stack, Typography,
    CircularProgress, useMediaQuery, useTheme
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";

import { usePrinter } from "../../../context/PrinterContext";
import { useFile } from "../../../context/FileContext";
import { usePrint } from "../../../context/PrintContext";
import { useUser } from "../../../context/UserContext";

import usePrintSummary from "../../../hooks/usePrintSummary";
import useSubmitPrint from "../../../hooks/useSubmitPrint";

import CustomModal from "../../utils/CustomModal";
import PrinterInfoCard from "./PrinterInfoCard";
import FilesListCard from "./FilesListCard";
import CostSummaryCard from "./CostSummaryCard";


export default function StepSend({ onPrev }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const desktopSummaryHeight = 332;

    const { user, isLoading: isLoadingUser } = useUser()
    const { selectedPrinter } = usePrinter();
    const { selectedIds, files, isLoading: isLoadingFiles } = useFile();
    const { printerOptionsByFile, validByFile } = usePrint();

    const { selectedFiles, totalCost, totalPages } = usePrintSummary(
        files, selectedIds, printerOptionsByFile, selectedPrinter
    );
    const { isPrinting, handlePrint } = useSubmitPrint({
        selectedIds, selectedPrinter, printerOptionsByFile, selectedFiles
    });

    const currentBalance = Math.round(((user?.balance || 0) + Number.EPSILON) * 100) / 100;
    const creditLimit = Math.round(((user?.credit_limit || 0) + Number.EPSILON) * 100) / 100;
    const availableToSpend = Math.round(((currentBalance + creditLimit) + Number.EPSILON) * 100) / 100;
    const hasEnoughCredit = availableToSpend >= totalCost;
    const allValid = selectedFiles.every(f => !Object.prototype.hasOwnProperty.call(validByFile, f.id) || validByFile[f.id]);
    const remainingBalance = Math.round(((currentBalance - totalCost) + Number.EPSILON) * 100) / 100;

    const handleBack = () => {
        onPrev?.();
    }

    return (
        <Box sx={{ width: "100%" }}>
            <Stack spacing={1.5}>
                <Box>
                    <Typography variant="body1" fontWeight={700}>
                        Summary
                    </Typography>
                </Box>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.45fr) minmax(300px, 0.9fr)" },
                        gap: 2,
                        alignItems: "stretch",
                        minWidth: 0,
                    }}
                >
                    {isMobile ? (
                        <>
                            <Stack spacing={2} sx={{ minWidth: 0 }}>
                                <PrinterInfoCard printer={selectedPrinter} isMobile />
                                <FilesListCard
                                    isMobile
                                    height={210}
                                    selectedFiles={selectedFiles}
                                    isLoadingFiles={isLoadingFiles}
                                    selectedIds={selectedIds}
                                    printerOptionsByFile={printerOptionsByFile}
                                    totalPages={totalPages}
                                />
                            </Stack>

                            <CostSummaryCard
                                isMobile
                                hasEnoughCredit={hasEnoughCredit}
                                allValid={allValid}
                                totalCost={totalCost}
                                isLoadingFiles={isLoadingFiles}
                                isLoadingUser={isLoadingUser}
                                currentBalance={currentBalance}
                                remainingBalance={remainingBalance}
                                selectedFilesCount={selectedFiles.length}
                                totalPages={totalPages}
                            />
                        </>
                    ) : (
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "minmax(0, 1.45fr) minmax(300px, 0.95fr)",
                                gap: 2,
                                gridColumn: "1 / -1",
                                minWidth: 0,
                                alignItems: "stretch",
                            }}
                        >
                            <FilesListCard
                                isMobile={false}
                                height={`${desktopSummaryHeight}px`}
                                selectedFiles={selectedFiles}
                                isLoadingFiles={isLoadingFiles}
                                selectedIds={selectedIds}
                                printerOptionsByFile={printerOptionsByFile}
                                totalPages={totalPages}
                            />

                            <Stack spacing={2} sx={{ minWidth: 0, height: `${desktopSummaryHeight}px` }}>
                                <PrinterInfoCard printer={selectedPrinter} isMobile={false} />
                                <CostSummaryCard
                                    isMobile={false}
                                    hasEnoughCredit={hasEnoughCredit}
                                    allValid={allValid}
                                    totalCost={totalCost}
                                    isLoadingFiles={isLoadingFiles}
                                    isLoadingUser={isLoadingUser}
                                    currentBalance={currentBalance}
                                    remainingBalance={remainingBalance}
                                    selectedFilesCount={selectedFiles.length}
                                    totalPages={totalPages}
                                />
                            </Stack>
                        </Box>
                    )}
                </Box>
            </Stack>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                    sx={{ borderRadius: 999 }}
                >
                    Back
                </Button>

                <Button
                    variant="contained"
                    onClick={handlePrint}
                    startIcon={<PrintIcon />}
                    disabled={!hasEnoughCredit || !allValid}
                    sx={{ borderRadius: 999, px: 3 }}
                >
                    Send
                </Button>
            </Box>

            <CustomModal
                open={isPrinting}
                onClose={() => {}}
                title=""
                content={
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 2 }}>
                        <CircularProgress />
                        <Typography variant="body1">Printing, please wait...</Typography>
                    </Box>
                }
                actions={<></>} // Sin botones, bloquea hasta que termine la impresión
                maxWidth="xs"
            />
        </Box>
    )
}
