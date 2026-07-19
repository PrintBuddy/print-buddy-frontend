import { useState } from "react";
import {
    Box,
    Button,
    Chip,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "notistack";

import { useAdmin } from "../context/AdminContext";
import LogExpenseModal from "../components/adminComponents/LogExpenseModal";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";

const CATEGORY_COLOR = {
    toner: "secondary",
    paper: "primary",
    maintenance: "warning",
    other: "default",
};

export default function AdminExpensesPage() {
    const { expenses, expensesLoading, createExpense, refreshAll } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [modalOpen, setModalOpen] = useState(false);

    const handleSubmit = async (category, amount, description) => {
        await createExpense(category, amount, description);
        enqueueSnackbar("Expense logged.", { variant: "success" });
    };

    const skeletonRows = Array.from({ length: 5 });
    const total = (expenses ?? []).reduce((sum, e) => sum + Number(e.amount), 0);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <AdminPageHero
                title="Expenses"
                description="Operational spend on supplies and maintenance — every entry also appears in the unified transaction timeline as an outflow."
                tags={[`Total logged: €${total.toFixed(2)}`]}
                action={(
                    <Box sx={{ display: "flex", gap: 1, flexDirection: { xs: "column", md: "row" } }}>
                        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setModalOpen(true)}>
                            Log Expense
                        </Button>
                        <Button startIcon={<RefreshIcon />} variant="outlined" onClick={refreshAll}>
                            Refresh
                        </Button>
                    </Box>
                )}
            />

            <AdminSurface title="Expense Log" description="Most recent first.">
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
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Amount (€)</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align="right">Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {expensesLoading ? (
                                skeletonRows.map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={4}><Skeleton /></TableCell></TableRow>
                                ))
                            ) : !expenses?.length ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography variant="body2" color="text.secondary">No expenses logged yet.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                [...expenses]
                                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                                    .map((expense) => (
                                        <TableRow key={expense.id} hover>
                                            <TableCell>
                                                <Chip label={expense.category} color={CATEGORY_COLOR[expense.category] ?? "default"} size="small" />
                                            </TableCell>
                                            <TableCell align="right">{Number(expense.amount).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                                                    {expense.description ?? "—"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="caption">
                                                    {new Date(expense.created_at).toLocaleString()}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </AdminSurface>

            <LogExpenseModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleSubmit} />
        </Box>
    );
}
