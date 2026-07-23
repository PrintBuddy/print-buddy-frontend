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

export async function updateInventoryItem(itemId, data) {
    const response = await api.patch(`${INVENTORY_ROUTE}/${itemId}`, data);
    return response.data;
}

export async function getItemMovements(itemId) {
    const response = await api.get(`${INVENTORY_ROUTE}/${itemId}/movements`);
    return response.data;
}

// Always a manual correction — not tied to a purchase or a print job —
// so `reason` is fixed to that enum value; `notes` carries the free-text
// explanation (e.g. "damaged box in storage").
export async function adjustStock(itemId, delta, notes) {
    const response = await api.post(`${INVENTORY_ROUTE}/${itemId}/adjust`, {
        delta, reason: "manual_adjustment", notes,
    });
    return response.data;
}

// Deliberately just the quantity — logging the purchase cost is a separate
// step via createExpense, not bundled into restocking.
export async function restockItem(itemId, quantity) {
    const response = await api.post(`${INVENTORY_ROUTE}/${itemId}/restock`, { quantity });
    return response.data;
}
