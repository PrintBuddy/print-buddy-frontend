import { 
    Box, Button, Chip, Divider, List, ListItem, ListItemText, Paper, Stack, Typography,
    CircularProgress, useMediaQuery, useTheme
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { usePrinter } from "../../../context/PrinterContext";
import { useFile } from "../../../context/FileContext";
import { usePrint } from "../../../context/PrintContext";
import { useUser } from "../../../context/UserContext";

import { print } from "../../../api/print";
import { calculateTotalCost, countPagesInRange } from "../../printCoreFunctions/calculateCost";

import LoadingTypography from '../../utils/LoadingTypography'
import LoadingList from "../../utils/LoadingList";
import CustomModal from "../../utils/CustomModal";
import { useSnackbar } from "notistack";


export default function StepSend({ onPrev }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const desktopSummaryHeight = 332;

    const { user, isLoading: isLoadingUser } = useUser()
    const { selectedPrinter } = usePrinter();
    const { selectedIds, files, isLoading: isLoadingFiles } = useFile();
    const { printerOptionsByFile } = usePrint();
    const { enqueueSnackbar } = useSnackbar();

    const [ selectedFiles, setSelectedFiles ] = useState([]);
    const [ totalCost, setTotalCost ] = useState(0);
    const [ isPrinting, setIsPrinting ] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        setSelectedFiles(files?.filter(f => selectedIds.includes(f.id)) || [])
        const value = calculateTotalCost(
            files?.filter(f => selectedIds.includes(f.id)) || [],
            printerOptionsByFile, 
            selectedPrinter
        )
        setTotalCost(value);
    }, [files, selectedIds, printerOptionsByFile, selectedPrinter])

    const currentBalance = Math.round(((user?.balance || 0) + Number.EPSILON) * 100) / 100;
    const creditLimit = Math.round(((user?.credit_limit || 0) + Number.EPSILON) * 100) / 100;
    const availableToSpend = Math.round(((currentBalance + creditLimit) + Number.EPSILON) * 100) / 100;
    const hasEnoughCredit = availableToSpend >= totalCost;
    const totalPages = selectedFiles.reduce((sum, file) => {
        const opts = printerOptionsByFile[file.id];
        return sum + countPagesInRange(opts?.pageRanges, file.pages) * (opts?.copies || 1);
    }, 0);
    const remainingBalance = Math.round(((currentBalance - totalCost) + Number.EPSILON) * 100) / 100;

    const handleBack = () => {
        onPrev?.();
    }

    const handlePrint = async () => {
        setIsPrinting(true);

        const printStatus = {};

        for (let i = 0; i < selectedIds.length; i++) {
            const id = selectedIds[i];
            printStatus[id] = {
                status: false,
                message: ""
            }

            try {
                const response = await print(selectedPrinter.name, id, printerOptionsByFile[id]);
                printStatus[id].status = true;

            } catch (err) {
                printStatus[id].message = err.message
            }

        }
        
        const filesMap = Object.fromEntries(selectedFiles.map(obj => [obj.id, obj]));
        setTimeout(() => {
            setIsPrinting(false);

            for (const key in printStatus) {
                const status = printStatus[key].status;
                if (status) {
                    enqueueSnackbar(`File ${filesMap[key].filename} queued`, { variant: "success" })
                } else {
                    enqueueSnackbar(`Could not print ${filesMap[key].filename}. Try again later.`, { variant: "error" })
                }
            }
            
            navigate("/");
        }, 800);
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
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: { xs: 1.1, sm: 1.5 },
                                        borderRadius: 3,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        minWidth: 0,
                                        overflow: "hidden",
                                    }}
                                >
                                    <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center" sx={{ minWidth: 0 }}>
                                        <Box
                                            sx={{
                                                width: { xs: 34, sm: 40 },
                                                height: { xs: 34, sm: 40 },
                                                display: "grid",
                                                placeItems: "center",
                                                borderRadius: 2.5,
                                                backgroundColor: "rgba(25,118,210,0.10)",
                                                color: "primary.main",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <PrintIcon fontSize={isMobile ? "small" : "medium"} />
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="body2" fontWeight={700} noWrap>
                                                {selectedPrinter?.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {selectedPrinter?.location}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        height: 210,
                                        borderRadius: 3,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        minWidth: 0,
                                        overflow: "hidden",
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography variant="body1" fontWeight={700}>
                                                Files
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {`${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"}, ${totalPages} page${totalPages === 1 ? "" : "s"}`}
                                            </Typography>
                                        </Box>
                                        <ReceiptLongOutlinedIcon color="action" sx={{ flexShrink: 0 }} />
                                    </Stack>

                                    <Box sx={{ mt: 0.75, minWidth: 0, flex: 1, minHeight: 0 }}>
                                        {isLoadingFiles ? (
                                            <LoadingList count={selectedIds.length} sx={{ overflowY: "auto", maxHeight: "calc(60vh - 280px)" }} />
                                        ) : selectedFiles.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary">
                                                No files selected
                                            </Typography>
                                        ) : (
                                            <List sx={{ overflowY: "auto", overflowX: "hidden", height: "100%", p: 0, minWidth: 0 }}>
                                                {selectedFiles.map(file => {
                                                    const opts = printerOptionsByFile[file.id];
                                                    const pagesCount = countPagesInRange(opts?.pageRanges, file.pages) * (opts?.copies || 1);
                                                    return (
                                                        <ListItem
                                                            key={file.id}
                                                            disablePadding
                                                            sx={{
                                                                py: 0.75,
                                                                display: "block",
                                                                "&:not(:last-child)": {
                                                                    borderBottom: "1px solid",
                                                                    borderColor: "divider",
                                                                },
                                                            }}
                                                        >
                                                            <ListItemText
                                                                sx={{ minWidth: 0, m: 0 }}
                                                                primary={
                                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontWeight={700}
                                                                            noWrap
                                                                            sx={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}
                                                                        >
                                                                            {file.filename}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                                                                            {pagesCount}p
                                                                        </Typography>
                                                                    </Stack>
                                                                }
                                                                secondary={
                                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.2, display: "block" }}>
                                                                        {opts?.copies || 1} cop{(opts?.copies || 1) === 1 ? "y" : "ies"}
                                                                    </Typography>
                                                                }
                                                            />
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        )}
                                    </Box>
                                </Paper>
                            </Stack>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 1.1, sm: 1.5 },
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: hasEnoughCredit ? "divider" : "error.light",
                                    backgroundColor: hasEnoughCredit ? "background.paper" : "rgba(211,47,47,0.04)",
                                    minWidth: 0,
                                    overflow: "hidden",
                                }}
                            >
                                <Stack spacing={1.1} sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Total
                                            </Typography>
                                            <LoadingTypography
                                                variant="h5"
                                                color={hasEnoughCredit ? "primary" : "error"}
                                                sx={{ fontWeight: 700, lineHeight: 1.05 }}
                                                loadingWidth={90}
                                                isLoading={isLoadingFiles}
                                            >
                                                €{totalCost.toFixed(2)}
                                            </LoadingTypography>
                                        </Box>
                                        <Box
                                            sx={{
                                                width: 34,
                                                height: 34,
                                                display: "grid",
                                                placeItems: "center",
                                                borderRadius: 2.5,
                                                backgroundColor: "rgba(15,23,42,0.06)",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <AccountBalanceWalletOutlinedIcon fontSize="small" />
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ minWidth: 0 }}>
                                        <Chip label={`${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"}`} sx={{ borderRadius: 999, height: 20, "& .MuiChip-label": { px: 1, fontSize: "0.7rem" } }} />
                                        <Chip label={`${totalPages} page${totalPages === 1 ? "" : "s"}`} sx={{ borderRadius: 999, height: 20, "& .MuiChip-label": { px: 1, fontSize: "0.7rem" } }} />
                                    </Stack>

                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                            gap: 1,
                                            minWidth: 0,
                                        }}
                                    >
                                        <Box sx={{ p: 1, borderRadius: 2.5, backgroundColor: "rgba(15,23,42,0.04)", minWidth: 0, overflow: "hidden" }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Balance
                                            </Typography>
                                            <LoadingTypography
                                                variant="body2"
                                                fontWeight={700}
                                                loadingWidth={70}
                                                isLoading={isLoadingUser}
                                            >
                                                €{currentBalance.toFixed(2)}
                                            </LoadingTypography>
                                        </Box>
                                        <Box sx={{ p: 1, borderRadius: 2.5, backgroundColor: "rgba(15,23,42,0.04)", minWidth: 0, overflow: "hidden" }}>
                                            <Typography variant="caption" color="text.secondary">
                                                After
                                            </Typography>
                                            <Typography variant="body2" fontWeight={700} noWrap sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                                €{remainingBalance.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {!hasEnoughCredit && (
                                        <Typography variant="caption" color="error" fontWeight={700}>
                                            Not enough credit.
                                        </Typography>
                                    )}
                                </Stack>
                            </Paper>
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
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    minWidth: 0,
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    overflow: "hidden",
                                    height: `${desktopSummaryHeight}px`,
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography variant="body1" fontWeight={700}>
                                            Files in this print job
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.35 }}>
                                            {`${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} and ${totalPages} printable page${totalPages === 1 ? "" : "s"}.`}
                                        </Typography>
                                    </Box>
                                    <ReceiptLongOutlinedIcon color="action" sx={{ flexShrink: 0 }} />
                                </Stack>

                                <Box sx={{ mt: 0.9, minWidth: 0, flex: 1, minHeight: 0 }}>
                                    {isLoadingFiles ? (
                                        <LoadingList count={selectedIds.length} sx={{ overflowY: "auto", maxHeight: "calc(60vh - 280px)" }} />
                                    ) : selectedFiles.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary">
                                            No files selected
                                        </Typography>
                                    ) : (
                                        <List sx={{ overflowY: "auto", overflowX: "hidden", height: "100%", p: 0, minWidth: 0 }}>
                                            {selectedFiles.map(file => {
                                                const opts = printerOptionsByFile[file.id];
                                                const pagesCount = countPagesInRange(opts?.pageRanges, file.pages) * (opts?.copies || 1);
                                                return (
                                                    <ListItem
                                                        key={file.id}
                                                        disablePadding
                                                        sx={{
                                                            py: 1.15,
                                                            display: "block",
                                                            "&:not(:last-child)": {
                                                                borderBottom: "1px solid",
                                                                borderColor: "divider",
                                                            },
                                                        }}
                                                    >
                                                        <ListItemText
                                                            sx={{ minWidth: 0, m: 0 }}
                                                            primary={
                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight={700}
                                                                    noWrap
                                                                    sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                                                                >
                                                                    {file.filename}
                                                                </Typography>
                                                            }
                                                            secondary={
                                                                <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap" sx={{ mt: 0.65 }}>
                                                                    <Chip size="small" variant="outlined" label={`${pagesCount} page${pagesCount === 1 ? "" : "s"}`} sx={{ borderRadius: 999, height: 22, "& .MuiChip-label": { px: 1, fontSize: "0.72rem" } }} />
                                                                    <Chip size="small" variant="outlined" label={`${opts?.copies || 1} cop${(opts?.copies || 1) === 1 ? "y" : "ies"}`} sx={{ borderRadius: 999, height: 22, "& .MuiChip-label": { px: 1, fontSize: "0.72rem" } }} />
                                                                    <Chip size="small" variant="outlined" label={opts?.colorMode || "B&W"} sx={{ borderRadius: 999, height: 22, "& .MuiChip-label": { px: 1, fontSize: "0.72rem" } }} />
                                                                    <Chip size="small" variant="outlined" label={opts?.sides === "1S" ? "One-sided" : "Two-sided"} sx={{ borderRadius: 999, height: 22, "& .MuiChip-label": { px: 1, fontSize: "0.72rem" } }} />
                                                                </Stack>
                                                            }
                                                        />
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    )}
                                </Box>
                            </Paper>

                            <Stack spacing={2} sx={{ minWidth: 0, height: `${desktopSummaryHeight}px` }}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.35,
                                        minWidth: 0,
                                        height: 96,
                                        borderRadius: 3,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                display: "grid",
                                                placeItems: "center",
                                                borderRadius: 2.25,
                                                backgroundColor: "rgba(25,118,210,0.10)",
                                                color: "primary.main",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <PrintIcon />
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="body1" fontWeight={700} noWrap>
                                                {selectedPrinter?.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {selectedPrinter?.location}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.75,
                                        minWidth: 0,
                                        flex: 1,
                                        minHeight: 0,
                                        borderRadius: 3,
                                        border: "1px solid",
                                        borderColor: hasEnoughCredit ? "divider" : "error.light",
                                        backgroundColor: hasEnoughCredit ? "background.paper" : "rgba(211,47,47,0.04)",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Stack direction="row" spacing={1.25} alignItems="center">
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
                                            <AccountBalanceWalletOutlinedIcon />
                                        </Box>
                                        <Box sx={{ minWidth: 0 }}>
                                            <Typography variant="body1" fontWeight={700}>
                                                Cost summary
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Estimated total before sending the print job.
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Total cost
                                        </Typography>
                                        <LoadingTypography
                                            variant="h4"
                                            color={hasEnoughCredit ? "primary" : "error"}
                                            sx={{ fontWeight: 700, lineHeight: 1.15 }}
                                            loadingWidth={90}
                                            isLoading={isLoadingFiles}
                                        >
                                            €{totalCost.toFixed(2)}
                                        </LoadingTypography>
                                    </Box>

                                    <Stack spacing={0.5}>
                                        <LoadingTypography
                                            color="text.secondary"
                                            variant="body2"
                                            loadingWidth={150}
                                            isLoading={isLoadingUser}
                                        >
                                            {`Current balance: €${currentBalance.toFixed(2)}`}
                                        </LoadingTypography>
                                        <Typography variant="body2" color="text.secondary">
                                            {`Balance after print: €${remainingBalance.toFixed(2)}`}
                                        </Typography>
                                        {!hasEnoughCredit && (
                                            <Typography variant="body2" color="error" fontWeight={600}>
                                                Insufficient credit. Add funds or adjust the print settings to continue.
                                            </Typography>
                                        )}
                                    </Stack>
                                </Paper>
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
                    disabled={!hasEnoughCredit}
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
