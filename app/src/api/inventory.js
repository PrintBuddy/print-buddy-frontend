import api from "../services/api";


const INVENTORY_ROUTE = "/inventory";


export async function getAllInventoryItems() {
    const response = await api.get(INVENTORY_ROUTE);
    return response.data;
}

export async function createInventoryItem(data) {
    const response = await api.post(INVENTORY_ROUTE, data);
    return response.data;
}

export async function getItemMovements(itemId) {
    const response = await api.get(`${INVENTORY_ROUTE}/${itemId}/movements`);
    return response.data;
}

export async function adjustStock(itemId, delta, reason) {
    const response = await api.post(`${INVENTORY_ROUTE}/${itemId}/adjust`, { delta, reason });
    return response.data;
}

export async function restockItem(itemId, quantity, expenseCategory, expenseAmount, expenseDescription) {
    const response = await api.post(`${INVENTORY_ROUTE}/${itemId}/restock`, {
        quantity,
        expense_category: expenseCategory,
        expense_amount: expenseAmount,
        expense_description: expenseDescription || null,
    });
    return response.data;
}
