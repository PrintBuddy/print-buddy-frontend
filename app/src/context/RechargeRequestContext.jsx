import { createContext, useContext } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import {
    getEligibleAdmins,
    createRechargeRequest,
    getMyRechargeRequests,
} from "../api/rechargeRequest";
import { useAuth } from "./AuthContext";


const RechargeRequestContext = createContext(null);


export function RechargeRequestProvider({ children }) {
    const { statusLoggedIn } = useAuth();
    const queryClient = useQueryClient();

    const adminsQuery = useQuery({
        queryKey: ["recharge-request-admins"],
        queryFn: getEligibleAdmins,
        enabled: statusLoggedIn === "loggedIn",
        staleTime: 1000 * 60 * 5,
        retry: false,
    });

    // A request's status can flip from either the web app or Telegram —
    // a long staleTime here would silently hide that change from the
    // requester exactly the way it once did on the print-history page, so
    // this refetches readily instead of trusting a stale cache.
    const myRequestsQuery = useQuery({
        queryKey: ["my-recharge-requests"],
        queryFn: getMyRechargeRequests,
        enabled: statusLoggedIn === "loggedIn",
        staleTime: 1000 * 15,
        refetchOnWindowFocus: true,
        retry: false,
    });

    const createRequestMutation = useMutation({
        mutationFn: ({ amount, method, targetTelegramAdminId, message }) =>
            createRechargeRequest(amount, method, targetTelegramAdminId, message),
        onSuccess: () => queryClient.invalidateQueries(["my-recharge-requests"]),
    });

    return (
        <RechargeRequestContext.Provider
            value={{
                eligibleAdmins: adminsQuery.data ?? [],
                adminsLoading: adminsQuery.isLoading,
                myRequests: myRequestsQuery.data ?? [],
                myRequestsLoading: myRequestsQuery.isLoading,
                createRequest: (amount, method, targetTelegramAdminId, message) =>
                    createRequestMutation.mutateAsync({ amount, method, targetTelegramAdminId, message }),
                refreshMyRequests: () => queryClient.invalidateQueries(["my-recharge-requests"]),
            }}
        >
            {children}
        </RechargeRequestContext.Provider>
    );
}

export function useRechargeRequests() {
    return useContext(RechargeRequestContext);
}
