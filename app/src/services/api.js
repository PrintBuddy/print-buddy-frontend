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


api.interceptors.response.use(
    res => res,
    err => {
        if (!err.response && err.request) {
            if (typeof authExpiredCallback === 'function') authExpiredCallback();
        }
        return Promise.reject(err);
    }
);


export default api;
