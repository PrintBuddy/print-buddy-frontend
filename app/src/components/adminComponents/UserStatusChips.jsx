import { Chip } from "@mui/material";

export default function UserStatusChips({ user }) {
    return (
        <>
            {user?.is_admin && <Chip label="Admin" color="primary" size="small" />}
            {!user?.is_active && <Chip label="Inactive" color="error" size="small" />}
        </>
    );
}
