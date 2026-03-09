import { useState } from "react";
import { Grid, Paper, Stack, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const USERNAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_-]{2,19}$/;
const USERNAME_HELPER = "3–20 characters. Start with a letter or underscore. Only letters, digits, _ and - allowed.";


export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [ name, setName ] = useState("");
    const [ surname, setSurname ] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [usernameError, setUsernameError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!USERNAME_REGEX.test(username)) {
            setUsernameError(USERNAME_HELPER);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        const response = await register({ username, email, password, name, surname });

        if (response.success) {
            navigate("/");
        } else {
            setError(response.message || "Registration failed");
        }

        setLoading(false);
    };

    return (
        <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: "100dvh" }}
        >
        <Grid
            sx={{
                width: { xs: "90%", sm: "60%", md: 400 },
                maxWidth: "100%",
            }}
        >
            <Paper elevation={3} sx={{ p: 4 }}>
            <Stack
                spacing={2}
                component="form"
                onSubmit={handleSubmit}
            >
                <Typography variant="h5" align="center">
                    Sign Up
                </Typography>

                <TextField
                    label="Username"
                    value={username}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\s/g, '');
                        setUsername(val);
                        setUsernameError(val && !USERNAME_REGEX.test(val) ? USERNAME_HELPER : "");
                    }}
                    fullWidth
                    required
                    error={!!usernameError}
                    helperText={usernameError || "Letters, digits, _ and - only; 3–20 chars"}
                />

                <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    required
                />

                <TextField
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                />

                <TextField
                label="Surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
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

                <TextField
                    label="Confirm Password"
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
                    disabled={loading}
                >
                {loading ? <CircularProgress size={24} /> : "Register"}
                </Button>

                <Typography variant="body2" align="center">
                    Already have an account? <Link to="/login">Sign in</Link>
                </Typography>
            </Stack>
            </Paper>
        </Grid>
        </Grid>
    );
}