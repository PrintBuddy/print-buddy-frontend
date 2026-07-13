import { Stack, Paper, Grid, Typography, TextField, Button, CircularProgress, Box, IconButton } from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import CustomModal from "../components/utils/CustomModal";


export default function PwdRequestPage() {
    const navigate = useNavigate();

    const [ helpOpen, setHelpOpen ] = useState(false);
    const [ email, setEmail ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState("");
    const [ successMsg, setSuccessMsg ] = useState("");


    const { requestPasswordReset } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        const response = await requestPasswordReset(email);
        if (response.success) {
            setSuccessMsg("Password reset link sent to your email.");
        } else {
            setError(response.message);
        }

        setLoading(false);
    };

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

            <IconButton
                size="small"
                color="primary"
                sx={{ position: "absolute", top: 8, right: 8 }}
                onClick={() => setHelpOpen(true)}
                aria-label="Help"
            >
                <HelpOutlineIcon />
            </IconButton>

            <IconButton
                size="small"
                color="primary"
                sx={{ position: "absolute", top: 8, left: 8 }}
                onClick={() => navigate(-1)}
                aria-label="Go back"
            >
                <ArrowBackIcon />
            </IconButton>

            <Stack spacing={2} p={4} component="form" onSubmit={handleSubmit}>

                <Typography variant="h6" textAlign="center" marginBottom={2}>
                    Password Reset
                </Typography>

                <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                {error && (
                    <Typography color="error" variant="body2" align="center">
                        {error}
                    </Typography>
                )}

                {successMsg && (
                    <Typography color="primary" variant="body2" align="center">
                        {successMsg}
                    </Typography>
                )}

                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : "Submit"}
                </Button>

            </Stack>
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
    )
}