import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

import StatsTableSkeletonRows from "./StatsTableSkeletonRows";

// Unifies what used to be two near-identical tables (pages-by-printer,
// pages-by-user) — the only real difference between them is whether a
// Revenue column applies, and which field backs the "name" column.
export default function StatsBreakdownTable({ nameHeader, rows, isLoading, isMobile, showRevenue = false }) {
    const cols = showRevenue ? 6 : 5;

    return (
        <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 300 }}>
                <TableHead>
                    <TableRow>
                        <TableCell><b>{nameHeader}</b></TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                            <b>{isMobile ? "Total" : "Total Pages"}</b>
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                            <b>B/W</b>
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                            <b>{isMobile ? "Color" : "Color Pages"}</b>
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                            <b>Sheets</b>
                        </TableCell>
                        {showRevenue && (
                            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                <b>Revenue</b>
                            </TableCell>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <StatsTableSkeletonRows cols={cols} rows={showRevenue ? 3 : 5} />
                    ) : rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={cols}>
                                <Typography color="text.secondary">No data available.</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row) => (
                            <TableRow key={row.key} hover>
                                <TableCell
                                    sx={{
                                        maxWidth: { xs: showRevenue ? 110 : 100, sm: "none" },
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {row.name}
                                </TableCell>
                                <TableCell align="right">{row.total_pages.toLocaleString()}</TableCell>
                                <TableCell align="right">{row.bw_pages.toLocaleString()}</TableCell>
                                <TableCell align="right">{row.color_pages.toLocaleString()}</TableCell>
                                <TableCell align="right">{row.total_sheets.toLocaleString()}</TableCell>
                                {showRevenue && (
                                    <TableCell align="right" sx={{ fontWeight: "bold", color: "success.dark" }}>
                                        €{row.total_cost.toFixed(2)}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
