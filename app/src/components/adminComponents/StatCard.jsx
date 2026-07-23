import { Box, Card, CardContent, Skeleton, Stack, Typography } from "@mui/material";

export default function StatCard({ icon, label, value, accentColor, loading, subtitle, action }) {
    return (
        <Card
            elevation={0}
            sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
                boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)"
            }}
        >
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} mb={1}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                        <Box
                            sx={{
                                p: { xs: 0.75, sm: 1 },
                                borderRadius: 2,
                                backgroundColor: `${accentColor}22`,
                                color: accentColor,
                                display: "flex",
                                alignItems: "center",
                                flexShrink: 0,
                            }}
                        >
                            {icon}
                        </Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            lineHeight={1.3}
                            sx={{ fontSize: { xs: "0.72rem", sm: "0.875rem" } }}
                        >
                            {label}
                        </Typography>
                    </Stack>
                    {action}
                </Stack>
                {loading ? (
                    <Skeleton width="55%" height={36} />
                ) : (
                    <Typography
                        fontWeight="bold"
                        sx={{ fontSize: { xs: "1.4rem", sm: "1.75rem", md: "2.125rem" } }}
                    >
                        {value}
                    </Typography>
                )}
                {subtitle && (
                    <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: { xs: "none", sm: "block" } }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
