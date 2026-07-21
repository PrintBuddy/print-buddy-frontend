export const STATUS_FILTER_OPTIONS = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
];

// Generic All/Pending/Accepted/Rejected vocabulary shared across refunds,
// recharge requests, and purchases, even though each domain's underlying
// "accepted" status string differs (approved/approved/fulfilled) — callers
// map the generic filter value to their own status via matchesStatusFilter.
export function matchesStatusFilter(status, filter, { accepted, rejected }) {
    if (filter === "all") return true;
    if (filter === "pending") return status === "pending";
    if (filter === "accepted") return status === accepted;
    if (filter === "rejected") return status === rejected;
    return true;
}
