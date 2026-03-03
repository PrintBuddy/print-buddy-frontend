import { useState, useEffect } from "react";
import {
    Button,
    Chip,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    Paper,
    Typography
} from "@mui/material";
import CustomModal from "../utils/CustomModal";
import { getUserTransactions } from "../../api/user";


const TX_COLOR = {
    recharge: "success",
    refund: "info",
    print: "error",
    adjustment: "warning",
};

export default function UserTransactionsModal({ open, onClose, user }) {
    const [txs, setTxs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && user) {
            setLoading(true);
            getUserTransactions(user.id)
                .then(setTxs)
                .catch(() => setTxs([]))
                .finally(() => setLoading(false));
        }
    }, [open, user]);

    const rows = loading
        ? Array.from({ length: 4 }).map((_, i) => (
            <TableRow key={i}>
                <TableCell colSpan={4}><Skeleton /></TableCell>
            </TableRow>
        ))
        : !txs.length
        ? (
            <TableRow>
                <TableCell colSpan={4} align="center">
                    <Typography variant="body2" color="text.secondary">No transactions.</Typography>
                </TableCell>
            </TableRow>
        )
        : txs.map((tx) => (
            <TableRow key={tx.id}>
                <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                <TableCell>
                    <Chip label={tx.type} color={TX_COLOR[tx.type] ?? "default"} size="small" />
                </TableCell>
                <TableCell>
                    <Typography
                        variant="body2"
                        color={tx.amount >= 0 ? "success.main" : "error.main"}
                    >
                        {tx.amount >= 0 ? "+" : ""}€{tx.amount.toFixed(2)}
                    </Typography>
                </TableCell>
                <TableCell><Typography variant="caption">€{tx.balance_after.toFixed(2)}</Typography></TableCell>
            </TableRow>
        ));

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={`Transactions — ${user?.username ?? ""}`}
            maxWidth="md"
            content={
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 1, maxHeight: 400, overflowY: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Balance after</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{rows}</TableBody>
                    </Table>
                </TableContainer>
            }
            actions={<Button onClick={onClose}>Close</Button>}
        />
    );
}
