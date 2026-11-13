import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SolicitacaoManutencaoLista } from "../components/list/SolicitacaoManutencaoLista";
import type { SolicitacaoManutencaoResumo } from "../types/solicitacaoManutencao.types";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { useOpcoesServicos } from "@/features/servico/hooks/useOpcoesServicos";
import { useTodasUnidadesEducacionais } from "@/features/unidade_educacional/hooks/useUnidadesEducacionais";

const mocks = vi.hoisted(() => ({
  consultar: vi.fn(),
  semOpcoes: false,
  semSituacoes: false,
  carregandoOpcoes: false,
  falhas: [] as string[],
  refetch: vi.fn(),
  servicos: {
    data: [
      { value: "s-pintura", label: "Pintura" },
      { value: "s-hidraulica", label: "Hidráulica" },
    ] as { value: string; label: string }[] | undefined,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  },
  unidades: {
    data: [
      { uuid: "ue1", nome: "Escola teste", codigo_eol: "123" },
      { uuid: "ue2", nome: "", codigo_eol: "456" },
    ] as { uuid: string; nome: string; codigo_eol: string }[] | undefined,
    isPending: false,
    isPlaceholderData: false,
    isError: false,
    refetch: vi.fn(),
  },
}));
vi.mock("@/features/servico/hooks/useOpcoesServicos", () => ({
  useOpcoesServicos: vi.fn(() => mocks.servicos),
}));
vi.mock("@/features/unidade_educacional/hooks/useUnidadesEducacionais", () => ({
  useTodasUnidadesEducacionais: vi.fn(() => mocks.unidades),
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
  useUsuarioStore.getState().limparUsuario();
  mocks.servicos.data = [
    { value: "s-pintura", label: "Pintura" },
    { value: "s-hidraulica", label: "Hidráulica" },
  ];
  mocks.servicos.isPending = false;
  mocks.servicos.isError = false;
  mocks.unidades.data = [
    { uuid: "ue1", nome: "Escola teste", codigo_eol: "123" },
    { uuid: "ue2", nome: "", codigo_eol: "456" },
  ];
  mocks.unidades.isPending = false;
  mocks.unidades.isPlaceholderData = false;
  mocks.unidades.isError = false;
  mocks.semOpcoes = false;
  mocks.semSituacoes = false;
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
  it("mostra dados reais da consulta, preserva zeros do código e permite visualizar", () => {
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
    expect(tabela.getByRole("button", { name: "Editar solicitação 0012345" })).toBeDisabled();
    expect(tabela.getByRole("button", { name: "Enviar para DRE 0012345" })).toBeDisabled();
    expect(tabela.getByRole("link", { name: "Detalhes da solicitação 0012345" })).toHaveAttribute(
      "href",
      "/solicitacao_manutencao/visualizar/s1",
    );
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
    data:
      mocks.semOpcoes || (campo === "situacoes" && mocks.semSituacoes)
        ? undefined
        : campo === "fases"
          ? [
              { value: "solicitacao", label: "Solicitação" },
              { value: "vistoria", label: "Vistoria" },
              { value: "execucao", label: "Execução" },
            ]
          : campo === "situacoes"
            ? {
                solicitacao: [
                  { value: "nao_enviado_dre", label: "Não enviada para DRE" },
                  { value: "aguardando_analise_dre", label: "Aguardando Analise DRE" },
                ],
                vistoria: [{ value: "vistoria_aprovada", label: "Vistoria aprovada" }],
                execucao: [
                  { value: "execucao_agendada", label: "Execução agendada" },
                  { value: "execucao_em_andamento", label: "Execução em andamento" },
                ],
              }
            : [
                { value: "comum", label: "Comum" },
                { value: "urgente", label: "Urgente" },
              ],
    isPending: mocks.carregandoOpcoes || (campo === "situacoes" && mocks.semSituacoes),
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

describe("situações disponíveis por fase", () => {
  it("permite selecionar a fase enquanto o catálogo de situações ainda está carregando", async () => {
    mocks.semSituacoes = true;
    const user = preparar();
    expect(screen.getByRole("button", { name: "Situação" })).toBeDisabled();
    await escolher(user, "Fase", "Vistoria");
    await user.click(screen.getByRole("button", { name: "Buscar solicitação" }));
    expect(mocks.consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({ fase: "vistoria", situacao: undefined }),
    );

    mocks.semSituacoes = false;
    fireEvent.change(screen.getByLabelText("Número da solicitação"), {
      target: { value: "123" },
    });
    await user.click(screen.getByRole("button", { name: "Situação" }));
    expect(screen.getByRole("checkbox", { name: "Vistoria aprovada" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Execução agendada" })).not.toBeInTheDocument();
  });

  it.each([
    ["Solicitação", ["Não enviada para DRE", "Aguardando Analise DRE"]],
    ["Vistoria", ["Vistoria aprovada"]],
    ["Execução", ["Execução agendada", "Execução em andamento"]],
  ] as const)("mostra somente situações de %s", async (fase, situacoes) => {
    const user = preparar();
    await escolher(user, "Fase", fase);
    await user.click(screen.getByRole("button", { name: "Situação" }));
    expect(
      screen.getAllByRole("checkbox").map((checkbox) => checkbox.parentElement?.textContent),
    ).toEqual(["Selecionar todas", ...situacoes]);
  });

  it("combina fases e remove somente situações que deixam de ser válidas", async () => {
    const user = preparar();
    await escolher(user, "Fase", ["Vistoria", "Execução"]);
    await escolher(user, "Situação", ["Vistoria aprovada", "Execução agendada"]);
    await escolher(user, "Fase", "Vistoria");
    expect(
      screen.queryByRole("button", { name: "Remover Vistoria aprovada" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remover Execução agendada" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Buscar solicitação" }));
    expect(mocks.consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({ fase: "execucao", situacao: "execucao_agendada" }),
    );
  });

  it("volta a mostrar todas as situações ao remover a última fase", async () => {
    const user = preparar();
    await escolher(user, "Fase", "Vistoria");
    await escolher(user, "Situação", "Vistoria aprovada");
    await user.click(screen.getByRole("button", { name: "Remover Vistoria" }));
    await user.click(screen.getByRole("button", { name: "Situação" }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(6);
    expect(screen.getByRole("checkbox", { name: "Vistoria aprovada" })).toBeChecked();
  });

  it("limpa a situação anterior ao trocar para outra fase", async () => {
    const user = preparar();
    await escolher(user, "Situação", "Não enviada para DRE");
    await escolher(user, "Fase", "Execução");
    await user.click(screen.getByRole("button", { name: "Buscar solicitação" }));
    expect(mocks.consultar).toHaveBeenLastCalledWith(
      expect.objectContaining({ fase: "execucao", situacao: undefined }),
    );
  });
});

function definirCargo(cargo: string, codigoPerfil = "DRE") {
  useUsuarioStore.getState().definirUsuario({
    nome: "Usuário",
    codigoRfOuCpf: "123",
    cargo,
    perfil: { codigo: codigoPerfil, descricao: codigoPerfil },
    diretoriaRegional: "DRE",
    unidadeEducacional: {
      id: 2074,
      uuid: "ue1",
      nome: "Escola teste",
      codigo_eol: "000086",
      diretoria_regional: { id: 3, nome_curto: "DRE GUAIANASES" },
    },
    funcionalidades: [],
  });
}

it.each([null, "UE", "DRE", "SME", "EMPRESA"])(
  "mantém envio visível e habilita somente para UE, perfil atual: %s",
  (codigoPerfil) => {
    if (codigoPerfil) definirCargo("Mesmo cargo", codigoPerfil);
    mocks.consultar.mockReturnValue({
      data: { count: 1, results: [{ ...solicitacao, situacao: "nao_enviado_dre" }] },
      isLoading: false,
      isError: false,
    });
    preparar();
    const enviar = screen.getByRole("button", { name: "Enviar para DRE 0012345" });
    if (codigoPerfil === "UE") expect(enviar).toBeEnabled();
    else expect(enviar).toBeDisabled();
  },
);

it.each([null, "UE", "SME", "EMPRESA", "dre"])(
  "não mostra nem consulta os catálogos exclusivos para perfil %s",
  (codigoPerfil) => {
    if (codigoPerfil) definirCargo("Gestor DRE", codigoPerfil);
    preparar();
    expect(screen.queryByRole("button", { name: "Solicitante" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Serviço" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Unidade Educacional" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Servidor responsável")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fase" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Situação" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tipo de atendimento" })).toBeInTheDocument();
    expect(useOpcoesServicos).not.toHaveBeenCalled();
    expect(useTodasUnidadesEducacionais).not.toHaveBeenCalled();
  },
);

it.each(["Gestor DRE ", "Diretor de Escola", "Administrador"])(
  "mostra os filtros do perfil DRE independentemente do cargo %s",
  (cargo) => {
    definirCargo(cargo);
    preparar();
    for (const label of [
      "Solicitante",
      "Serviço",
      "Unidade Educacional",
      "Fase",
      "Situação",
      "Tipo de atendimento",
      "Data de envio",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeEnabled();
    }
  },
);

it("aplica os filtros DRE somente na busca, preserva ao paginar e limpa todos", async () => {
  definirCargo("Gestor DRE ");
  const user = preparar();
  await escolher(user, "Solicitante", ["UE", "DRE"]);
  await escolher(user, "Serviço", ["Pintura", "Hidráulica"]);
  await user.click(screen.getByRole("button", { name: "Unidade Educacional" }));
  await user.click(screen.getByRole("option", { name: "Escola teste" }));
  expect(mocks.consultar).toHaveBeenLastCalledWith(
    expect.objectContaining({
      solicitante: undefined,
      servico: undefined,
      unidade_educacional: undefined,
      servidor_responsavel: undefined,
    }),
  );
  await user.click(screen.getByRole("button", { name: "Buscar solicitação" }));
  const filtros = {
    solicitante: "ue,dre",
    servico: "s-pintura,s-hidraulica",
    unidade_educacional: "ue1",
  };
  expect(mocks.consultar).toHaveBeenLastCalledWith(
    expect.objectContaining({ ...filtros, page: 1 }),
  );
  await user.click(screen.getByRole("button", { name: "Próxima página" }));
  expect(mocks.consultar).toHaveBeenLastCalledWith(
    expect.objectContaining({ ...filtros, page: 2 }),
  );
  await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
  expect(mocks.consultar).toHaveBeenLastCalledWith(
    expect.objectContaining({
      solicitante: undefined,
      servico: undefined,
      unidade_educacional: undefined,
      servidor_responsavel: undefined,
      page: 1,
    }),
  );
  for (const label of ["Solicitante", "Serviço", "Unidade Educacional"]) {
    expect(screen.getByRole("button", { name: label })).toHaveTextContent("Selecione");
  }
});

it("repete a consulta de unidades com falha sem bloquear os demais filtros", async () => {
  definirCargo("Gestor DRE");
  mocks.servicos.isError = true;
  mocks.unidades.isError = true;
  const user = preparar();
  expect(screen.getByRole("button", { name: "Serviço" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Unidade Educacional" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Solicitante" })).toBeEnabled();
  const alerta = screen.getByRole("alert");
  expect(alerta).toHaveTextContent("Não foi possível carregar as unidades educacionais.");
  await user.click(within(alerta).getByRole("button", { name: "Tentar novamente" }));
  expect(mocks.servicos.refetch).not.toHaveBeenCalled();
  expect(mocks.unidades.refetch).toHaveBeenCalledOnce();
});

it("mostra os filtros DRE desabilitados enquanto carrega suas listas", () => {
  definirCargo("Gestor DRE");
  mocks.servicos.isPending = true;
  mocks.servicos.data = undefined;
  mocks.unidades.isPending = true;
  mocks.unidades.data = undefined;
  preparar();
  expect(screen.getByRole("button", { name: "Serviço" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Unidade Educacional" })).toBeDisabled();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("usa o código EOL quando a unidade não possui nome", async () => {
  definirCargo("Gestor DRE");
  const user = preparar();
  await user.click(screen.getByRole("button", { name: "Unidade Educacional" }));
  await user.click(screen.getByRole("option", { name: "456" }));
  await user.click(screen.getByRole("button", { name: "Buscar solicitação" }));
  expect(mocks.consultar).toHaveBeenLastCalledWith(
    expect.objectContaining({ unidade_educacional: "ue2" }),
  );
});

it("deixa de enviar filtros exclusivos quando o usuário muda para outro perfil", async () => {
  definirCargo("Gestor DRE");
  mocks.consultar.mockReturnValue({
    data: { count: 0, results: [] },
    isLoading: false,
    isError: false,
  });
  const user = preparar();
  await escolher(user, "Solicitante", "DRE");
  await user.click(screen.getByRole("button", { name: "Buscar solicitação" }));
  expect(screen.getByText("Não encontramos dados para esta busca")).toBeInTheDocument();
  act(() => definirCargo("Gestor DRE", "UE"));
  expect(mocks.consultar.mock.lastCall![0]).not.toHaveProperty("solicitante");
  expect(mocks.consultar.mock.lastCall![0]).not.toHaveProperty("servico");
  expect(mocks.consultar.mock.lastCall![0]).not.toHaveProperty("unidade_educacional");
  expect(mocks.consultar.mock.lastCall![0]).not.toHaveProperty("servidor_responsavel");
  expect(screen.getByText("Não há solicitações cadastradas")).toBeInTheDocument();
});
