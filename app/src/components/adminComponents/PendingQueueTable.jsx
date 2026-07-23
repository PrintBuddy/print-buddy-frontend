import {
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

/**
 * Shared responsive table for the Refunds/Recharge/Purchases "pending
 * queue" pattern — extracted because the three original pages were
 * near-identical (same skeleton/empty-state handling, same mobile-collapse
 * behavior, same "click row -> resolve modal" flow), differing only in
 * columns and which action a row exposes.
 */
export default function PendingQueueTable({
    columns,
    data,
    isLoading,
    emptyMessage,
    getRowKey = (row) => row.id,
    getRowSx,
    onRowClick,
    renderMobileRow,
    renderActions,
    mobilePrimaryHeader = "Item",
    mobileTrailingHeader = "Status",
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const skeletonRows = Array.from({ length: 5 });
    const columnCount = isMobile ? 2 : columns.length + (renderActions ? 1 : 0);

    return (
        <TableContainer
            component={Paper}
            elevation={0}
            sx={{
                maxHeight: "calc(80vh - 180px)",
                overflowY: "auto",
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
                bgcolor: "rgba(255,255,255,0.75)"
            }}
        >
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {isMobile ? (
                            <>
                                <TableCell>{mobilePrimaryHeader}</TableCell>
                                <TableCell align="right">{mobileTrailingHeader}</TableCell>
                            </>
                        ) : (
                            <>
                                {columns.map((col) => <TableCell key={col.header}>{col.header}</TableCell>)}
                                {renderActions && <TableCell align="right">Actions</TableCell>}
                            </>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        skeletonRows.map((_, i) => (
                            <TableRow key={i}><TableCell colSpan={columnCount}><Skeleton /></TableCell></TableRow>
                        ))
                    ) : !data?.length ? (
                        <TableRow>
                            <TableCell colSpan={columnCount} align="center">
                                <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((row) => {
                            const key = getRowKey(row);
                            const handleClick = onRowClick ? () => onRowClick(row) : undefined;
                            const rowSx = { ...(onRowClick ? { cursor: "pointer" } : null), ...(getRowSx ? getRowSx(row) : null) };

                            if (isMobile) {
                                const { primary, secondary, trailing } = renderMobileRow(row);
                                return (
                                    <TableRow key={key} hover onClick={handleClick} sx={rowSx}>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">{primary}</Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                noWrap
                                                sx={{ maxWidth: "40vw", display: "block" }}
                                            >
                                                {secondary}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>{trailing}</TableCell>
                                    </TableRow>
                                );
                            }

                            return (
                                <TableRow key={key} hover onClick={handleClick} sx={rowSx}>
                                    {columns.map((col) => (
                                        <TableCell key={col.header}>{col.render(row)}</TableCell>
                                    ))}
                                    {renderActions && (
                                        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                            {renderActions(row)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
