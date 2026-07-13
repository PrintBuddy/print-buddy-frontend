import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../api/user", () => ({
    getAllUsers: vi.fn().mockResolvedValue([]),
    updateUser: vi.fn(),
    adjustUserBalance: vi.fn(),
    rechargeUserBalance: vi.fn(),
    getUserTransactions: vi.fn(),
    deleteUser: vi.fn(),
}));
vi.mock("../api/print", () => ({
    getAllJobs: vi.fn().mockResolvedValue([]),
}));
vi.mock("../api/refund", () => ({
    getAllRefunds: vi.fn().mockResolvedValue([]),
    resolveRefund: vi.fn(),
}));
vi.mock("../api/group", () => ({
    getGroups: vi.fn().mockResolvedValue([]),
    createGroup: vi.fn(),
    updateGroup: vi.fn(),
    deleteGroup: vi.fn(),
}));

const getAllPrinters = vi.fn().mockResolvedValue([]);
vi.mock("../api/printer", () => ({
    getAllPrinters: (...args) => getAllPrinters(...args),
    updatePrinter: vi.fn(),
    deletePrinter: vi.fn(),
}));

let mockUser = null;
vi.mock("./UserContext", () => ({
    useUser: () => ({ user: mockUser }),
}));

// Import after mocks are registered so AdminContext picks up the mocked modules.
const { AdminProvider } = await import("./AdminContext");

function renderWithClient(ui) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
    getAllPrinters.mockClear();
});

describe("AdminProvider printersQuery", () => {
    it("does not fetch printers for a non-admin user", async () => {
        mockUser = { is_admin: false };
        renderWithClient(<AdminProvider>{null}</AdminProvider>);

        // Give any (incorrectly) enabled query a moment to fire.
        await new Promise((r) => setTimeout(r, 50));
        expect(getAllPrinters).not.toHaveBeenCalled();
    });

    it("fetches printers for an admin user", async () => {
        mockUser = { is_admin: true };
        renderWithClient(<AdminProvider>{null}</AdminProvider>);

        await waitFor(() => expect(getAllPrinters).toHaveBeenCalledTimes(1));
    });
});
