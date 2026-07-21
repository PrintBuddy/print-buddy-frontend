import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "../../hooks/useSnackbar";
import { getTelegramAdmins, addTelegramAdmin, updateTelegramAdmin, removeTelegramAdmin } from "../../api/settings";
import {
    Typography, Stack, TextField, Button, Box, Divider, IconButton, Tooltip, InputAdornment, Paper, Chip, Checkbox, FormControlLabel
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SettingsSectionCard from "./SettingsSectionCard";
import TelegramAdminEditModal from "./TelegramAdminEditModal";
import ConfirmDialog from "../utils/ConfirmDialog";

const NEW_ADMIN_DEFAULTS = {
    username: "", telegram_id: "", phone_number: "", accepts_transfer: false,
    bank_name: "", bank_iban: "", bank_link: "",
};

export default function TelegramAdminsSection() {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const { data: admins = [], isLoading } = useQuery({
        queryKey: ["admin-telegram-admins"],
        queryFn: getTelegramAdmins,
        staleTime: 1000 * 60 * 5,
    });
    const [newAdmin, setNewAdmin] = useState(NEW_ADMIN_DEFAULTS);
    const [addError, setAddError] = useState("");
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [removeTarget, setRemoveTarget] = useState(null);

    const addMutation = useMutation({
        mutationFn: (data) => addTelegramAdmin(data),
        meta: { skipGlobalErrorToast: true },
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-telegram-admins"]);
            queryClient.invalidateQueries(["recharge-request-admins"]);
            setNewAdmin(NEW_ADMIN_DEFAULTS);
            setAddError("");
            enqueueSnackbar("Telegram admin added.", { variant: "success" });
        },
        onError: (err) => {
            const detail = err?.response?.data?.detail ?? "Failed to add.";
            setAddError(detail);
        }
    });
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateTelegramAdmin(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-telegram-admins"]);
            queryClient.invalidateQueries(["recharge-request-admins"]);
            enqueueSnackbar("Payment info updated.", { variant: "success" });
        },
    });
    const removeMutation = useMutation({
        mutationFn: removeTelegramAdmin,
        meta: { skipGlobalErrorToast: true },
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-telegram-admins"]);
            queryClient.invalidateQueries(["recharge-request-admins"]);
            enqueueSnackbar("Telegram admin removed.", { variant: "success" });
        },
        onError: (err) => {
            const detail = err?.response?.data?.detail ?? "Failed to remove.";
            enqueueSnackbar(detail, { variant: "error" });
        },
        onSettled: () => setRemoveTarget(null),
    });
    const handleAdd = () => {
        if (!newAdmin.username.trim() || !newAdmin.telegram_id.trim()) {
            setAddError("Both username and Telegram ID are required.");
            return;
        }
        setAddError("");
        addMutation.mutate({
            username: newAdmin.username.trim(),
            telegram_id: newAdmin.telegram_id.trim(),
            phone_number: newAdmin.phone_number.trim() || null,
            accepts_transfer: newAdmin.accepts_transfer,
            bank_name: newAdmin.bank_name.trim() || null,
            bank_iban: newAdmin.bank_iban.trim() || null,
            bank_link: newAdmin.bank_link.trim() || null,
        });
    };
    return (
        <SettingsSectionCard
            title="Telegram Admins"
            description="Manage the Telegram accounts allowed to receive admin bot actions and notifications, and the payment info shown to users on their Balance page."
            badge="Access"
        >
            <Stack spacing={3}>
                <Box>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Current Admins
                    </Typography>
                    {isLoading ? (
                        <Typography color="text.secondary">Loading…</Typography>
                    ) : admins.length === 0 ? (
                        <Typography variant="body2" color="text.disabled" fontStyle="italic" mt={1}>
                            No Telegram admins configured.
                        </Typography>
                    ) : (
                        <Stack spacing={1.25} mt={1.5}>
                            {admins.map((ta) => (
                                <Paper
                                    key={ta.id}
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 2,
                                        px: 1.5,
                                        py: 1.25,
                                        bgcolor: "rgba(15, 23, 42, 0.02)"
                                    }}
                                >
                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        justifyContent="space-between"
                                        alignItems={{ xs: "flex-start", sm: "center" }}
                                        spacing={1}
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
                                            <Typography variant="caption" color="text.disabled" display="block">
                                                Telegram ID: {ta.telegram_id}
                                            </Typography>
                                            <Stack direction="row" spacing={0.75} mt={0.5}>
                                                <Chip
                                                    label={ta.phone_number ? `Cash: ${ta.phone_number}` : "No phone set"}
                                                    size="small"
                                                    variant="outlined"
                                                    color={ta.phone_number ? "default" : "warning"}
                                                />
                                                {ta.accepts_transfer && (
                                                    <Chip label="Transfer OK" size="small" color="primary" variant="outlined" />
                                                )}
                                            </Stack>
                                        </Box>
                                        <Stack direction="row" spacing={0.5} sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
                                            <Tooltip title="Edit payment info">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setEditingAdmin(ta)}
                                                    aria-label="Edit payment info"
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Remove">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => setRemoveTarget(ta)}
                                                    disabled={removeMutation.isPending}
                                                    aria-label="Remove telegram admin"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Box>
                <Divider />
                <Stack spacing={1.5}>
                    <Typography variant="subtitle2" fontWeight="bold">
                        Add New Telegram Admin
                    </Typography>
                    <Stack spacing={1.5} direction={{ xs: "column", sm: "row" }}>
                        <TextField
                            label="PrintBuddy username"
                            size="small"
                            fullWidth
                            value={newAdmin.username}
                            onChange={(e) => { setNewAdmin((f) => ({ ...f, username: e.target.value })); setAddError(""); }}
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
                            value={newAdmin.telegram_id}
                            onChange={(e) => { setNewAdmin((f) => ({ ...f, telegram_id: e.target.value })); setAddError(""); }}
                        />
                    </Stack>
                    <TextField
                        label="Phone number (for cash payments)"
                        size="small"
                        fullWidth
                        value={newAdmin.phone_number}
                        onChange={(e) => setNewAdmin((f) => ({ ...f, phone_number: e.target.value }))}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={newAdmin.accepts_transfer}
                                onChange={(e) => setNewAdmin((f) => ({ ...f, accepts_transfer: e.target.checked }))}
                            />
                        }
                        label="Accepts bank transfer"
                    />
                    {newAdmin.accepts_transfer && (
                        <Stack spacing={1.5}>
                            <TextField
                                label="Account holder name"
                                size="small"
                                fullWidth
                                value={newAdmin.bank_name}
                                onChange={(e) => setNewAdmin((f) => ({ ...f, bank_name: e.target.value }))}
                            />
                            <TextField
                                label="IBAN"
                                size="small"
                                fullWidth
                                value={newAdmin.bank_iban}
                                onChange={(e) => setNewAdmin((f) => ({ ...f, bank_iban: e.target.value }))}
                            />
                            <TextField
                                label="Payment link (Revolut, PayPal…)"
                                size="small"
                                fullWidth
                                value={newAdmin.bank_link}
                                onChange={(e) => setNewAdmin((f) => ({ ...f, bank_link: e.target.value }))}
                            />
                        </Stack>
                    )}
                    {addError && (
                        <Typography variant="body2" color="error">{addError}</Typography>
                    )}
                    <Box>
                        <Button
                            variant="outlined"
                            size="medium"
                            startIcon={<AddIcon />}
                            onClick={handleAdd}
                            disabled={addMutation.isPending}
                            sx={{ width: { xs: "100%", sm: "auto" } }}
                        >
                            {addMutation.isPending ? "Adding…" : "Add Admin"}
                        </Button>
                    </Box>
                </Stack>
            </Stack>

            <TelegramAdminEditModal
                open={Boolean(editingAdmin)}
                admin={editingAdmin}
                onClose={() => setEditingAdmin(null)}
                onSubmit={(id, data) => updateMutation.mutateAsync({ id, data })}
            />

            <ConfirmDialog
                open={Boolean(removeTarget)}
                title="Remove Telegram admin?"
                message={`Remove @${removeTarget?.username ?? removeTarget?.user_id} from Telegram admins? They will stop receiving admin bot notifications.`}
                onClose={() => setRemoveTarget(null)}
                onConfirm={() => removeMutation.mutate(removeTarget.id)}
                loading={removeMutation.isPending}
            />
        </SettingsSectionCard>
    );
}
