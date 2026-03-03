import api from "../services/api";

const STATS_ROUTE = "/stats";

export async function getStatsOverview() {
    const response = await api.get(`${STATS_ROUTE}/overview`);
    return response.data;
}
