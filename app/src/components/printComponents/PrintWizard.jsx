import {
    Box,
    Paper,
    Stack,
    Step,
    StepLabel,
    Stepper,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';

import { usePrint } from '../../context/PrintContext'
import StepUpload from './printSteps/StepUpload';
import StepPrinter from './printSteps/StepPrinter';
import StepPrintPrefs from './printSteps/StepPrintPrefs';
import StepSend from './printSteps/StepSend';
import UserSurface from '../userViewComponents/UserSurface';


const steps = [
    'Upload files',
    'Select printer',
    'Printing preferences',
    'Submit'
]

const stepIcons = [
    <CloudUploadOutlinedIcon fontSize="small" />,
    <PrintOutlinedIcon fontSize="small" />,
    <TuneOutlinedIcon fontSize="small" />,
    <ReceiptLongOutlinedIcon fontSize="small" />,
];


export default function PrintWizard() {
    const { activePrintStep, setActivePrintStep } = usePrint();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const next = () => setActivePrintStep(a => Math.min(a + 1, steps.length - 1));
    const prev = () => setActivePrintStep(a => Math.max(a - 1, 0));

    return (
        <Stack spacing={2.5}>
            <UserSurface
                title="Print your documents"
                sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 3,
                    background: "linear-gradient(180deg, rgba(248,250,252,0.92) 0%, rgba(255,255,255,1) 100%)",
                    "& .MuiTypography-h6": {
                        fontSize: { xs: "1.05rem", sm: "1.15rem" },
                    },
                }}
            >
                <Box
                    sx={{
                        px: { xs: 0, sm: 0.5 },
                        py: { xs: 0.25, sm: 0.5 },
                    }}
                >
                    <Stepper
                        activeStep={activePrintStep}
                        alternativeLabel
                        orientation="horizontal"
                        sx={{
                            width: "100%",
                            "& .MuiStep-root": {
                                minWidth: 0,
                                flex: 1,
                                px: { xs: 0, sm: 1 },
                            },
                            "& .MuiStepLabel-root": {
                                py: 0,
                                width: "100%",
                            },
                            "& .MuiStepLabel-labelContainer": {
                                minWidth: 0,
                            },
                            "& .MuiStepLabel-label": {
                                display: "block",
                                width: "100%",
                                fontSize: { xs: "0.68rem", sm: "0.84rem" },
                                fontWeight: 600,
                                mt: { xs: 0.35, sm: 0.5 },
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            },
                            "& .MuiStepIcon-root": {
                                fontSize: { xs: "1.08rem", sm: "1.1rem" },
                            },
                            "& .MuiSvgIcon-root": {
                                fontSize: { xs: "0.92rem", sm: "1rem" },
                            },
                            "& .MuiStepIcon-root.Mui-active": {
                                color: "primary.main",
                            },
                            "& .MuiStepIcon-root.Mui-completed": {
                                color: "success.main",
                            },
                        }}
                    >
                        {(isMobile ? ["Upload", "Printer", "Options", "Summary"] : steps).map((step, index) => (
                            <Step key={step}>
                                <StepLabel
                                    icon={stepIcons[index]}
                                >
                                    {step}
                                </StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 1.25, sm: 2.5 },
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "background.paper",
                        overflow: "hidden",
                    }}
                >
                    {activePrintStep == 0 && <StepUpload onNext={next} />}
                    {activePrintStep == 1 && <StepPrinter onPrev={prev} onNext={next} />}
                    {activePrintStep == 2 && <StepPrintPrefs onPrev={prev} onNext={next} />}
                    {activePrintStep == 3 && <StepSend onPrev={prev} />}
                </Paper>
            </UserSurface>
        </Stack>

    )
}
