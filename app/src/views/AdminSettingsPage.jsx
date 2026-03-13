


import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import ADConfigSection from "../components/adminSettings/ADConfigSection";
import RechargeInfoSection from "../components/adminSettings/RechargeInfoSection";
import TelegramAdminsSection from "../components/adminSettings/TelegramAdminsSection";
import TonerAlertSection from "../components/adminSettings/TonerAlertSection";

export default function AdminSettingsPage() {

    return (
        <Box>
            <Box mb={3}>
                <Typography variant="h5" fontWeight="bold">Settings</Typography>
                <Typography variant="body2" color="text.secondary">
                    Manage app configuration: recharge info, Telegram bot admins, toner alerts, and AD config.
                </Typography>
            </Box>
            <Stack spacing={2}>
                <RechargeInfoSection />
                <TelegramAdminsSection />
                <TonerAlertSection />
                <ADConfigSection />
            </Stack>
        </Box>
    );
}
