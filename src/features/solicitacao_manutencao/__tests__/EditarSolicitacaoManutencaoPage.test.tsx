import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { EditarSolicitacaoManutencaoPage } from "../components/form/EditarSolicitacaoManutencaoPage";
import {
  editarEEnviarSolicitacaoManutencaoAction,
  editarSolicitacaoManutencaoAction,
} from "../services/editarSolicitacaoManutencao.api";

const buscar = vi.hoisted(() => vi.fn());
const feedback = vi.hoisted(() => ({ replace: vi.fn(), sucesso: vi.fn(), erro: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: feedback.replace }) }));
vi.mock("@/components/ui/toast-custom", () => ({
  toastSucesso: feedback.sucesso,
  toastErro: feedback.erro,
}));
vi.mock("../services/editarSolicitacaoManutencao.api", () => ({
  editarEEnviarSolicitacaoManutencaoAction: vi.fn(),
  editarSolicitacaoManutencaoAction: vi.fn(),
}));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(editarSolicitacaoManutencaoAction).mockResolvedValue({ success: true, codigo: "0012" });
  vi.mocked(editarEEnviarSolicitacaoManutencaoAction).mockResolvedValue({
    success: true,
    codigo: "0012",
  });
});
vi.mock("../services/buscarSolicitacaoManutencao.api", () => ({
  buscarSolicitacaoManutencaoAction: buscar,
}));
vi.mock("../hooks/useOpcoesSolicitacaoManutencao", () => ({
  useOpcoesSolicitacaoManutencao: () => ({
    data: [
      { value: "comum", label: "Comum" },
      { value: "urgente", label: "Urgente" },
    ],
    isPending: false,
  }),
}));
vi.mock("@/features/servico/hooks/useOpcoesServicos", () => ({
  useOpcoesServicos: () => ({ data: [{ value: "p1", label: "Pintura" }], isPending: false }),
}));

function preparar(situacao: string, alteracoes: Record<string, unknown> = {}) {
  buscar.mockResolvedValue({
    uuid: "s1",
    situacao,
    unidade_educacional: { uuid: "ue1", nome: "Escola da solicitação" },
    tipo_atendimento: "comum",
    informacoes_adicionais: "Inicial",
    servicos: [
      {
        servico_uuid: "p1",
        nome_servico: "Pintura",
        servico_especifico: "",
        local_reparo: "Sala",
        descricao: "Parede",
        arquivos: [{ uuid: "a1", arquivo: "/foto.jpg", nome_original: "foto.jpg" }],
      },
    ],
    ...alteracoes,
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const pagina = render(
    <QueryClientProvider client={client}>
      <EditarSolicitacaoManutencaoPage uuid="s1" />
    </QueryClientProvider>,
  );
  return { ...pagina, client };
}

it("mantém o carregamento após aprovação até sair da edição, sem consultar a nova situação", async () => {
  const { client, unmount } = preparar("nao_enviado_dre");
  try {
    await screen.findByRole("button", { name: "Salvar" });
    buscar.mockResolvedValue({ situacao: "aguardando_analise_dre" });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await user.click(screen.getByRole("button", { name: "Enviar para aprovação" }));
    await waitFor(() => expect(feedback.replace).toHaveBeenCalledWith("/solicitacao_manutencao"));
    expect(screen.getByText("Voltando para a lista de solicitações...")).toBeInTheDocument();
    expect(
      screen.queryByText("Esta solicitação não está disponível para edição na situação atual."),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Salvar" })).not.toBeInTheDocument();
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(client.getQueryState(["solicitacoes-manutencao", "detalhe", "s1"])?.isInvalidated).toBe(
      true,
    );
    expect(feedback.erro).not.toHaveBeenCalled();
  } finally {
    unmount();
    client.clear();
  }
});

it.each([false, true])(
  "atualiza dados em cache antes de editar e preserva UUIDs dos itens e anexos, enviar=%s",
  async (enviar) => {
    const antiga = {
      uuid: "s1",
      situacao: "nao_enviado_dre",
      unidade_educacional: { uuid: "ue1", nome: "Escola da solicitação" },
      tipo_atendimento: "comum",
      informacoes_adicionais: "Inicial",
      servicos: [
        {
          servico_uuid: "p1",
          nome_servico: "Pintura",
          servico_especifico: "",
          local_reparo: "Sala",
          descricao: "Parede",
          arquivos: [{ uuid: "a1", arquivo: "/foto.jpg" }],
        },
        {
          servico_uuid: "p1",
          nome_servico: "Pintura",
          servico_especifico: "",
          local_reparo: "Quadra",
          descricao: "Piso",
          arquivos: [{ uuid: "a2", arquivo: "/quadra.jpg" }],
        },
      ],
    };
    const atualizada = {
      ...antiga,
      servicos: antiga.servicos.map((item, indice) => ({ ...item, uuid: `item${indice + 1}` })),
    };
    let concluir!: (dados: typeof atualizada) => void;
    buscar.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          concluir = resolve;
        }),
    );
    buscar.mockResolvedValue(atualizada);
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    client.setQueryData(["solicitacoes-manutencao", "detalhe", "s1"], antiga);
    const { unmount } = render(
      <QueryClientProvider client={client}>
        <EditarSolicitacaoManutencaoPage uuid="s1" />
      </QueryClientProvider>,
    );
    try {
      expect(screen.queryByRole("button", { name: "Salvar" })).not.toBeInTheDocument();
      await waitFor(() => expect(buscar).toHaveBeenCalledWith("s1"));
      await act(async () => {
        concluir(atualizada);
      });
      await screen.findByRole("button", { name: "Salvar" });
      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: "Remover serviço de Sala" }));
      await user.click(screen.getByRole("button", { name: "Editar serviço de Quadra" }));
      const modal = within(screen.getByRole("dialog"));
      fireEvent.change(modal.getByLabelText("Qual local necessita do reparo?"), {
        target: { value: "Quadra coberta" },
      });
      await user.click(modal.getByRole("button", { name: "Salvar alterações" }));
      if (enviar) {
        await user.click(screen.getByRole("button", { name: "Enviar para DRE" }));
      } else {
        await user.click(screen.getByRole("button", { name: "Salvar" }));
        await user.click(screen.getByRole("button", { name: "Salvar e continuar depois" }));
      }
      const acao = enviar
        ? editarEEnviarSolicitacaoManutencaoAction
        : editarSolicitacaoManutencaoAction;
      await waitFor(() => expect(acao).toHaveBeenCalledOnce());
      expect(vi.mocked(acao).mock.calls[0][0]).toEqual({
        uuid: "s1",
        unidade_educacional: "ue1",
        tipo_atendimento: "comum",
        informacoes_adicionais: "Inicial",
        servicos: [
          {
            uuid: "item2",
            servico: "p1",
            servico_especifico: "",
            local_reparo: "Quadra coberta",
            descricao: "Piso",
            arquivos: [{ uuid: "a2" }],
          },
        ],
      });
    } finally {
      unmount();
      client.clear();
    }
  },
);

