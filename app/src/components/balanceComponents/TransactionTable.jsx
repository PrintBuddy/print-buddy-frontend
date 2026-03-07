import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Typography,
    Paper,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, useMemo } from "react";
import TransactionRow from "./TransactionRow";
import SkeletonRow from "./SkeletonRow";
import TransactionDetailsModal from "./TransactionDetailsModal";


export default function TransactionsTable({ transactions, isLoading }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [selectedTx, setSelectedTx] = useState(null);

    const skeletonRows = Array.from({ length: 5 });

    const sortedTransactions = useMemo(() => {
        return [...(transactions || [])].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
        ).slice({end: 20});
    }, [transactions]);

    return (
        <>
        <TableContainer
            component={Paper}
            sx={{
            mt: 2,
            maxHeight: "calc(70vh - 200px)",
            overflowY: "auto",
            }}
        >
            <Table>
            {!isMobile && (
                <TableHead>
                <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount (€)</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell align="right">Balance after (€)</TableCell>
                    <TableCell align="right">Date</TableCell>
                </TableRow>
                </TableHead>
            )}

            <TableBody>
                {isLoading ? (
                skeletonRows.map((_, i) => <SkeletonRow key={i} isMobile={isMobile} />)
                ) : transactions?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                        No transactions found
                    </Typography>
                    </TableCell>
                </TableRow>
                ) : (
                sortedTransactions?.map((tx) => (
                    <TransactionRow
                    key={tx.id}
                    tx={tx}
                    isMobile={isMobile}
                    onClick={() => setSelectedTx(tx)}
                    />
                ))
                )}
            </TableBody>
            </Table>
        </TableContainer>

        {/* Modal para móviles */}
        <TransactionDetailsModal
            transaction={selectedTx}
            onClose={() => setSelectedTx(null)}
        />
        </>
    );
}
