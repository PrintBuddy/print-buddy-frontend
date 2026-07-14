import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../api/stats", () => ({
    getStatsOverview: vi.fn().mockResolvedValue({
        total_pages: 100,
        bw_pages: 60,
        color_pages: 40,
        total_sheets: 80,
        total_jobs: 10,
        by_printer: [
            { printer_name: "Printer1", total_pages: 100, bw_pages: 60, color_pages: 40, total_sheets: 80, total_cost: 12.5 },
        ],
        by_user: [
            { user_id: "u1", username: "alice", total_pages: 100, bw_pages: 60, color_pages: 40, total_sheets: 80 },
        ],
        finance: {
            total_recharged: 50,
            total_current_balance: 20,
            total_spent_on_print: 12.5,
            total_refunded: 0,
            total_adjustments: 0,
        },
    }),
}));

vi.mock("../api/printer", () => ({
    getPrinters: vi.fn().mockResolvedValue([{ id: "p1", name: "Printer1" }]),
}));

const { default: AdminStatisticsPage } = await import("./AdminStatisticsPage");

function renderWithClient(ui) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("AdminStatisticsPage smoke test", () => {
    it("renders cards, charts, and tables without crashing", async () => {
        renderWithClient(<AdminStatisticsPage />);

        await waitFor(() => expect(screen.getAllByText("Total Pages").length).toBeGreaterThan(0));
        await waitFor(() => expect(screen.getAllByText("Printer1").length).toBeGreaterThan(0));
        expect(screen.getAllByText("alice").length).toBeGreaterThan(0);
    });
});
