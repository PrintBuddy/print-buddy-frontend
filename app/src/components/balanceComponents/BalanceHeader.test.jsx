import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import BalanceHeader from "./BalanceHeader";

describe("BalanceHeader", () => {
    it("shows a loading skeleton", () => {
        const { container } = render(<BalanceHeader user={null} isLoading isError={false} />);
        expect(container.querySelector(".MuiSkeleton-root")).toBeInTheDocument();
    });

    it("shows a distinct error state instead of spinning forever", () => {
        render(<BalanceHeader user={null} isLoading={false} isError />);
        expect(screen.getByText("Unavailable")).toBeInTheDocument();
        expect(screen.queryByText(/^€/)).not.toBeInTheDocument();
    });

    it("shows the formatted balance on success", () => {
        render(<BalanceHeader user={{ balance: 12.5 }} isLoading={false} isError={false} />);
        expect(screen.getByText("€12.50")).toBeInTheDocument();
    });
});
