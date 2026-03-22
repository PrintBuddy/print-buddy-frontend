import { Paper, Stack, Typography } from "@mui/material";

export default function UserSurface({ title, description, children, sx = {} }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
                ...sx,
            }}
        >
            <Stack spacing={2}>
                {(title || description) && (
                    <Stack spacing={0.75}>
                        {title && (
                            <Typography variant="h6" fontWeight={700}>
                                {title}
                            </Typography>
                        )}
                        {description && (
                            <Typography variant="body2" color="text.secondary">
                                {description}
                            </Typography>
                        )}
                    </Stack>
                )}
                {children}
            </Stack>
        </Paper>
    );
}
