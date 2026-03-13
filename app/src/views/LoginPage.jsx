import { Stack, Paper, Grid, Typography, TextField, Button, CircularProgress, Box, IconButton } from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import CustomModal from "../components/utils/CustomModal";


export default function LoginPage() {

    const { login } = useAuth();

    const navigate = useNavigate();

    const [ username, setUsername ] = useState("");
    const [ password, setPassword ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState("");
    const [ helpOpen, setHelpOpen ] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const response = await login(username, password);
        if (response.success) {
            navigate("/");
        } else {
            setError(response.message);
        }

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

            <IconButton
                size="small"
                color="primary"
                sx={{ position: "absolute", top: 8, right: 8 }}
                onClick={() => setHelpOpen(true)}
            >
                <HelpOutlineIcon />
            </IconButton>


            <Stack spacing={2} p={4} component="form">
                <Typography variant="h5" align="center">
                Sign In
                </Typography>

                <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => {
                        // Strip spaces from username input
                        setUsername(e.target.value.replace(/\s/g, ''));
                    }}
                    fullWidth
                    required
                />

                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

                <Stack spacing={1}>
                    <Typography variant="body2" align="center">
                        Forgot your password? <Link to="/pwd-reset-request">Reset Password</Link>
                    </Typography>
                    <Typography variant="body2" align="center">
                        Don't have an account? <Link to="/register">Sign up</Link>
                    </Typography>
                </Stack>
                
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