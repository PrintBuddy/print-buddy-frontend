import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mockUsers = [
    { id: "u1", username: "alice", name: "Alice", surname: "A", email: "a@x.com", balance: 5, is_admin: true, is_active: true },
    { id: "u2", username: "bob", name: "Bob", surname: "B", email: "b@x.com", balance: -2, is_admin: false, is_active: true },
];

vi.mock("../context/AdminContext", () => ({
    useAdmin: () => ({
        users: mockUsers,
        usersLoading: false,
        updateUser: vi.fn(),
        adjustBalance: vi.fn(),
        rechargeBalance: vi.fn(),
        deleteUser: vi.fn(),
        refreshAll: vi.fn(),
    }),
}));

const { default: AdminUsersPage } = await import("./AdminUsersPage");

describe("AdminUsersPage smoke test", () => {
    it("renders the user directory without crashing", () => {
        render(
            <MemoryRouter>
                <AdminUsersPage />
            </MemoryRouter>
        );

        expect(screen.getAllByText("alice").length).toBeGreaterThan(0);
        expect(screen.getAllByText("bob").length).toBeGreaterThan(0);
    });
});
