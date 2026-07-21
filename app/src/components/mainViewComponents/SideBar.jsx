import { Drawer, Toolbar, List, ListItemButton, ListItemText, ListItemIcon } from "@mui/material";
import { useLocation, Link } from "react-router-dom";

import DescriptionIcon from "@mui/icons-material/Description";
import PrintIcon from "@mui/icons-material/Print";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HistoryIcon from "@mui/icons-material/History";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SettingsIcon from "@mui/icons-material/Settings";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import BarChartIcon from "@mui/icons-material/BarChart";
import GroupsIcon from "@mui/icons-material/Groups";

import { useUser } from "../../context/UserContext";


export default function SideBar({ open, onClose, isDesktop, width, isAdminView }) {

    const location = useLocation();
    const currentPath = location.pathname;
    const { isAdmin } = useUser();

    const menuItems = [
        { text: "Home", icon: <HomeIcon />, path: "/" },
        { text: "Print", icon: <PrintIcon />, path: "/print" },
        { text: "Print history", icon: <HistoryIcon />, path: "/history"},
        { text: "My files", icon: <DescriptionIcon />, path: "/files" },
        { text: "My balance", icon: <AccountBalanceWalletIcon />, path: "/balance" },
        { text: "Extras", icon: <StorefrontIcon />, path: "/extras" },
        { text: "My statistics", icon: <BarChartIcon />, path: "/statistics" },
    ];

    const adminMenuItems = [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
        { text: "Printers", icon: <PrintIcon />, path: "/admin/printers" },
        { text: "Users", icon: <PeopleIcon />, path: "/admin/users" },
        { text: "Groups", icon: <GroupsIcon />, path: "/admin/groups" },
        { text: "Requests", icon: <AssignmentReturnIcon />, path: "/admin/requests" },
        { text: "Supplies", icon: <Inventory2Icon />, path: "/admin/supplies" },
        { text: "Cash Reconciliation", icon: <PriceCheckIcon />, path: "/admin/collections" },
        { text: "Activity Log", icon: <HistoryEduIcon />, path: "/admin/activity" },
        { text: "Statistics", icon: <BarChartIcon />, path: "/admin/statistics" },
        { text: "Settings", icon: <SettingsIcon />, path: "/admin/settings" },
    ];

    const renderItem = ({ text, icon, path }) => (
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
    );

    // Never mix the two sets: on an /admin/* route an admin sees only the
    // admin items; everywhere else, only the regular user items. Which set
    // to show is derived from the route itself (isAdminView), not a
    // separately-tracked mode, so it can't desync from what's on screen.
    const drawerContent = (
        <List disablePadding sx={{ pt: 0.5 }}>
            {isAdminView && isAdmin
                ? adminMenuItems.map(renderItem)
                : menuItems.map(renderItem)}
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
