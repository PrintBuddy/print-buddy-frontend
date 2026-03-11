import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Stack,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PrintIcon from "@mui/icons-material/Print";
import LockIcon from "@mui/icons-material/Lock";
import { useSnackbar } from "notistack";

import CustomModal from "../utils/CustomModal";
import {
    getGroupDetail,
    addGroupMember,
    removeGroupMember,
    addGroupPrinterPermit,
    updateGroupPrinterPermit,
    removeGroupPrinterPermit,
} from "../../api/group";


function TabPanel({ children, value, index }) {
    return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}


export default function GroupDetailModal({ open, onClose, group, users, printers }) {
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const [tab, setTab] = useState(0);

    // ── Detail fetch ─────────────────────────────────────────────────────────
    const { data: detail, isLoading: detailLoading } = useQuery({
        queryKey: ["group-detail", group?.id],
        queryFn: () => getGroupDetail(group.id),
        enabled: open && Boolean(group?.id),
        staleTime: 0,
    });

    const refresh = () => queryClient.invalidateQueries(["group-detail", group?.id]);

    // ── Members ──────────────────────────────────────────────────────────────
    const [addMemberUser, setAddMemberUser] = useState(null);
    const [memberLoading, setMemberLoading] = useState(false);

    const memberIds = new Set(detail?.members ?? []);
    const availableUsers = (users ?? []).filter((u) => !memberIds.has(u.id));
    const memberUsers = (users ?? []).filter((u) => memberIds.has(u.id));

    const handleAddMember = async () => {
        if (!addMemberUser) return;
        setMemberLoading(true);
        try {
            await addGroupMember(group.id, addMemberUser.id);
            setAddMemberUser(null);
            refresh();
        } catch {
            enqueueSnackbar("Failed to add member.", { variant: "error" });
        } finally {
            setMemberLoading(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await removeGroupMember(group.id, userId);
            refresh();
        } catch {
            enqueueSnackbar("Failed to remove member.", { variant: "error" });
        }
    };

    // ── Printer permits ───────────────────────────────────────────────────────
    const [addPermitPrinter, setAddPermitPrinter] = useState(null);
    const [addPermitBw, setAddPermitBw] = useState("");
    const [addPermitColor, setAddPermitColor] = useState("");
    const [permitLoading, setPermitLoading] = useState(false);

    // Edit state: { printerId, bw, color }
    const [editingPermit, setEditingPermit] = useState(null);

    const permitPrinterIds = new Set((detail?.printer_permits ?? []).map((p) => p.printer_id));
    const availablePrinters = (printers ?? []).filter((p) => !permitPrinterIds.has(p.id ?? p.name));

    const printerById = Object.fromEntries((printers ?? []).map((p) => [p.id ?? p.name, p]));

    const handleAddPermit = async () => {
        if (!addPermitPrinter) return;
        setPermitLoading(true);
        try {
            await addGroupPrinterPermit(group.id, {
                printer_id: addPermitPrinter.id,
                custom_price_bw: addPermitBw !== "" ? parseFloat(addPermitBw) : null,
                custom_price_color: addPermitColor !== "" ? parseFloat(addPermitColor) : null,
            });
            setAddPermitPrinter(null);
            setAddPermitBw("");
            setAddPermitColor("");
            refresh();
        } catch {
            enqueueSnackbar("Failed to add printer permit.", { variant: "error" });
        } finally {
            setPermitLoading(false);
        }
    };

    const handleUpdatePermit = async (printerId) => {
        try {
            await updateGroupPrinterPermit(group.id, printerId, {
                custom_price_bw: editingPermit.bw !== "" ? parseFloat(editingPermit.bw) : null,
                custom_price_color: editingPermit.color !== "" ? parseFloat(editingPermit.color) : null,
            });
            setEditingPermit(null);
            refresh();
        } catch {
            enqueueSnackbar("Failed to update permit.", { variant: "error" });
        }
    };

    const handleRemovePermit = async (printerId) => {
        try {
            await removeGroupPrinterPermit(group.id, printerId);
            refresh();
        } catch {
            enqueueSnackbar("Failed to remove printer permit.", { variant: "error" });
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    const content = detailLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
        </Box>
    ) : (
        <Box>
            {group?.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {group.description}
                </Typography>
            )}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tab label={`Members (${memberIds.size})`} />
                <Tab label={`Printer Permits (${permitPrinterIds.size})`} />
            </Tabs>

            {/* ── Members tab ── */}
            <TabPanel value={tab} index={0}>
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
                                        <IconButton size="small" color="error" onClick={() => handleRemoveMember(u.id)}>
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
                        onClick={handleAddMember}
                    >
                        {memberLoading ? <CircularProgress size={16} /> : "Add"}
                    </Button>
                </Stack>
            </TabPanel>

            {/* ── Printer permits tab ── */}
            <TabPanel value={tab} index={1}>
                {(detail?.printer_permits ?? []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ mb: 2 }}>
                        No printer permits yet.
                    </Typography>
                ) : (
                    <List dense disablePadding sx={{ mb: 1 }}>
                        {(detail?.printer_permits ?? []).map((permit) => {
                            const printer = printerById[permit.printer_id];
                            const isEditing = editingPermit?.printerId === permit.printer_id;
                            return (
                                <ListItem
                                    key={permit.printer_id}
                                    disableGutters
                                    alignItems="flex-start"
                                    secondaryAction={
                                        isEditing ? (
                                            <Stack direction="row" spacing={0.5}>
                                                <Tooltip title="Save">
                                                    <IconButton size="small" color="success" onClick={() => handleUpdatePermit(permit.printer_id)}>
                                                        <CheckIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Cancel">
                                                    <IconButton size="small" onClick={() => setEditingPermit(null)}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        ) : (
                                            <Stack direction="row" spacing={0.5}>
                                                <Tooltip title="Edit prices">
                                                    <IconButton size="small" onClick={() => setEditingPermit({
                                                        printerId: permit.printer_id,
                                                        bw: permit.custom_price_bw ?? "",
                                                        color: permit.custom_price_color ?? "",
                                                    })}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Remove permit">
                                                    <IconButton size="small" color="error" onClick={() => handleRemovePermit(permit.printer_id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        )
                                    }
                                >
                                    <PrintIcon fontSize="small" sx={{ mr: 1, mt: 0.5, color: "text.secondary", flexShrink: 0 }} />
                                    <ListItemText
                                        primary={
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="body2" fontWeight="medium">
                                                    {printer?.name ?? permit.printer_id}
                                                </Typography>
                                                {printer?.is_restricted && (
                                                    <Chip icon={<LockIcon />} label="Restricted" size="small" color="warning" variant="outlined" />
                                                )}
                                            </Stack>
                                        }
                                        secondary={
                                            isEditing ? (
                                                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                                    <TextField
                                                        size="small"
                                                        label="B&W price"
                                                        type="number"
                                                        value={editingPermit.bw}
                                                        onChange={(e) => setEditingPermit((p) => ({ ...p, bw: e.target.value }))}
                                                        placeholder="Default"
                                                        slotProps={{
                                                            input: {
                                                                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                                                inputProps: { min: 0, step: 0.001 }
                                                            }
                                                        }}
                                                        sx={{ width: 130 }}
                                                    />
                                                    <TextField
                                                        size="small"
                                                        label="Color price"
                                                        type="number"
                                                        value={editingPermit.color}
                                                        onChange={(e) => setEditingPermit((p) => ({ ...p, color: e.target.value }))}
                                                        placeholder="Default"
                                                        disabled={!printer?.admits_color}
                                                        slotProps={{
                                                            input: {
                                                                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                                                inputProps: { min: 0, step: 0.001 }
                                                            }
                                                        }}
                                                        sx={{ width: 130 }}
                                                    />
                                                </Stack>
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">
                                                    B&W: {permit.custom_price_bw != null ? `€${permit.custom_price_bw.toFixed(3)}` : "Default"}{" · "}
                                                    Color: {permit.custom_price_color != null ? `€${permit.custom_price_color.toFixed(3)}` : "Default"}
                                                </Typography>
                                            )
                                        }
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                )}
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1}>
                    <Autocomplete
                        size="small"
                        options={availablePrinters}
                        getOptionLabel={(p) => p.name}
                        value={addPermitPrinter}
                        onChange={(_, v) => setAddPermitPrinter(v)}
                        renderInput={(params) => <TextField {...params} label="Add printer" />}
                        isOptionEqualToValue={(o, v) => (o.id ?? o.name) === (v.id ?? v.name)}
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                            size="small"
                            label="Custom B&W price"
                            type="number"
                            value={addPermitBw}
                            onChange={(e) => setAddPermitBw(e.target.value)}
                            placeholder="Default"
                            disabled={!addPermitPrinter}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                    inputProps: { min: 0, step: 0.001 }
                                }
                            }}
                            sx={{ flexGrow: 1 }}
                        />
                        <TextField
                            size="small"
                            label="Custom color price"
                            type="number"
                            value={addPermitColor}
                            onChange={(e) => setAddPermitColor(e.target.value)}
                            placeholder="Default"
                            disabled={!addPermitPrinter || !addPermitPrinter?.admits_color}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                    inputProps: { min: 0, step: 0.001 }
                                }
                            }}
                            sx={{ flexGrow: 1 }}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            disabled={!addPermitPrinter || permitLoading}
                            onClick={handleAddPermit}
                            sx={{ whiteSpace: "nowrap" }}
                        >
                            {permitLoading ? <CircularProgress size={16} /> : "Add"}
                        </Button>
                    </Stack>
                </Stack>
            </TabPanel>
        </Box>
    );

    return (
        <CustomModal
            open={open}
            onClose={onClose}
            title={`Group: ${group?.name ?? ""}`}
            maxWidth="md"
            content={content}
            actions={<Button onClick={onClose}>Close</Button>}
        />
    );
}
