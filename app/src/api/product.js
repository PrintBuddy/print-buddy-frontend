import api from "../services/api";


const PRODUCT_ROUTE = "/products";


export async function getProducts() {
    const response = await api.get(PRODUCT_ROUTE);
    return response.data;
}

export async function purchaseProduct(productId) {
    const response = await api.post(`${PRODUCT_ROUTE}/${productId}/purchase`);
    return response.data;
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
