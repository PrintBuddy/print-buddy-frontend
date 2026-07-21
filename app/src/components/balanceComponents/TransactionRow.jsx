import { TableRow, TableCell, Box, Typography } from "@mui/material";
import { getIconForType, getLabelForType } from "./transactionDisplay";

export default function TransactionRow({ tx, isMobile, onClick }) {
    return (
        <TableRow
        hover
        onClick={onClick}
        sx={{ cursor: "pointer" }}
        >
        {isMobile ? (
            <>
            <TableCell width={50}>
                <Box sx={{ display: "flex", alignItems: "center"}}>
                {getIconForType(tx.type)}
                </Box>
            </TableCell>
            <TableCell>{getLabelForType(tx.type)}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
                <Typography
                color={tx.amount > 0 ? "success.main" : "error.main"}
                fontWeight={600}
                >
                {tx.amount > 0 ? "+" : ""}
                {tx.amount.toFixed(2)}
                </Typography>
            </TableCell>
            </>
        ) : (
            <>
            <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {getIconForType(tx.type)}
                {getLabelForType(tx.type)}
                </Box>
            </TableCell>
            <TableCell  sx={{ fontWeight: 600 }}>
                <Typography
                color={tx.amount > 0 ? "success.main" : "error.main"}
                fontWeight={600}
                >
                {tx.amount > 0 ? "+" : ""}
                {tx.amount.toFixed(2)}
                </Typography>
            </TableCell>
            <TableCell sx={{ maxWidth: "20vw", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {tx.note || "-"}
            </TableCell>
            <TableCell align="right">
                <Typography color="primary.main">
                    <strong>{tx.balance_after.toFixed(2)}</strong>
                </Typography>
            </TableCell>
            <TableCell align="right">
                {tx.created_at ? new Date(tx.created_at).toLocaleString() : "—"}
            </TableCell>
            </>
        )}
        </TableRow>
    );
}
