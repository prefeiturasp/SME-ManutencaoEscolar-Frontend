import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/fornecedor/components/FornecedorForm", () => ({
  FornecedorForm: () => <div>Fornecedor form</div>,
}));

import CadastrarFornecedorPage from "../page";

describe("CadastrarFornecedorPage", () => {
  it("deve renderizar o breadcrumb e o formulário", () => {
    render(<CadastrarFornecedorPage />);

    expect(screen.getByText(/fornecedor form/i)).toBeInTheDocument();
  });
});
