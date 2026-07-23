import { useEffect, useRef, useState } from "react";
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemText,
    MobileStepper,
    Button,
    useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import HomeIcon from "@mui/icons-material/Home";
import PrintIcon from "@mui/icons-material/Print";
import DescriptionIcon from "@mui/icons-material/Description";
import HistoryIcon from "@mui/icons-material/History";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import StorefrontIcon from "@mui/icons-material/Storefront";
import BarChartIcon from "@mui/icons-material/BarChart";

import { useUser } from "../../context/UserContext";
import tutorialSteps from "./tutorialSteps";

// Mirrors SideBar.jsx's per-page icons, keyed by tutorialSteps' `icon` name.
const STEP_ICONS = {
    home: HomeIcon,
    print: PrintIcon,
    files: DescriptionIcon,
    history: HistoryIcon,
    balance: AccountBalanceWalletIcon,
    extras: StorefrontIcon,
    statistics: BarChartIcon,
};

// First-time onboarding guide. Auto-opens once per user account (backend
// flag `has_seen_tutorial`, mirroring the existing `email_to_set` forced
// -modal pattern) and can be reopened any time via the ? icon in TopBar.
export default function TutorialGuide({ open, onOpen, onClose }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { user, markTutorialSeen } = useUser();

    const [activeStep, setActiveStep] = useState(0);
    // "Shown once" means "auto-triggered once", not "read to completion" —
    // guards against re-firing as `user` refetches (e.g. right after
    // markTutorialSeen's own mutation invalidates the query).
    const hasAutoTriggered = useRef(false);

    useEffect(() => {
        if (user && !user.has_seen_tutorial && !hasAutoTriggered.current) {
            hasAutoTriggered.current = true;
            onOpen();
            markTutorialSeen();
        }
    }, [user, onOpen, markTutorialSeen]);

    useEffect(() => {
        if (open) setActiveStep(0);
    }, [open]);

    const maxSteps = tutorialSteps.length;
    const step = tutorialSteps[activeStep];
    const isLastStep = activeStep === maxSteps - 1;

    const handleNext = () => {
        if (isLastStep) {
            onClose();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const StepIcon = STEP_ICONS[step.icon];

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullScreen={isMobile}
            fullWidth
            maxWidth="xs"
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: "blur(6px)",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                    },
                },
                paper: {
                    sx: isMobile ? { justifyContent: "center" } : undefined,
                },
            }}
        >
            <DialogTitle sx={{ position: "relative", textAlign: "center" }}>
                <IconButton
                    onClick={onClose}
                    aria-label="Close tutorial"
                    size="small"
                    sx={{ position: "absolute", top: 8, right: 8 }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
                {StepIcon ? (
                    <StepIcon color="primary" sx={{ width: 48, height: 48, mb: 1 }} />
                ) : (
                    <Box
                        component="img"
                        src="/printbuddy.png"
                        alt="PrintBuddy logo"
                        sx={{ width: 56, height: 56, mb: 1 }}
                    />
                )}
                <Box>{step.title}</Box>
            </DialogTitle>

            <DialogContent sx={{ minHeight: { xs: "auto", sm: 160 }, flexGrow: 0 }}>
                {Array.isArray(step.body) ? (
                    <List dense sx={{ pt: 0 }}>
                        {step.body.map((line, i) => (
                            <ListItem
                                key={i}
                                sx={{ display: "list-item", listStyleType: "disc", pl: 0, ml: 2.5, py: 0.25 }}
                            >
                                <ListItemText primary={line} slotProps={{ primary: { sx: { fontSize: "1.1rem" } } }} />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography sx={{ fontSize: "1.1rem" }}>{step.body}</Typography>
                )}
            </DialogContent>

            <MobileStepper
                variant="dots"
                steps={maxSteps}
                position="static"
                activeStep={activeStep}
                nextButton={
                    <Button size="small" onClick={handleNext}>
                        {isLastStep ? "Done" : "Next"}
                        {!isLastStep && <KeyboardArrowRight />}
                    </Button>
                }
                backButton={
                    <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                        <KeyboardArrowLeft />
                        Back
                    </Button>
                }
            />
        </Dialog>
    );
}
