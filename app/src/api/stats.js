import api from "../services/api";

const STATS_ROUTE = "/stats";

export async function getStatsOverview() {
    const response = await api.get(`${STATS_ROUTE}/overview`);
    return response.data;
}

export async function getUserStats() {
    const response = await api.get(`${STATS_ROUTE}/me`);
    return response.data;
}
