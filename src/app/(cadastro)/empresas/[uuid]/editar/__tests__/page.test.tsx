import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { empresaFormMock } = vi.hoisted(() => ({
  empresaFormMock: vi.fn(),
}));

vi.mock("@/features/empresa/components/form/EmpresaForm", () => ({
  EmpresaForm: (props: { uuid?: string }) => {
    empresaFormMock(props);
    return <div>Empresa form</div>;
  },
}));

import EditarEmpresaPage from "../page";

describe("EditarEmpresaPage", () => {
  it("deve renderizar o breadcrumb e o formulário com o uuid da rota", async () => {
    const jsx = await EditarEmpresaPage({
      params: Promise.resolve({ uuid: "uuid-1" }),
    });

    render(jsx);

    expect(screen.getByText(/empresa form/i)).toBeInTheDocument();
    expect(empresaFormMock).toHaveBeenCalledWith({ uuid: "uuid-1" });
  });
});
