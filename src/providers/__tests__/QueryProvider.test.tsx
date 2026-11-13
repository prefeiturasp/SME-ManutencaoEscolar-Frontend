import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QueryProvider } from "@/providers/QueryProvider";

describe("QueryProvider", () => {
  it("deve renderizar os children", () => {
    render(
      <QueryProvider>
        <div>Conteúdo interno</div>
      </QueryProvider>,
    );

    expect(screen.getByText("Conteúdo interno")).toBeInTheDocument();
  });
});
