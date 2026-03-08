import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Paper,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, useMemo } from "react";
import JobRow from "./JobRow";
import SkeletonRow from "./SkeletonRow";
import JobDetailsModal from "./JobDetailsModal";


export default function HistoryTable({ jobs, isLoading, renderStatusIcon }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [selectedJob, setSelectedJob] = useState(null);

    const skeletonRows = Array.from({ length: 5 });

    const sortedJobs = useMemo(() => {
        return [...(jobs || [])].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
        );
    }, [jobs]);

    return (
        <>
        <TableContainer
            component={Paper}
            sx={{
            mt: 2,
            maxHeight: "calc(80vh - 200px)",
            overflowY: "auto",
            }}
        >
            <Table>
            {!isMobile && (
                <TableHead>
                <TableRow>
                    <TableCell></TableCell>
                    <TableCell>File Name</TableCell>
                    <TableCell>Printer</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created at</TableCell>
                    <TableCell>Completed at</TableCell>
                </TableRow>
                </TableHead>
            )}

            <TableBody>
                {isLoading ? (
                skeletonRows.map((_, i) => <SkeletonRow key={i} isMobile={isMobile} />)
                ) : jobs?.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                        No jobs found
                    </Typography>
                    </TableCell>
                </TableRow>
                ) : (
                sortedJobs?.map((job) => (
                    <JobRow
                        key={job.id}
                        job={job}
                        isMobile={isMobile}
                        renderStatusIcon={renderStatusIcon}
                        onClick={() => setSelectedJob(job)}
                    />
                ))
                )}
            </TableBody>
            </Table>
        </TableContainer>

        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        </>
    );
}