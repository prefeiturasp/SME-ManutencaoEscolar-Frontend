import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EquipeLista } from "../components/list/EquipeLista";

const mocks = vi.hoisted(() => ({ useEquipes: vi.fn(), push: vi.fn() }));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("../hooks/useEquipes", () => ({ useEquipes: mocks.useEquipes }));
vi.mock("@/features/empresa/hooks/useEmpresas", () => ({
  useEmpresas: () => ({ data: { results: [] } }),
}));
vi.mock("@/features/lotes/hooks/useLotes", () => ({ useLotes: () => ({ data: { results: [] } }) }));
vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({ LoadingGlobal: () => null }));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.useEquipes.mockReturnValue({
    data: {
      count: 1,
      results: [
        {
          id: 1,
          uuid: "equipe-1",
          nome: "Equipe Elétrica Norte",
          situacao: true,
          nome_empresa: "Empresa Norte",
          lote: {
            id: 1,
            nome: "Lote 005",
            periodo_inicial: "2026-01-01",
            periodo_final: "2026-12-31",
          },
        },
      ],
    },
    isLoading: false,
    isFetching: false,
    isError: false,
  });
});

describe("EquipeLista", () => {
  it("exibe os títulos, filtros e link de cadastro", () => {
    render(<EquipeLista />);
    expect(screen.getByRole("heading", { name: "Equipes" })).toBeInTheDocument();
    expect(screen.getByText("Equipes cadastradas")).toBeInTheDocument();
    expect(
      screen.getByText("Estas são as equipes que já estão cadastradas no sistema."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cadastrar equipe" })).toHaveAttribute(
      "href",
      "/empresas/equipes/cadastrar",
    );
    for (const name of ["Empresa", "Lote", "Situação"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });
  it("exibe as colunas e o período do lote e direciona para edição", () => {
    render(<EquipeLista />);
    for (const name of ["Nome da equipe", "Empresa", "Lote", "Situação", "Ações"]) {
      expect(screen.getByRole("columnheader", { name })).toBeInTheDocument();
    }
    expect(screen.getByText("Empresa Norte")).toBeInTheDocument();
    expect(screen.getByText("01/01/2026 à 31/12/2026")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Editar Equipe Elétrica Norte" }));
    expect(mocks.push).toHaveBeenCalledWith("/empresas/equipes/equipe-1/editar");
  });
  it("aplica a busca apenas ao enviar e limpa os filtros", () => {
    render(<EquipeLista />);
    fireEvent.change(screen.getByLabelText("Nome da equipe"), { target: { value: "  Norte  " } });
    expect(mocks.useEquipes).toHaveBeenLastCalledWith({ page: 1, page_size: 10 });
    fireEvent.click(screen.getByRole("button", { name: "Buscar equipe" }));
    expect(mocks.useEquipes).toHaveBeenLastCalledWith(
      expect.objectContaining({ nome: "Norte", page: 1 }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getByLabelText("Nome da equipe")).toHaveValue("");
    expect(mocks.useEquipes).toHaveBeenLastCalledWith({ page: 1, page_size: 10 });
  });
  it("diferencia lista vazia de busca sem resultados", () => {
    mocks.useEquipes.mockReturnValue({
      data: { count: 0, results: [] },
      isLoading: false,
      isError: false,
    });
    render(<EquipeLista />);
    expect(screen.getByText("Não há equipes cadastradas")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Nome da equipe"), { target: { value: "Norte" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar equipe" }));
    expect(screen.getByText("Não encontramos dados para esta busca")).toBeInTheDocument();
  });
  it("exibe erro quando a consulta falha", () => {
    mocks.useEquipes.mockReturnValue({ isLoading: false, isError: true });
    render(<EquipeLista />);
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar as equipes.");
  });
});
