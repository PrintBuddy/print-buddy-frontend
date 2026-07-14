import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Stable, module-level references — a mock returning fresh object/array
// literals on every call would make usePrintSummary's effect (which
// depends on `files`/`printerOptionsByFile`) re-fire every render, looping.
const selectedPrinter = { name: "Printer1", location: "Room A" };
const files = [{ id: "f1", filename: "doc.pdf", pages: 10 }];
const selectedIds = ["f1"];
const printerOptionsByFile = { f1: { copies: 1, pageRanges: "", colorMode: "B&W", sides: "1S" } };
const validByFile = {};
const user = { balance: 10, credit_limit: 0 };

vi.mock("../../../context/PrinterContext", () => ({
    usePrinter: () => ({ selectedPrinter }),
}));

vi.mock("../../../context/FileContext", () => ({
    useFile: () => ({ selectedIds, files, isLoading: false }),
}));

vi.mock("../../../context/PrintContext", () => ({
    usePrint: () => ({ printerOptionsByFile, validByFile }),
}));

vi.mock("../../../context/UserContext", () => ({
    useUser: () => ({ user, isLoading: false }),
}));

vi.mock("../../../api/print", () => ({
    print: vi.fn().mockResolvedValue({}),
}));

const { default: StepSend } = await import("./StepSend");

describe("StepSend smoke test", () => {
    it("renders printer info, file list, and cost summary without crashing", () => {
        render(
            <MemoryRouter>
                <StepSend onPrev={() => {}} />
            </MemoryRouter>
        );

        expect(screen.getAllByText("Printer1").length).toBeGreaterThan(0);
        expect(screen.getAllByText("doc.pdf").length).toBeGreaterThan(0);
        expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
    });
});
