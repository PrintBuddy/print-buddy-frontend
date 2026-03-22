import { useState, useMemo } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "notistack";

import { useAdmin } from "../context/AdminContext";
import PrinterStatusGrid from "../components/adminComponents/PrinterStatusGrid";
import AdminJobsTable from "../components/adminComponents/AdminJobsTable";
import EditPrinterModal from "../components/adminComponents/EditPrinterModal";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";


export default function AdminDashboardPage() {
    const { printers, printersLoading, allJobs, jobsLoading, refreshAll, updatePrinter, deletePrinter, users } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [editPrinter, setEditPrinter] = useState(null);
    const [confirmDeletePrinter, setConfirmDeletePrinter] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const userById = useMemo(() => {
        const map = {};
        (users ?? []).forEach((u) => { map[u.id] = u; });
        return map;
    }, [users]);

    const handleSavePrinter = async (name, data) => {
        await updatePrinter(name, data);
        enqueueSnackbar("Printer updated successfully.", { variant: "success" });
    };

    const handleDeletePrinter = async () => {
        if (!confirmDeletePrinter) return;
        setDeleteLoading(true);
        try {
            await deletePrinter(confirmDeletePrinter.name);
            enqueueSnackbar(`Printer "${confirmDeletePrinter.name}" deleted.`, { variant: "success" });
            setConfirmDeletePrinter(null);
        } catch (err) {
            const detail = err?.response?.data?.detail;
            enqueueSnackbar(detail ?? "Failed to delete printer.", { variant: "error" });
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <AdminPageHero
                title="Admin Dashboard"
                description="Monitor printers and review the latest print activity from one focused workspace."
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

            <AdminSurface
                title="Printer Status"
                description="Overview of all registered printers, their availability, and their live supply information."
            >
                <PrinterStatusGrid
                    printers={printers}
                    isLoading={printersLoading}
                    onEdit={(p) => setEditPrinter(p)}
                    onDelete={(p) => setConfirmDeletePrinter(p)}
                />
            </AdminSurface>

            <AdminSurface
                title="All Print Jobs"
                description="Complete print history across all users, with quick access to job details."
            >
                <AdminJobsTable jobs={allJobs} isLoading={jobsLoading} userById={userById} />
            </AdminSurface>

            {/* Edit Printer Modal */}
            <EditPrinterModal
                open={Boolean(editPrinter)}
                onClose={() => setEditPrinter(null)}
                printer={editPrinter}
                onSave={handleSavePrinter}
            />

            {/* Delete Printer Confirmation */}
            <Dialog
                open={Boolean(confirmDeletePrinter)}
                onClose={() => setConfirmDeletePrinter(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete printer?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to permanently delete{" "}
                        <strong>{confirmDeletePrinter?.name}</strong>? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeletePrinter(null)} disabled={deleteLoading}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDeletePrinter} disabled={deleteLoading}>
                        {deleteLoading ? "Deleting…" : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
