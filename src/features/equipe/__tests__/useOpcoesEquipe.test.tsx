import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useOpcoesEquipe } from "../hooks/useOpcoesEquipe";
import type { EquipeDetalhe } from "../types/equipe.types";

const mocks = vi.hoisted(() => ({
  empresas: vi.fn(),
  profissionais: vi.fn(),
  lotes: vi.fn(),
  getValues: vi.fn(),
  setValue: vi.fn(),
}));
vi.mock("@/features/empresa/hooks/useEmpresas", () => ({ useEmpresas: mocks.empresas }));
vi.mock("@/features/profissional/hooks/useProfissionais", () => ({
  useTodosProfissionais: mocks.profissionais,
}));
vi.mock("@/features/lotes/hooks/useLotes", () => ({ useLotes: mocks.lotes }));

const methods = { getValues: mocks.getValues, setValue: mocks.setValue };
const equipe: EquipeDetalhe = {
  id: 1,
  uuid: "e1",
  nome: "Equipe",
  situacao: true,
  empresa: "empresa-atual",
  lote: "lote-atual",
  profissionais: [{ profissional: "p-atual", funcao: "f1" }],
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.empresas.mockReturnValue({
    data: {
      results: [
        { id: 1, uuid: "empresa-atual", nome: "Atual", cnpj: "111", status: false },
        { id: 2, uuid: "empresa-ativa", nome: "Ativa", cnpj: "222", status: true },
        { id: 3, uuid: "empresa-inativa", nome: "Inativa", cnpj: "333", status: false },
      ],
    },
  });
  mocks.profissionais.mockReturnValue({
    data: {
      results: [
        { uuid: "p-atual", nome: "Ana", cpf: "111", status: false, funcoes: [] },
        { uuid: "p-ativo", nome: "Bruno", cpf: "222", status: true, funcoes: [] },
        { uuid: "p-inativo", nome: "Caio", cpf: "333", status: false, funcoes: [] },
      ],
    },
  });
  mocks.lotes.mockReturnValue({ data: { results: [] } });
  mocks.getValues.mockReturnValue("");
});

describe("useOpcoesEquipe", () => {
  it("preserva empresa e profissional inativos vinculados na edição", () => {
    const { result } = renderHook(() => useOpcoesEquipe(equipe.empresa, methods, equipe));
    expect(result.current.empresasOpcoes).toEqual([
      { value: "empresa-atual", label: "111 - Atual" },
      { value: "empresa-ativa", label: "222 - Ativa" },
    ]);
    expect(result.current.profissionaisOpcoes).toEqual([
      { value: "p-atual", label: "111 - Ana" },
      { value: "p-ativo", label: "222 - Bruno" },
    ]);
    expect(result.current.profissionaisDisponiveis.map((item) => item.uuid)).toEqual([
      "p-atual",
      "p-ativo",
    ]);
    expect(mocks.setValue).not.toHaveBeenCalled();
  });

  it("preserva o lote vencido atual e exclui outros lotes vencidos", () => {
    mocks.lotes.mockReturnValue({
      data: {
        results: [
          {
            uuid: "lote-atual",
            nome: "Atual",
            periodo_inicial: "2020-01-01",
            periodo_final: "2020-12-31",
          },
          { uuid: "outro-vencido", nome: "Outro", periodo_final: "2020-12-31" },
        ],
      },
    });
    const { result } = renderHook(() => useOpcoesEquipe(equipe.empresa, methods, equipe));
    expect(result.current.lotesOpcoes).toEqual([
      { value: "lote-atual", label: "Atual - 01/01/2020 à 31/12/2020" },
    ]);
  });

  it("oferece somente cadastros ativos na criação", () => {
    const { result } = renderHook(() => useOpcoesEquipe("empresa-ativa", methods));
    expect(result.current.empresasOpcoes).toEqual([
      { value: "empresa-ativa", label: "222 - Ativa" },
    ]);
    expect(result.current.profissionaisOpcoes).toEqual([
      { value: "p-ativo", label: "222 - Bruno" },
    ]);
  });

  it("não tenta limpar um lote vazio ao trocar de empresa", () => {
    const { rerender } = renderHook(({ empresa }) => useOpcoesEquipe(empresa, methods), {
      initialProps: { empresa: "empresa-atual" },
    });
    rerender({ empresa: "empresa-ativa" });
    expect(mocks.getValues).toHaveBeenCalledWith("lote");
    expect(mocks.setValue).not.toHaveBeenCalled();
  });
});
