import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getTelegramAdmins, addTelegramAdmin, removeTelegramAdmin } from "../../api/settings";
import {
    Typography, Stack, TextField, Button, Box, Divider, IconButton, Tooltip, InputAdornment, Paper
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsSectionCard from "./SettingsSectionCard";

export default function TelegramAdminsSection() {
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
        <SettingsSectionCard
            title="Telegram Admins"
            description="Manage the Telegram accounts allowed to receive admin bot actions and notifications."
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
                                                sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
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
        </SettingsSectionCard>
    );
}
