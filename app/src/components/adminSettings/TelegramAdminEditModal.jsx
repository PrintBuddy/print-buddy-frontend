import { useEffect, useState } from "react";
import { Button, Checkbox, FormControlLabel, Stack, TextField, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";

export default function TelegramAdminEditModal({ open, admin, onClose, onSubmit }) {
    const [form, setForm] = useState({
        telegram_id: "", phone_number: "", accepts_transfer: false, bank_name: "", bank_iban: "", bank_link: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (admin) {
            setForm({
                telegram_id: admin.telegram_id ?? "",
                phone_number: admin.phone_number ?? "",
                accepts_transfer: admin.accepts_transfer ?? false,
                bank_name: admin.bank_name ?? "",
                bank_iban: admin.bank_iban ?? "",
                bank_link: admin.bank_link ?? "",
            });
            setError("");
        }
    }, [admin]);

    if (!admin) return null;

    const handleSave = async () => {
        if (!form.telegram_id.trim()) {
            setError("Telegram ID is required.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onSubmit(admin.id, {
                telegram_id: form.telegram_id.trim(),
                phone_number: form.phone_number || null,
                accepts_transfer: form.accepts_transfer,
                bank_name: form.bank_name || null,
                bank_iban: form.bank_iban || null,
                bank_link: form.bank_link || null,
            });
            onClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to save.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={`Payment info — @${admin.username}`}
            maxWidth="sm"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Telegram chat ID"
                        size="small"
                        fullWidth
                        value={form.telegram_id}
                        onChange={(e) => { setForm((f) => ({ ...f, telegram_id: e.target.value })); setError(""); }}
                    />
                    <TextField
                        label="Phone number (for cash payments)"
                        size="small"
                        fullWidth
                        value={form.phone_number}
                        onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={form.accepts_transfer}
                                onChange={(e) => setForm((f) => ({ ...f, accepts_transfer: e.target.checked }))}
                            />
                        }
                        label="Accepts bank transfer"
                    />
                    {form.accepts_transfer && (
                        <Stack spacing={1.5}>
                            <TextField
                                label="Account holder name"
                                size="small"
                                fullWidth
                                value={form.bank_name}
                                onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
                            />
                            <TextField
                                label="IBAN"
                                size="small"
                                fullWidth
                                value={form.bank_iban}
                                onChange={(e) => setForm((f) => ({ ...f, bank_iban: e.target.value }))}
                            />
                            <TextField
                                label="Payment link (Revolut, PayPal…)"
                                size="small"
                                fullWidth
                                value={form.bank_link}
                                onChange={(e) => setForm((f) => ({ ...f, bank_link: e.target.value }))}
                            />
                        </Stack>
                    )}
                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                </Stack>
            }
            actions={
                <>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} disabled={loading}>Save</Button>
                </>
            }
        />
    );
}
