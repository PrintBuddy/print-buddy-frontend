import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import useAsyncAction from "./useAsyncAction";

describe("useAsyncAction", () => {
    it("calls onSuccess and resets loading after a successful run", async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        const fn = vi.fn().mockResolvedValue("ok");

        const { result } = renderHook(() => useAsyncAction(fn, { onSuccess, onError }));

        await act(async () => {
            await result.current[0]("arg1");
        });

        expect(fn).toHaveBeenCalledWith("arg1");
        expect(onSuccess).toHaveBeenCalledWith("ok", "arg1");
        expect(onError).not.toHaveBeenCalled();
        expect(result.current[1]).toBe(false);
    });

    it("calls onError and resets loading after a failed run", async () => {
        const onSuccess = vi.fn();
        const onError = vi.fn();
        const error = new Error("boom");
        const fn = vi.fn().mockRejectedValue(error);

        const { result } = renderHook(() => useAsyncAction(fn, { onSuccess, onError }));

        await act(async () => {
            await result.current[0]();
        });

        expect(onError).toHaveBeenCalledWith(error);
        expect(onSuccess).not.toHaveBeenCalled();
        expect(result.current[1]).toBe(false);
    });
});
