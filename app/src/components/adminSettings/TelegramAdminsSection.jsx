import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getTelegramAdmins, addTelegramAdmin, removeTelegramAdmin } from "../../api/settings";
import {
    Accordion, AccordionSummary, AccordionDetails, Typography, Stack, TextField, Button, Box, Divider, IconButton, Tooltip, InputAdornment
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

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
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">Telegram Admins</Typography>
            </AccordionSummary>
            <AccordionDetails>
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
            </AccordionDetails>
        </Accordion>
    );
}
