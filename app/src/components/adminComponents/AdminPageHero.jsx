import { useState } from "react";
import { Box, Chip, Paper, Stack, Typography, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CustomModal from "../utils/CustomModal";

export default function AdminPageHero({ eyebrow = "Admin Workspace", title, description, tags = [], action }) {
    const [descOpen, setDescOpen] = useState(false);

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
            }}
        >
            <Stack spacing={2.5}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "flex-start" }}
                    spacing={2}
                >
                    <Stack spacing={1} sx={{ minWidth: 0 }}>
                        <Chip
                            label={eyebrow}
                            size="small"
                            sx={{
                                width: "fit-content",
                                bgcolor: "rgba(25, 118, 210, 0.08)",
                                color: "primary.main",
                                fontWeight: 600,
                            }}
                        />
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: "1.6rem", sm: "1.9rem" } }}>
                                {title}
                            </Typography>
                            {description && (
                                <IconButton
                                    size="small"
                                    aria-label="Section info"
                                    onClick={() => setDescOpen(true)}
                                    sx={{ display: { xs: "inline-flex", sm: "none" } }}
                                >
                                    <InfoOutlinedIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Stack>
                        {description && (
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ maxWidth: 760, display: { xs: "none", sm: "block" } }}
                            >
                                {description}
                            </Typography>
                        )}
                    </Stack>
                    {action && <Box sx={{ width: { xs: "100%", md: "auto" } }}>{action}</Box>}
                </Stack>
                {tags.length > 0 && (
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} useFlexGap flexWrap="wrap">
                        {tags.map((tag) => (
                            <Chip
                                key={tag}
                                label={tag}
                                sx={{ bgcolor: "rgba(25, 118, 210, 0.08)", color: "primary.main" }}
                            />
                        ))}
                    </Stack>
                )}
            </Stack>

            {description && (
                <CustomModal
                    open={descOpen}
                    onClose={() => setDescOpen(false)}
                    title={title}
                    content={description}
                />
            )}
        </Paper>
    );
}
