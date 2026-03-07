import { Box, TableRow, TableCell, Typography } from "@mui/material";


export default function JobRow({ job, isMobile, renderStatusIcon, onClick }) {
    return (
        <TableRow
            hover
            onClick={onClick}
            sx={{ cursor: "pointer" }}
        >
        {isMobile ? (
            <>
            <TableCell width={36} sx={{ pl: 1, pr: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    {renderStatusIcon(job.status)}
                </Box>
            </TableCell>
            <TableCell>
                <Typography variant="body2" fontWeight="medium" noWrap sx={{ maxWidth: "40vw" }}>
                    {job.file_name || "—"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {job.printer_name || "—"}
                </Typography>
            </TableCell>
            <TableCell align="right">
                <Typography variant="caption" color="text.secondary">
                    {job.completed_at
                        ? new Date(job.completed_at).toLocaleDateString()
                        : job.created_at
                        ? new Date(job.created_at).toLocaleDateString()
                        : "—"}
                </Typography>
            </TableCell>
            </>
        ) : (
            <>
            <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {renderStatusIcon(job.status)}
                </Box>
            </TableCell>
            <TableCell sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "10vw" }}>
                {job.file_name || "—"}
            </TableCell>
            <TableCell>{job.printer_name || "—"}</TableCell>
            <TableCell>{job.status.toUpperCase() || "—"}</TableCell>
            <TableCell>
                {job.created_at ? new Date(job.created_at).toLocaleString() : "—"}
            </TableCell>
            <TableCell>
                {job.completed_at ? new Date(job.completed_at).toLocaleString() : "—"}
            </TableCell>
            </>
        )}
        </TableRow>
    );
}