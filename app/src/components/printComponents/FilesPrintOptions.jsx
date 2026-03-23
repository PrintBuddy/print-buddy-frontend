import { 
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    Stack,
    Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import PrintOptionsForm from "./PrintOptionsForm"


export default function FilesPrintOptions({ files, optionsByFile, onChange, colorDisabled, duplexDisabled, validByFile, setValid }) {
    return (
        <Box
            sx={{
                maxHeight: { xs: "none", sm: "min(34vh, 340px)" },
                overflowY: { xs: "visible", sm: "auto" },
                pr: { xs: 0, sm: 0.5 },
            }}
        >
        {files.map((file) => (
            <Accordion
                key={file.id}
                defaultExpanded={files.length === 1}
                disableGutters
                elevation={0}
                sx={{
                    mb: 1.5,
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:before": {
                        display: "none",
                    },
                }}
            >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    "& .MuiAccordionSummary-content": {
                        my: 1.5,
                        width: "100%",
                        minWidth: 0,
                    },
                    "& .MuiAccordionSummary-expandIconWrapper": {
                        alignSelf: { xs: "flex-start", sm: "center" },
                        mt: { xs: 0.5, sm: 0 },
                    },
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.25}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    sx={{ width: "100%", mr: 1, minWidth: 0 }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: { xs: "flex-start", sm: "center" },
                            gap: 1,
                            flex: 1,
                            width: "100%",
                            maxWidth: "100%",
                            minWidth: 0,
                        }}
                    >
                        {validByFile[file.id] === false ? (
                            <CancelIcon color="error" sx={{ mt: { xs: 0.25, sm: 0 }, flexShrink: 0 }} />
                        ) : (
                            <CheckCircleIcon color="success" sx={{ mt: { xs: 0.25, sm: 0 }, flexShrink: 0 }} />
                        )}
                        <Typography
                            sx={{
                                fontWeight: 700,
                                display: "block",
                                flex: 1,
                                maxWidth: "100%",
                                minWidth: 0,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {file.filename}
                        </Typography>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{
                            width: { xs: "100%", sm: "auto" },
                            flexShrink: 0,
                            alignSelf: { xs: "stretch", sm: "center" },
                        }}
                    >
                        <Chip size="small" variant="outlined" label={`${file.pages} pages`} sx={{ borderRadius: 999 }} />
                        <Chip size="small" variant="outlined" label={`${Math.round(file.size_bytes / 1024)} KB`} sx={{ borderRadius: 999 }} />
                    </Stack>
                </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 2.5 }}>
                <PrintOptionsForm
                    options={optionsByFile[file.id] ?? {
                        colorMode: "B&W",
                        sides: "1S",
                        copies: 1,
                        pageRanges: "",
                        numberUp: 1
                    }}
                    onChange={(newOpts) => onChange(file.id, newOpts)}
                    colorDisabled={!colorDisabled}
                    duplexDisabled={duplexDisabled}
                    totalPages={file.pages}
                    changeValid={(valid) => setValid(file.id, valid)}
                />
            </AccordionDetails>
            </Accordion>
        ))}
        </Box>
    );
}
