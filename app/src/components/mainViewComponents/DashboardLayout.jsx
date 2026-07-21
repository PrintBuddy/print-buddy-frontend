import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { useLocation } from "react-router-dom";

import TopBar from "./TopBar";
import SideBar from "./SideBar";

import ForceLoginModal from "./ForceLoginModal";
import ForceEmailModal from "./ForceEmailModal";
import TutorialGuide from "./TutorialGuide";


export default function DashboardLayout({ children }) {
    const [ mobileOpen, setMobileOpen ] = useState(false);
    const [ tutorialOpen, setTutorialOpen ] = useState(false);
    const isDesktop = useMediaQuery("(min-width:900px)");
    const location = useLocation();
    const isAdminView = location.pathname.startsWith("/admin");

    const drawerWidth = 220;

    const handleDrawerToggle = () => {
        setMobileOpen((prev) => !prev);
    }

    const handleDrawerClose = () => {
        setMobileOpen(false);
    }

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    return (
        <Box>
            

            <ForceLoginModal />
            <ForceEmailModal />
            <TutorialGuide
                open={tutorialOpen}
                onOpen={() => setTutorialOpen(true)}
                onClose={() => setTutorialOpen(false)}
            />

            <TopBar
                onMenuClick={handleDrawerToggle}
                isDesktop={isDesktop}
                isAdminView={isAdminView}
                onOpenTutorial={() => setTutorialOpen(true)}
            />

            <SideBar
                open={mobileOpen}
                onClose={handleDrawerClose}
                isDesktop={isDesktop}
                width={drawerWidth}
                isAdminView={isAdminView}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: isDesktop ? `${drawerWidth}px` : 0,
                    p: 3,
                    mt: 8
                }}
            >
                { children }
            </Box>

        </Box>
    );
}
