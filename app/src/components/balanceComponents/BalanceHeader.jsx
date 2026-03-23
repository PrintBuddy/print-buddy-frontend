import { Button, Box, Typography } from "@mui/material";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import LoadingTypography from "../utils/LoadingTypography";
import UserPageHero from "../userViewComponents/UserPageHero";

export default function BalanceHeader({ user, isLoading, onClickButton, voucherRedeemEnabled = true }) {

    return (
        <UserPageHero
            title="My Balance"
            description={
                voucherRedeemEnabled
                    ? "Track your available credit, review top-up instructions, and redeem voucher codes."
                    : "Track your available credit and review top-up instructions."
            }
            action={voucherRedeemEnabled ? (
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AttachMoneyIcon />}
                    onClick={onClickButton}
                    sx={{ width: { xs: "100%", md: "auto" } }}
                >
                    Redeem code
                </Button>
            ) : null}
        >
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                    Available balance
                </Typography>
                <LoadingTypography
                    isLoading={isLoading}
                    variant="h5"
                    color="primary.main"
                    loadingWidth={80}
                    sx={{ fontWeight: 700 }}
                >
                    €{user?.balance?.toFixed(2)}
                </LoadingTypography>
            </Box>
        </UserPageHero>
    );
}
