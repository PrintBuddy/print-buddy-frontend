import api, { fetchAllPages } from "../services/api";


const PRODUCT_ROUTE = "/products";


export async function getProducts() {
    const response = await api.get(PRODUCT_ROUTE);
    return response.data;
}

export async function purchaseProduct(productId, quantity, message) {
    const response = await api.post(`${PRODUCT_ROUTE}/${productId}/purchase`, {
        quantity,
        message: message || null,
    });
    return response.data;
}

export async function getMyPurchases() {
    return fetchAllPages(`${PRODUCT_ROUTE}/purchases/me`);
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAllProductsAdmin() {
    const response = await api.get(`${PRODUCT_ROUTE}/admin`);
    return response.data;
}

export async function createProduct(data) {
    const response = await api.post(PRODUCT_ROUTE, data);
    return response.data;
}

export async function updateProduct(productId, data) {
    const response = await api.patch(`${PRODUCT_ROUTE}/${productId}`, data);
    return response.data;
}

export async function deleteProduct(productId) {
    const response = await api.delete(`${PRODUCT_ROUTE}/${productId}`);
    return response.data;
}

export async function getPendingPurchases() {
    return fetchAllPages(`${PRODUCT_ROUTE}/purchases/pending`);
}

export async function getAllPurchases() {
    return fetchAllPages(`${PRODUCT_ROUTE}/purchases`);
}

export async function resolvePurchase(purchaseId, action, adminMessage) {
    const response = await api.patch(`${PRODUCT_ROUTE}/purchases/${purchaseId}`, {
        action,
        admin_message: adminMessage || null,
    });
    return response.data;
}
