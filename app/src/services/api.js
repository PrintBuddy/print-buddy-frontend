import axios from "axios";

import { isTokenExpired } from "./jwt";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

let authExpiredCallback = null;

export function setAuthExpiredCallback(cb) {
    authExpiredCallback = cb;
}

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
        if (isTokenExpired(token)) {
            sessionStorage.removeItem("token");
            if (typeof authExpiredCallback === "function") authExpiredCallback();
            return Promise.reject(new Error("Session expired"));
        }
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            if (typeof authExpiredCallback === 'function') authExpiredCallback();
        }
        return Promise.reject(err);
    }
);


// Several endpoints enforce a server-side page size (default 50, max 200)
// and return a plain list with no "has more" indicator. Callers that need
// the full collection (there's no pagination UI in this app) loop pages
// until a short page confirms there's nothing left, rather than assuming
// a single request returns everything.
export async function fetchAllPages(url, extraParams = {}) {
    const limit = 200;
    let offset = 0;
    let all = [];

    while (true) {
        const response = await api.get(url, { params: { ...extraParams, limit, offset } });
        all = all.concat(response.data);
        if (response.data.length < limit) break;
        offset += limit;
    }

    return all;
}

export default api;
