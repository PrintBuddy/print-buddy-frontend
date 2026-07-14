import { useState } from "react";
import {
    Box,
    Button,
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import UserStatusChips from "./UserStatusChips";

function getBalanceColor(balance, positiveColor = "success.main") {
    return balance < 0 ? "error.main" : positiveColor;
}

// The user directory table + its mobile tap-to-open action sheet — one
// cohesive interactive unit (a mobile row tap opens the sheet, whose
// buttons hand off to the parent's edit/recharge/transactions/delete
// modals via the callbacks below).
export default function UsersTable({
    users,
    usersLoading,
    isMobile,
    onEditUser,
    onRechargeUser,
    onViewTransactions,
    onDeleteUser,
}) {
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);

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
        <>
            <TextField
                placeholder="Search by name or username…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                fullWidth
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: search ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setSearch("")} aria-label="Clear search">
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null
                    }
                }}
            />

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
                                        color={getBalanceColor(user.balance)}
                                    >
                                        €{user.balance?.toFixed(2)}
                                    </Typography>
                                    <Box display="flex" gap={0.5} justifyContent="flex-end" mt={0.25}>
                                        <UserStatusChips user={user} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
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
                                </TableCell>
                                <TableCell>{user.name} {user.surname}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Typography
                                        variant="body2"
                                        color={getBalanceColor(user.balance, "text.primary")}
                                    >
                                        €{user.balance?.toFixed(2)}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" gap={0.5}>
                                        <UserStatusChips user={user} />
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit user info">
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEditUser(user); }} aria-label="Edit user info">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Adjust balance">
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onRechargeUser(user); }} aria-label="Adjust balance">
                                            <AccountBalanceWalletIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="View transactions">
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onViewTransactions(user); }} aria-label="View transactions">
                                            <ReceiptLongIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete user">
                                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDeleteUser(user); }} aria-label="Delete user">
                                            <DeleteIcon fontSize="small" />
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
                <DialogTitle sx={{ pb: 0.5, pr: 6 }}>
                    <Typography fontWeight="bold">{selectedUser?.username}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {selectedUser?.name} {selectedUser?.surname}
                    </Typography>
                    <IconButton
                        onClick={() => setSelectedUser(null)}
                        size="small"
                        sx={{ position: "absolute", top: 8, right: 8 }}
                        aria-label="Close"
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {selectedUser?.email}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Typography
                            variant="body1"
                            fontWeight="medium"
                            color={getBalanceColor(selectedUser?.balance)}
                        >
                            €{selectedUser?.balance?.toFixed(2)}
                        </Typography>
                        <UserStatusChips user={selectedUser} />
                    </Box>
                </DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 2, pb: 2 }}>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => { onEditUser(selectedUser); setSelectedUser(null); }}
                    >
                        Edit Info
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AccountBalanceWalletIcon />}
                        onClick={() => { onRechargeUser(selectedUser); setSelectedUser(null); }}
                    >
                        Recharge / Adjust Balance
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ReceiptLongIcon />}
                        onClick={() => { onViewTransactions(selectedUser); setSelectedUser(null); }}
                    >
                        View Transactions
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => { onDeleteUser(selectedUser); setSelectedUser(null); }}
                    >
                        Delete User
                    </Button>
                </Box>
            </Dialog>
        </>
    );
}
