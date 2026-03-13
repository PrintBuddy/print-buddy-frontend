import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getTonerAlertConfig, updateTonerAlertConfig, testTonerAlert } from "../../api/settings";
import {
    Accordion, AccordionSummary, AccordionDetails, Typography, Stack, FormControlLabel, Switch, TextField, Button, Box
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from "@mui/icons-material/Save";
import EmailIcon from "@mui/icons-material/Email";

export default function TonerAlertSection() {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const { data, isLoading } = useQuery({
        queryKey: ["admin-toner-alert"],
        queryFn: getTonerAlertConfig,
        staleTime: 1000 * 60 * 5,
    });
    const [enabled, setEnabled] = useState(false);
    const [intervalHours, setIntervalHours] = useState(24);
    const [intervalError, setIntervalError] = useState("");
    const [testing, setTesting] = useState(false);
    useEffect(() => {
        if (data) {
            setEnabled(data.enabled ?? false);
            setIntervalHours(data.interval_hours ?? 24);
        }
    }, [data]);
    const saveMutation = useMutation({
        mutationFn: (payload) => updateTonerAlertConfig(payload),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-toner-alert"]);
            enqueueSnackbar("Toner alert settings saved.", { variant: "success" });
        },
        onError: () => enqueueSnackbar("Failed to save toner alert settings.", { variant: "error" }),
    });
    const handleSave = () => {
        const hours = parseInt(intervalHours, 10);
        if (isNaN(hours) || hours < 1) {
            setIntervalError("Must be at least 1 hour.");
            return;
        }
        setIntervalError("");
        saveMutation.mutate({ enabled, interval_hours: hours });
    };
    const handleTest = async () => {
        setTesting(true);
        try {
            const res = await testTonerAlert();
            enqueueSnackbar(res.detail ?? "Test email sent.", { variant: "success" });
        } catch (err) {
            const detail = err?.response?.data?.detail ?? "Failed to send test email.";
            enqueueSnackbar(detail, { variant: "error" });
        } finally {
            setTesting(false);
        }
    };
    return (
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="bold">Toner Alert Emails</Typography>
            </AccordionSummary>
            <AccordionDetails>
                {isLoading ? (
                    <Typography color="text.secondary">Loading…</Typography>
                ) : (
                    <Stack spacing={2}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={enabled}
                                    onChange={(e) => setEnabled(e.target.checked)}
                                />
                            }
                            label={enabled ? "Notifications enabled" : "Notifications disabled"}
                        />
                        <TextField
                            label="Repeat notification every (hours)"
                            type="number"
                            size="small"
                            value={intervalHours}
                            onChange={(e) => setIntervalHours(e.target.value)}
                            disabled={!enabled}
                            error={Boolean(intervalError)}
                            helperText={intervalError || "While toner remains low, re-send the alert at this interval."}
                            inputProps={{ min: 1 }}
                            sx={{ maxWidth: 300 }}
                        />
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={saveMutation.isPending}
                            >
                                Save
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<EmailIcon />}
                                onClick={handleTest}
                                disabled={testing}
                            >
                                Send test email
                            </Button>
                        </Stack>
                    </Stack>
                )}
            </AccordionDetails>
        </Accordion>
    );
}
