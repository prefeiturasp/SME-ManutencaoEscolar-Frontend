import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardPage from "../page";

describe("DashboardPage", () => {
  it("renderiza o conteúdo da página", () => {
    const { container } = render(<DashboardPage />);

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
