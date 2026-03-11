import { createContext, useContext } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { useUser } from "./UserContext";

import { getAllUsers, updateUser, adjustUserBalance, rechargeUserBalance, getUserTransactions, deleteUser } from "../api/user";
import { getAllJobs } from "../api/print";
import { getAllRefunds, resolveRefund } from "../api/refund";
import { getPrinters, getAllPrinters, updatePrinter, deletePrinter } from "../api/printer";
import { getGroups, createGroup, updateGroup, deleteGroup } from "../api/group";


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

    const rechargeBalanceMutation = useMutation({
        mutationFn: ({ userId, amount }) => rechargeUserBalance(userId, amount),
        onSuccess: () => queryClient.invalidateQueries(["admin-users"])
    });

    const deleteUserMutation = useMutation({
        mutationFn: (userId) => deleteUser(userId),
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
        queryKey: ["admin-printers"],
        queryFn: getAllPrinters,
        staleTime: 1000 * 30,
        retry: false
    });

    const updatePrinterMutation = useMutation({
        mutationFn: ({ name, data }) => updatePrinter(name, data),
        onSuccess: () => queryClient.invalidateQueries(["admin-printers"])
    });

    const deletePrinterMutation = useMutation({
        mutationFn: (name) => deletePrinter(name),
        onSuccess: () => queryClient.invalidateQueries(["admin-printers"])
    });

    // ─── Groups ────────────────────────────────────────────────────────────────
    const groupsQuery = useQuery({
        queryKey: ["admin-groups"],
        queryFn: getGroups,
        enabled: isAdmin,
        staleTime: 1000 * 60 * 2,
        retry: false
    });

    const createGroupMutation = useMutation({
        mutationFn: (data) => createGroup(data),
        onSuccess: () => queryClient.invalidateQueries(["admin-groups"])
    });

    const updateGroupMutation = useMutation({
        mutationFn: ({ groupId, data }) => updateGroup(groupId, data),
        onSuccess: () => queryClient.invalidateQueries(["admin-groups"])
    });

    const deleteGroupMutation = useMutation({
        mutationFn: (groupId) => deleteGroup(groupId),
        onSuccess: () => queryClient.invalidateQueries(["admin-groups"])
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
        queryClient.invalidateQueries(["admin-printers"]);
        queryClient.invalidateQueries(["admin-groups"]);
    };

    return (
        <AdminContext.Provider value={{
            // users
            users: usersQuery.data ?? [],
            usersLoading: usersQuery.isLoading,
            updateUser: (userId, data) => updateUserMutation.mutateAsync({ userId, data }),
            adjustBalance: (userId, amount) => adjustBalanceMutation.mutateAsync({ userId, amount }),
            rechargeBalance: (userId, amount) => rechargeBalanceMutation.mutateAsync({ userId, amount }),
            deleteUser: (userId) => deleteUserMutation.mutateAsync(userId),
            getUserTransactions,

            // jobs
            allJobs: allJobsQuery.data ?? [],
            jobsLoading: allJobsQuery.isLoading,

            // printers
            printers: printersQuery.data ?? [],
            printersLoading: printersQuery.isLoading,
            updatePrinter: (name, data) => updatePrinterMutation.mutateAsync({ name, data }),
            deletePrinter: (name) => deletePrinterMutation.mutateAsync(name),

            // groups
            groups: groupsQuery.data ?? [],
            groupsLoading: groupsQuery.isLoading,
            createGroup: (data) => createGroupMutation.mutateAsync(data),
            updateGroup: (groupId, data) => updateGroupMutation.mutateAsync({ groupId, data }),
            deleteGroup: (groupId) => deleteGroupMutation.mutateAsync(groupId),

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
