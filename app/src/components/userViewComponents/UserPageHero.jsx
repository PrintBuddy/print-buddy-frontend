import { useState } from "react";
import { Box, Paper, Stack, Typography, IconButton } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CustomModal from "../utils/CustomModal";

export default function UserPageHero({ title, description, action, children }) {
    const [descOpen, setDescOpen] = useState(false);

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2.25, sm: 3 },
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.paper",
                boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
            }}
        >
            <Stack spacing={2}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={2}
                >
                    <Stack spacing={0.75}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: "1.55rem", sm: "1.85rem" } }}>
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
                {children}
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
