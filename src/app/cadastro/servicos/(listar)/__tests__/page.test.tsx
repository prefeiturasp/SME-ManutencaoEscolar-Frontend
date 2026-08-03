import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Listar from "../page";

const { listarServicoMock } = vi.hoisted(() => ({
  listarServicoMock: vi.fn(),
}));

vi.mock("@/features/servico/components/ServicoForm/ListarServico", () => ({
  ListarServico: () => {
    listarServicoMock();

    return <div data-testid="listar-servico">Listagem de serviços</div>;
  },
}));

describe("Listar", () => {
  it("deve renderizar o componente de listagem de serviços", () => {
    render(<Listar />);

    expect(screen.getByTestId("listar-servico")).toBeInTheDocument();

    expect(listarServicoMock).toHaveBeenCalledTimes(1);
  });

  it("deve aplicar o espaçamento da listagem", () => {
    render(<Listar />);

    const listagem = screen.getByTestId("listar-servico");

    expect(listagem.parentElement).toHaveClass("ml-2");
  });
});
