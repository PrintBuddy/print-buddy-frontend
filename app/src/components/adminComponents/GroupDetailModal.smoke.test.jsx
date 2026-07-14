import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../../api/group", () => ({
    getGroupDetail: vi.fn().mockResolvedValue({
        members: ["u1"],
        printer_permits: [{ printer_id: "p1", custom_price_bw: null, custom_price_color: null }],
    }),
    addGroupMember: vi.fn(),
    removeGroupMember: vi.fn(),
    addGroupPrinterPermit: vi.fn(),
    updateGroupPrinterPermit: vi.fn(),
    removeGroupPrinterPermit: vi.fn(),
}));

const { default: GroupDetailModal } = await import("./GroupDetailModal");

function renderWithClient(ui) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("GroupDetailModal smoke test", () => {
    it("renders both tabs without crashing", async () => {
        renderWithClient(
            <GroupDetailModal
                open
                onClose={() => {}}
                group={{ id: "g1", name: "Test Group", description: "desc" }}
                users={[{ id: "u1", username: "alice", name: "Alice", surname: "A", email: "a@x.com" }]}
                printers={[{ id: "p1", name: "Printer1", admits_color: true, is_restricted: false }]}
            />
        );

        await waitFor(() => expect(screen.getByText(/Members \(1\)/)).toBeInTheDocument());
        expect(screen.getByText(/Printer Permits \(1\)/)).toBeInTheDocument();
        expect(screen.getByText("alice")).toBeInTheDocument();
    });
});
