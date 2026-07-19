import { createContext, useContext } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import { useUser } from "./UserContext";

import { getAllUsers, updateUser, adjustUserBalance, rechargeUserBalance, getUserTransactions, deleteUser } from "../api/user";
import { getAllJobs } from "../api/print";
import { getAllRefunds, resolveRefund } from "../api/refund";
import { getPendingRechargeRequests, resolveRechargeRequest } from "../api/rechargeRequest";
import { getOutstandingFloats, collectFromAdmin, getCollectionHistory } from "../api/collectionEvent";
import { createExpense, getAllExpenses } from "../api/expense";
import { getAllInventoryItems, createInventoryItem, adjustStock, restockItem } from "../api/inventory";
import { getAllProductsAdmin, createProduct, updateProduct } from "../api/product";
import { getAllPrinters, updatePrinter, deletePrinter } from "../api/printer";
import { getGroups, createGroup, updateGroup, deleteGroup } from "../api/group";


const AdminContext = createContext(null);


export function AdminProvider({ children }) {
    const { user } = useUser();
    const isAdmin = user?.is_admin ?? false;
    const isSuperAdmin = user?.role === "super_admin";

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

    const resolveRechargeRequestMutation = useMutation({
        mutationFn: ({ requestId, status }) => resolveRechargeRequest(requestId, status),
        onSuccess: () => queryClient.invalidateQueries(["admin-recharge-requests-pending"])
    });

    // ─── Cash reconciliation (Super Admin only) ────────────────────────────────
    const outstandingFloatsQuery = useQuery({
        queryKey: ["admin-outstanding-floats"],
        queryFn: getOutstandingFloats,
        enabled: isSuperAdmin,
        staleTime: 1000 * 30,
        retry: false
    });

    const collectionHistoryQuery = useQuery({
        queryKey: ["admin-collection-history"],
        queryFn: getCollectionHistory,
        enabled: isSuperAdmin,
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

    // ─── Expenses ───────────────────────────────────────────────────────────────
    const expensesQuery = useQuery({
        queryKey: ["admin-expenses"],
        queryFn: getAllExpenses,
        enabled: isAdmin,
        staleTime: 1000 * 60,
        retry: false
    });

    const createExpenseMutation = useMutation({
        mutationFn: ({ category, amount, description }) => createExpense(category, amount, description),
        onSuccess: () => queryClient.invalidateQueries(["admin-expenses"])
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

    const adjustStockMutation = useMutation({
        mutationFn: ({ itemId, delta, reason }) => adjustStock(itemId, delta, reason),
        onSuccess: () => queryClient.invalidateQueries(["admin-inventory-items"])
    });

    const restockItemMutation = useMutation({
        mutationFn: ({ itemId, quantity, expenseCategory, expenseAmount, expenseDescription }) =>
            restockItem(itemId, quantity, expenseCategory, expenseAmount, expenseDescription),
        onSuccess: () => {
            queryClient.invalidateQueries(["admin-inventory-items"]);
            queryClient.invalidateQueries(["admin-expenses"]);
        }
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

    const refreshAll = () => {
        queryClient.invalidateQueries(["admin-users"]);
        queryClient.invalidateQueries(["admin-jobs"]);
        queryClient.invalidateQueries(["admin-refunds"]);
        queryClient.invalidateQueries(["admin-printers"]);
        queryClient.invalidateQueries(["admin-groups"]);
        queryClient.invalidateQueries(["admin-recharge-requests-pending"]);
        queryClient.invalidateQueries(["admin-outstanding-floats"]);
        queryClient.invalidateQueries(["admin-collection-history"]);
        queryClient.invalidateQueries(["admin-expenses"]);
        queryClient.invalidateQueries(["admin-inventory-items"]);
        queryClient.invalidateQueries(["admin-products"]);
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

            // recharge requests
            pendingRechargeRequests: pendingRechargeRequestsQuery.data ?? [],
            pendingRechargeRequestsLoading: pendingRechargeRequestsQuery.isLoading,
            resolveRechargeRequest: (requestId, status) =>
                resolveRechargeRequestMutation.mutateAsync({ requestId, status }),

            // cash reconciliation
            outstandingFloats: outstandingFloatsQuery.data ?? [],
            outstandingFloatsLoading: outstandingFloatsQuery.isLoading,
            collectionHistory: collectionHistoryQuery.data ?? [],
            collectionHistoryLoading: collectionHistoryQuery.isLoading,
            collectFromAdmin: (adminId) => collectFromAdminMutation.mutateAsync(adminId),

            // expenses
            expenses: expensesQuery.data ?? [],
            expensesLoading: expensesQuery.isLoading,
            createExpense: (category, amount, description) =>
                createExpenseMutation.mutateAsync({ category, amount, description }),

            // inventory
            inventoryItems: inventoryItemsQuery.data ?? [],
            inventoryItemsLoading: inventoryItemsQuery.isLoading,
            createInventoryItem: (data) => createInventoryItemMutation.mutateAsync(data),
            adjustStock: (itemId, delta, reason) => adjustStockMutation.mutateAsync({ itemId, delta, reason }),
            restockItem: (itemId, quantity, expenseCategory, expenseAmount, expenseDescription) =>
                restockItemMutation.mutateAsync({ itemId, quantity, expenseCategory, expenseAmount, expenseDescription }),

            // products
            products: productsQuery.data ?? [],
            productsLoading: productsQuery.isLoading,
            createProduct: (data) => createProductMutation.mutateAsync(data),
            updateProduct: (productId, data) => updateProductMutation.mutateAsync({ productId, data }),

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
