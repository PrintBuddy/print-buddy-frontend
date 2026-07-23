import { fetchAllPages } from "../services/api"


const TX_ROUTE = "/transactions"


export async function getMyTransactions() {
    return fetchAllPages(`${TX_ROUTE}/me`);
}
