import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SolicitacaoManutencaoLista } from "../components/list/SolicitacaoManutencaoLista";
import type { SolicitacaoManutencaoResumo } from "../types/solicitacaoManutencao.types";

const mocks = vi.hoisted(() => ({
  consultar: vi.fn(),
  semOpcoes: false,
  carregandoOpcoes: false,
  falhas: [] as string[],
  refetch: vi.fn(),
}));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("../hooks/useSolicitacoesManutencao", () => ({
  useSolicitacoesManutencao: mocks.consultar,
}));

const solicitacao: SolicitacaoManutencaoResumo = {
  uuid: "s1",
  codigo: "0012345",
  tipo_atendimento: "urgente",
  data_envio: "2026-07-21T10:00:00-03:00",
  fase: "execucao",
  situacao: "execucao_agendada",
};
function preparar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <SolicitacaoManutencaoLista />
    </QueryClientProvider>,
  );
  return userEvent.setup();
}
async function escolher(
  user: ReturnType<typeof userEvent.setup>,
  campo: string,
  opcao: string | string[],
) {
  const opcoes = Array.isArray(opcao) ? opcao : [opcao];
  if (campo === "Registros por página") {
    await user.click(screen.getByRole("combobox", { name: campo }));
    await user.click(await screen.findByRole("option", { name: opcoes[0] }));
    return;
  }
  await user.click(screen.getByRole("button", { name: campo }));
  for (const nome of opcoes) {
    await user.click(screen.getByRole("checkbox", { name: nome }));
  }
  await user.keyboard("{Escape}");
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.semOpcoes = false;
  mocks.carregandoOpcoes = false;
  mocks.falhas = [];
  mocks.consultar.mockReturnValue({
    data: { count: 21, results: [solicitacao] },
    isLoading: false,
    isFetching: false,
    isError: false,
  });
});

