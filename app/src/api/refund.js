import api, { fetchAllPages } from "../services/api";


const REFUND_ROUTE = "/refunds";


export async function requestRefund(jobId, message) {
    const response = await api.post(`${REFUND_ROUTE}/${jobId}`, { message });
    return response.data;
}

export async function getMyRefunds() {
    return fetchAllPages(`${REFUND_ROUTE}/me`);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAllRefunds() {
    return fetchAllPages(REFUND_ROUTE);
}

export async function getPendingRefunds() {
    return fetchAllPages(`${REFUND_ROUTE}/pending`);
}

export async function resolveRefund(refundId, status, adminMessage) {
    const response = await api.patch(`${REFUND_ROUTE}/${refundId}`, {
        status,
        admin_message: adminMessage || null,
    });
    return response.data;
}

export async function overrideRefund(jobId, reason) {
    const response = await api.post(`${REFUND_ROUTE}/override/${jobId}`, { reason });
    return response.data;
}
