import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { ConfirmDialog } from "@/components/ui/confirmaDialogo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { SolicitacaoManutencaoLista } from "../components/list/SolicitacaoManutencaoLista";
import { useSolicitacaoManutencaoEnviadaStore } from "../stores/useSolicitacaoManutencaoEnviadaStore";
import type {
  CriarSolicitacaoManutencaoResultado,
  SolicitacaoManutencaoDetalhe,
} from "../types/solicitacaoManutencao.types";

const mocks = vi.hoisted(() => ({
  buscar: vi.fn(),
  enviar: vi.fn(),
  salvar: vi.fn(),
  consultar: vi.fn(),
  sucesso: vi.fn(),
  push: vi.fn(),
}));
vi.mock("../services/buscarSolicitacaoManutencao.api", () => ({
  buscarSolicitacaoManutencaoAction: mocks.buscar,
}));
vi.mock("../services/editarSolicitacaoManutencao.api", () => ({
  editarEEnviarSolicitacaoManutencaoAction: mocks.enviar,
  editarSolicitacaoManutencaoAction: mocks.salvar,
}));
vi.mock("../hooks/useSolicitacoesManutencao", () => ({
  useSolicitacoesManutencao: mocks.consultar,
}));
vi.mock("../hooks/useOpcoesSolicitacaoManutencao", () => ({
  useOpcoesSolicitacaoManutencao: () => ({ data: [], isPending: false, isError: false }),
}));
vi.mock("@/components/ui/toast-custom", () => ({ toastSucesso: mocks.sucesso }));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/components/ui/confirmaDialogo", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/components/ui/confirmaDialogo")>();
  return { ...original, ConfirmDialog: vi.fn(original.ConfirmDialog) };
});

function detalhe(): SolicitacaoManutencaoDetalhe {
  return {
    uuid: "sol1",
    codigo: "0000018",
    situacao: "nao_enviado_dre",
    fase: "solicitacao",
    tipo_atendimento: "comum",
    data_envio: null,
    unidade_educacional: { uuid: "ue1", id: 1, nome: "Escola", codigo_eol: "123" },
    informacoes_adicionais: "Informações existentes",
    servicos: [
      {
        uuid: "item1",
        servico_uuid: "pintura1",
        nome_servico: "Pintura",
        servico_especifico: null,
        local_reparo: "Sala",
        descricao: "Reparar parede",
        arquivos: [{ uuid: "foto1", arquivo: "/foto.jpg", nome_original: "foto.jpg" }],
      },
    ],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  useUsuarioStore.getState().limparUsuario();
  useSolicitacaoManutencaoEnviadaStore.getState().fechar();
  mocks.buscar.mockReset().mockResolvedValue(detalhe());
  mocks.enviar.mockReset().mockResolvedValue({ success: true, codigo: "0000018" });
  mocks.consultar.mockReturnValue({
    data: { count: 1, results: [detalhe()] },
    isLoading: false,
    isError: false,
  });
});

function preparar() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const atualizar = vi.spyOn(client, "refetchQueries");
  render(
    <QueryClientProvider client={client}>
      <SolicitacaoManutencaoLista />
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), client, atualizar };
}

async function abrir(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Enviar para DRE 0000018" }));
  return within(screen.getByRole("alertdialog", { name: "Envio de solicitação para DRE" }));
}

it("abre a confirmação da solicitação escolhida e permite fechar sem enviar", async () => {
  const { user } = preparar();
  const modal = await abrir(user);
  expect(modal.getByText(/Após confirmar, não será possível editar/)).toBeInTheDocument();
  expect(modal.getByRole("button", { name: "Revisar informações" })).toBeEnabled();
  expect(mocks.buscar).toHaveBeenCalledExactlyOnceWith("sol1");
  expect(mocks.enviar).not.toHaveBeenCalled();
  await user.click(modal.getByRole("button", { name: "Fechar" }));
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(mocks.enviar).not.toHaveBeenCalled();
});

