import { Box, Chip, List, ListItem, ListItemText, Paper, Stack, Typography } from "@mui/material";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";

import { countPagesInRange } from "../../printCoreFunctions/calculateCost";
import LoadingList from "../../utils/LoadingList";

export default function FilesListCard({
    isMobile,
    height,
    selectedFiles,
    isLoadingFiles,
    selectedIds,
    printerOptionsByFile,
    totalPages,
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: isMobile ? { xs: 1.1, sm: 1.5 } : 1.5,
                height,
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
                    <Typography variant={isMobile ? "body1" : "body1"} fontWeight={700}>
                        {isMobile ? "Files" : "Files in this print job"}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={
                            isMobile
                                ? { display: "block", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }
                                : { display: "block", lineHeight: 1.35 }
                        }
                    >
                        {isMobile
                            ? `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"}, ${totalPages} page${totalPages === 1 ? "" : "s"}`
                            : `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} and ${totalPages} printable page${totalPages === 1 ? "" : "s"}.`}
                    </Typography>
                </Box>
                <ReceiptLongOutlinedIcon color="action" sx={{ flexShrink: 0 }} />
            </Stack>

            <Box sx={{ mt: isMobile ? 0.75 : 0.9, minWidth: 0, flex: 1, minHeight: 0 }}>
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
                                        py: isMobile ? 0.75 : 1.15,
                                        display: "block",
                                        "&:not(:last-child)": {
                                            borderBottom: "1px solid",
                                            borderColor: "divider",
                                        },
                                    }}
                                >
                                    {isMobile ? (
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
                                    ) : (
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
                                    )}
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </Box>
        </Paper>
    );
}
