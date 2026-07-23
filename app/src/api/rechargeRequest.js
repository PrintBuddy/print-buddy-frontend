import api, { fetchAllPages } from "../services/api";


const RECHARGE_REQUEST_ROUTE = "/recharge-requests";


export async function getEligibleAdmins() {
    const response = await api.get(`${RECHARGE_REQUEST_ROUTE}/admins`);
    return response.data;
}

export async function createRechargeRequest(amount, method, targetTelegramAdminId, message) {
    const response = await api.post(RECHARGE_REQUEST_ROUTE, {
        amount,
        method,
        target_telegram_admin_id: targetTelegramAdminId,
        message: message || null,
    });
    return response.data;
}

export async function getMyRechargeRequests() {
    return fetchAllPages(`${RECHARGE_REQUEST_ROUTE}/me`);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getPendingRechargeRequests() {
    return fetchAllPages(`${RECHARGE_REQUEST_ROUTE}/pending`);
}

export async function getAllRechargeRequests() {
    return fetchAllPages(RECHARGE_REQUEST_ROUTE);
}

export async function resolveRechargeRequest(requestId, status) {
    const response = await api.patch(`${RECHARGE_REQUEST_ROUTE}/${requestId}`, { status });
    return response.data;
}
