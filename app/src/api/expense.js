import api, { fetchAllPages } from "../services/api";


const EXPENSE_ROUTE = "/expenses";


export async function createExpense(category, amount, description) {
    const response = await api.post(EXPENSE_ROUTE, { category, amount, description: description || null });
    return response.data;
}

export async function getAllExpenses() {
    return fetchAllPages(EXPENSE_ROUTE);
}
