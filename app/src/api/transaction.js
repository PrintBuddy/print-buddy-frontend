import api from "../services/api"


const TX_ROUTE = "/transactions"


export async function getMyTransactions() {
    const response = await api.get(`${TX_ROUTE}/me`)
    return response.data;
}


export async function getRechargeInfo() {
    const response = await api.get(`${TX_ROUTE}/recharge-info`)
    return response.data;
}

export async function getVoucherRedeemConfig() {
    const response = await api.get(`${TX_ROUTE}/voucher-redeem`)
    return response.data;
}
