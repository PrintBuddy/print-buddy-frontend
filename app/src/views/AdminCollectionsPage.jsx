import { useState } from "react";
import {
    Box,
    Button,
    IconButton,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "notistack";

import { useAdmin } from "../context/AdminContext";
import ConfirmCollectDialog from "../components/adminComponents/ConfirmCollectDialog";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";

export default function AdminCollectionsPage() {
    const {
        outstandingFloats,
        outstandingFloatsLoading,
        collectionHistory,
        collectionHistoryLoading,
        collectFromAdmin,
        refreshAll,
    } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [collectTarget, setCollectTarget] = useState(null);

    const handleCollect = async () => {
        try {
            await collectFromAdmin(collectTarget.admin_id);
            enqueueSnackbar(`Collected €${Number(collectTarget.outstanding_amount).toFixed(2)} from ${collectTarget.username}.`, { variant: "success" });
        } catch (err) {
            enqueueSnackbar(err?.response?.data?.detail ?? "Failed to collect.", { variant: "error" });
        } finally {
            setCollectTarget(null);
        }
    };

    const skeletonRows = Array.from({ length: 3 });

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <AdminPageHero
                title="Cash Reconciliation"
                description="Every admin currently holding cash or transfer recharges they haven't handed over yet. Collecting sweeps all of an admin's outstanding recharges into one settlement record."
                action={(
                    <Button
                        startIcon={<RefreshIcon />}
                        variant="contained"
                        size="medium"
                        onClick={refreshAll}
                        color="primary"
                        sx={{ width: { xs: "100%", md: "auto" } }}
                    >
                        Refresh
                    </Button>
                )}
            />

            <AdminSurface title="Outstanding Float" description="Money each admin is currently holding, not yet handed over.">
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        maxHeight: "calc(50vh - 120px)",
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
                                <TableCell>Admin</TableCell>
                                <TableCell align="right">Outstanding (€)</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {outstandingFloatsLoading ? (
                                skeletonRows.map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={3}><Skeleton /></TableCell></TableRow>
                                ))
                            ) : !outstandingFloats?.length ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No admin currently holds an uncollected recharge.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                outstandingFloats.map((admin) => (
                                    <TableRow key={admin.admin_id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {admin.name} {admin.surname}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">@{admin.username}</Typography>
                                        </TableCell>
                                        <TableCell align="right">{Number(admin.outstanding_amount).toFixed(2)}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Mark as collected">
                                                <IconButton size="small" onClick={() => setCollectTarget(admin)} aria-label="Collect">
                                                    <PriceCheckIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </AdminSurface>

            <AdminSurface title="Collection History" description="Past settlements, most recent first.">
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        maxHeight: "calc(50vh - 120px)",
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
                                <TableCell>Admin</TableCell>
                                <TableCell>Collected by</TableCell>
                                <TableCell align="right">Amount (€)</TableCell>
                                <TableCell align="right">Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {collectionHistoryLoading ? (
                                skeletonRows.map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={4}><Skeleton /></TableCell></TableRow>
                                ))
                            ) : !collectionHistory?.length ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No collections recorded yet.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                collectionHistory.map((event) => (
                                    <TableRow key={event.id} hover>
                                        <TableCell>@{event.standard_admin_username ?? "—"}</TableCell>
                                        <TableCell>@{event.super_admin_username ?? "—"}</TableCell>
                                        <TableCell align="right">{Number(event.amount_collected).toFixed(2)}</TableCell>
                                        <TableCell align="right">
                                            <Typography variant="caption">
                                                {new Date(event.created_at).toLocaleString()}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </AdminSurface>

            <ConfirmCollectDialog
                admin={collectTarget}
                onClose={() => setCollectTarget(null)}
                onConfirm={handleCollect}
            />
        </Box>
    );
}
