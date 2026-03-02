import api from "../services/api";

const APP_ROUTE = "";

export async function getAppInfo() {
    const response = await api.get(`${APP_ROUTE}/version`);
    return response.data;
}
