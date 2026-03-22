import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getRechargeInfo, updateRechargeInfo } from "../../api/settings";
import {
    Typography, Stack, TextField, Button, Box, Divider, IconButton, Tooltip, Paper
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsSectionCard from "./SettingsSectionCard";

export default function RechargeInfoSection() {
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
    return (
        <SettingsSectionCard
            title="Recharge Info"
            description="Organize the payment details students and staff need when topping up their balance."
            badge="Payments"
        >
            {isLoading ? (
                <Typography color="text.secondary">Loading recharge info…</Typography>
            ) : (
                <Stack spacing={3}>
                    <Box>
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
                    </Box>
                    <Divider />
                    <Box>
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
                    </Box>
                    <Divider />
                    <Stack spacing={2}>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "stretch", sm: "center" }}
                            spacing={1}
                        >
                            <Typography variant="subtitle2" fontWeight="bold">
                                Cash Contacts
                            </Typography>
                            <Button size="small" startIcon={<AddIcon />} onClick={addContact}>
                                Add contact
                            </Button>
                        </Stack>
                        <Stack spacing={1.5}>
                            {form.cashContacts.map((contact, i) => (
                                <Paper
                                    key={i}
                                    variant="outlined"
                                    sx={{ p: 1.5, borderRadius: 2, bgcolor: "rgba(15, 23, 42, 0.02)" }}
                                >
                                    <Stack
                                        direction={{ xs: "column", md: "row" }}
                                        gap={1}
                                        alignItems={{ xs: "stretch", md: "center" }}
                                    >
                                    <TextField
                                        label="Name"
                                        size="small"
                                        value={contact.name}
                                        onChange={(e) => handleContactChange(i, "name", e.target.value)}
                                        sx={{ flex: 1, minWidth: 0 }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Phone number"
                                        size="small"
                                        value={contact.number}
                                        onChange={(e) => handleContactChange(i, "number", e.target.value)}
                                        sx={{ flex: 1, minWidth: 0 }}
                                        fullWidth
                                    />
                                    <Tooltip title="Remove">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => removeContact(i)}
                                            sx={{ alignSelf: { xs: "flex-end", md: "center" } }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    </Stack>
                                </Paper>
                            ))}
                            {form.cashContacts.length === 0 && (
                                <Typography variant="body2" color="text.disabled" fontStyle="italic">
                                    No cash contacts yet.
                                </Typography>
                            )}
                        </Stack>
                    </Stack>
                    <Box>
                        <Divider sx={{ mb: 2 }} />
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
                            <Button
                                variant="contained"
                                size="medium"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={saveMutation.isPending}
                                sx={{ width: { xs: "100%", sm: "auto" } }}
                            >
                                {saveMutation.isPending ? "Saving…" : "Save"}
                            </Button>
                        </Stack>
                    </Box>
                </Stack>
            )}
        </SettingsSectionCard>
    );
}
