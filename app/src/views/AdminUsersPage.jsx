import { Box, Button, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useAdmin } from "../context/AdminContext";
import AdminPageHero from "../components/adminComponents/AdminPageHero";
import AdminSurface from "../components/adminComponents/AdminSurface";
import UsersTable from "../components/adminComponents/UsersTable";


export default function AdminUsersPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { users, usersLoading, refreshAll } = useAdmin();

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
            <AdminPageHero
                title="Users"
                description="Manage registered users and search accounts quickly. Open a user to edit details, manage balance, view transactions, or delete the account."
                action={(
                    <Button
                        startIcon={<RefreshIcon />}
                        variant="contained"
                        size="medium"
                        onClick={refreshAll}
                        color="primary"
                        sx={{ width: { xs: "100%", md: "auto" } }}
                    >
                        Refresh
                    </Button>
                )}
            />

            <AdminSurface title="User Directory" description="Search users and click one to open their account.">
                <UsersTable
                    users={users}
                    usersLoading={usersLoading}
                    isMobile={isMobile}
                />
            </AdminSurface>
        </Box>
    );
}
