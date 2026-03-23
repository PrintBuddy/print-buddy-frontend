import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Button, FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SettingsSectionCard from "./SettingsSectionCard";
import { getVoucherRedeemConfig, updateVoucherRedeemConfig } from "../../api/settings";

export default function VoucherRedeemSection() {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const { data, isLoading } = useQuery({
        queryKey: ["admin-voucher-redeem"],
        queryFn: getVoucherRedeemConfig,
        staleTime: 1000 * 60 * 5,
    });
    const [enabled, setEnabled] = useState(true);

    useEffect(() => {
        if (data) {
            setEnabled(data.enabled ?? true);
        }
    }, [data]);

    const saveMutation = useMutation({
        mutationFn: updateVoucherRedeemConfig,
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-voucher-redeem"]);
            queryClient.invalidateQueries(["voucher-redeem-config"]);
            enqueueSnackbar("Voucher redeem setting saved.", { variant: "success" });
        },
        onError: () => {
            enqueueSnackbar("Failed to save voucher redeem setting.", { variant: "error" });
        },
    });

    const handleSave = () => {
        saveMutation.mutate({ enabled });
    };

    return (
        <SettingsSectionCard
            title="Voucher Redeem"
            description="Enable or disable voucher redemption from the balance page."
            badge="Payments"
            sx={{ height: "auto" }}
        >
            {isLoading ? (
                <Typography color="text.secondary">Loading voucher redeem setting…</Typography>
            ) : (
                <Stack spacing={2}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                            />
                        }
                        label={enabled ? "Voucher redeem enabled" : "Voucher redeem disabled"}
                    />
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
                        <Button
                            variant="contained"
                            size="medium"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={saveMutation.isPending}
                            sx={{ width: { xs: "100%", sm: "auto" } }}
                        >
                            {saveMutation.isPending ? "Saving…" : "Save"}
                        </Button>
                    </Stack>
                </Stack>
            )}
        </SettingsSectionCard>
    );
}
