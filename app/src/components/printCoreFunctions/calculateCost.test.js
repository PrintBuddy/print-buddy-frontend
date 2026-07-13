import { describe, it, expect } from "vitest";
import { countPagesInRange, calculateTotalCost } from "./calculateCost";

describe("countPagesInRange", () => {
    it("returns totalPages when the range is empty", () => {
        expect(countPagesInRange("", 10)).toBe(10);
        expect(countPagesInRange(null, 10)).toBe(10);
    });

    it("counts a single range", () => {
        expect(countPagesInRange("2-4", 10)).toBe(3);
    });

    it("counts a single page", () => {
        expect(countPagesInRange("5", 10)).toBe(1);
    });

    it("dedupes overlapping ranges", () => {
        expect(countPagesInRange("1-3,2-4", 10)).toBe(4);
    });

    it("clamps a range end beyond totalPages", () => {
        expect(countPagesInRange("8-100", 10)).toBe(3);
    });
});

describe("calculateTotalCost", () => {
    const printer = { price_per_page_bw: 0.10, price_per_page_color: 0.20 };
    const files = [{ id: "1", pages: 10 }];

    it("prices a normal B&W job", () => {
        const cost = calculateTotalCost(
            files,
            { "1": { pageRanges: "", numberUp: 1, copies: 3, colorMode: "B&W" } },
            printer
        );
        expect(cost).toBe(3.00); // 10 pages * 3 copies * 0.10
    });

    it("does not price copies=0 as free — regression test for the new Number() bug", () => {
        // Previously `new Number(opts.copies)` was always a truthy wrapper
        // object, so `(copies || 1)` never fell back and copies=0 silently
        // priced the whole file at zero.
        const cost = calculateTotalCost(
            files,
            { "1": { pageRanges: "", numberUp: 1, copies: 0, colorMode: "B&W" } },
            printer
        );
        expect(cost).toBe(1.00); // falls back to 1 copy, not 0
    });

    it("does not corrupt the total to NaN when copies is non-numeric", () => {
        const cost = calculateTotalCost(
            files,
            { "1": { pageRanges: "", numberUp: 1, copies: undefined, colorMode: "B&W" } },
            printer
        );
        expect(cost).toBe(1.00);
        expect(Number.isNaN(cost)).toBe(false);
    });

    it("accounts for n-up when calculating effective pages", () => {
        const cost = calculateTotalCost(
            files,
            { "1": { pageRanges: "", numberUp: 2, copies: 1, colorMode: "B&W" } },
            printer
        );
        expect(cost).toBe(0.50); // ceil(10/2) = 5 pages * 0.10
    });

    it("prices color pages using the color rate", () => {
        const cost = calculateTotalCost(
            files,
            { "1": { pageRanges: "", numberUp: 1, copies: 1, colorMode: "Color" } },
            printer
        );
        expect(cost).toBe(2.00); // 10 pages * 0.20
    });
});
