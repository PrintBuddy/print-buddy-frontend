import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getADConfig, updateADConfig, importADUsers, previewADUsersImport } from "../../api/settings";
import {
    Typography, Stack, FormControlLabel, Switch, TextField, Button, Box, List, ListItem, ListItemText, Divider
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import CustomModal from "../utils/CustomModal";
import SettingsSectionCard from "./SettingsSectionCard";

export default function ADConfigSection() {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const { data, isLoading } = useQuery({
        queryKey: ["admin-ad-config"],
        queryFn: getADConfig,
        staleTime: 1000 * 60 * 5,
    });
    const [form, setForm] = useState({
        enabled: false,
        institution_name: "",
        server: "",
        domain: "",
        base_dn: "",
    });
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [adCredentials, setAdCredentials] = useState({
        username: "",
        pwd: "",
    });
    const [previewResult, setPreviewResult] = useState(null);
    useEffect(() => { if (data) setForm({ ...data }); }, [data]);
    const saveMutation = useMutation({
        mutationFn: async (variables) => {
            const { silent, ...payload } = variables;
            return updateADConfig(payload);
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries(["admin-ad-config"]);
            if (!variables?.silent) {
                enqueueSnackbar("AD config saved.", { variant: "success" });
            }
        },
        onError: (err) => {
            const detail = err?.response?.data?.detail ?? "Failed to save.";
            enqueueSnackbar(detail, { variant: "error" });
        }
    });
    const importMutation = useMutation({
        mutationFn: importADUsers,
        onSuccess: (result) => {
            queryClient.invalidateQueries(["admin-users"]);
            setImportModalOpen(false);
            setAdCredentials({ username: "", pwd: "" });
            setPreviewResult(null);
            enqueueSnackbar(`Imported ${result.imported_count} AD user(s).`, {
                variant: "success"
            });
        },
        onError: (err) => {
            const detail = err?.response?.data?.detail ?? "Failed to import AD users.";
            enqueueSnackbar(detail, { variant: "error" });
        }
    });
    const previewMutation = useMutation({
        mutationFn: previewADUsersImport,
        onSuccess: (result) => {
            setPreviewResult(result);
        },
        onError: (err) => {
            const detail = err?.response?.data?.detail ?? "Failed to preview AD users.";
            enqueueSnackbar(detail, { variant: "error" });
        }
    });
    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));
    const handleCredentialChange = (field, value) => setAdCredentials((current) => ({ ...current, [field]: value }));
    const handleSave = () => saveMutation.mutate(form);
    const openImportModal = () => {
        setPreviewResult(null);
        setImportModalOpen(true);
    };
    const handlePreview = async (event) => {
        event.preventDefault();
        if (!adCredentials.username || !adCredentials.pwd) {
            enqueueSnackbar("Please enter AD credentials.", { variant: "warning" });
            return;
        }

        try {
            await saveMutation.mutateAsync({ ...form, silent: true });
            await previewMutation.mutateAsync(adCredentials);
        } catch {
            // Snackbar feedback is handled in the mutations.
        }
    };
    const handleImport = async (event) => {
        event.preventDefault();
        if (!previewResult) {
            enqueueSnackbar("Preview the AD users before importing.", { variant: "warning" });
            return;
        }

        try {
            await importMutation.mutateAsync(adCredentials);
        } catch {
            // Snackbar feedback is handled in the mutations.
        }
    };
    return (
        <SettingsSectionCard
            title="Active Directory (AD) Config"
            description="Set up directory connection details and import users after previewing the accounts that will be created."
            badge="Directory Sync"
        >
            {isLoading ? (
                <Typography color="text.secondary">Loading…</Typography>
            ) : (
                <Stack spacing={3}>
                    <Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.enabled}
                                    onChange={e => handleChange("enabled", e.target.checked)}
                                />
                            }
                            label={form.enabled ? "AD enabled" : "AD disabled"}
                        />
                    </Box>
                    <Divider />
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                            gap: 2
                        }}
                    >
                        <TextField
                            label="Institution Name"
                            size="small"
                            fullWidth
                            value={form.institution_name}
                            onChange={e => handleChange("institution_name", e.target.value)}
                        />
                        <TextField
                            label="AD Server"
                            size="small"
                            fullWidth
                            value={form.server}
                            onChange={e => handleChange("server", e.target.value)}
                        />
                        <TextField
                            label="AD Domain"
                            size="small"
                            fullWidth
                            value={form.domain}
                            onChange={e => handleChange("domain", e.target.value)}
                        />
                        <TextField
                            label="Base DN"
                            size="small"
                            fullWidth
                            value={form.base_dn}
                            onChange={e => handleChange("base_dn", e.target.value)}
                        />
                    </Box>
                    <Divider />
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button
                            variant="contained"
                            size="medium"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={saveMutation.isPending || importMutation.isPending}
                            sx={{ width: { xs: "100%", sm: "auto" } }}
                        >
                            {saveMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button
                            variant="outlined"
                            size="medium"
                            startIcon={<DownloadIcon />}
                            onClick={openImportModal}
                            disabled={!form.enabled || saveMutation.isPending || importMutation.isPending}
                            sx={{ width: { xs: "100%", sm: "auto" } }}
                        >
                            {importMutation.isPending ? "Importing..." : "Import AD users"}
                        </Button>
                    </Stack>
                </Stack>
            )}
            <CustomModal
                open={importModalOpen}
                onClose={() => {
                    if (importMutation.isPending || saveMutation.isPending || previewMutation.isPending) return;
                    setImportModalOpen(false);
                    setPreviewResult(null);
                }}
                title="Import AD users"
                isForm
                maxWidth="sm"
                content={(
                    <Stack spacing={2} mt={1}>
                        <Typography variant="body2" color="text.secondary">
                            Enter AD credentials to bind against the directory and preview which users will be imported.
                        </Typography>
                        <TextField
                            label="AD Username"
                            value={adCredentials.username}
                            onChange={(e) => handleCredentialChange("username", e.target.value)}
                            fullWidth
                            autoFocus
                        />
                        <TextField
                            label="AD Password"
                            type="password"
                            value={adCredentials.pwd}
                            onChange={(e) => handleCredentialChange("pwd", e.target.value)}
                            fullWidth
                        />
                        {previewResult && (
                            <>
                                <Divider />
                                <Stack spacing={0.5}>
                                    <Typography fontWeight="bold">
                                        {previewResult.importable_count} user(s) will be imported
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {previewResult.detail}
                                    </Typography>
                                </Stack>
                                <List dense sx={{ maxHeight: 260, overflow: "auto", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                                    {previewResult.candidates.map((candidate) => (
                                        <ListItem key={candidate.username}>
                                            <ListItemText
                                                primary={`${candidate.name} ${candidate.surname}`.trim() || candidate.username}
                                                secondary={candidate.username}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                                <Typography variant="body2" color="text.secondary">
                                    Confirm to create these users in the app.
                                </Typography>
                            </>
                        )}
                    </Stack>
                )}
                actions={(
                    <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: "100%" }}>
                        <Button
                            type="button"
                            onClick={() => {
                                setImportModalOpen(false);
                                setPreviewResult(null);
                            }}
                            color="secondary"
                            disabled={saveMutation.isPending || importMutation.isPending || previewMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handlePreview}
                            variant="outlined"
                            disabled={saveMutation.isPending || importMutation.isPending || previewMutation.isPending}
                        >
                            {previewMutation.isPending ? "Loading..." : "Preview"}
                        </Button>
                        <Button
                            type="submit"
                            onClick={handleImport}
                            variant="contained"
                            disabled={!previewResult || saveMutation.isPending || importMutation.isPending || previewMutation.isPending}
                        >
                            {importMutation.isPending ? "Importing..." : "Confirm import"}
                        </Button>
                    </Stack>
                )}
            />
        </SettingsSectionCard>
    );
}
