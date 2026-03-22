import { Button, Box, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PrintIcon from '@mui/icons-material/Print';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

import LoadingTypography from "../utils/LoadingTypography";
import UserPageHero from "../userViewComponents/UserPageHero";

export default function MainHeader({ user, isLoading, isError }) {
    const navigate = useNavigate();

    return (
        <UserPageHero
            title={`Welcome${user?.name ? `, ${user.name}` : ""}`}
            description="Start a new print, review recent activity, and keep an eye on your available balance."
            action={(
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", md: "auto" } }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PrintIcon />}
                        onClick={() => navigate("/print")}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                        Print
                    </Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<AttachMoneyIcon />}
                        onClick={() => navigate("/balance")}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                    >
                        Add credit
                    </Button>
                </Stack>
            )}
        >
            <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                    Available balance
                </Typography>
                <LoadingTypography
                    variant="h5"
                    loadingWidth={120}
                    isLoading={isLoading || isError}
                    sx={{ fontWeight: 700, color: "primary.main" }}
                >
                    €{user?.balance?.toFixed(2)}
                </LoadingTypography>
            </Box>
        </UserPageHero>
    );
}
