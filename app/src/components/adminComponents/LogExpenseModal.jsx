import { useEffect, useState } from "react";
import { Autocomplete, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import CustomModal from "../utils/CustomModal";
import { useAdmin } from "../../context/AdminContext";
import { useUser } from "../../context/UserContext";

const CATEGORIES = [
    { value: "toner", label: "Toner" },
    { value: "paper", label: "Paper" },
    { value: "maintenance", label: "Maintenance" },
    { value: "other", label: "Other" },
];

export default function LogExpenseModal({ open, onClose, onSubmit }) {
    const { users } = useAdmin();
    const { user } = useUser();
    const admins = (users ?? []).filter((u) => u.is_admin);

    const [category, setCategory] = useState("toner");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [payer, setPayer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Default the payer to the logged-in admin as soon as the picker's
    // options (and the current user) are available.
    useEffect(() => {
        if (open && !payer && user) {
            setPayer(admins.find((a) => a.id === user.id) ?? null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, user, users]);

    const reset = () => {
        setCategory("toner");
        setAmount("");
        setDescription("");
        setPayer(null);
        setError("");
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = async () => {
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            setError("Enter a valid amount greater than 0.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            await onSubmit(category, parsedAmount, description || null, payer?.id ?? null);
            handleClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to log the expense.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={handleClose}
            title="Log an Expense"
            maxWidth="sm"
            content={
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <TextField
                        select
                        label="Category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        fullWidth
                        size="small"
                    >
                        {CATEGORIES.map((c) => (
                            <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Amount (€)"
                        type="number"
                        value={amount}
                        onChange={(e) => { setAmount(e.target.value); if (error) setError(""); }}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        label="Description (optional)"
                        multiline
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        size="small"
                    />

                    <Autocomplete
                        size="small"
                        options={admins}
                        getOptionLabel={(a) => `${a.username} — ${a.name} ${a.surname}`}
                        value={payer}
                        onChange={(_, v) => setPayer(v)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} label="Paid by" />}
                    />

                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                </Stack>
            }
            actions={
                <>
                    <Button onClick={handleClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>Log Expense</Button>
                </>
            }
        />
    );
}
