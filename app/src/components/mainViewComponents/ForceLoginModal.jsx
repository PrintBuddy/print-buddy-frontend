import { Button, Stack, Typography, TextField } from "@mui/material";
import { useEffect, useState } from "react";

import CustomModal from "../utils/CustomModal";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";


export default function ForceLoginModal() {
    const { authExpired, logout, login } = useAuth();
    const { lastUsername } = useUser();


    const [ open, setOpen ] = useState(false);
    const username = lastUsername || "";
    const [ password, setPassword ] = useState("");
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState("");

    useEffect(()  => {
        if (authExpired) {
            if (!lastUsername) {
                logout();
            }
            setOpen(true);
        }
    }, [authExpired])

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const response = await login(username, password);
        setLoading(false);

        if (response.success) {
            setOpen(false);
            setPassword("");
        } else {
            setError(response.message);
        }        
    }

    const handleLogout = () => {
        setOpen(false);
        logout();
    }

    return (
        <CustomModal
            isForm
            open={open}
            onClose={() => {}}
            title="Session expired, please sign in again."
            content={
                <Stack spacing={2} mt={1}>
                    <TextField 
                        label="Username"
                        value={username}
                        disabled
                        fullWidth
                    />

                    <TextField 
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                    />

                    {error && (
                        <Typography color="error" variant="body2">
                            { error }
                        </Typography>
                    )}
                </Stack>
            }

            actions={
                <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="flex-end"
                    sx={{ width: "100%" }}
                >
                    <Button
                        type="button"
                        onClick={handleLogout}
                        color="secondary"
                    >
                        Logout
                    </Button>

                    <Button
                        type="submit"
                        onClick={handleLogin}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </Stack>
            }
            maxWidth="xs"
        />
    );
}