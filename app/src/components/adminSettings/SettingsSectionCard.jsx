import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";

export default function SettingsSectionCard({ title, description, badge, children, sx = {} }) {
    return (
        <Card
            elevation={0}
            sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
                ...sx,
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack spacing={3}>
                    <Stack spacing={1.25}>
                        {badge && (
                            <Chip
                                label={badge}
                                size="small"
                                sx={{
                                    width: "fit-content",
                                    fontWeight: 600,
                                    bgcolor: "rgba(25, 118, 210, 0.08)",
                                    color: "primary.main"
                                }}
                            />
                        )}
                        <Stack spacing={0.75}>
                            <Typography variant="h6" fontWeight={700}>
                                {title}
                            </Typography>
                            {description && (
                                <Typography variant="body2" color="text.secondary">
                                    {description}
                                </Typography>
                            )}
                        </Stack>
                    </Stack>
                    {children}
                </Stack>
            </CardContent>
        </Card>
    );
}
