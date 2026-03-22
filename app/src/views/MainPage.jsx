import { Box, Grid } from "@mui/material";
import { useUser } from "../context/UserContext";
import { useFile } from "../context/FileContext";
import { usePrint } from "../context/PrintContext";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

import { renderStatusIcon } from "../components/utils/RenderStatusIcon";
import MainHeader from "../components/mainPageComponents/MainHeader";
import RecentJobsCard from "../components/mainPageComponents/RecentJobsCard";
import RecentFilesCard from "../components/mainPageComponents/RecentFilesCard";

export default function MainPage() {
    const { user, isLoading, isError } = useUser();
    const { jobs, isLoading: isLoadingJobs } = usePrint();
    const { files, isLoading: isLoadingFiles } = useFile();
    const navigate = useNavigate();

    const sortedJobs = useMemo(() => {
        return [...(jobs || [])].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
        );
    }, [jobs]);

    const sortedFiles = useMemo(() => {
        return [...(files || [])].sort((a, b) => 
        new Date(b.uploaded_at) - new Date(a.uploaded_at)
        );
    }, [files]);

    const recentFiles = sortedFiles?.slice(0, 5) || [];
    const recentJobs = sortedJobs?.slice(0, 5) || [];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
        <MainHeader user={user} isLoading={isLoading} isError={isError} />

        <Grid container spacing={2} sx={{ width: "100%" }}>
            <Grid size={{ xs: 12, sm: 12, md: 9, lg: 9, xl: 9 }} >
            <RecentJobsCard
                jobs={recentJobs}
                isLoading={isLoadingJobs}
                onViewAll={() => navigate("/history")}
                renderStatusIcon={renderStatusIcon}
            />
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 3, lg: 3, xl: 3 }}>
            <RecentFilesCard
                files={recentFiles}
                isLoading={isLoadingFiles}
                onViewAll={() => navigate("/files")}
            />
            </Grid>
        </Grid>
        </Box>
    );
}
