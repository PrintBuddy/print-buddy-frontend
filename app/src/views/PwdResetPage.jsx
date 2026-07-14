import { Stack, Paper, Grid, Typography, TextField, Button, CircularProgress, Box, IconButton } from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { useSearchParams } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import CustomModal from "../components/utils/CustomModal";


export default function PwdResetPage() {

    const { resetPassword } = useAuth();

    const [ searchParams ] = useSearchParams();
    const token = searchParams.get("token");

    const [ helpOpen, setHelpOpen ] = useState(false);
    const [ password, setPassword ] = useState("");
    const [ confirmPassword, setConfirmPassword ] = useState("");

    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState("");
    const [ success, setSuccess ] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        const response = await resetPassword(token, password);
        if (!response.success) {
            setError(response.message);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    }

    return (
        <Grid
            container
            justifyContent="center"
            alignItems="center"
            style={{ minHeight: "100dvh"}}
        >
            <Grid sx={{
                width: { xs: "80%", sm: "60%", md: 400 },
                maxWidth: "100%"
            }}>

                <Box textAlign="center">
                    <img
                        src="/printbuddy.png"
                        alt="PrintBuddy logo"
                        style={{ width: 80, height: 80, marginBottom: 8 }}
                    />
                    <Typography variant="h5" fontWeight="600">
                        PrintBuddy
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Smart printing management
                    </Typography>
                </Box>

                <Paper elevation={3} sx={{ mt: 3, position: "relative" }}>
                    {!success ? (
                        <>
                        <IconButton
                            size="small"
                            color="primary"
                            sx={{ position: "absolute", top: 8, right: 8 }}
                            onClick={() => setHelpOpen(true)}
                            aria-label="Help"
                        >
                            <HelpOutlineIcon />
                        </IconButton>

                        <Stack spacing={2} p={4} component="form">
                            <Typography variant="h5" align="center">
                                Reset Password
                            </Typography>

                            <TextField
                                label="New password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                required
                            />

                            <TextField
                                label="Confirm new password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                fullWidth
                                required
                            />

                            {error && (
                            <Typography color="error" variant="body2" align="center">
                                {error}
                            </Typography>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                            {loading ? <CircularProgress size={24} /> : "Submit"}
                            </Button>
                        </Stack>
                        </>
                    ) : (
                        <Box p={4} textAlign="center">
                            <Typography variant="h5" gutterBottom>
                                Password reset successful!
                            </Typography>
                            <Typography variant="body1" >
                                You may now close this window and log in with your new password.
                            </Typography>
                        </Box>
                    )}
                </Paper>

                <CustomModal
                    open={helpOpen}
                    onClose={() => setHelpOpen(false)}
                    title="Help"
                    content={
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Typography variant="body1">
                                If you experience any problems with the app, please contact:
                            </Typography>
                            <Box>
                                <Typography variant="body1">Name: {import.meta.env.VITE_CONTACT_NAME}</Typography>
                                <Typography variant="body1">Phone: {import.meta.env.VITE_CONTACT_NUMBER}</Typography>
                            </Box>
                        </Box>
                    }
                />

            </Grid>

        </Grid>
        
    );

}