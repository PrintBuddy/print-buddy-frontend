import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";

const markTutorialSeen = vi.fn();
let mockUser = { has_seen_tutorial: false };

vi.mock("../../context/UserContext", () => ({
    useUser: () => ({ user: mockUser, markTutorialSeen }),
}));

const { default: TutorialGuide } = await import("./TutorialGuide");

// Mirrors how DashboardLayout wires open/onOpen/onClose in the real app.
function Harness({ initialOpen = false }) {
    const [open, setOpen] = useState(initialOpen);
    return (
        <>
            <button onClick={() => setOpen(true)}>open-tutorial</button>
            <TutorialGuide open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} />
        </>
    );
}

describe("TutorialGuide", () => {
    beforeEach(() => {
        markTutorialSeen.mockClear();
    });

    it("auto-opens and marks the tutorial seen when the user hasn't seen it yet", async () => {
        mockUser = { has_seen_tutorial: false };
        render(<Harness />);

        expect(await screen.findByText(/Welcome to Print Buddy/i)).toBeInTheDocument();
        expect(markTutorialSeen).toHaveBeenCalledTimes(1);
    });

    it("does not auto-open when the user has already seen the tutorial", () => {
        mockUser = { has_seen_tutorial: true };
        render(<Harness />);

        expect(screen.queryByText(/Welcome to Print Buddy/i)).not.toBeInTheDocument();
        expect(markTutorialSeen).not.toHaveBeenCalled();
    });

    it("navigates through steps with Next/Back and closes on Done", async () => {
        mockUser = { has_seen_tutorial: true };
        render(<Harness />);

        fireEvent.click(screen.getByText("open-tutorial"));
        expect(screen.getByText(/Welcome to Print Buddy/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /next/i }));
        expect(screen.getByText("Home")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /back/i }));
        expect(screen.getByText(/Welcome to Print Buddy/i)).toBeInTheDocument();

        // Advance all the way to the last step.
        for (let i = 0; i < 8; i++) {
            fireEvent.click(screen.getByRole("button", { name: /next/i }));
        }
        expect(screen.getByText(/You're all set/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /done/i }));
        await waitFor(() => {
            expect(screen.queryByText(/You're all set/i)).not.toBeInTheDocument();
        });
    });
});
