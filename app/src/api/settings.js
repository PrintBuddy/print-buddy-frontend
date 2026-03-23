import api from "../services/api";

const SETTINGS_ROUTE = "/settings";

// AD Config
export async function getADConfig() {
    const response = await api.get(`${SETTINGS_ROUTE}/ad-config`);
    return response.data;
}

export async function updateADConfig(data) {
    const response = await api.put(`${SETTINGS_ROUTE}/ad-config`, data);
    return response.data;
}

export async function importADUsers(data) {
    const response = await api.post(`${SETTINGS_ROUTE}/ad-config/import-users`, data);
    return response.data;
}

export async function previewADUsersImport(data) {
    const response = await api.post(`${SETTINGS_ROUTE}/ad-config/preview-import-users`, data);
    return response.data;
}

export async function getRechargeInfo() {
    const response = await api.get(`${SETTINGS_ROUTE}/recharge-info`);
    return response.data;
}

export async function updateRechargeInfo(data) {
    const response = await api.put(`${SETTINGS_ROUTE}/recharge-info`, data);
    return response.data;
}

export async function getTelegramAdmins() {
    const response = await api.get(`${SETTINGS_ROUTE}/telegram-admins`);
    return response.data;
}

export async function addTelegramAdmin(username, telegram_id) {
    const response = await api.post(`${SETTINGS_ROUTE}/telegram-admins`, { username, telegram_id });
    return response.data;
}

export async function removeTelegramAdmin(id) {
    const response = await api.delete(`${SETTINGS_ROUTE}/telegram-admins/${id}`);
    return response.data;
}

export async function getActivityLog() {
    const response = await api.get(`${SETTINGS_ROUTE}/activity-log`);
    return response.data;
}

export async function getTonerAlertConfig() {
    const response = await api.get(`${SETTINGS_ROUTE}/toner-alert`);
    return response.data;
}

export async function getVoucherRedeemConfig() {
    const response = await api.get(`${SETTINGS_ROUTE}/voucher-redeem`);
    return response.data;
}

export async function updateVoucherRedeemConfig(data) {
    const response = await api.put(`${SETTINGS_ROUTE}/voucher-redeem`, data);
    return response.data;
}

export async function updateTonerAlertConfig(data) {
    const response = await api.put(`${SETTINGS_ROUTE}/toner-alert`, data);
    return response.data;
}

export async function testTonerAlert() {
    const response = await api.post(`${SETTINGS_ROUTE}/toner-alert/test`);
    return response.data;
}
