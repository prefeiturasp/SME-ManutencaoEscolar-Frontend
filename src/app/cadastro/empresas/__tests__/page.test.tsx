import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import EmpresasPage from "../page";

vi.mock("@/features/fornecedor/components/list/FornecedorLista", () => ({
  FornecedorLista: () => <div data-testid="fornecedor-lista" />,
}));

describe("EmpresasPage", () => {
  it("deve renderizar a listagem de empresas", () => {
    render(<EmpresasPage />);

    expect(screen.getByTestId("fornecedor-lista")).toBeInTheDocument();
  });
});
