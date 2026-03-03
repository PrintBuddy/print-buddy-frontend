import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Divider,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import {
    getRechargeInfo,
    updateRechargeInfo,
    getTelegramAdmins,
    addTelegramAdmin,
    removeTelegramAdmin
} from "../api/settings";


// ─── Recharge Info Section ─────────────────────────────────────────────────────

function RechargeInfoCard() {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-recharge-info"],
        queryFn: getRechargeInfo,
        staleTime: 1000 * 60 * 5,
    });

    const [form, setForm] = useState({
        cashContacts: [],
        bank: { name: "", iban: "", link: "" },
        confirmation: { name: "", number: "" }
    });

    useEffect(() => {
        if (data) {
            setForm({
                cashContacts: (data.cashContacts ?? []).map((c) => ({ ...c })),
                bank: { ...data.bank },
                confirmation: { ...data.confirmation }
            });
        }
    }, [data]);

    const saveMutation = useMutation({
        mutationFn: updateRechargeInfo,
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-recharge-info"]);
            enqueueSnackbar("Recharge info saved.", { variant: "success" });
        },
        onError: (err) => {
            const detail = err?.response?.data?.detail ?? "Failed to save.";
            enqueueSnackbar(detail, { variant: "error" });
        }
    });

    const handleBankChange = (field, value) =>
        setForm((f) => ({ ...f, bank: { ...f.bank, [field]: value } }));

    const handleConfirmationChange = (field, value) =>
        setForm((f) => ({ ...f, confirmation: { ...f.confirmation, [field]: value } }));

    const handleContactChange = (i, field, value) =>
        setForm((f) => {
            const updated = [...f.cashContacts];
            updated[i] = { ...updated[i], [field]: value };
            return { ...f, cashContacts: updated };
        });

    const addContact = () =>
        setForm((f) => ({ ...f, cashContacts: [...f.cashContacts, { name: "", number: "" }] }));

    const removeContact = (i) =>
        setForm((f) => ({ ...f, cashContacts: f.cashContacts.filter((_, idx) => idx !== i) }));

    const handleSave = () => saveMutation.mutate(form);

    if (isLoading) {
        return (
            <Paper sx={{ p: 3 }}>
                <Typography color="text.secondary">Loading recharge info…</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">Recharge Info</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Shown to users on the balance / recharge page.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saveMutation.isPending}
                    sx={{ flexShrink: 0 }}
                >
                    {saveMutation.isPending ? "Saving…" : "Save"}
                </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Bank info */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Bank / Transfer
            </Typography>
            <Stack spacing={1.5} mb={3}>
                <TextField
                    label="Account holder name"
                    size="small"
                    fullWidth
                    value={form.bank.name}
                    onChange={(e) => handleBankChange("name", e.target.value)}
                />
                <TextField
                    label="IBAN"
                    size="small"
                    fullWidth
                    value={form.bank.iban}
                    onChange={(e) => handleBankChange("iban", e.target.value)}
                />
                <TextField
                    label="Payment link (Revolut, PayPal…)"
                    size="small"
                    fullWidth
                    value={form.bank.link}
                    onChange={(e) => handleBankChange("link", e.target.value)}
                />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Confirmation contact */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Confirmation Contact
            </Typography>
            <Stack spacing={1.5} direction={{ xs: "column", sm: "row" }} mb={3}>
                <TextField
                    label="Name"
                    size="small"
                    fullWidth
                    value={form.confirmation.name}
                    onChange={(e) => handleConfirmationChange("name", e.target.value)}
                />
                <TextField
                    label="Phone number"
                    size="small"
                    fullWidth
                    value={form.confirmation.number}
                    onChange={(e) => handleConfirmationChange("number", e.target.value)}
                />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Cash contacts */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" fontWeight="bold">
                    Cash Contacts
                </Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addContact}>
                    Add
                </Button>
            </Box>
            <Stack spacing={1.5}>
                {form.cashContacts.map((contact, i) => (
                    <Box key={i} display="flex" gap={1} alignItems="center">
                        <TextField
                            label="Name"
                            size="small"
                            value={contact.name}
                            onChange={(e) => handleContactChange(i, "name", e.target.value)}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            label="Phone number"
                            size="small"
                            value={contact.number}
                            onChange={(e) => handleContactChange(i, "number", e.target.value)}
                            sx={{ flex: 1 }}
                        />
                        <Tooltip title="Remove">
                            <IconButton size="small" color="error" onClick={() => removeContact(i)}>
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ))}
                {form.cashContacts.length === 0 && (
                    <Typography variant="body2" color="text.disabled" fontStyle="italic">
                        No cash contacts yet.
                    </Typography>
                )}
            </Stack>
        </Paper>
    );
}


