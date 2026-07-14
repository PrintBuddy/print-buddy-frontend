import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";

import LoadingTypography from "../../utils/LoadingTypography";

export default function CostSummaryCard({
    isMobile,
    hasEnoughCredit,
    allValid,
    totalCost,
    isLoadingFiles,
    isLoadingUser,
    currentBalance,
    remainingBalance,
    selectedFilesCount,
    totalPages,
}) {
    const borderColor = hasEnoughCredit ? "divider" : "error.light";
    const backgroundColor = hasEnoughCredit ? "background.paper" : "rgba(211,47,47,0.04)";

    if (isMobile) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 1.1, sm: 1.5 },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor,
                    backgroundColor,
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
                        <Chip label={`${selectedFilesCount} file${selectedFilesCount === 1 ? "" : "s"}`} sx={{ borderRadius: 999, height: 20, "& .MuiChip-label": { px: 1, fontSize: "0.7rem" } }} />
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
                    {hasEnoughCredit && !allValid && (
                        <Typography variant="caption" color="error" fontWeight={700}>
                            Fix invalid print options before sending.
                        </Typography>
                    )}
                </Stack>
            </Paper>
        );
    }

    return (
        <Paper
            elevation={0}
            sx={{
                p: 1.75,
                minWidth: 0,
                flex: 1,
                minHeight: 0,
                borderRadius: 3,
                border: "1px solid",
                borderColor,
                backgroundColor,
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
                {hasEnoughCredit && !allValid && (
                    <Typography variant="body2" color="error" fontWeight={600}>
                        Fix invalid print options before sending.
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
}
