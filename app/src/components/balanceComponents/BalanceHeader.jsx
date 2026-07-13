import { Box, Typography } from "@mui/material";

import LoadingTypography from "../utils/LoadingTypography";
import UserPageHero from "../userViewComponents/UserPageHero";

export default function BalanceHeader({ user, isLoading, isError }) {

    return (
        <UserPageHero
            title="My Balance"
            description="Track your available credit and review top-up instructions."
        >
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
        </UserPageHero>
    );
}
