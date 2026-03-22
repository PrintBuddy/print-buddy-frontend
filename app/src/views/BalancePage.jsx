import { useState } from "react";
import { Box, Button, Typography, TextField, Stack } from "@mui/material";
import { useSnackbar } from "notistack";
import { useQuery } from "@tanstack/react-query";

import TransactionsTable from "../components/balanceComponents/TransactionTable";
import BalanceHeader from "../components/balanceComponents/BalanceHeader";
import CustomModal from "../components/utils/CustomModal";
import MoneyInfoAccordion from "../components/balanceComponents/MoneyInfoAccordeon";
import UserSurface from "../components/userViewComponents/UserSurface";

import { useTxs } from "../context/TransactionContext";
import { useUser } from "../context/UserContext";
import { getVoucherRedeemConfig } from "../api/transaction";

export default function BalancePage() {
    
    const { 
        txs, 
        isLoading, 
        errorRedeem,
        setErrorRedeem,
        redeemVoucherCode 
    } = useTxs();

    const { user, isLoading: isLoadingUser, isError: isErrorUser } = useUser();
    const { enqueueSnackbar } = useSnackbar();
    const { data: voucherRedeemConfig } = useQuery({
        queryKey: ["voucher-redeem-config"],
        queryFn: getVoucherRedeemConfig,
        staleTime: 1000 * 60 * 5,
    });

    const [openModal, setOpenModal] = useState(false);
    const [voucherCode, setVoucherCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const voucherRedeemEnabled = voucherRedeemConfig?.enabled ?? true;

    const handleOpen = () => {
        setErrorRedeem("");
        setVoucherCode("");
        setOpenModal(true);

    };

    const handleClose = () => {
        setOpenModal(false);
    };

    const handleRedeem = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await redeemVoucherCode(voucherCode);
            enqueueSnackbar("Voucher redeemed successfully 🎉", { variant: "success" });
            setOpenModal(false);
            setVoucherCode("");
        } catch {
        // Error already handled
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
        <BalanceHeader
            user={user}
            isLoading={isLoadingUser || isErrorUser}
            onClickButton={handleOpen}
            voucherRedeemEnabled={voucherRedeemEnabled}
        />

        <UserSurface title="Recharge Options" description="See the available ways to add credit to your account.">
            <MoneyInfoAccordion />
        </UserSurface>
        

        <UserSurface title="Transaction History" description="Overview of your recent balance changes and credits.">
            <TransactionsTable transactions={txs} isLoading={isLoading} />
        </UserSurface>

        

        {voucherRedeemEnabled && (
            <CustomModal 
                open={openModal}
                onClose={handleClose}
                title="Redeem code"
                isForm
                content={
                    <Stack spacing={2} mt={1}>
                        <Typography>
                            Please insert your code:
                        </Typography>

                        <TextField 
                            label="Voucher code"
                            value={voucherCode}
                            onChange={(e) => setVoucherCode(e.target.value)}
                            fullWidth
                        />

                        {errorRedeem && (
                            <Typography color="error" variant="body2">
                                { errorRedeem }
                            </Typography>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            onClick={handleRedeem}
                            disabled={isSubmitting}
                        >
                            Confirm
                        </Button>
                    </Stack>
                }
                maxWidth="xs"
            />
        )}


        </Box>
    );
}
