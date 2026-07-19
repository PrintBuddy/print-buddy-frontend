import { useState } from "react";
import { Box, Button } from "@mui/material";
import { useSnackbar } from "notistack";

import TransactionsTable from "../components/balanceComponents/TransactionTable";
import BalanceHeader from "../components/balanceComponents/BalanceHeader";
import MoneyInfoAccordion from "../components/balanceComponents/MoneyInfoAccordeon";
import RequestRechargeModal from "../components/balanceComponents/RequestRechargeModal";
import RechargeRequestsTable from "../components/balanceComponents/RechargeRequestsTable";
import UserSurface from "../components/userViewComponents/UserSurface";

import { useTxs } from "../context/TransactionContext";
import { useUser } from "../context/UserContext";
import { useRechargeRequests } from "../context/RechargeRequestContext";

export default function BalancePage() {

    const { txs, isLoading } = useTxs();
    const { user, isLoading: isLoadingUser, isError: isErrorUser } = useUser();
    const { eligibleAdmins, myRequests, myRequestsLoading, createRequest } = useRechargeRequests();
    const { enqueueSnackbar } = useSnackbar();
    const [requestModalOpen, setRequestModalOpen] = useState(false);

    const handleSubmitRequest = async (amount, method, adminId, message) => {
        await createRequest(amount, method, adminId, message);
        enqueueSnackbar("Recharge requested — waiting for approval.", { variant: "success" });
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}>
        <BalanceHeader
            user={user}
            isLoading={isLoadingUser}
            isError={isErrorUser}
        />

        <UserSurface title="Recharge Options" description="See the available ways to add credit to your account.">
            <MoneyInfoAccordion />
        </UserSurface>

        <UserSurface
            title="Recharge Requests"
            description="Already paid an admin? Let us know and they'll approve it from Telegram or the admin panel."
        >
            <Button variant="contained" onClick={() => setRequestModalOpen(true)} sx={{ width: { xs: "100%", sm: "auto" } }}>
                Request a Recharge
            </Button>
            <RechargeRequestsTable requests={myRequests} isLoading={myRequestsLoading} />
        </UserSurface>

        <UserSurface title="Transaction History" description="Overview of your recent balance changes and credits.">
            <TransactionsTable transactions={txs} isLoading={isLoading} />
        </UserSurface>

        <RequestRechargeModal
            open={requestModalOpen}
            onClose={() => setRequestModalOpen(false)}
            eligibleAdmins={eligibleAdmins}
            onSubmit={handleSubmitRequest}
        />

        </Box>
    );
}
