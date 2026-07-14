import { Box, Paper, Stack, Typography } from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";

export default function PrinterInfoCard({ printer, isMobile }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: isMobile ? { xs: 1.1, sm: 1.5 } : 1.35,
                height: isMobile ? "auto" : 96,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                minWidth: 0,
                overflow: "hidden",
                ...(isMobile ? {} : { display: "flex", flexDirection: "column", justifyContent: "center" }),
            }}
        >
            <Stack direction="row" spacing={isMobile ? { xs: 1, sm: 1.5 } : 1.25} alignItems="center" sx={{ minWidth: 0 }}>
                <Box
                    sx={{
                        width: isMobile ? { xs: 34, sm: 40 } : 38,
                        height: isMobile ? { xs: 34, sm: 40 } : 38,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: isMobile ? 2.5 : 2.25,
                        backgroundColor: "rgba(25,118,210,0.10)",
                        color: "primary.main",
                        flexShrink: 0,
                    }}
                >
                    <PrintIcon fontSize={isMobile ? "small" : "medium"} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant={isMobile ? "body2" : "body1"} fontWeight={700} noWrap>
                        {printer?.name}
                    </Typography>
                    <Typography
                        variant={isMobile ? "caption" : "body2"}
                        color="text.secondary"
                        noWrap
                        sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                        {printer?.location}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
}
