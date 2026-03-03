import { useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useSnackbar } from "notistack";

import { useAdmin } from "../context/AdminContext";
import EditUserModal from "../components/adminComponents/EditUserModal";
import RechargeModal from "../components/adminComponents/RechargeModal";
import UserTransactionsModal from "../components/adminComponents/UserTransactionsModal";


export default function AdminUsersPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const {
        users,
        usersLoading,
        updateUser,
        adjustBalance,
        refreshAll
    } = useAdmin();

    const { enqueueSnackbar } = useSnackbar();

    const [editUser, setEditUser] = useState(null);
    const [rechargeUser, setRechargeUser] = useState(null);
    const [txUser, setTxUser] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null); // mobile action sheet
    const [search, setSearch] = useState("");

    const handleSaveEdit = async (userId, data) => {
        await updateUser(userId, data);
        enqueueSnackbar("User updated successfully.", { variant: "success" });
    };

    const handleSaveBalance = async (userId, amount) => {
        await adjustBalance(userId, amount);
        enqueueSnackbar("Balance updated successfully.", { variant: "success" });
    };

    const skeletonRows = Array.from({ length: 6 });

    const filteredUsers = (users ?? [])
        .filter((u) => {
            const q = search.trim().toLowerCase();
            if (!q) return true;
            return (
                u.username?.toLowerCase().includes(q) ||
                u.name?.toLowerCase().includes(q) ||
                u.surname?.toLowerCase().includes(q) ||
                `${u.name} ${u.surname}`.toLowerCase().includes(q)
            );
        })
        .sort((a, b) => {
            if (a.is_admin !== b.is_admin) return a.is_admin ? -1 : 1;
            return (a.username ?? "").localeCompare(b.username ?? "");
        });

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={1} flexWrap="wrap">
                <Box minWidth={0}>
                    <Typography variant="h5" fontWeight="bold">Users</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage all registered users, their info and balance.
                    </Typography>
                </Box>
                <Button
                    startIcon={<RefreshIcon />}
                    variant="outlined"
                    size="small"
                    onClick={refreshAll}
                    sx={{ flexShrink: 0 }}
                >
                    Refresh
                </Button>
            </Box>

            <TextField
                placeholder="Search by name or username…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                fullWidth
                sx={{ mb: 2 }}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: search ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearch("")}>
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null
                    }
                }}
            />

            <TableContainer component={Paper} sx={{ maxHeight: "calc(80vh - 180px)", overflowY: "auto" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {isMobile ? (
                                <>
                                    <TableCell>User</TableCell>
                                    <TableCell align="right">Balance</TableCell>
                                </>
                            ) : (
                                <>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Balance</TableCell>
                                    <TableCell>Roles</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usersLoading
                            ? skeletonRows.map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={isMobile ? 2 : 6}><Skeleton /></TableCell>
                                </TableRow>
                            ))
                            : !users?.length
                            ? (
                                <TableRow>
                                    <TableCell colSpan={isMobile ? 2 : 6} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No users found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )
                            : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isMobile ? 2 : 6} align="center">
                                        <Typography variant="body2" color="text.secondary">
                                            No users match your search.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.map((user) => isMobile ? (
                                <TableRow
                                    key={user.id}
                                    hover
                                    onClick={() => setSelectedUser(user)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {user.username}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {user.name} {user.surname}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography
                                            variant="body2"
                                            fontWeight="medium"
                                            color={user.balance < 0 ? "error.main" : "success.main"}
                                        >
                                            €{user.balance?.toFixed(2)}
                                        </Typography>
                                        <Box display="flex" gap={0.5} justifyContent="flex-end" mt={0.25}>
                                            {user.is_admin && <Chip label="Admin" color="primary" size="small" />}
                                            {!user.is_active && <Chip label="Inactive" color="error" size="small" />}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {user.username}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{user.name} {user.surname}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            color={user.balance < 0 ? "error.main" : "text.primary"}
                                        >
                                            €{user.balance?.toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" gap={0.5}>
                                            {user.is_admin && <Chip label="Admin" color="primary" size="small" />}
                                            {!user.is_active && <Chip label="Inactive" color="error" size="small" />}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit user info">
                                            <IconButton size="small" onClick={() => setEditUser(user)}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Adjust balance">
                                            <IconButton size="small" onClick={() => setRechargeUser(user)}>
                                                <AccountBalanceWalletIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="View transactions">
                                            <IconButton size="small" onClick={() => setTxUser(user)}>
                                                <ReceiptLongIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Mobile action sheet */}
            <Dialog
                open={Boolean(selectedUser)}
                onClose={() => setSelectedUser(null)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle sx={{ pb: 0.5 }}>
                    <Typography fontWeight="bold">{selectedUser?.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {selectedUser?.name} {selectedUser?.surname}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {selectedUser?.email}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Typography
                            variant="body1"
                            fontWeight="medium"
                            color={selectedUser?.balance < 0 ? "error.main" : "success.main"}
                        >
                            €{selectedUser?.balance?.toFixed(2)}
                        </Typography>
                        {selectedUser?.is_admin && <Chip label="Admin" color="primary" size="small" />}
                        {!selectedUser?.is_active && <Chip label="Inactive" color="error" size="small" />}
                    </Box>
                </DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 2, pb: 2 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => { setEditUser(selectedUser); setSelectedUser(null); }}
                    >
                        Edit Info
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AccountBalanceWalletIcon />}
                        onClick={() => { setRechargeUser(selectedUser); setSelectedUser(null); }}
                    >
                        Adjust Balance
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ReceiptLongIcon />}
                        onClick={() => { setTxUser(selectedUser); setSelectedUser(null); }}
                    >
                        View Transactions
                    </Button>
                </Box>
            </Dialog>

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
            />

            <UserTransactionsModal
                open={Boolean(txUser)}
                onClose={() => setTxUser(null)}
                user={txUser}
            />
        </Box>
    );
}
