
import api from "../services/api";


const USER_ROUTE = "/users";


export async function getMe() {

    const response = await api.get(`${USER_ROUTE}/me`);
    sessionStorage.setItem("lastUsername", response.data.username);
    return response.data;
}


export async function updatePwd(current_pwd, new_pwd) {
    const response = await api.patch(`${USER_ROUTE}/change-password`,
        {
            current_pwd, new_pwd
        }
    )

    return response.data;
}

export async function updateMyEmail(email) {
    const response = await api.patch(`${USER_ROUTE}/me/email`, { email });
    return response.data;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAllUsers() {
    const response = await api.get(USER_ROUTE);
    return response.data;
}

export async function getUserById(userId) {
    const response = await api.get(`${USER_ROUTE}/${userId}`);
    return response.data;
}

export async function updateUser(userId, data) {
    const response = await api.patch(`${USER_ROUTE}/${userId}`, data);
    return response.data;
}

export async function adjustUserBalance(userId, amount) {
    const response = await api.patch(`${USER_ROUTE}/balance-adjust/${userId}/${amount}`);
    return response.data;
}

export async function rechargeUserBalance(userId, amount) {
    const response = await api.patch(`${USER_ROUTE}/balance-recharge/${userId}/${amount}`);
    return response.data;
}

export async function getUserTransactions(userId) {
    const response = await api.get(`${USER_ROUTE}/${userId}/transactions`);
    return response.data;
}

export async function deleteUser(userId) {
    const response = await api.delete(`${USER_ROUTE}/${userId}`);
    return response.data;
}

