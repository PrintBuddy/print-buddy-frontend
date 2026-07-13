import { Box } from "@mui/material";

import TransactionsTable from "../components/balanceComponents/TransactionTable";
import BalanceHeader from "../components/balanceComponents/BalanceHeader";
import MoneyInfoAccordion from "../components/balanceComponents/MoneyInfoAccordeon";
import UserSurface from "../components/userViewComponents/UserSurface";

import { useTxs } from "../context/TransactionContext";
import { useUser } from "../context/UserContext";

export default function BalancePage() {

    const { txs, isLoading } = useTxs();
    const { user, isLoading: isLoadingUser, isError: isErrorUser } = useUser();

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

        <UserSurface title="Transaction History" description="Overview of your recent balance changes and credits.">
            <TransactionsTable transactions={txs} isLoading={isLoading} />
        </UserSurface>

        </Box>
    );
}
