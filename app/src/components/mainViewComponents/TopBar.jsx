import { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Box, Tooltip, Avatar, Menu, MenuItem, CircularProgress, Stack, TextField, Button } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from "@mui/icons-material/Logout";

import { useUser } from "../../context/UserContext";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "notistack";

import { updatePwd } from "../../api/user";
import { getAppInfo } from "../../api/app";

import CustomModal from "../utils/CustomModal";
import LoadingTypography from "../utils/LoadingTypography";


export default function TopBar({ onMenuClick, isDesktop }) {

    const { user, isLoading, isError, updateEmail } = useUser();
    const { logout } = useAuth()
    const { enqueueSnackbar } = useSnackbar();

    const [ anchorEl, setAnchorEl ] = useState(null);
    const open = Boolean(anchorEl);

    const [ openModal, setOpenModal ] = useState(false);
    const [ openEmailModal, setOpenEmailModal ] = useState(false);
    const [ errChangeEmail, setErrChangeEmail ] = useState("");
    const [ isSubmittingEmail, setIsSubmittingEmail ] = useState(false);
    const [ email, setEmail ] = useState("");
        const handleOpenEmailModal = () => {
            setEmail("");
            setErrChangeEmail("");
            setOpenEmailModal(true);
        };

        const validateEmail = (email) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        };

        const handleChangeEmail = async () => {
            setIsSubmittingEmail(true);
            setErrChangeEmail("");
            if (!validateEmail(email)) {
                setErrChangeEmail("Please enter a valid email address.");
                setIsSubmittingEmail(false);
                return;
            }
            const response = await updateEmail(email);
            setIsSubmittingEmail(false);
            if (response.success) {
                setOpenEmailModal(false);
                enqueueSnackbar("Email changed successfully!", { variant: "success" });
            } else {
                setErrChangeEmail(response.message || "Failed to update email.");
            }
        };
    const [ errChangePwd, setErrChangePwd ] = useState("")
    const [ isSubmitting, setIsSubmitting ] = useState(false);
    const [ appName, setAppName ] = useState("PrintBuddy");
    const [ appVersion, setAppVersion ] = useState("0.1.0");
    const [ loadingAppInfo, setLoadingAppInfo ] = useState(false);

    const [ current_pwd, setCurrentPwd ] = useState("");
    const [ new_pwd, setNewPwd ] = useState("");
    
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogOut = () => {
        logout();
        handleMenuClose()
    }

    const handleOpenModal = () => {
        setCurrentPwd("");
        setNewPwd("");
        setErrChangePwd("");
        setOpenModal(true)
    }

    const handleChangePwd = async () => {

        setIsSubmitting(true)

        try {
            const response = await updatePwd(current_pwd, new_pwd);
            setOpenModal(false);
            enqueueSnackbar("Password changed succesfully!", { variant: "success" });
        } catch (err) {
            if (err.response) {
                const status = err.response.status;
                if (status == 404) {
                    setErrChangePwd("User not found!");
                } else if (status == 403) {
                    setErrChangePwd("Incorrect password!")
                }
            } else {
                setErrChangePwd("An error occurred!")
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    useEffect(() => {
        const fetchAppInfo = async () => {
            try {
                setLoadingAppInfo(true);
                const info = await getAppInfo();
                setAppName(info.app);
                setAppVersion(info.version);
            } catch (err) {
                console.error("Failed to fetch app info:", err);
            } finally {
                setLoadingAppInfo(false);
            }
        }
        
        fetchAppInfo();
    }, []);

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                {!isDesktop && (
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={onMenuClick}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                <LoadingTypography
                    variant="h6"
                    noWrap
                    isLoading={isLoading}
                    loadingWidth={200}
                >
                    { appName } v{ appVersion }
                </LoadingTypography>


                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Tooltip title="Account settings">
                        <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                            <Avatar sx={{ bgcolor: "secondary.main" }}>
                                { (isLoading || isError)? (
                                    <CircularProgress color="inherit" size={20}/>
                                    ) : (
                                    user?.name[0]?.toUpperCase()  || "U"
                                )}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: "right", vertical: "top" }}
                        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    >
                        <MenuItem disabled>
                            { user?.username || "User" }
                        </MenuItem>
                        <MenuItem onClick={handleOpenEmailModal}>
                            Change email
                        </MenuItem>
                        <MenuItem onClick={handleOpenModal}>
                            Change password
                        </MenuItem>
                        

            <CustomModal
                open={openEmailModal}
                onClose={() => setOpenEmailModal(false)}
                title="Change email"
                isForm
                maxWidth="xs"
                content={
                    <Stack spacing={2} mt={1}>
                        <Typography>
                            Current email: <b>{user?.email || "(none)"}</b>
                        </Typography>
                        <TextField
                            label="New email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                            autoFocus
                        />
                        {errChangeEmail && (
                            <Typography color="error" variant="body2">
                                {errChangeEmail}
                            </Typography>
                        )}
                        <Button
                            type="submit"
                            variant="contained"
                            onClick={handleChangeEmail}
                            disabled={isSubmittingEmail}
                        >
                            Confirm
                        </Button>
                    </Stack>
                }
            />

                        <MenuItem
                            onClick={handleLogOut}
                        >
                            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
                        </MenuItem>

                    </Menu>
                </Box>

            </Toolbar>

            <CustomModal 
                open={openModal}
                onClose={() => setOpenModal(false)}
                title="Change password"
                isForm
                maxWidth="xs"
                content={
                    <Stack spacing={2} mt={1}>
                        <Typography>
                            Insert current and new password
                        </Typography>

                        <TextField 
                            label="Current password"
                            type="password"
                            onChange={(e) => setCurrentPwd(e.target.value)}
                            fullWidth
                        />

                        <TextField 
                            label="New password"
                            type="password"
                            onChange={(e) => setNewPwd(e.target.value)}
                            fullWidth
                        />

                        {errChangePwd && (
                            <Typography color="error" variant="body2">
                                { errChangePwd }
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            onClick={handleChangePwd}
                            disabled={isSubmitting}
                        >
                            Confirm
                        </Button>

                    </Stack>
                }
            
            />

        </AppBar>
    );
}