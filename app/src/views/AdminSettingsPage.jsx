
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import ADConfigSection from "../components/adminSettings/ADConfigSection";
import RechargeInfoSection from "../components/adminSettings/RechargeInfoSection";
import TelegramAdminsSection from "../components/adminSettings/TelegramAdminsSection";
import TonerAlertSection from "../components/adminSettings/TonerAlertSection";

export default function AdminSettingsPage() {

    return (
        <Stack spacing={3}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2.5, sm: 3.5 },
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.paper",
                    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)"
                }}
            >
                <Stack spacing={2}>
                    <Stack spacing={1}>
                        <Chip
                            label="Admin Workspace"
                            size="small"
                            sx={{
                                width: "fit-content",
                                bgcolor: "rgba(25, 118, 210, 0.08)",
                                color: "primary.main",
                                fontWeight: 600
                            }}
                        />
                        <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: "1.6rem", sm: "1.9rem" } }}>
                            Settings
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
                            Configure payments, alerts, admin access, and directory sync from one place.
                        </Typography>
                    </Stack>
                </Stack>
            </Paper>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
                    gap: 3,
                    alignItems: "start"
                }}
            >
                <RechargeInfoSection />
                <TelegramAdminsSection />
                <ADConfigSection />
                <TonerAlertSection />
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">
                    On smaller screens, each settings card stacks into a single column so actions and fields stay easy to use.
                </Typography>
            </Box>
        </Stack>
    );
}
