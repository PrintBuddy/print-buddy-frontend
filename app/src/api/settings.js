import api from "../services/api";

const SETTINGS_ROUTE = "/settings";

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
