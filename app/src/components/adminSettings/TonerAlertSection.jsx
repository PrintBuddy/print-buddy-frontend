import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getTonerAlertConfig, updateTonerAlertConfig, testTonerAlert, getVoucherRedeemConfig, updateVoucherRedeemConfig } from "../../api/settings";
import {
    Typography, Stack, FormControlLabel, Switch, TextField, Button, Box, Divider
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import EmailIcon from "@mui/icons-material/Email";
import SettingsSectionCard from "./SettingsSectionCard";

export default function TonerAlertSection() {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const { data, isLoading } = useQuery({
        queryKey: ["admin-toner-alert"],
        queryFn: getTonerAlertConfig,
        staleTime: 1000 * 60 * 5,
    });
    const { data: voucherData, isLoading: isVoucherLoading } = useQuery({
        queryKey: ["admin-voucher-redeem"],
        queryFn: getVoucherRedeemConfig,
        staleTime: 1000 * 60 * 5,
    });
    const [enabled, setEnabled] = useState(false);
    const [intervalHours, setIntervalHours] = useState(24);
    const [voucherEnabled, setVoucherEnabled] = useState(true);
    const [intervalError, setIntervalError] = useState("");
    const [testing, setTesting] = useState(false);
    useEffect(() => {
        if (data) {
            setEnabled(data.enabled ?? false);
            setIntervalHours(data.interval_hours ?? 24);
        }
    }, [data]);
    useEffect(() => {
        if (voucherData) {
            setVoucherEnabled(voucherData.enabled ?? true);
        }
    }, [voucherData]);
    const saveMutation = useMutation({
        mutationFn: (payload) => updateTonerAlertConfig(payload),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-toner-alert"]);
            enqueueSnackbar("Toner alert settings saved.", { variant: "success" });
        },
        onError: () => enqueueSnackbar("Failed to save toner alert settings.", { variant: "error" }),
    });
    const saveVoucherMutation = useMutation({
        mutationFn: updateVoucherRedeemConfig,
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-voucher-redeem"]);
            queryClient.invalidateQueries(["voucher-redeem-config"]);
            enqueueSnackbar("Voucher redeem setting saved.", { variant: "success" });
        },
        onError: () => enqueueSnackbar("Failed to save voucher redeem setting.", { variant: "error" }),
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
    const handleVoucherSave = () => {
        saveVoucherMutation.mutate({ enabled: voucherEnabled });
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
        <SettingsSectionCard
            title="General Settings"
            description="Manage voucher redemption and operational notifications from one place."
            badge="Controls"
        >
            {isLoading || isVoucherLoading ? (
                <Typography color="text.secondary">Loading…</Typography>
            ) : (
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Voucher Redeem
                        </Typography>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            alignItems={{ xs: "stretch", sm: "center" }}
                            justifyContent="space-between"
                        >
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={voucherEnabled}
                                        onChange={(e) => setVoucherEnabled(e.target.checked)}
                                    />
                                }
                                label={voucherEnabled ? "Voucher redeem enabled" : "Voucher redeem disabled"}
                            />
                            <Button
                                variant="contained"
                                size="medium"
                                startIcon={<SaveIcon />}
                                onClick={handleVoucherSave}
                                disabled={saveVoucherMutation.isPending}
                                sx={{ width: { xs: "100%", sm: "auto" } }}
                            >
                                {saveVoucherMutation.isPending ? "Saving…" : "Save"}
                            </Button>
                        </Stack>
                    </Box>
                    <Stack
                        spacing={2}
                    >
                        <Divider />
                        <Typography variant="subtitle2" fontWeight="bold">
                            Toner Alert Emails
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={enabled}
                                    onChange={(e) => setEnabled(e.target.checked)}
                                />
                            }
                            label={enabled ? "Notifications enabled" : "Notifications disabled"}
                        />
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            alignItems={{ xs: "stretch", md: "flex-start" }}
                        >
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
                                sx={{ width: { xs: "100%", md: 300 } }}
                            />
                        </Stack>
                    </Stack>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                        <Button
                            variant="contained"
                            size="medium"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={saveMutation.isPending}
                            sx={{ width: { xs: "100%", sm: "auto" } }}
                        >
                            Save
                        </Button>
                        <Button
                            variant="outlined"
                            size="medium"
                            startIcon={<EmailIcon />}
                            onClick={handleTest}
                            disabled={testing}
                            sx={{ width: { xs: "100%", sm: "auto" } }}
                        >
                            Send test email
                        </Button>
                    </Stack>
                </Stack>
            )}
        </SettingsSectionCard>
    );
}
