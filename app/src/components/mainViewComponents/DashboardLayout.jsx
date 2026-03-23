import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { useLocation } from "react-router-dom";

import TopBar from "./TopBar";
import SideBar from "./SideBar";

import ForceLoginModal from "./ForceLoginModal";
import ForceEmailModal from "./ForceEmailModal";


export default function DashboardLayout({ children }) {
    const [ mobileOpen, setMobileOpen ] = useState(false);
    const isDesktop = useMediaQuery("(min-width:900px)");
    const location = useLocation();

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

            <TopBar onMenuClick={handleDrawerToggle} isDesktop={isDesktop} />

            <SideBar
                open={mobileOpen}
                onClose={handleDrawerClose}
                isDesktop={isDesktop}
                width={drawerWidth}
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
