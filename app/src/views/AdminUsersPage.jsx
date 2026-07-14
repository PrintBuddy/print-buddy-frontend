import { useState } from "react";
import { Box, Button, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useSnackbar } from "notistack";

import { useAdmin } from "../context/AdminContext";
import EditUserModal from "../components/adminComponents/EditUserModal";
import RechargeModal from "../components/adminComponents/RechargeModal";
import UserTransactionsModal from "../components/adminComponents/UserTransactionsModal";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";
import UsersTable from "../components/adminComponents/UsersTable";
import ConfirmDeleteUserDialog from "../components/adminComponents/ConfirmDeleteUserDialog";


export default function AdminUsersPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const {
        users,
        usersLoading,
        updateUser,
        adjustBalance,
        rechargeBalance,
        deleteUser,
        refreshAll
    } = useAdmin();

    const { enqueueSnackbar } = useSnackbar();

    const [editUser, setEditUser] = useState(null);
    const [rechargeUser, setRechargeUser] = useState(null);
    const [txUser, setTxUser] = useState(null);
    const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

    const handleSaveEdit = async (userId, data) => {
        await updateUser(userId, data);
        enqueueSnackbar("User updated successfully.", { variant: "success" });
    };

    const handleSaveBalance = async (userId, amount) => {
        await adjustBalance(userId, amount);
        enqueueSnackbar("Balance adjusted.", { variant: "success" });
    };

    const handleRecharge = async (userId, amount) => {
        await rechargeBalance(userId, amount);
        enqueueSnackbar("Credit recharged successfully.", { variant: "success" });
    };

    const handleDeleteUser = async () => {
        if (!confirmDeleteUser) return;
        try {
            await deleteUser(confirmDeleteUser.id);
            enqueueSnackbar(`User "${confirmDeleteUser.username}" deleted.`, { variant: "success" });
        } catch {
            enqueueSnackbar("Failed to delete user.", { variant: "error" });
        } finally {
            setConfirmDeleteUser(null);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <AdminPageHero
                title="Users"
                description="Manage registered users, search accounts quickly, and handle balance-related actions from one place."
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

            <AdminSurface title="User Directory" description="Search users and open account actions directly from the list.">
                <UsersTable
                    users={users}
                    usersLoading={usersLoading}
                    isMobile={isMobile}
                    onEditUser={setEditUser}
                    onRechargeUser={setRechargeUser}
                    onViewTransactions={setTxUser}
                    onDeleteUser={setConfirmDeleteUser}
                />
            </AdminSurface>

            <EditUserModal
                open={Boolean(editUser)}
                onClose={() => setEditUser(null)}
                user={editUser}
                onSave={handleSaveEdit}
            />

            <RechargeModal
                open={Boolean(rechargeUser)}
                onClose={() => setRechargeUser(null)}
                user={rechargeUser}
                onSave={handleSaveBalance}
                onRecharge={handleRecharge}
            />

            <UserTransactionsModal
                open={Boolean(txUser)}
                onClose={() => setTxUser(null)}
                user={txUser}
            />

            <ConfirmDeleteUserDialog
                user={confirmDeleteUser}
                onClose={() => setConfirmDeleteUser(null)}
                onConfirm={handleDeleteUser}
            />
        </Box>
    );
}
