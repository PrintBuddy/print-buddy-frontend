import { createContext, useContext } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { useUser } from "./UserContext";

import { getAllUsers, updateUser, adjustUserBalance, getUserTransactions } from "../api/user";
import { getAllJobs } from "../api/print";
import { getAllRefunds, resolveRefund } from "../api/refund";
import { getPrinters, updatePrinter } from "../api/printer";


const AdminContext = createContext(null);


export function AdminProvider({ children }) {
    const { user } = useUser();
    const isAdmin = user?.is_admin ?? false;

    const queryClient = useQueryClient();

    // ─── Users ─────────────────────────────────────────────────────────────────
    const usersQuery = useQuery({
        queryKey: ["admin-users"],
        queryFn: getAllUsers,
        enabled: isAdmin,
        staleTime: 1000 * 60 * 2,
        retry: false
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ userId, data }) => updateUser(userId, data),
        onSuccess: () => queryClient.invalidateQueries(["admin-users"])
    });

    const adjustBalanceMutation = useMutation({
        mutationFn: ({ userId, amount }) => adjustUserBalance(userId, amount),
        onSuccess: () => queryClient.invalidateQueries(["admin-users"])
    });

    // ─── All print jobs ────────────────────────────────────────────────────────
    const allJobsQuery = useQuery({
        queryKey: ["admin-jobs"],
        queryFn: getAllJobs,
        enabled: isAdmin,
        staleTime: 1000 * 60 * 1,
        retry: false
    });

    // ─── Printers ──────────────────────────────────────────────────────────────
    const printersQuery = useQuery({
        queryKey: ["printers"],
        queryFn: getPrinters,
        staleTime: 1000 * 30,
        retry: false
    });

    const updatePrinterMutation = useMutation({
        mutationFn: ({ name, data }) => updatePrinter(name, data),
        onSuccess: () => queryClient.invalidateQueries(["printers"])
    });

    // ─── Refunds ───────────────────────────────────────────────────────────────
    const refundsQuery = useQuery({
        queryKey: ["admin-refunds"],
        queryFn: getAllRefunds,
        enabled: isAdmin,
        staleTime: 1000 * 60,
        retry: false
    });

    const resolveRefundMutation = useMutation({
        mutationFn: ({ refundId, status, adminMessage }) =>
            resolveRefund(refundId, status, adminMessage),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-refunds"]);
        }
    });

    const refreshAll = () => {
        queryClient.invalidateQueries(["admin-users"]);
        queryClient.invalidateQueries(["admin-jobs"]);
        queryClient.invalidateQueries(["admin-refunds"]);
        queryClient.invalidateQueries(["printers"]);
    };

    return (
        <AdminContext.Provider value={{
            // users
            users: usersQuery.data ?? [],
            usersLoading: usersQuery.isLoading,
            updateUser: (userId, data) => updateUserMutation.mutateAsync({ userId, data }),
            adjustBalance: (userId, amount) => adjustBalanceMutation.mutateAsync({ userId, amount }),
            getUserTransactions,

            // jobs
            allJobs: allJobsQuery.data ?? [],
            jobsLoading: allJobsQuery.isLoading,

            // printers
            printers: printersQuery.data ?? [],
            printersLoading: printersQuery.isLoading,
            updatePrinter: (name, data) => updatePrinterMutation.mutateAsync({ name, data }),

            // refunds
            refunds: refundsQuery.data ?? [],
            refundsLoading: refundsQuery.isLoading,
            resolveRefund: (refundId, status, adminMessage) =>
                resolveRefundMutation.mutateAsync({ refundId, status, adminMessage }),

            refreshAll,
            isAdmin
        }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    return useContext(AdminContext);
}
