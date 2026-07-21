import { createContext, useContext } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { useUser } from "./UserContext";

import { getAllUsers, updateUser, adjustUserBalance, rechargeUserBalance, getUserTransactions, deleteUser } from "../api/user";
import { getAllJobs, freeReprint } from "../api/print";
import { getAllRefunds, resolveRefund, overrideRefund } from "../api/refund";
import { getPendingRechargeRequests, getAllRechargeRequests, resolveRechargeRequest } from "../api/rechargeRequest";
import { getOutstandingFloats, collectFromAdmin, payAdmin, getCollectionHistory } from "../api/collectionEvent";
import { createExpense, getAllExpenses } from "../api/expense";
import { getAllInventoryItems, createInventoryItem, updateInventoryItem, adjustStock, restockItem } from "../api/inventory";
import { getAllProductsAdmin, createProduct, updateProduct, deleteProduct, getPendingPurchases, getAllPurchases, resolvePurchase } from "../api/product";
import { getAllPrinters, updatePrinter, deletePrinter } from "../api/printer";
import { getGroups, createGroup, updateGroup, deleteGroup } from "../api/group";
import { getStatsOverview } from "../api/stats";
import { getActivityLog } from "../api/settings";


const AdminContext = createContext(null);


export function AdminProvider({ children }) {
    const { isAdmin, isSuperAdmin } = useUser();

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
        enabled: isAdmin,
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

    const overrideRefundMutation = useMutation({
        mutationFn: ({ jobId, reason }) => overrideRefund(jobId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-refunds"]);
            queryClient.invalidateQueries(["admin-users"]);
        }
    });

    const freeReprintMutation = useMutation({
        mutationFn: ({ jobId, reason }) => freeReprint(jobId, reason),
        onSuccess: () => queryClient.invalidateQueries(["admin-jobs"])
    });

    // ─── Recharge requests ─────────────────────────────────────────────────────
    // Short staleTime + refetch-on-focus: this queue can change from the
    // Telegram side too (an admin approving from their phone), so a long
    // cache window would hide that from whoever's looking at this page.
    const pendingRechargeRequestsQuery = useQuery({
        queryKey: ["admin-recharge-requests-pending"],
        queryFn: getPendingRechargeRequests,
        enabled: isAdmin,
        staleTime: 1000 * 15,
        refetchOnWindowFocus: true,
        retry: false
    });

    // Full history, any status — for the Requests page's history/filter view.
    // Same short staleTime + refetch-on-focus reasoning as the pending query.
    const allRechargeRequestsQuery = useQuery({
        queryKey: ["admin-recharge-requests-all"],
        queryFn: getAllRechargeRequests,
        enabled: isAdmin,
        staleTime: 1000 * 15,
        refetchOnWindowFocus: true,
        retry: false
    });

    const resolveRechargeRequestMutation = useMutation({
        mutationFn: ({ requestId, status }) => resolveRechargeRequest(requestId, status),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-recharge-requests-pending"]);
            queryClient.invalidateQueries(["admin-recharge-requests-all"]);
        }
    });

    // ─── Cash reconciliation — readable by any admin, only a Super Admin
    // can actually collect/pay (see collectFromAdmin/payAdmin below; the
    // backend 403s regardless of what the UI shows). ────────────────────────
    const outstandingFloatsQuery = useQuery({
        queryKey: ["admin-outstanding-floats"],
        queryFn: getOutstandingFloats,
        enabled: isAdmin,
        staleTime: 1000 * 30,
        retry: false
    });

    const collectionHistoryQuery = useQuery({
        queryKey: ["admin-collection-history"],
        queryFn: getCollectionHistory,
        enabled: isAdmin,
        staleTime: 1000 * 60,
        retry: false
    });

    const collectFromAdminMutation = useMutation({
        mutationFn: (adminId) => collectFromAdmin(adminId),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-outstanding-floats"]);
            queryClient.invalidateQueries(["admin-collection-history"]);
        }
    });

    const payAdminMutation = useMutation({
        mutationFn: (adminId) => payAdmin(adminId),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-outstanding-floats"]);
            queryClient.invalidateQueries(["admin-collection-history"]);
        }
    });

    // ─── Expenses ───────────────────────────────────────────────────────────────
    const expensesQuery = useQuery({
        queryKey: ["admin-expenses"],
        queryFn: getAllExpenses,
        enabled: isAdmin,
        staleTime: 1000 * 60,
        retry: false
    });

    const createExpenseMutation = useMutation({
        mutationFn: ({ category, amount, description, paidByAdminId }) =>
            createExpense(category, amount, description, paidByAdminId),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-expenses"]);
            queryClient.invalidateQueries(["admin-outstanding-floats"]);
        }
    });

    // ─── Inventory ──────────────────────────────────────────────────────────────
    const inventoryItemsQuery = useQuery({
        queryKey: ["admin-inventory-items"],
        queryFn: getAllInventoryItems,
        enabled: isAdmin,
        staleTime: 1000 * 30,
        retry: false
    });

    const createInventoryItemMutation = useMutation({
        mutationFn: (data) => createInventoryItem(data),
        onSuccess: () => queryClient.invalidateQueries(["admin-inventory-items"])
    });

    const updateInventoryItemMutation = useMutation({
        mutationFn: ({ itemId, data }) => updateInventoryItem(itemId, data),
        onSuccess: () => queryClient.invalidateQueries(["admin-inventory-items"])
    });

    const adjustStockMutation = useMutation({
        mutationFn: ({ itemId, delta, notes }) => adjustStock(itemId, delta, notes),
        onSuccess: () => queryClient.invalidateQueries(["admin-inventory-items"])
    });

    // Deliberately doesn't touch expenses — restocking and logging the
    // purchase cost are separate actions now (see createExpense).
    const restockItemMutation = useMutation({
        mutationFn: ({ itemId, quantity }) => restockItem(itemId, quantity),
        onSuccess: () => queryClient.invalidateQueries(["admin-inventory-items"])
    });

    // ─── Products ───────────────────────────────────────────────────────────────
    const productsQuery = useQuery({
        queryKey: ["admin-products"],
        queryFn: getAllProductsAdmin,
        enabled: isAdmin,
        staleTime: 1000 * 60,
        retry: false
    });

    const createProductMutation = useMutation({
        mutationFn: (data) => createProduct(data),
        onSuccess: () => queryClient.invalidateQueries(["admin-products"])
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ productId, data }) => updateProduct(productId, data),
        onSuccess: () => queryClient.invalidateQueries(["admin-products"])
    });

    const deleteProductMutation = useMutation({
        mutationFn: (productId) => deleteProduct(productId),
        onSuccess: () => queryClient.invalidateQueries(["admin-products"])
    });

    // ─── Product purchases ─────────────────────────────────────────────────────
    // Short staleTime + refetch-on-focus: this queue can also be resolved
    // from Telegram, same reasoning as the recharge-request queue above.
    const pendingPurchasesQuery = useQuery({
        queryKey: ["admin-purchases-pending"],
        queryFn: getPendingPurchases,
        enabled: isAdmin,
        staleTime: 1000 * 15,
        refetchOnWindowFocus: true,
        retry: false
    });

    // Full history, any status — for the Requests page's history/filter view.
    const allPurchasesQuery = useQuery({
        queryKey: ["admin-purchases-all"],
        queryFn: getAllPurchases,
        enabled: isAdmin,
        staleTime: 1000 * 15,
        refetchOnWindowFocus: true,
        retry: false
    });

    const resolvePurchaseMutation = useMutation({
        mutationFn: ({ purchaseId, action, adminMessage }) => resolvePurchase(purchaseId, action, adminMessage),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-purchases-pending"]);
            queryClient.invalidateQueries(["admin-purchases-all"]);
            queryClient.invalidateQueries(["admin-inventory-items"]);
        }
    });

    // ─── Stats + activity (shared with AdminStatisticsPage/AdminActivityPage —
    // same query keys, so React Query dedupes rather than double-fetching) ──────
    const statsQuery = useQuery({
        queryKey: ["admin-stats"],
        queryFn: getStatsOverview,
        enabled: isAdmin,
        staleTime: 1000 * 60 * 2,
        retry: false
    });

    const recentActivityQuery = useQuery({
        queryKey: ["admin-activity-log"],
        queryFn: getActivityLog,
        enabled: isAdmin,
        staleTime: 1000 * 30,
        retry: false
    });

    const refreshAll = () => {
        queryClient.invalidateQueries(["admin-users"]);
        queryClient.invalidateQueries(["admin-jobs"]);
        queryClient.invalidateQueries(["admin-refunds"]);
        queryClient.invalidateQueries(["admin-printers"]);
        queryClient.invalidateQueries(["admin-groups"]);
        queryClient.invalidateQueries(["admin-recharge-requests-pending"]);
        queryClient.invalidateQueries(["admin-recharge-requests-all"]);
        queryClient.invalidateQueries(["admin-outstanding-floats"]);
        queryClient.invalidateQueries(["admin-collection-history"]);
        queryClient.invalidateQueries(["admin-expenses"]);
        queryClient.invalidateQueries(["admin-inventory-items"]);
        queryClient.invalidateQueries(["admin-products"]);
        queryClient.invalidateQueries(["admin-purchases-pending"]);
        queryClient.invalidateQueries(["admin-purchases-all"]);
        queryClient.invalidateQueries(["admin-stats"]);
        queryClient.invalidateQueries(["admin-activity-log"]);
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
            overrideRefund: (jobId, reason) => overrideRefundMutation.mutateAsync({ jobId, reason }),
            freeReprint: (jobId, reason) => freeReprintMutation.mutateAsync({ jobId, reason }),

            // recharge requests
            pendingRechargeRequests: pendingRechargeRequestsQuery.data ?? [],
            pendingRechargeRequestsLoading: pendingRechargeRequestsQuery.isLoading,
            allRechargeRequests: allRechargeRequestsQuery.data ?? [],
            allRechargeRequestsLoading: allRechargeRequestsQuery.isLoading,
            resolveRechargeRequest: (requestId, status) =>
                resolveRechargeRequestMutation.mutateAsync({ requestId, status }),

            // cash reconciliation
            outstandingFloats: outstandingFloatsQuery.data ?? [],
            outstandingFloatsLoading: outstandingFloatsQuery.isLoading,
            collectionHistory: collectionHistoryQuery.data ?? [],
            collectionHistoryLoading: collectionHistoryQuery.isLoading,
            collectFromAdmin: (adminId) => collectFromAdminMutation.mutateAsync(adminId),
            payAdmin: (adminId) => payAdminMutation.mutateAsync(adminId),

            // expenses
            expenses: expensesQuery.data ?? [],
            expensesLoading: expensesQuery.isLoading,
            createExpense: (category, amount, description, paidByAdminId) =>
                createExpenseMutation.mutateAsync({ category, amount, description, paidByAdminId }),

            // inventory
            inventoryItems: inventoryItemsQuery.data ?? [],
            inventoryItemsLoading: inventoryItemsQuery.isLoading,
            createInventoryItem: (data) => createInventoryItemMutation.mutateAsync(data),
            updateInventoryItem: (itemId, data) => updateInventoryItemMutation.mutateAsync({ itemId, data }),
            adjustStock: (itemId, delta, notes) => adjustStockMutation.mutateAsync({ itemId, delta, notes }),
            restockItem: (itemId, quantity) => restockItemMutation.mutateAsync({ itemId, quantity }),

            // products
            products: productsQuery.data ?? [],
            productsLoading: productsQuery.isLoading,
            createProduct: (data) => createProductMutation.mutateAsync(data),
            updateProduct: (productId, data) => updateProductMutation.mutateAsync({ productId, data }),
            deleteProduct: (productId) => deleteProductMutation.mutateAsync(productId),

            // product purchases
            pendingPurchases: pendingPurchasesQuery.data ?? [],
            pendingPurchasesLoading: pendingPurchasesQuery.isLoading,
            allPurchases: allPurchasesQuery.data ?? [],
            allPurchasesLoading: allPurchasesQuery.isLoading,
            resolvePurchase: (purchaseId, action, adminMessage) =>
                resolvePurchaseMutation.mutateAsync({ purchaseId, action, adminMessage }),

            // stats + activity
            stats: statsQuery.data,
            statsLoading: statsQuery.isLoading,
            recentActivity: recentActivityQuery.data ?? [],
            recentActivityLoading: recentActivityQuery.isLoading,

            refreshAll,
            isAdmin,
            isSuperAdmin
        }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    return useContext(AdminContext);
}
