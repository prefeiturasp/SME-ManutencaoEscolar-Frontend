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
  uuid: "e1",
  nome: "Equipe",
  situacao: true,
  empresa: { id: 1, uuid: "empresa-atual", nome: "Atual", cnpj: "12345678000190" },
  lote: {
    uuid: "lote-atual",
    nome: "Atual",
    periodo_inicial: "2020-01-01",
    periodo_final: "2020-12-31",
  },
  profissionais: [
    { profissional: "p-atual", funcao: "f1", nome: "Ana", cpf: "111", nome_funcao: "Fun??o" },
  ],
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.empresas.mockReturnValue({
    data: {
      results: [
        { id: 1, uuid: "empresa-atual", nome: "Atual", cnpj: "12345678000190", status: false },
        { id: 2, uuid: "empresa-ativa", nome: "Ativa", cnpj: "98765432000110", status: true },
        { id: 3, uuid: "empresa-inativa", nome: "Inativa", cnpj: "11222333000181", status: false },
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
  it("resolve o ID pela lista quando o detalhe traz somente UUID", () => {
    const semId = {
      ...equipe,
      empresa: { uuid: equipe.empresa.uuid, nome: equipe.empresa.nome, cnpj: equipe.empresa.cnpj },
    };
    mocks.empresas.mockReturnValue({});
    const { result, rerender } = renderHook(() =>
      useOpcoesEquipe(semId.empresa.uuid, methods, semId),
    );
    expect(result.current.empresasOpcoes[0].value).toBe(semId.empresa.uuid);
    expect(result.current.lotesOpcoes[0].value).toBe(semId.lote.uuid);
    expect(mocks.lotes).toHaveBeenLastCalledWith(
      { page: 1, page_size: "all", empresa: undefined },
      { enabled: false, keepPreviousData: false },
    );
    mocks.empresas.mockReturnValue({
      data: { results: [{ ...semId.empresa, id: 2, status: true }] },
    });
    rerender();
    expect(mocks.lotes).toHaveBeenLastCalledWith(
      { page: 1, page_size: "all", empresa: 2 },
      { enabled: true, keepPreviousData: false },
    );
  });
  it("não duplica a função atual quando ela já veio na consulta", () => {
    mocks.profissionais.mockReturnValue({
      data: {
        results: [
          {
            uuid: "p-atual",
            nome: "Ana",
            cpf: "111",
            status: true,
            funcoes: [{ uuid: "f1", nome: "Função atualizada" }],
          },
        ],
      },
    });
    const { result } = renderHook(() => useOpcoesEquipe(equipe.empresa.uuid, methods, equipe));
    expect(result.current.profissionaisDisponiveis[0].funcoes).toEqual([
      { uuid: "f1", nome: "Função atualizada" },
    ]);
  });
  it("mostra os vínculos e inicia a busca de lotes antes de carregar as listas", () => {
    mocks.empresas.mockReturnValue({});
    mocks.profissionais.mockReturnValue({});
    mocks.lotes.mockReturnValue({});
    const { result } = renderHook(() => useOpcoesEquipe(equipe.empresa.uuid, methods, equipe));
    expect(result.current.empresasOpcoes).toEqual([
      { value: equipe.empresa.uuid, label: "12.345.678/0001-90 - Atual" },
    ]);
    expect(result.current.lotesOpcoes).toEqual([
      { value: equipe.lote.uuid, label: "Atual - 01/01/2020 à 31/12/2020" },
    ]);
    expect(result.current.profissionaisOpcoes).toEqual([{ value: "p-atual", label: "111 - Ana" }]);
    expect(result.current.profissionaisDisponiveis[0].funcoes).toEqual([
      { uuid: "f1", nome: equipe.profissionais[0].nome_funcao },
    ]);
    expect(mocks.lotes).toHaveBeenCalledWith(
      { page: 1, page_size: "all", empresa: equipe.empresa.id },
      { enabled: true, keepPreviousData: false },
    );
    expect(mocks.setValue).not.toHaveBeenCalled();
  });

  it("troca o filtro de empresa e remove a opção do lote original", () => {
    mocks.getValues.mockReturnValue(equipe.lote.uuid);
    const { result, rerender } = renderHook(
      ({ empresa }) => useOpcoesEquipe(empresa, methods, equipe),
      { initialProps: { empresa: equipe.empresa.uuid } },
    );
    rerender({ empresa: "empresa-ativa" });
    expect(result.current.lotesOpcoes).toEqual([]);
    expect(mocks.lotes).toHaveBeenLastCalledWith(
      { page: 1, page_size: "all", empresa: 2 },
      { enabled: true, keepPreviousData: false },
    );
    expect(mocks.setValue).toHaveBeenCalledWith("lote", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  });
  it("preserva empresa e profissional inativos vinculados na edição", () => {
    const { result } = renderHook(() => useOpcoesEquipe(equipe.empresa.uuid, methods, equipe));
    expect(result.current.empresasOpcoes).toEqual([
      { value: "empresa-atual", label: "12.345.678/0001-90 - Atual" },
      { value: "empresa-ativa", label: "98.765.432/0001-10 - Ativa" },
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
    const { result } = renderHook(() => useOpcoesEquipe(equipe.empresa.uuid, methods, equipe));
    expect(result.current.lotesOpcoes).toEqual([
      { value: "lote-atual", label: "Atual - 01/01/2020 à 31/12/2020" },
    ]);
  });

  it("oferece somente cadastros ativos na criação", () => {
    const { result } = renderHook(() => useOpcoesEquipe("empresa-ativa", methods));
    expect(result.current.empresasOpcoes).toEqual([
      { value: "empresa-ativa", label: "98.765.432/0001-10 - Ativa" },
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
