import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getADConfig, updateADConfig } from "../../api/settings";
import {
    Accordion, AccordionSummary, AccordionDetails, Typography, Stack, FormControlLabel, Switch, TextField, Button, Box
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from "@mui/icons-material/Save";

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
    useEffect(() => { if (data) setForm({ ...data }); }, [data]);
    const saveMutation = useMutation({
        mutationFn: updateADConfig,
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-ad-config"]);
            enqueueSnackbar("AD config saved.", { variant: "success" });
        },
        onError: (err) => {
            const detail = err?.response?.data?.detail ?? "Failed to save.";
            enqueueSnackbar(detail, { variant: "error" });
        }
    });
    const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));
    const handleSave = () => saveMutation.mutate(form);
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">Active Directory (AD) Config</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {isLoading ? (
                    <Typography color="text.secondary">Loading…</Typography>
                ) : (
                    <Stack spacing={2}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={form.enabled}
                                    onChange={e => handleChange("enabled", e.target.checked)}
                                />
                            }
                            label={form.enabled ? "AD enabled" : "AD disabled"}
                        />
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
                        <Box>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={saveMutation.isPending}
                            >
                                {saveMutation.isPending ? "Saving…" : "Save"}
                            </Button>
                        </Box>
                    </Stack>
                )}
            </AccordionDetails>
        </Accordion>
    );
}
