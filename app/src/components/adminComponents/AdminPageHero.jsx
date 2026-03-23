import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

export default function AdminPageHero({ eyebrow = "Admin Workspace", title, description, tags = [], action }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
            }}
        >
            <Stack spacing={2.5}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "flex-start" }}
                    spacing={2}
                >
                    <Stack spacing={1}>
                        <Chip
                            label={eyebrow}
                            size="small"
                            sx={{
                                width: "fit-content",
                                bgcolor: "rgba(25, 118, 210, 0.08)",
                                color: "primary.main",
                                fontWeight: 600,
                            }}
                        />
                        <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: "1.6rem", sm: "1.9rem" } }}>
                            {title}
                        </Typography>
                        {description && (
                            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
                                {description}
                            </Typography>
                        )}
                    </Stack>
                    {action && <Box sx={{ width: { xs: "100%", md: "auto" } }}>{action}</Box>}
                </Stack>
                {tags.length > 0 && (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} useFlexGap flexWrap="wrap">
                        {tags.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                sx={{ bgcolor: "rgba(25, 118, 210, 0.08)", color: "primary.main" }}
                            />
                        ))}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}
