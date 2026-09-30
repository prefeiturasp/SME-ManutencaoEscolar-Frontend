import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/profissional/components/form/ProfissionalForm", () => ({
  ProfissionalForm: () => <div>Profissional form</div>,
}));

import CadastrarProfissionalPage from "../page";

describe("CadastrarProfissionalPage", () => {
  it("deve renderizar o breadcrumb e o formulário", () => {
    render(<CadastrarProfissionalPage />);

    expect(screen.getByText(/profissional form/i)).toBeInTheDocument();
  });
});
