import { useState } from "react";
import { Autocomplete, Button, Chip, CircularProgress, Divider, IconButton, InputAdornment, List, ListItem, ListItemText, Stack, TextField, Tooltip, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import LockIcon from "@mui/icons-material/Lock";
import { useSnackbar } from "../../hooks/useSnackbar";

import { addGroupPrinterPermit, updateGroupPrinterPermit, removeGroupPrinterPermit } from "../../api/group";
import useAsyncAction from "../../hooks/useAsyncAction";
import ConfirmDialog from "../utils/ConfirmDialog";

export default function GroupPrinterPermitsTab({ group, printers, detail, refresh }) {
    const { enqueueSnackbar } = useSnackbar();

    const [addPermitPrinter, setAddPermitPrinter] = useState(null);
    const [addPermitBw, setAddPermitBw] = useState("");
    const [addPermitColor, setAddPermitColor] = useState("");
    // { printerId, bw, color }
    const [editingPermit, setEditingPermit] = useState(null);
    const [removeTarget, setRemoveTarget] = useState(null);

    const permitPrinterIds = new Set((detail?.printer_permits ?? []).map((p) => p.printer_id));
    const availablePrinters = (printers ?? []).filter((p) => !permitPrinterIds.has(p.id ?? p.name));
    const printerById = Object.fromEntries((printers ?? []).map((p) => [p.id ?? p.name, p]));

    const [runAddPermit, permitLoading] = useAsyncAction(
        () => addGroupPrinterPermit(group.id, {
            printer_id: addPermitPrinter.id,
            custom_price_bw: addPermitBw !== "" ? parseFloat(addPermitBw) : null,
            custom_price_color: addPermitColor !== "" ? parseFloat(addPermitColor) : null,
        }),
        {
            onSuccess: () => {
                setAddPermitPrinter(null);
                setAddPermitBw("");
                setAddPermitColor("");
                refresh();
            },
            onError: () => enqueueSnackbar("Failed to add printer permit.", { variant: "error" }),
        }
    );

    const [runUpdatePermit] = useAsyncAction(
        (printerId) => updateGroupPrinterPermit(group.id, printerId, {
            custom_price_bw: editingPermit.bw !== "" ? parseFloat(editingPermit.bw) : null,
            custom_price_color: editingPermit.color !== "" ? parseFloat(editingPermit.color) : null,
        }),
        {
            onSuccess: () => { setEditingPermit(null); refresh(); },
            onError: () => enqueueSnackbar("Failed to update permit.", { variant: "error" }),
        }
    );

    const [runRemovePermit, removeLoading] = useAsyncAction(
        (printerId) => removeGroupPrinterPermit(group.id, printerId),
        {
            onSuccess: () => { refresh(); setRemoveTarget(null); },
            onError: () => { enqueueSnackbar("Failed to remove printer permit.", { variant: "error" }); setRemoveTarget(null); },
        }
    );

    return (
        <>
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
                                                <IconButton size="small" color="success" onClick={() => runUpdatePermit(permit.printer_id)} aria-label="Save">
                                                    <CheckIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Cancel">
                                                <IconButton size="small" onClick={() => setEditingPermit(null)} aria-label="Cancel">
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
                                                })} aria-label="Edit prices">
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Remove permit">
                                                <IconButton size="small" color="error" onClick={() => setRemoveTarget(permit)} aria-label="Remove permit">
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
                        onClick={runAddPermit}
                        sx={{ whiteSpace: "nowrap" }}
                    >
                        {permitLoading ? <CircularProgress size={16} /> : "Add"}
                    </Button>
                </Stack>
            </Stack>

            <ConfirmDialog
                open={Boolean(removeTarget)}
                title="Remove printer permit?"
                message={`Remove this group's permit for "${printerById[removeTarget?.printer_id]?.name ?? removeTarget?.printer_id}"? Members will lose access to that printer through this group.`}
                onClose={() => setRemoveTarget(null)}
                onConfirm={() => runRemovePermit(removeTarget.printer_id)}
                loading={removeLoading}
            />
        </>
    );
}
