import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Box,
    Button,
    Checkbox,
    Chip,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "../hooks/useSnackbar";

import { useAdmin } from "../context/AdminContext";
import { getUserTransactions } from "../api/user";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";
import StatCard from "../components/adminComponents/StatCard";
import RechargeModal from "../components/adminComponents/RechargeModal";
import ConfirmDeleteUserDialog from "../components/adminComponents/ConfirmDeleteUserDialog";

const ROLE_LABEL = { user: "User", admin: "Admin", super_admin: "Super Admin" };
const TX_COLOR = { recharge: "success", refund: "info", print: "error", adjustment: "warning" };

function getBalanceColor(balance) {
    return balance < 0 ? "error.main" : "success.main";
}

export default function AdminUserDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const {
        users, usersLoading,
        updateUser, adjustBalance, rechargeBalance, deleteUser,
        isSuperAdmin,
    } = useAdmin();

    const user = useMemo(() => (users ?? []).find((u) => u.id === id), [users, id]);

    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [rechargeOpen, setRechargeOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name ?? "",
                surname: user.surname ?? "",
                username: user.username ?? "",
                email: user.email ?? "",
                is_active: user.is_active ?? true,
                credit_limit: user.credit_limit ?? 0,
                role: user.role ?? "user",
            });
            setFormError("");
        }
    }, [user]);

    const { data: transactions, isLoading: txLoading } = useQuery({
        queryKey: ["admin-user-transactions", id],
        queryFn: () => getUserTransactions(id),
        enabled: Boolean(id),
    });

    const handleFieldChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            const payload = {
                name: form.name,
                surname: form.surname,
                username: form.username,
                email: form.email.trim() ? form.email.trim() : null,
                is_active: form.is_active,
                credit_limit: Number(form.credit_limit) || 0,
            };
            if (isSuperAdmin) {
                payload.role = form.role;
            }
            await updateUser(user.id, payload);
            enqueueSnackbar("User updated successfully.", { variant: "success" });
        } catch (err) {
            const detail = err?.response?.data?.detail;
            setFormError(detail ?? "Failed to update user.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBalance = async (userId, amount) => {
        await adjustBalance(userId, amount);
        enqueueSnackbar("Balance adjusted.", { variant: "success" });
    };

    const handleRecharge = async (userId, amount) => {
        await rechargeBalance(userId, amount);
        enqueueSnackbar("Credit recharged successfully.", { variant: "success" });
    };

    const handleDelete = async () => {
        try {
            await deleteUser(user.id);
            enqueueSnackbar(`User "${user.username}" deleted.`, { variant: "success" });
            navigate("/admin/users");
        } catch {
            enqueueSnackbar("Failed to delete user.", { variant: "error" });
        } finally {
            setConfirmDelete(false);
        }
    };

    if (usersLoading && !user) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
                <Skeleton variant="rounded" height={140} />
                <Skeleton variant="rounded" height={300} />
            </Box>
        );
    }

    if (!user) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
                <Button
                    component={Link}
                    to="/admin/users"
                    variant="text"
                    size="small"
                    startIcon={<ArrowBackIcon />}
                    sx={{ alignSelf: "flex-start" }}
                >
                    Back to Users
                </Button>
                <AdminPageHero
                    eyebrow="User"
                    title="User not found"
                    description="This user may have been deleted or the link is invalid."
                />
            </Box>
        );
    }

    const tags = [ROLE_LABEL[user.role] ?? user.role];
    if (!user.is_active) tags.push("Inactive");

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <Button
                component={Link}
                to="/admin/users"
                variant="text"
                size="small"
                startIcon={<ArrowBackIcon />}
                sx={{ alignSelf: "flex-start" }}
            >
                Back to Users
            </Button>
            <AdminPageHero
                eyebrow="User"
                title={`${user.name} ${user.surname}`}
                description={`@${user.username} · ${user.email ?? "no email set"}`}
                tags={tags}
            />

            <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <StatCard
                        icon={<AccountBalanceWalletIcon />}
                        label="Balance"
                        value={`€${Number(user.balance ?? 0).toFixed(2)}`}
                        accentColor={getBalanceColor(user.balance ?? 0)}
                        action={
                            <Button size="small" onClick={() => setRechargeOpen(true)}>
                                Recharge / Adjust
                            </Button>
                        }
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <StatCard
                        icon={<CreditCardIcon />}
                        label="Credit Limit"
                        value={`€${Number(user.credit_limit ?? 0).toFixed(2)}`}
                        accentColor="primary.main"
                    />
                </Grid>
            </Grid>

            <AdminSurface title="Profile" description="Edit this user's account details.">
                {form && (
                    <Box component="form" onSubmit={handleSaveProfile}>
                        <Grid container spacing={2}>
                            {formError && (
                                <Grid size={12}>
                                    <Typography color="error" variant="body2">{formError}</Typography>
                                </Grid>
                            )}
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Name" name="name" value={form.name} onChange={handleFieldChange} fullWidth size="small" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Surname" name="surname" value={form.surname} onChange={handleFieldChange} fullWidth size="small" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Username" name="username" value={form.username} onChange={handleFieldChange} fullWidth size="small" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField label="Email" name="email" type="email" value={form.email} onChange={handleFieldChange} fullWidth size="small" />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    label="Credit Limit (€)"
                                    name="credit_limit"
                                    type="number"
                                    value={form.credit_limit}
                                    onChange={handleFieldChange}
                                    fullWidth
                                    size="small"
                                    slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                                />
                            </Grid>
                            {isSuperAdmin && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel id="role-label">Role</InputLabel>
                                        <Select
                                            labelId="role-label"
                                            label="Role"
                                            name="role"
                                            value={form.role}
                                            onChange={handleFieldChange}
                                        >
                                            <MenuItem value="user">User</MenuItem>
                                            <MenuItem value="admin">Admin</MenuItem>
                                            <MenuItem value="super_admin">Super Admin</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                            <Grid size={12}>
                                <FormControlLabel
                                    control={<Checkbox checked={form.is_active} onChange={handleFieldChange} name="is_active" />}
                                    label="Active"
                                />
                            </Grid>
                            <Grid size={12}>
                                <Button type="submit" variant="contained" disabled={saving}>
                                    {saving ? "Saving…" : "Save Changes"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </AdminSurface>

            <AdminSurface title="Transaction History" description="Every recharge, print, refund, and adjustment for this user.">
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400, overflowY: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Balance after</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {txLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <TableRow key={i}><TableCell colSpan={4}><Skeleton /></TableCell></TableRow>
                                ))
                            ) : !transactions?.length ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <Typography variant="body2" color="text.secondary">No transactions.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>{new Date(tx.created_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Chip label={tx.type} color={TX_COLOR[tx.type] ?? "default"} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color={tx.amount >= 0 ? "success.main" : "error.main"}>
                                                {tx.amount >= 0 ? "+" : ""}€{tx.amount.toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell><Typography variant="caption">€{tx.balance_after.toFixed(2)}</Typography></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </AdminSurface>

            <AdminSurface title="Danger Zone" description="Permanently delete this user account. This cannot be undone.">
                <Box>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setConfirmDelete(true)}
                    >
                        Delete User
                    </Button>
                </Box>
            </AdminSurface>

            <RechargeModal
                open={rechargeOpen}
                onClose={() => setRechargeOpen(false)}
                user={user}
                onSave={handleSaveBalance}
                onRecharge={handleRecharge}
            />

            <ConfirmDeleteUserDialog
                user={confirmDelete ? user : null}
                onClose={() => setConfirmDelete(false)}
                onConfirm={handleDelete}
            />
        </Box>
    );
}