it("abre a edição da solicitação escolhida ao revisar informações", async () => {
  const { user } = preparar();
  const modal = await abrir(user);
  await user.click(modal.getByRole("button", { name: "Revisar informações" }));
  expect(mocks.push).toHaveBeenCalledExactlyOnceWith("/solicitacao_manutencao/visualizar/sol1");
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(mocks.enviar).not.toHaveBeenCalled();
});

it("envia pela mesma ação da edição quando a situação é nao_enviado_dre", async () => {
  const dados = detalhe();
  mocks.buscar.mockResolvedValueOnce(dados);
  mocks.consultar.mockReturnValue({
    data: { count: 1, results: [dados] },
    isLoading: false,
    isError: false,
  });
  const { user, atualizar } = preparar();
  const modal = await abrir(user);
  const enviar = modal.getByRole("button", { name: "Enviar para DRE" });
  await waitFor(() => expect(enviar).toBeEnabled());
  await user.click(enviar);
  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  expect(mocks.enviar).toHaveBeenCalledExactlyOnceWith({
    uuid: "sol1",
    unidade_educacional: "ue1",
    tipo_atendimento: "comum",
    informacoes_adicionais: "Informações existentes",
    servicos: [
      {
        uuid: "item1",
        servico: "pintura1",
        servico_especifico: "",
        local_reparo: "Sala",
        descricao: "Reparar parede",
        arquivos: [{ uuid: "foto1" }],
      },
    ],
  });
  expect(mocks.salvar).not.toHaveBeenCalled();
  expect(useSolicitacaoManutencaoEnviadaStore.getState()).toMatchObject({
    codigo: "0000018",
    enviada: true,
    editada: true,
  });
  expect(atualizar).toHaveBeenCalledWith({
    queryKey: ["solicitacoes-manutencao"],
    type: "active",
  });
});

it("mantém edição disponível mas não abre o modal de envio em necessidade_revisao_ue", async () => {
  mocks.consultar.mockReturnValue({
    data: { count: 1, results: [{ ...detalhe(), situacao: "necessidade_revisao_ue" }] },
    isLoading: false,
    isError: false,
  });
  const { user } = preparar();
  const enviar = screen.getByRole("button", { name: "Enviar para DRE 0000018" });
  expect(enviar).toBeDisabled();
  expect(screen.getByRole("link", { name: "Editar solicitação 0000018" })).toHaveAttribute(
    "href",
    "/solicitacao_manutencao/sol1/editar",
  );
  await user.click(enviar);
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(mocks.buscar).not.toHaveBeenCalled();
  expect(mocks.enviar).not.toHaveBeenCalled();
});

it.each(["aguardando_analise_dre", "aprovada_dre", "reprovada_dre", "execucao_em_andamento"])(
  "desabilita envio e edição para a situação %s",
  async (situacao) => {
    mocks.consultar.mockReturnValue({
      data: { count: 1, results: [{ ...detalhe(), situacao }] },
      isLoading: false,
      isError: false,
    });
    const { user } = preparar();
    const botao = screen.getByRole("button", { name: "Enviar para DRE 0000018" });
    expect(botao).toBeDisabled();
    expect(screen.getByRole("button", { name: "Editar solicitação 0000018" })).toBeDisabled();
    await user.click(botao);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(mocks.buscar).not.toHaveBeenCalled();
  },
);

