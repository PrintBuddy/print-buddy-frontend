import api, { fetchAllPages } from "../services/api";


const COLLECTIONS_ROUTE = "/collections";


export async function getOutstandingFloats() {
    const response = await api.get(`${COLLECTIONS_ROUTE}/outstanding`);
    return response.data;
}

export async function collectFromAdmin(adminId) {
    const response = await api.post(`${COLLECTIONS_ROUTE}/${adminId}/collect`);
    return response.data;
}

export async function payAdmin(adminId) {
    const response = await api.post(`${COLLECTIONS_ROUTE}/${adminId}/pay`);
    return response.data;
}

export async function getCollectionHistory() {
    return fetchAllPages(COLLECTIONS_ROUTE);
}
