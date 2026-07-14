import { Box, Skeleton, Stack, Typography } from "@mui/material";

export default function FinanceBreakdownItem({ icon, label, value, color, subtitle, loading }) {
    return (
        <Box
            sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                flex: 1,
                minWidth: 0,
            }}
        >
            <Stack direction="row" alignItems="center" spacing={0.7} mb={0.5}>
                <Box sx={{ color, display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</Box>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" }, lineHeight: 1.3 }}
                >
                    {label}
                </Typography>
            </Stack>
            {loading ? (
                <Skeleton width="65%" height={26} />
            ) : (
                <Typography
                    fontWeight="bold"
                    color={color}
                    sx={{ fontSize: { xs: "1rem", sm: "1.3rem" } }}
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
        </Box>
    );
}