it.each([
  "sem serviços",
  "sem anexos",
  "sem descrição",
  "sem unidade",
  "situação alterada",
  "em revisão",
])("mantém o envio bloqueado com dados inválidos: %s", async (cenario) => {
  const dados = detalhe();
  if (cenario === "sem serviços") dados.servicos = [];
  if (cenario === "sem anexos") dados.servicos[0].arquivos = [];
  if (cenario === "sem descrição") dados.servicos[0].descricao = " ";
  if (cenario === "sem unidade") dados.unidade_educacional.uuid = "";
  if (cenario === "situação alterada") dados.situacao = "aguardando_analise_dre";
  if (cenario === "em revisão") dados.situacao = "necessidade_revisao_ue";
  mocks.buscar.mockResolvedValueOnce(dados);
  const { user } = preparar();
  const modal = await abrir(user);
  await waitFor(() => expect(modal.getByRole("alert")).toHaveTextContent("Revise as informações"));
  expect(modal.getByRole("button", { name: "Enviar para DRE" })).toBeDisabled();
  expect(modal.getByRole("button", { name: "Revisar informações" })).toBeEnabled();
  expect(mocks.enviar).not.toHaveBeenCalled();
});

it("desabilita o envio enquanto carrega os detalhes e permite repetir uma consulta com erro", async () => {
  let rejeitar!: (erro: Error) => void;
  mocks.buscar.mockReturnValueOnce(
    new Promise((_, reject) => {
      rejeitar = reject;
    }),
  );
  const { user } = preparar();
  const modal = await abrir(user);
  expect(modal.getByRole("button", { name: "Enviar para DRE" })).toBeDisabled();
  await act(async () => rejeitar(new Error("Falha na consulta")));
  await user.click(await modal.findByRole("button", { name: "Tentar novamente" }));
  await waitFor(() => expect(modal.getByRole("button", { name: "Enviar para DRE" })).toBeEnabled());
  expect(mocks.buscar).toHaveBeenCalledTimes(2);
});

it("envia serviços específicos sem UUID usando ID ou posição e aceita informações adicionais ausentes", async () => {
  const dados = detalhe();
  dados.servicos = [
    {
      ...dados.servicos[0],
      uuid: undefined,
      id: 7,
      servico_uuid: null,
      servico_especifico: "Vidraçaria",
    },
    { ...dados.servicos[0], uuid: undefined, servico_uuid: null, servico_especifico: "Limpeza" },
  ];
  mocks.buscar.mockResolvedValueOnce({ ...dados, informacoes_adicionais: null });
  const { user } = preparar();
  const modal = await abrir(user);
  const enviar = modal.getByRole("button", { name: "Enviar para DRE" });
  await waitFor(() => expect(enviar).toBeEnabled());
  await user.click(enviar);
  await waitFor(() => expect(mocks.enviar).toHaveBeenCalledOnce());
  expect(mocks.enviar.mock.lastCall![0]).toEqual({
    uuid: "sol1",
    unidade_educacional: "ue1",
    tipo_atendimento: "comum",
    informacoes_adicionais: "",
    servicos: ["Vidraçaria", "Limpeza"].map((servico_especifico) => ({
      servico: "",
      servico_especifico,
      local_reparo: "Sala",
      descricao: "Reparar parede",
      arquivos: [{ uuid: "foto1" }],
    })),
  });
});

it("bloqueia envio quando a resposta da API não traz a unidade educacional", async () => {
  mocks.buscar.mockResolvedValueOnce({ ...detalhe(), unidade_educacional: null });
  const { user } = preparar();
  const modal = await abrir(user);
  await waitFor(() => expect(modal.getByRole("alert")).toHaveTextContent("Revise as informações"));
  expect(modal.getByRole("button", { name: "Enviar para DRE" })).toBeDisabled();
  expect(mocks.enviar).not.toHaveBeenCalled();
});

it("bloqueia envio quando a API omite os anexos do serviço", async () => {
  const dados = detalhe();
  mocks.buscar.mockResolvedValueOnce({
    ...dados,
    servicos: [{ ...dados.servicos[0], arquivos: undefined }],
  });
  const { user } = preparar();
  const modal = await abrir(user);
  await waitFor(() => expect(modal.getByRole("alert")).toHaveTextContent("Revise as informações"));
  expect(modal.getByRole("button", { name: "Enviar para DRE" })).toBeDisabled();
  expect(mocks.enviar).not.toHaveBeenCalled();
});

