import { describe, it, expect } from "vitest";
import { decodeJwtPayload, isTokenExpired } from "./jwt";

function makeToken(payload) {
    const base64url = (obj) =>
        btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url(payload)}.fakesignature`;
}

describe("decodeJwtPayload", () => {
    it("decodes a well-formed token", () => {
        const token = makeToken({ uid: "abc123", exp: 12345 });
        expect(decodeJwtPayload(token)).toEqual({ uid: "abc123", exp: 12345 });
    });

    it("returns null for a malformed token", () => {
        expect(decodeJwtPayload("not-a-jwt")).toBeNull();
        expect(decodeJwtPayload("")).toBeNull();
    });
});

describe("isTokenExpired", () => {
    it("returns true for a falsy token", () => {
        expect(isTokenExpired(null)).toBe(true);
        expect(isTokenExpired("")).toBe(true);
    });

    it("returns false for a token expiring in the future", () => {
        const token = makeToken({ uid: "abc", exp: Math.floor(Date.now() / 1000) + 3600 });
        expect(isTokenExpired(token)).toBe(false);
    });

    it("returns true for a token that already expired", () => {
        const token = makeToken({ uid: "abc", exp: Math.floor(Date.now() / 1000) - 3600 });
        expect(isTokenExpired(token)).toBe(true);
    });

    it("does not treat an unparsable token as expired (defers to the backend's 401)", () => {
        expect(isTokenExpired("garbage.token.here")).toBe(false);
    });
});
