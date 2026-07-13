import { Component } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error("Uncaught render error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "100vh",
                        p: 3,
                    }}
                >
                    <Stack spacing={2} alignItems="center" textAlign="center">
                        <Typography variant="h5">Something went wrong</Typography>
                        <Typography variant="body2" color="text.secondary">
                            An unexpected error occurred. Try reloading the page.
                        </Typography>
                        <Button variant="contained" onClick={() => window.location.reload()}>
                            Reload
                        </Button>
                    </Stack>
                </Box>
            );
        }

        return this.props.children;
    }
}
