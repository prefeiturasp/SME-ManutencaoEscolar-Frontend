import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentProps } from "react";
import { EquipeLista } from "../components/list/EquipeLista";
import type { EquipeFiltros } from "../components/list/EquipeFiltros";
import type { TabelaEquipe } from "../components/list/TabelaEquipe";
import type { Paginacao } from "@/components/navigation/paginacao/Paginacao";

const mocks = vi.hoisted(() => ({
  equipes: vi.fn(),
  empresas: vi.fn(),
  lotes: vi.fn(),
  tabela: vi.fn(),
  filtros: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("../hooks/useEquipes", () => ({ useEquipes: mocks.equipes }));
vi.mock("@/features/empresa/hooks/useEmpresas", () => ({ useEmpresas: mocks.empresas }));
vi.mock("@/features/lotes/hooks/useLotes", () => ({ useLotes: mocks.lotes }));
vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: ({ exibir }: { exibir: boolean }) =>
    exibir ? <div role="status">Carregando</div> : null,
}));
vi.mock("@/components/shared/ListaVazia/ListaVazia", () => ({
  ListaVazio: ({ titulo }: { titulo: string }) => <p>{titulo}</p>,
}));
vi.mock("../components/list/TabelaEquipe", () => ({
  TabelaEquipe: (props: ComponentProps<typeof TabelaEquipe>) => {
    mocks.tabela(props);
    return <div data-testid="tabela" />;
  },
}));
vi.mock("../components/list/EquipeFiltros", () => ({
  EquipeFiltros: (props: ComponentProps<typeof EquipeFiltros>) => {
    mocks.filtros(props);
    return (
      <>
        {(["nome", "empresa", "lote", "status"] as const).map((campo) => (
          <input
            key={campo}
            aria-label={campo}
            value={props.valores[campo]}
            onChange={(event) => props.onMudar(campo, event.target.value)}
          />
        ))}
        <button onClick={props.onBuscar}>Buscar</button>
        <button onClick={props.onLimpar}>Limpar</button>
      </>
    );
  },
}));
vi.mock("@/components/navigation/paginacao/Paginacao", () => ({
  Paginacao: (props: ComponentProps<typeof Paginacao>) => (
    <>
      <button onClick={() => props.onMudarPagina(2)}>Página 2</button>
      <button onClick={() => props.onMudarRegistrosPorPagina(20)}>20 registros</button>
    </>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.equipes.mockReturnValue({
    data: { count: 1, results: [] },
    isLoading: false,
    isError: false,
    isFetching: false,
  });
  mocks.empresas.mockReturnValue({ data: { results: [] } });
  mocks.lotes.mockReturnValue({ data: { results: [] } });
});

describe("EquipeLista: integração dos dados e controles", () => {
  it("mostra carregamento sem tabela ou paginação quando os dados estão indisponíveis", () => {
    mocks.equipes.mockReturnValue({ isLoading: true });
    mocks.empresas.mockReturnValue({});
    mocks.lotes.mockReturnValue({});
    render(<EquipeLista />);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando");
    expect(screen.queryByTestId("tabela")).not.toBeInTheDocument();
    expect(screen.queryByText("Página 2")).not.toBeInTheDocument();
    expect(mocks.filtros).toHaveBeenLastCalledWith(
      expect.objectContaining({ opcoesEmpresas: [], opcoesLotes: [] }),
    );
  });

  it("tolera respostas sem results e exibe a lista vazia", () => {
    mocks.equipes.mockReturnValue({ data: {}, isLoading: false });
    mocks.empresas.mockReturnValue({ data: {} });
    mocks.lotes.mockReturnValue({ data: {} });
    render(<EquipeLista />);
    expect(screen.getByText("Não há equipes cadastradas")).toBeInTheDocument();
  });

  it.each([true, false])(
    "monta opções e resolve vínculos por UUID ou ID, com empresas em array=%s",
    (array) => {
      const empresas = [
        { id: 1, uuid: "e1", nome: "Empresa Norte" },
        { id: 2, uuid: "", nome: "Empresa Sul" },
      ];
      const lotes = [
        { id: 1, uuid: "l1", nome: "Lote Norte", codigo_cadastro: "001" },
        { id: 2, codigo_cadastro: "002" },
      ];
      const loteObjeto = { id: 3, nome: "Lote incorporado" };
      mocks.empresas.mockReturnValue({ data: array ? empresas : { results: empresas } });
      mocks.lotes.mockReturnValue({ data: { results: lotes } });
      mocks.equipes.mockReturnValue({
        data: {
          count: 4,
          results: [
            { uuid: "1", nome_empresa: "Empresa Norte", lote: "l1" },
            { uuid: "2", nome_empresa: "Empresa Sul", lote: 2 },
            { uuid: "3", nome_empresa: "Empresa incorporada", lote: loteObjeto },
            { uuid: "4", nome_empresa: "desconhecida", lote: "desconhecido" },
          ],
        },
        isFetching: true,
      });
      render(<EquipeLista />);
      expect(mocks.tabela).toHaveBeenLastCalledWith(
        expect.objectContaining({
          atualizando: true,
          equipes: [
            { uuid: "1", nome_empresa: "Empresa Norte", lote: lotes[0] },
            { uuid: "2", nome_empresa: "Empresa Sul", lote: lotes[1] },
            { uuid: "3", nome_empresa: "Empresa incorporada", lote: loteObjeto },
            { uuid: "4", nome_empresa: "desconhecida", lote: "desconhecido" },
          ],
        }),
      );
      expect(mocks.filtros).toHaveBeenLastCalledWith(
        expect.objectContaining({
          opcoesEmpresas: [
            { label: "Empresa Norte", value: "e1" },
            { label: "Empresa Sul", value: "2" },
          ],
          opcoesLotes: [
            { label: "Lote Norte", value: "l1" },
            { label: "002", value: "2" },
          ],
        }),
      );
    },
  );

  it.each([
    ["empresa", "e1", { empresa: "e1" }],
    ["lote", "l1", { lote: "l1" }],
    ["status", "ativo", { situacao: true }],
    ["status", "inativo", { situacao: false }],
  ])("aplica o filtro isolado %s=%s e distingue busca vazia", (campo, valor, esperado) => {
    mocks.equipes.mockReturnValue({ data: { count: 0, results: [] } });
    render(<EquipeLista />);
    fireEvent.change(screen.getByLabelText(campo), { target: { value: valor } });
    fireEvent.click(screen.getByText("Buscar"));
    expect(mocks.equipes).toHaveBeenLastCalledWith(
      expect.objectContaining({ ...esperado, page: 1, page_size: 10 }),
    );
    expect(screen.getByText("Não encontramos dados para esta busca")).toBeInTheDocument();
  });

  it("preserva filtros ao paginar e reinicia a página ao mudar a quantidade, buscar ou limpar", () => {
    render(<EquipeLista />);
    fireEvent.change(screen.getByLabelText("nome"), { target: { value: " Norte " } });
    fireEvent.click(screen.getByText("Buscar"));
    fireEvent.click(screen.getByText("Página 2"));
    expect(mocks.equipes).toHaveBeenLastCalledWith(
      expect.objectContaining({ nome: "Norte", page: 2, page_size: 10 }),
    );
    fireEvent.click(screen.getByText("20 registros"));
    expect(mocks.equipes).toHaveBeenLastCalledWith(
      expect.objectContaining({ nome: "Norte", page: 1, page_size: 20 }),
    );
    fireEvent.click(screen.getByText("Página 2"));
    fireEvent.click(screen.getByText("Buscar"));
    expect(mocks.equipes).toHaveBeenLastCalledWith(
      expect.objectContaining({ nome: "Norte", page: 1, page_size: 20 }),
    );
    fireEvent.click(screen.getByText("Limpar"));
    expect(mocks.equipes).toHaveBeenLastCalledWith({ page: 1, page_size: 20 });
    expect(screen.getByLabelText("nome")).toHaveValue("");
    fireEvent.click(screen.getByText("Buscar"));
    expect(mocks.equipes).toHaveBeenLastCalledWith({
      nome: undefined,
      empresa: undefined,
      lote: undefined,
      situacao: undefined,
      page: 1,
      page_size: 20,
    });
  });
});
