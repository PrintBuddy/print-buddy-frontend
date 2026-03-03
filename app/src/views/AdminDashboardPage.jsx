import { useState, useMemo } from "react";
import { Box, Paper, Typography, Stack, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "notistack";

import { useAdmin } from "../context/AdminContext";
import PrinterStatusGrid from "../components/adminComponents/PrinterStatusGrid";
import AdminJobsTable from "../components/adminComponents/AdminJobsTable";
import EditPrinterModal from "../components/adminComponents/EditPrinterModal";


export default function AdminDashboardPage() {
    const { printers, printersLoading, allJobs, jobsLoading, refreshAll, updatePrinter, users } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();
    const [editPrinter, setEditPrinter] = useState(null);

    const userById = useMemo(() => {
        const map = {};
        (users ?? []).forEach((u) => { map[u.id] = u; });
        return map;
    }, [users]);

    const handleSavePrinter = async (name, data) => {
        await updatePrinter(name, data);
        enqueueSnackbar("Printer updated successfully.", { variant: "success" });
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight="bold">
                    Admin Dashboard
                </Typography>
                <Button
                    startIcon={<RefreshIcon />}
                    variant="outlined"
                    size="small"
                    onClick={refreshAll}
                >
                    Refresh
                </Button>
            </Stack>

            {/* Printers */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6">Printer Status</Typography>
                <Typography variant="body2" color="text.secondary">
                    Overview of all registered printers and their current configuration.
                </Typography>
                <PrinterStatusGrid
                    printers={printers}
                    isLoading={printersLoading}
                    onEdit={(p) => setEditPrinter(p)}
                />
            </Paper>

            {/* All Print Jobs */}
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6">All Print Jobs</Typography>
                <Typography variant="body2" color="text.secondary">
                    Complete print history across all users.
                </Typography>
                <AdminJobsTable jobs={allJobs} isLoading={jobsLoading} userById={userById} />
            </Paper>

            {/* Edit Printer Modal */}
            <EditPrinterModal
                open={Boolean(editPrinter)}
                onClose={() => setEditPrinter(null)}
                printer={editPrinter}
                onSave={handleSavePrinter}
            />

        </Box>
    );
}
