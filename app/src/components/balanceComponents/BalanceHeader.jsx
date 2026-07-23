import { Button } from "@mui/material";

import UserPageHero from "../userViewComponents/UserPageHero";
import BalanceIndicator from "./BalanceIndicator";

export default function BalanceHeader({ user, isLoading, isError, onRequestRecharge }) {

    return (
        <UserPageHero
            title="My Balance"
            description="Track your available credit and review top-up instructions."
            action={
                <Button
                    variant="contained"
                    onClick={onRequestRecharge}
                    sx={{ width: { xs: "100%", md: "auto" } }}
                >
                    Request a Recharge
                </Button>
            }
        >
            <BalanceIndicator user={user} isLoading={isLoading} isError={isError} />
        </UserPageHero>
    );
}
