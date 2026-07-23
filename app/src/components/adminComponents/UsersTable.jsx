import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
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
    Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import UserStatusChips from "./UserStatusChips";

function getBalanceColor(balance, positiveColor = "success.main") {
    return balance < 0 ? "error.main" : positiveColor;
}

// The user directory table — clicking a row navigates to that user's
// dedicated detail sub-page (/admin/users/:id), which now houses every
// action (edit, balance, transactions, delete) that used to live in
// separate modals launched from this list.
export default function UsersTable({ users, usersLoading, isMobile }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

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

    const goToUser = (user) => navigate(`/admin/users/${user.id}`);

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
                                <TableCell align="right" />
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
                                onClick={() => goToUser(user)}
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
                                onClick={() => goToUser(user)}
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
                                    <ChevronRightIcon fontSize="small" color="disabled" />
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
            </TableContainer>
        </>
    );
}
