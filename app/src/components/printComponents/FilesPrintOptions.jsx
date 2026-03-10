import { 
    Typography, 
    Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import PrintOptionsForm from "./PrintOptionsForm"


export default function FilesPrintOptions({ files, optionsByFile, onChange, colorDisabled, duplexDisabled, validByFile, setValid }) {
    return (
        <div>
        {files.map((file) => (
            <Accordion key={file.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {validByFile[file.id] === false ? (
                    <CancelIcon color="error" />
                ) : (
                    <CheckCircleIcon color="success" />
                )}
                <Typography
                    sx={{
                        ml: 1
                    }}
                >
                    {file.filename}
                </Typography>
                
            </AccordionSummary>
            <AccordionDetails>
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
        </div>
    );
}