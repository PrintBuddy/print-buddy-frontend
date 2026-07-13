import api, { fetchAllPages } from "../services/api"


const TX_ROUTE = "/transactions"


export async function getMyTransactions() {
    return fetchAllPages(`${TX_ROUTE}/me`);
}


export async function getRechargeInfo() {
    const response = await api.get(`${TX_ROUTE}/recharge-info`)
    return response.data;
}
