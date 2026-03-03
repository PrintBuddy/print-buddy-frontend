import { useState, useEffect } from "react";
import {
    Button,
    Checkbox,
    FormControlLabel,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import CustomModal from "../utils/CustomModal";


export default function EditUserModal({ open, onClose, user, onSave }) {
    const [form, setForm] = useState({
        name: "",
        surname: "",
        username: "",
        email: "",
        is_active: true,
        is_admin: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user) {
            setForm({
                name: user.name ?? "",
                surname: user.surname ?? "",
                username: user.username ?? "",
                email: user.email ?? "",
                is_active: user.is_active ?? true,
                is_admin: user.is_admin ?? false,
            });
            setError("");
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await onSave(user.id, form);
            onClose();
        } catch (err) {
            const detail = err?.response?.data?.detail;
            setError(detail ?? "Failed to update user.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={`Edit User — ${user?.username ?? ""}`}
            isForm
            maxWidth="xs"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                    <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth size="small" />
                    <TextField label="Surname" name="surname" value={form.surname} onChange={handleChange} fullWidth size="small" />
                    <TextField label="Username" name="username" value={form.username} onChange={handleChange} fullWidth size="small" />
                    <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} fullWidth size="small" />
                    <FormControlLabel
                        control={<Checkbox checked={form.is_active} onChange={handleChange} name="is_active" />}
                        label="Active"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={form.is_admin} onChange={handleChange} name="is_admin" />}
                        label="Admin"
                    />
                </Stack>
            }
            actions={
                <>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        onClick={handleSubmit}
                    >
                        {loading ? "Saving…" : "Save"}
                    </Button>
                </>
            }
        />
    );
}
