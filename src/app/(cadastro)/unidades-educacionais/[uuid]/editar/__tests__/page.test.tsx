import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { unidadeFormMock } = vi.hoisted(() => ({
  unidadeFormMock: vi.fn(),
}));

vi.mock("@/features/unidade_educacional/components/form/FormularioUnidadeEducacional", () => ({
  UnidadeEducacionalForm: (props: { uuid?: string }) => {
    unidadeFormMock(props);
    return <div>Unidade form</div>;
  },
}));

import EditarUnidadeEducacionalPage from "../page";

describe("EditarEmpresaPage", () => {
  it("deve renderizar o breadcrumb e o formulário com o uuid da rota", async () => {
    const jsx = await EditarUnidadeEducacionalPage({
      params: Promise.resolve({ uuid: "uuid-1" }),
    });

    render(jsx);

    expect(screen.getByText(/Unidade form/i)).toBeInTheDocument();
    expect(unidadeFormMock).toHaveBeenCalledWith({ uuid: "uuid-1" });
  });
});