describe("SolicitacaoManutencaoLista", () => {
  it("mostra o carregamento inicial sem dados e sem antecipar a mensagem de lista vazia", () => {
    mocks.consultar.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
    });
    preparar();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText("Não há solicitações cadastradas")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("mostra etiquetas e remove cada seleção sem abrir a lista ou buscar automaticamente", async () => {
    const user = preparar();
    await escolher(user, "Fase", "Execução");
    await escolher(user, "Fase", "Vistoria");
    const fase = screen.getByRole("button", { name: "Fase" });
    expect(screen.getByRole("button", { name: "Remover Execução" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Remover Vistoria" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Remover Execução" }));
    expect(screen.queryByRole("button", { name: "Remover Execução" })).not.toBeInTheDocument();
    expect(fase).toHaveAttribute("aria-expanded", "false");
    expect(fase).toHaveFocus();
    expect(mocks.consultar).toHaveBeenLastCalledWith(expect.objectContaining({ fase: undefined }));
    await user.click(fase);
    expect(screen.getByRole("checkbox", { name: "Execução" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Vistoria" })).toBeChecked();
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Buscar solicitação" }));
    expect(mocks.consultar).toHaveBeenLastCalledWith(expect.objectContaining({ fase: "vistoria" }));
    screen.getByRole("button", { name: "Remover Vistoria" }).focus();
    await user.keyboard("{Enter}");
    expect(fase).toHaveFocus();
    expect(fase).toHaveTextContent("Selecione");
    await user.click(screen.getByRole("button", { name: "Buscar solicitação" }));
    expect(mocks.consultar).toHaveBeenLastCalledWith(expect.objectContaining({ fase: undefined }));
  });
  it("seleciona todas, limpa todas e permite selecionar opções com teclado", async () => {
    const user = preparar();
    const fase = screen.getByRole("button", { name: "Fase" });
    await user.click(fase);
    const todas = screen.getByRole("checkbox", { name: "Selecionar todas" });
    await user.click(screen.getByRole("checkbox", { name: "Vistoria" }));
    expect(todas).toBePartiallyChecked();
    expect(fase).toHaveAttribute("aria-expanded", "true");
    await user.click(todas);
    screen.getAllByRole("checkbox").forEach((checkbox) => expect(checkbox).toBeChecked());
    await user.click(todas);
    screen.getAllByRole("checkbox").forEach((checkbox) => expect(checkbox).not.toBeChecked());
    await user.tab();
    expect(screen.getByRole("checkbox", { name: "Solicitação" })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("checkbox", { name: "Solicitação" })).toBeChecked();
    await user.keyboard("{Escape}");
    expect(fase).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Buscar solicitação" }));
    expect(mocks.consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({ fase: "solicitacao" }),
    );
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(fase).toHaveTextContent("Selecione");
    await user.click(fase);
    screen.getAllByRole("checkbox").forEach((checkbox) => expect(checkbox).not.toBeChecked());
  });
  it("aplica o intervalo de envio apenas ao buscar e limpa as datas", async () => {
    const user = preparar();
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 10);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 15);
    await user.click(screen.getByRole("button", { name: "Data de envio" }));
    await user.click(
      screen.getByRole("button", { name: new RegExp(format(inicio, "PPPP", { locale: ptBR })) }),
    );
    await user.click(
      screen.getByRole("button", { name: new RegExp(format(fim, "PPPP", { locale: ptBR })) }),
    );
    expect(mocks.consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({ data_envio_after: undefined, data_envio_before: undefined }),
    );
    await user.click(screen.getByRole("button", { name: "Buscar solicitação" }));
    expect(mocks.consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data_envio_after: format(inicio, "yyyy-MM-dd"),
        data_envio_before: format(fim, "yyyy-MM-dd"),
      }),
    );
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getByRole("button", { name: "Data de envio" })).toHaveTextContent("00/00/0000");
  });
  it("mostra dados reais da consulta, preserva zeros do código e deixa as ações desabilitadas", () => {
    preparar();
    expect(screen.getByRole("link", { name: "Nova solicitação" })).toHaveAttribute(
      "href",
      "/solicitacao_manutencao/nova-solicitacao",
    );
    const tabela = within(screen.getByRole("table"));
    for (const titulo of [
      "Código da solicitação",
      "Tipo de atendimento",
      "Data de envio",
      "Fase",
      "Situação",
      "Ações",
    ]) {
      expect(tabela.getByRole("columnheader", { name: titulo })).toBeInTheDocument();
    }
    for (const texto of ["0012345", "Urgente", "21/07/2026", "Execução", "Execução agendada"])
      expect(tabela.getByText(texto)).toBeInTheDocument();
    expect(tabela.getAllByRole("button")).toHaveLength(3);
    tabela.getAllByRole("button").forEach((botao) => expect(botao).toBeDisabled());
  });

  it("só aplica filtros ao buscar e preserva a busca ao paginar", async () => {
    const user = preparar();
    fireEvent.change(screen.getByLabelText("Número da solicitação"), {
      target: { value: " 0012345 " },
    });
    await escolher(user, "Fase", ["Vistoria", "Execução"]);
    await escolher(user, "Situação", "Vistoria aprovada");
    await escolher(user, "Tipo de atendimento", ["Urgente", "Comum"]);
    expect(mocks.consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({ codigo: undefined, fase: undefined }),
    );
    await user.click(screen.getByRole("button", { name: "Buscar solicitação" }));
    expect(mocks.consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        codigo: "0012345",
        fase: "vistoria,execucao",
        situacao: "vistoria_aprovada",
        tipo_atendimento: "urgente,comum",
        page: 1,
        page_size: 10,
      }),
    );
    fireEvent.change(screen.getByLabelText("Número da solicitação"), {
      target: { value: "rascunho ainda não aplicado" },
    });
    await user.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(mocks.consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        codigo: "0012345",
        fase: "vistoria,execucao",
        situacao: "vistoria_aprovada",
        tipo_atendimento: "urgente,comum",
        page: 2,
      }),
    );
    await escolher(user, "Registros por página", "20");
    expect(mocks.consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({ codigo: "0012345", page: 1, page_size: 20 }),
    );
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getByLabelText("Número da solicitação")).toHaveValue("");
    expect(mocks.consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({
        codigo: undefined,
        fase: undefined,
        situacao: undefined,
        tipo_atendimento: undefined,
        data_envio_after: undefined,
        data_envio_before: undefined,
        page: 1,
        page_size: 20,
      }),
    );
  });

  it("permite buscar com Enter e volta à primeira página", async () => {
    const user = preparar();
    await user.click(screen.getByRole("button", { name: "Próxima página" }));
    await user.type(screen.getByLabelText("Número da solicitação"), "123{Enter}");
    expect(mocks.consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({ codigo: "123", page: 1 }),
    );
  });

  it("diferencia carregamento e erro sem exibir dados antigos como resultado válido", () => {
    mocks.consultar.mockReturnValue({
      data: { count: 1, results: [solicitacao] },
      isLoading: true,
      isError: false,
    });
    const client = new QueryClient();
    const { rerender } = render(
      <QueryClientProvider client={client}>
        <SolicitacaoManutencaoLista />
      </QueryClientProvider>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    mocks.consultar.mockReturnValue({
      data: { count: 1, results: [solicitacao] },
      isLoading: false,
      isError: true,
    });
    rerender(
      <QueryClientProvider client={client}>
        <SolicitacaoManutencaoLista />
      </QueryClientProvider>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível carregar as solicitações.",
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("diferencia ausência de cadastros e busca sem resultados", async () => {
    mocks.consultar.mockReturnValue({
      data: { count: 0, results: [] },
      isLoading: false,
      isError: false,
    });
    const user = preparar();
    expect(screen.getByText("Não há solicitações cadastradas")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Número da solicitação"), "999");
    await user.click(screen.getByRole("button", { name: "Buscar solicitação" }));
    expect(screen.getByText("Não encontramos dados para esta busca")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it.each([null, "invalida"])(
    "trata data ausente ou inválida (%s) sem quebrar a tabela",
    (data_envio) => {
      mocks.consultar.mockReturnValue({
        data: {
          count: 1,
          results: [{ ...solicitacao, data_envio, fase: "Fase nova", situacao: "" }],
        },
        isLoading: false,
        isError: false,
      });
      preparar();
      const tabela = within(screen.getByRole("table"));
      expect(tabela.getByText("Fase nova")).toBeInTheDocument();
      expect(tabela.getAllByText("—")).toHaveLength(2);
    },
  );
});

vi.mock("../hooks/useOpcoesSolicitacaoManutencao", () => ({
  useOpcoesSolicitacaoManutencao: (campo: string) => ({
    data: mocks.semOpcoes
      ? undefined
      : campo === "fases"
        ? [
            { value: "solicitacao", label: "Solicitação" },
            { value: "vistoria", label: "Vistoria" },
            { value: "execucao", label: "Execução" },
          ]
        : campo === "situacoes"
          ? [
              { value: "nao_enviado_dre", label: "Não enviada para DRE" },
              { value: "aguardando_analise_dre", label: "Aguardando Analise DRE" },
              { value: "vistoria_aprovada", label: "Vistoria aprovada" },
              { value: "execucao_agendada", label: "Execução agendada" },
              { value: "execucao_em_andamento", label: "Execução em andamento" },
            ]
          : [
              { value: "comum", label: "Comum" },
              { value: "urgente", label: "Urgente" },
            ],
    isPending: mocks.carregandoOpcoes,
    isError: mocks.falhas.includes(campo),
    refetch: () => mocks.refetch(campo),
  }),
}));

it("repete apenas os catalogos com falha e preserva os filtros disponiveis", async () => {
  mocks.falhas = ["fases", "situacoes"];
  const user = preparar();
  expect(screen.getByRole("alert")).toHaveTextContent(/carregar as/);
  expect(screen.getByRole("button", { name: "Fase" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Situa\u00e7\u00e3o" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Tipo de atendimento" })).toBeEnabled();
  await user.click(screen.getByRole("button", { name: "Tentar novamente" }));
  expect(mocks.refetch.mock.calls).toEqual([["fases"], ["situacoes"]]);
});

it("mantem a tabela utilizavel enquanto os catalogos ainda nao chegaram", () => {
  mocks.semOpcoes = true;
  mocks.carregandoOpcoes = true;
  preparar();
  const tabela = within(screen.getByRole("table"));
  expect(tabela.getByText("urgente")).toBeInTheDocument();
  expect(tabela.getByText("execucao")).toBeInTheDocument();
  expect(tabela.getByText("execucao_agendada")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Fase" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Situa\u00e7\u00e3o" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Tipo de atendimento" })).toBeDisabled();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
