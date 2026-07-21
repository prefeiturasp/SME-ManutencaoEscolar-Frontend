import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "../dashboard/page";

describe("Home", () => {
  it("deve renderizar o conteúdo da página", () => {
    const { container } = render(<Home />);

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
