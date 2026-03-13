import { Button, Stack, Typography, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import CustomModal from "../utils/CustomModal";
import { useUser } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";

export default function ForceEmailModal() {
    const { user, updateEmail } = useUser();
    const { logout } = useAuth();

    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState(user?.email || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user && user.email_to_set) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [user]);

    const validateEmail = (email) => {
        // Simple email regex for client-side validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        const response = await updateEmail(email);
        setLoading(false);
        if (response.success) {
            setSuccess(true);
            setOpen(false);
        } else {
            setError(response.message || "Failed to update email.");
        }
    };

    const handleLogout = () => {
        setOpen(false);
        logout();
    };

    return (
        <CustomModal
            isForm
            open={open}
            onClose={() => {}}
            title="Please set your email address."
            content={
                <Stack spacing={2} mt={1}>
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        autoFocus
                    />
                    {error && (
                        <Typography color="error" variant="body2">
                            {error}
                        </Typography>
                    )}
                    {success && (
                        <Typography color="success.main" variant="body2">
                            Email updated successfully.
                        </Typography>
                    )}
                </Stack>
            }
            actions={
                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: "100%" }}>
                    <Button type="button" onClick={handleLogout} color="secondary">
                        Logout
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleUpdateEmail}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Email"}
                    </Button>
                </Stack>
            }
            maxWidth="xs"
        />
    );
}