it("carrega a edição, permite alterar serviço preservando anexos e cancelar retorna à listagem", async () => {
  preparar("nao_enviado_dre");
  expect(await screen.findByText("Escola da solicitação")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  expect(screen.getByRole("link", { name: "Cancelar" })).toHaveAttribute(
    "href",
    "/solicitacao_manutencao",
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Editar serviço de Sala" }));
  const modal = within(screen.getByRole("dialog"));
  expect(modal.getByRole("img")).toHaveAttribute("src", "/foto.jpg");
  const local = modal.getByLabelText("Qual local necessita do reparo?");
  fireEvent.change(local, { target: { value: "Quadra" } });
  await user.click(modal.getByRole("button", { name: "Salvar alterações" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Editar serviço de Quadra" })).toBeInTheDocument();
});

it("bloqueia acesso direto à edição em situação não permitida", async () => {
  preparar("aguardando_analise_dre");
  expect(await screen.findByRole("alert")).toHaveTextContent("não está disponível para edição");
  expect(screen.queryByRole("button", { name: "Adicionar serviço" })).not.toBeInTheDocument();
});

it.each(["Salvar", "Enviar para DRE"])(
  "%s respeita o fluxo de envio para aprovação",
  async (botao) => {
    preparar("nao_enviado_dre");
    await screen.findByText("Escola da solicitação");
    await userEvent.setup().click(screen.getByRole("button", { name: botao }));
    if (botao === "Salvar") {
      const modal = within(screen.getByRole("dialog", { name: "Enviar para aprovação?" }));
      expect(editarEEnviarSolicitacaoManutencaoAction).not.toHaveBeenCalled();
      await userEvent.setup().click(modal.getByRole("button", { name: "Enviar para aprovação" }));
    }
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(editarEEnviarSolicitacaoManutencaoAction).toHaveBeenCalledTimes(1);
    expect(vi.mocked(editarEEnviarSolicitacaoManutencaoAction).mock.calls[0][0]).toEqual(
      expect.objectContaining({ uuid: "s1" }),
    );
    expect(vi.mocked(editarEEnviarSolicitacaoManutencaoAction).mock.calls[0][0]).not.toHaveProperty(
      "enviar",
    );
    await waitFor(() => expect(feedback.replace).toHaveBeenCalledWith("/solicitacao_manutencao"));
  },
);
it.each(["api", "inesperado"])("retorna à listagem após erro %s no envio", async (tipoErro) => {
  if (tipoErro === "api") {
    vi.mocked(editarEEnviarSolicitacaoManutencaoAction).mockResolvedValueOnce({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Falha no envio.",
      status: 400,
    });
  } else {
    vi.mocked(editarEEnviarSolicitacaoManutencaoAction).mockRejectedValueOnce(
      new Error("Sem conexão"),
    );
  }
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    preparar("nao_enviado_dre");
    await screen.findByText("Escola da solicitação");
    await userEvent.setup().click(screen.getByRole("button", { name: "Enviar para DRE" }));
    expect(vi.mocked(editarEEnviarSolicitacaoManutencaoAction).mock.calls[0][0]).not.toHaveProperty(
      "enviar",
    );
    await waitFor(() => expect(feedback.replace).toHaveBeenCalledWith("/solicitacao_manutencao"));
    expect(feedback.erro).toHaveBeenCalled();
    expect(feedback.sucesso).not.toHaveBeenCalled();
  } finally {
    consoleError.mockRestore();
  }
});

it("mostra o estado vazio e a validação ao remover o último serviço", async () => {
  preparar("nao_enviado_dre");
  await screen.findByText("Escola da solicitação");
  await userEvent.setup().click(screen.getByRole("button", { name: "Remover serviço de Sala" }));
  expect(screen.getByText("Nenhum serviço foi adicionado.")).toBeInTheDocument();
  expect(
    screen.getByText('Clique em "Adicionar serviço" para adicionar o primeiro serviço.'),
  ).toBeInTheDocument();
  expect(screen.getByText("Adicione pelo menos um serviço.")).toBeInTheDocument();
  expect(screen.queryByRole("table", { name: "Serviços adicionados" })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Enviar para DRE" })).toBeDisabled();
});

it("exibe excluir, editar e visualizar nessa ordem e abre a lupa sem permitir alterações", async () => {
  preparar("nao_enviado_dre");
  await screen.findByText("Escola da solicitação");
  const tabela = within(screen.getByRole("table", { name: "Serviços adicionados" }));
  expect(tabela.getAllByRole("button").map((botao) => botao.getAttribute("aria-label"))).toEqual([
    "Remover serviço de Sala",
    "Editar serviço de Sala",
    "Visualizar serviço de Sala",
  ]);
  await userEvent.setup().click(tabela.getByRole("button", { name: "Visualizar serviço de Sala" }));
  const modal = within(screen.getByRole("dialog"));
  expect(modal.getByLabelText("Qual local necessita do reparo?")).toBeDisabled();
  expect(modal.getByLabelText("Breve descrição do serviço")).toBeDisabled();
  expect(modal.queryByRole("button", { name: "Salvar alterações" })).not.toBeInTheDocument();
  expect(modal.queryByRole("button", { name: "Remover imagem foto.jpg" })).not.toBeInTheDocument();
});

it("permite visualizar imagem nova e remover pela galeria sem aceitar PDF", async () => {
  vi.stubGlobal(
    "URL",
    class extends URL {
      static createObjectURL = vi.fn(() => "blob:nova-imagem");
      static revokeObjectURL = vi.fn();
    },
  );
  try {
    preparar("nao_enviado_dre");
    await screen.findByText("Escola da solicitação");
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Editar serviço de Sala" }));
    const modal = within(screen.getByRole("dialog"));
    const input = modal.getByLabelText("Fotos do local do reparo");
    fireEvent.change(input, { target: { files: [new File(["pdf"], "anexo.pdf")] } });
    expect(modal.getByRole("alert")).toHaveTextContent("Selecione arquivos PNG, JPG e JPEG.");
    fireEvent.change(input, {
      target: { files: [new File(["foto"], "nova.jpg", { type: "image/jpeg" })] },
    });
    expect(modal.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(modal.getByRole("button", { name: "Próximo anexo" }));
    expect(modal.getByRole("img")).toHaveAttribute("src", "blob:nova-imagem");
    await user.click(modal.getByRole("button", { name: "Remover imagem nova.jpg" }));
    expect(modal.getByRole("img")).toHaveAttribute("src", "/foto.jpg");
    await user.click(modal.getByRole("button", { name: "Remover imagem foto.jpg" }));
    expect(modal.getByRole("button", { name: "Salvar alterações" })).toBeDisabled();
  } finally {
    vi.unstubAllGlobals();
  }
});
