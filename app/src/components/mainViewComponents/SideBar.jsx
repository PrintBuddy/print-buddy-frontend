import { Drawer, Toolbar, List, ListItemButton, ListItemText, ListItemIcon, Divider, Typography } from "@mui/material";
import { useLocation, Link } from "react-router-dom";

import DescriptionIcon from "@mui/icons-material/Description";
import PrintIcon from "@mui/icons-material/Print";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HistoryIcon from "@mui/icons-material/History";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import BarChartIcon from "@mui/icons-material/BarChart";
import GroupsIcon from "@mui/icons-material/Groups";

import { useUser } from "../../context/UserContext";


export default function SideBar({ open, onClose, isDesktop, width }) {

    const location = useLocation();
    const currentPath = location.pathname;
    const { user } = useUser();
    const isAdmin = user?.is_admin ?? false;

    const menuItems = [
        { text: "Home", icon: <HomeIcon />, path: "/" },
        { text: "My files", icon: <DescriptionIcon />, path: "/files" },
        { text: "Print", icon: <PrintIcon />, path: "/print" },
        { text: "Print history", icon: <HistoryIcon />, path: "/history"},
        { text: "My balance", icon: <AccountBalanceWalletIcon />, path: "/balance" },
        { text: "My statistics", icon: <BarChartIcon />, path: "/statistics" },
    ];

    const adminMenuItems = [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
        { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
        { text: "Groups", icon: <GroupsIcon />, path: "/admin/groups" },
        { text: "Refunds", icon: <AssignmentReturnIcon />, path: "/admin/refunds" },
        { text: "Activity Log", icon: <HistoryEduIcon />, path: "/admin/activity" },
        { text: "Statistics", icon: <BarChartIcon />, path: "/admin/statistics" },
        { text: "Settings", icon: <SettingsIcon />, path: "/admin/settings" },
    ];

    const drawerContent = (
        <List disablePadding sx={{ pt: 0.5 }}>
            {menuItems.map(({ text, icon, path}) => (
                <ListItemButton 
                    key={text}
                    component={Link}
                    to={path}
                    selected={currentPath == path}
                    sx={{ py: 0.75, px: 2 }}
                >
                    <ListItemIcon sx={{ minWidth: 38 }}>
                        {icon}
                    </ListItemIcon>
                    <ListItemText primary={text} />
                </ListItemButton>
            ))}

            {isAdmin && (
                <>
                    <Divider sx={{ my: 0.75 }} />
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ pl: 2, pb: 0.25, display: "block" }}
                    >
                        Admin
                    </Typography>
                    {adminMenuItems.map(({ text, icon, path }) => (
                        <ListItemButton
                            key={text}
                            component={Link}
                            to={path}
                            selected={currentPath === path}
                            sx={{ py: 0.75, px: 2 }}
                        >
                            <ListItemIcon sx={{ minWidth: 38 }}>
                                {icon}
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    ))}
                </>
            )}
        </List>
    );

    if (isDesktop) {
        return (
            <Drawer
                variant="permanent"
                sx={{
                    width,
                    [`& .MuiDrawer-paper`]: {
                        width,
                        boxSizing: "border-box"
                    }
                }}
                open
            >
                <Toolbar />
                { drawerContent }
            </Drawer>
        )
    }

    return (
        <Drawer
            variant="temporary"
            open={open}
            onClose={onClose}
            ModalProps={{ keepMounted: true }}
            sx={{
                display: { xs: "block", md: "none" },
                [`& .MuiDrawer-paper`]: {
                    width,
                    boxSizing: "border-box",
                },
            }}
        >
            <Toolbar />
            { drawerContent }
        </Drawer>
    )

}