import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Home from "../page";
import { useHealth } from "@/hooks/useHealth";

vi.mock("@/hooks/useHealth", () => ({
  useHealth: vi.fn(),
}));

const mockedUseHealth = vi.mocked(useHealth);

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar os textos principais da página", () => {
    mockedUseHealth.mockReturnValue("ok");

    render(<Home />);

    expect(screen.getByText("Status da API")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Health check" }),
    ).toBeInTheDocument();
    expect(screen.getByText("O endpoint retornou:")).toBeInTheDocument();
  });

  it("deve exibir o status retornado pelo hook useHealth", () => {
    mockedUseHealth.mockReturnValue("ok");

    render(<Home />);

    expect(screen.getByText("ok")).toBeInTheDocument();
    expect(mockedUseHealth).toHaveBeenCalledTimes(1);
  });

  it("deve exibir indisponível quando o hook retornar esse status", () => {
    mockedUseHealth.mockReturnValue("indisponível");

    render(<Home />);

    expect(screen.getByText("indisponível")).toBeInTheDocument();
  });
});