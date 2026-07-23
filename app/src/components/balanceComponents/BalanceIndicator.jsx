import { Box, Typography } from "@mui/material";

import LoadingTypography from "../utils/LoadingTypography";

export default function BalanceIndicator({ user, isLoading, isError }) {
    return (
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
                Available balance
            </Typography>
            {isError ? (
                <Typography variant="h5" color="error.main" sx={{ fontWeight: 700 }}>
                    Unavailable
                </Typography>
            ) : (
                <LoadingTypography
                    isLoading={isLoading}
                    variant="h5"
                    color="primary.main"
                    loadingWidth={80}
                    sx={{ fontWeight: 700 }}
                >
                    €{user?.balance?.toFixed(2)}
                </LoadingTypography>
            )}
        </Box>
    );
}
