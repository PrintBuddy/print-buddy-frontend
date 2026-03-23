import { Box, Button, Stack, Typography } from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import HistoryTable from "../historyJobComponents/HistoryTable";
import UserSurface from "../userViewComponents/UserSurface";


export default function RecentJobsCard({ jobs, isLoading, onViewAll, renderStatusIcon }) {
    return (
        <UserSurface>
            <Box
                sx={{
                    position: "relative",
                    pr: { xs: 0, sm: 12 },
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight={700}>
                        Recent Jobs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Your latest print jobs and their current status.
                    </Typography>
                </Stack>
                <Button
                    variant="text"
                    size="small"
                    endIcon={<HistoryIcon />}
                    sx={{
                        position: { xs: "static", sm: "absolute" },
                        top: 0,
                        right: 0,
                        mt: { xs: 1, sm: 0 },
                        alignSelf: { xs: "flex-end", sm: "auto" }
                    }}
                    onClick={onViewAll}
                >
                    View all
                </Button>
            </Box>

            <HistoryTable
                jobs={jobs}
                isLoading={isLoading}
                renderStatusIcon={renderStatusIcon}
            />
        </UserSurface>
    );
}
