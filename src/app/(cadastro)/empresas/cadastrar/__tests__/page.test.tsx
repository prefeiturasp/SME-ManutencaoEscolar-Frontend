import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/empresa/components/form/EmpresaForm", () => ({
  EmpresaForm: () => <div>Empresa form</div>,
}));

import CadastrarEmpresaPage from "../page";

describe("CadastrarEmpresaPage", () => {
  it("deve renderizar o breadcrumb e o formulário", () => {
    render(<CadastrarEmpresaPage />);

    expect(screen.getByText(/empresa form/i)).toBeInTheDocument();
  });
});
