import { useState } from "react";
import { Autocomplete, Button, CircularProgress, Divider, IconButton, List, ListItem, ListItemText, Stack, TextField, Tooltip, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import { useSnackbar } from "../../hooks/useSnackbar";

import { addGroupMember, removeGroupMember } from "../../api/group";
import useAsyncAction from "../../hooks/useAsyncAction";
import ConfirmDialog from "../utils/ConfirmDialog";

export default function GroupMembersTab({ group, users, detail, refresh }) {
    const { enqueueSnackbar } = useSnackbar();
    const [addMemberUser, setAddMemberUser] = useState(null);
    const [removeTarget, setRemoveTarget] = useState(null);

    const memberIds = new Set(detail?.members ?? []);
    const availableUsers = (users ?? []).filter((u) => !memberIds.has(u.id));
    const memberUsers = (users ?? []).filter((u) => memberIds.has(u.id));

    const [runAddMember, memberLoading] = useAsyncAction(
        () => addGroupMember(group.id, addMemberUser.id),
        {
            onSuccess: () => { setAddMemberUser(null); refresh(); },
            onError: () => enqueueSnackbar("Failed to add member.", { variant: "error" }),
        }
    );

    const [runRemoveMember, removeLoading] = useAsyncAction(
        (userId) => removeGroupMember(group.id, userId),
        {
            onSuccess: () => { refresh(); setRemoveTarget(null); },
            onError: () => { enqueueSnackbar("Failed to remove member.", { variant: "error" }); setRemoveTarget(null); },
        }
    );

    return (
        <>
            {memberUsers.length === 0 ? (
                <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mb: 2 }}>
                    No members yet.
                </Typography>
            ) : (
                <List dense disablePadding sx={{ mb: 1 }}>
                    {memberUsers.map((u) => (
                        <ListItem
                            key={u.id}
                            disableGutters
                            secondaryAction={
                                <Tooltip title="Remove from group">
                                    <IconButton size="small" color="error" onClick={() => setRemoveTarget(u)} aria-label="Remove from group">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            }
                        >
                            <PersonIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                            <ListItemText
                                primary={u.username}
                                secondary={`${u.name} ${u.surname} · ${u.email}`}
                            />
                        </ListItem>
                    ))}
                </List>
            )}
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={1} alignItems="center">
                <Autocomplete
                    size="small"
                    options={availableUsers}
                    getOptionLabel={(u) => `${u.username} — ${u.name} ${u.surname}`}
                    value={addMemberUser}
                    onChange={(_, v) => setAddMemberUser(v)}
                    renderInput={(params) => <TextField {...params} label="Add user" />}
                    sx={{ flexGrow: 1 }}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                />
                <Button
                    variant="contained"
                    size="small"
                    disabled={!addMemberUser || memberLoading}
                    onClick={runAddMember}
                >
                    {memberLoading ? <CircularProgress size={16} /> : "Add"}
                </Button>
            </Stack>

            <ConfirmDialog
                open={Boolean(removeTarget)}
                title="Remove member?"
                message={`Remove @${removeTarget?.username} from "${group?.name}"? They will lose access to this group's restricted printers and pricing.`}
                onClose={() => setRemoveTarget(null)}
                onConfirm={() => runRemoveMember(removeTarget.id)}
                loading={removeLoading}
            />
        </>
    );
}
