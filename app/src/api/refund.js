import api from "../services/api";


const REFUND_ROUTE = "/refunds";


export async function requestRefund(jobId, message) {
    const response = await api.post(`${REFUND_ROUTE}/${jobId}`, { message });
    return response.data;
}

export async function getMyRefunds() {
    const response = await api.get(`${REFUND_ROUTE}/me`);
    return response.data;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAllRefunds() {
    const response = await api.get(REFUND_ROUTE);
    return response.data;
}

export async function getPendingRefunds() {
    const response = await api.get(`${REFUND_ROUTE}/pending`);
    return response.data;
}

export async function resolveRefund(refundId, status, adminMessage) {
    const response = await api.patch(`${REFUND_ROUTE}/${refundId}`, {
        status,
        admin_message: adminMessage || null,
    });
    return response.data;
}
