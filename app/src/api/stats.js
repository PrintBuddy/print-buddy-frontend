import api from "../services/api";

const STATS_ROUTE = "/stats";

export async function getStatsOverview({ start, end } = {}) {
    const response = await api.get(`${STATS_ROUTE}/overview`, {
        params: { start_date: start ?? undefined, end_date: end ?? undefined },
    });
    return response.data;
}

export async function getUserStats({ start, end } = {}) {
    const response = await api.get(`${STATS_ROUTE}/me`, {
        params: { start_date: start ?? undefined, end_date: end ?? undefined },
    });
    return response.data;
}

export async function exportFinanceWorkbook({ start, end } = {}) {
    const response = await api.get(`${STATS_ROUTE}/export/finance`, {
        params: { start_date: start ?? undefined, end_date: end ?? undefined },
        responseType: "blob",
    });
    return response.data;
}
