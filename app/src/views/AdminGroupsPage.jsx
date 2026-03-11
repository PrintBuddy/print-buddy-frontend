import { useState } from "react";
import {
    Box,
    Button,
    Chip,
    IconButton,
    Paper,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupsIcon from "@mui/icons-material/Groups";
import { useSnackbar } from "notistack";

import { useAdmin } from "../context/AdminContext";
import GroupDetailModal from "../components/adminComponents/GroupDetailModal";
import CustomModal from "../components/utils/CustomModal";


function CreateGroupModal({ open, onClose, onCreate }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) { setError("Name is required."); return; }
        setLoading(true);
        setError("");
        try {
            await onCreate({ name: name.trim(), description: description.trim() || null });
            setName("");
            setDescription("");
            onClose();
        } catch (err) {
            setError(err?.response?.data?.detail ?? "Failed to create group.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title="Create Group"
            isForm
            maxWidth="xs"
            content={
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Typography color="error" variant="body2">{error}</Typography>}
                    <TextField
                        label="Group name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        size="small"
                        required
                        autoFocus
                    />
                    <TextField
                        label="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                    />
                </Stack>
            }
            actions={
                <>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button variant="contained" type="submit" disabled={loading} onClick={handleSubmit}>
                        {loading ? "Creating…" : "Create"}
                    </Button>
                </>
            }
        />
    );
}


export default function AdminGroupsPage() {
    const { groups, groupsLoading, users, printers, createGroup, deleteGroup } = useAdmin();
    const { enqueueSnackbar } = useSnackbar();

    const [createOpen, setCreateOpen] = useState(false);
    const [detailGroup, setDetailGroup] = useState(null);

    const handleDelete = async (group) => {
        if (!window.confirm(`Delete group "${group.name}"? This cannot be undone.`)) return;
        try {
            await deleteGroup(group.id);
            enqueueSnackbar(`Group "${group.name}" deleted.`, { variant: "success" });
        } catch {
            enqueueSnackbar("Failed to delete group.", { variant: "error" });
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5" fontWeight="bold">Groups</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    size="small"
                    onClick={() => setCreateOpen(true)}
                >
                    New Group
                </Button>
            </Stack>

            {/* Table */}
            <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Groups control which users can access restricted printers and at what price.
                </Typography>

                {groupsLoading ? (
                    <Stack spacing={1}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} variant="rounded" height={48} />
                        ))}
                    </Stack>
                ) : groups.length === 0 ? (
                    <Stack alignItems="center" spacing={1} py={4} color="text.secondary">
                        <GroupsIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                        <Typography variant="body2">No groups yet. Create one to get started.</Typography>
                    </Stack>
                ) : (
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {groups.map((group) => (
                                <TableRow key={group.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <GroupsIcon fontSize="small" color="action" />
                                            <Typography variant="body2" fontWeight="medium">
                                                {group.name}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {group.description ?? "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" justifyContent="center" spacing={0.5}>
                                            <Tooltip title="Manage members & permits">
                                                <IconButton size="small" onClick={() => setDetailGroup(group)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete group">
                                                <IconButton size="small" color="error" onClick={() => handleDelete(group)}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>

            {/* Modals */}
            <CreateGroupModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreate={createGroup}
            />

            <GroupDetailModal
                open={Boolean(detailGroup)}
                onClose={() => setDetailGroup(null)}
                group={detailGroup}
                users={users}
                printers={printers}
            />

        </Box>
    );
}