it("mostra o título do erro quando a API não fornece mensagem", async () => {
  mocks.enviar.mockResolvedValueOnce({
    success: false,
    error: "api-error",
    title: "Solicitação bloqueada",
    message: "",
  });
  const { user } = preparar();
  const modal = await abrir(user);
  const enviar = modal.getByRole("button", { name: "Enviar para DRE" });
  await waitFor(() => expect(enviar).toBeEnabled());
  await user.click(enviar);
  expect(await modal.findByRole("alert")).toHaveTextContent("Solicitação bloqueada");
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  expect(useSolicitacaoManutencaoEnviadaStore.getState().codigo).toBeNull();
});

it("bloqueia envio enquanto atualiza dados em cache e após falha na atualização", async () => {
  const { user, client } = preparar();
  client.setQueryData(["solicitacoes-manutencao", "detalhe", "sol1"], detalhe());
  let rejeitar!: (erro: Error) => void;
  mocks.buscar.mockReturnValueOnce(
    new Promise((_, reject) => {
      rejeitar = reject;
    }),
  );
  const modal = await abrir(user);
  expect(modal.getByRole("button", { name: "Enviar para DRE" })).toBeDisabled();
  await act(async () => rejeitar(new Error("Falha na atualização")));
  expect(await modal.findByRole("alert")).toHaveTextContent("Não foi possível carregar");
  expect(modal.getByRole("button", { name: "Enviar para DRE" })).toBeDisabled();
  expect(mocks.enviar).not.toHaveBeenCalled();
});

it("impede envios duplicados e bloqueia fechamento e revisão durante o envio", async () => {
  let concluir!: (resultado: CriarSolicitacaoManutencaoResultado) => void;
  mocks.enviar.mockReturnValueOnce(
    new Promise((resolve) => {
      concluir = resolve;
    }),
  );
  const { user } = preparar();
  const modal = await abrir(user);
  const botao = modal.getByRole("button", { name: "Enviar para DRE" });
  await waitFor(() => expect(botao).toBeEnabled());
  const confirmar = vi.mocked(ConfirmDialog).mock.lastCall![0].onConfirm;
  act(() => {
    vi.mocked(ConfirmDialog).mock.lastCall![0].onOpenChange(true);
    void confirmar();
    void confirmar();
  });
  await waitFor(() => expect(modal.getByRole("button", { name: "Enviando..." })).toBeDisabled());
  expect(modal.getByRole("button", { name: "Fechar" })).toBeDisabled();
  expect(modal.getByRole("button", { name: "Revisar informações" })).toBeDisabled();
  await user.keyboard("{Escape}");
  act(() => vi.mocked(ConfirmDialog).mock.lastCall![0].onOpenChange(false));
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  expect(mocks.enviar).toHaveBeenCalledOnce();
  await act(async () => concluir({ success: true, codigo: "0000018" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
});

it.each(["api", "inesperado"])(
  "preserva o modal e permite repetir o envio após erro %s",
  async (tipo) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    if (tipo === "api")
      mocks.enviar.mockResolvedValueOnce({
        success: false,
        error: "api-error",
        title: "Erro",
        message: "Solicitação não enviada",
      });
    else mocks.enviar.mockRejectedValueOnce(new Error("Falha inesperada"));
    const { user } = preparar();
    const modal = await abrir(user);
    await waitFor(() =>
      expect(modal.getByRole("button", { name: "Enviar para DRE" })).toBeEnabled(),
    );
    await user.click(modal.getByRole("button", { name: "Enviar para DRE" }));
    expect(await modal.findByRole("alert")).toHaveTextContent(
      tipo === "api" ? "Solicitação não enviada" : "Não foi possível enviar",
    );
    expect(useSolicitacaoManutencaoEnviadaStore.getState().codigo).toBeNull();
    await user.click(modal.getByRole("button", { name: "Enviar para DRE" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(mocks.enviar).toHaveBeenCalledTimes(2);
    vi.restoreAllMocks();
  },
);