// ─── Telegram Admins Section ───────────────────────────────────────────────────

function TelegramAdminsCard() {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    const { data: admins = [], isLoading } = useQuery({
        queryKey: ["admin-telegram-admins"],
        queryFn: getTelegramAdmins,
        staleTime: 1000 * 60 * 5,
    });

    const [newUsername, setNewUsername] = useState("");
    const [newTelegramId, setNewTelegramId] = useState("");
    const [addError, setAddError] = useState("");

    const addMutation = useMutation({
        mutationFn: ({ username, telegram_id }) => addTelegramAdmin(username, telegram_id),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-telegram-admins"]);
            setNewUsername("");
            setNewTelegramId("");
            setAddError("");
            enqueueSnackbar("Telegram admin added.", { variant: "success" });
        },
        onError: (err) => {
            const detail = err?.response?.data?.detail ?? "Failed to add.";
            setAddError(detail);
        }
    });

    const removeMutation = useMutation({
        mutationFn: removeTelegramAdmin,
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-telegram-admins"]);
            enqueueSnackbar("Telegram admin removed.", { variant: "success" });
        },
        onError: (err) => {
            const detail = err?.response?.data?.detail ?? "Failed to remove.";
            enqueueSnackbar(detail, { variant: "error" });
        }
    });

    const handleAdd = () => {
        if (!newUsername.trim() || !newTelegramId.trim()) {
            setAddError("Both username and Telegram ID are required.");
            return;
        }
        setAddError("");
        addMutation.mutate({ username: newUsername.trim(), telegram_id: newTelegramId.trim() });
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box mb={2}>
                <Typography variant="h6" fontWeight="bold">Telegram Admins</Typography>
                <Typography variant="body2" color="text.secondary">
                    Telegram users authorised to manage PrintBuddy via the bot.
                </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Current admins list */}
            {isLoading ? (
                <Typography color="text.secondary">Loading…</Typography>
            ) : admins.length === 0 ? (
                <Typography variant="body2" color="text.disabled" fontStyle="italic" mb={2}>
                    No Telegram admins configured.
                </Typography>
            ) : (
                <Stack spacing={1} mb={3}>
                    {admins.map((ta) => (
                        <Box
                            key={ta.id}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                                bgcolor: "action.hover",
                                borderRadius: 1,
                                px: 1.5,
                                py: 1
                            }}
                        >
                            <Box>
                                <Typography variant="body2" fontWeight="medium">
                                    @{ta.username ?? ta.user_id}
                                    {ta.name && (
                                        <Typography
                                            component="span"
                                            variant="caption"
                                            color="text.secondary"
                                            ml={1}
                                        >
                                            {ta.name} {ta.surname}
                                        </Typography>
                                    )}
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    Telegram ID: {ta.telegram_id}
                                </Typography>
                            </Box>
                            <Tooltip title="Remove">
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => removeMutation.mutate(ta.id)}
                                    disabled={removeMutation.isPending}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ))}
                </Stack>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Add new admin */}
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Add New Telegram Admin
            </Typography>
            <Stack spacing={1.5}>
                <Stack spacing={1.5} direction={{ xs: "column", sm: "row" }}>
                    <TextField
                        label="PrintBuddy username"
                        size="small"
                        fullWidth
                        value={newUsername}
                        onChange={(e) => { setNewUsername(e.target.value); setAddError(""); }}
                        slotProps={{
                            input: {
                                startAdornment: <InputAdornment position="start">@</InputAdornment>
                            }
                        }}
                    />
                    <TextField
                        label="Telegram chat ID"
                        size="small"
                        fullWidth
                        value={newTelegramId}
                        onChange={(e) => { setNewTelegramId(e.target.value); setAddError(""); }}
                    />
                </Stack>
                {addError && (
                    <Typography variant="body2" color="error">{addError}</Typography>
                )}
                <Box>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        disabled={addMutation.isPending}
                    >
                        {addMutation.isPending ? "Adding…" : "Add Admin"}
                    </Button>
                </Box>
            </Stack>
        </Paper>
    );
}


// ─── Page ──────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
    return (
        <Box>
            <Box mb={3}>
                <Typography variant="h5" fontWeight="bold">Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage app configuration: recharge info and Telegram bot admins.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 7 }}>
                    <RechargeInfoCard />
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                    <TelegramAdminsCard />
                </Grid>
            </Grid>
        </Box>
    );
}
