export function decodeJwtPayload(token) {
    try {
        const [, payload] = token.split(".");
        if (!payload) return null;
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const json = atob(base64);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function isTokenExpired(token) {
    if (!token) return true;
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== "number") return false;
    return payload.exp * 1000 <= Date.now();
}
