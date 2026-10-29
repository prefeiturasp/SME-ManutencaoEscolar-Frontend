import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CadastrarSolicitacaoManutencaoPage from "../components/form/CadastrarSolicitacaoManutencaoPage";
import { useSolicitacaoManutencaoEnviadaStore } from "../stores/useSolicitacaoManutencaoEnviadaStore";
import type {
  CriarSolicitacaoManutencaoParams,
  CriarSolicitacaoManutencaoResultado,
  ServicoManutencao,
} from "../types/solicitacaoManutencao.types";

const mocks = vi.hoisted(() => ({
  usuario: undefined as unknown,
  isPending: false,
  mutate: vi.fn(),
  toast: vi.fn(),
  toastErro: vi.fn(),
  replace: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("@/stores/useUsuarioStore", () => ({
  useUsuarioStore: (selector: (state: { usuario: unknown }) => unknown) =>
    selector({ usuario: mocks.usuario }),
}));
vi.mock("../hooks/useCriarSolicitacaoManutencao", () => ({
  useCriarSolicitacaoManutencao: () => ({ mutate: mocks.mutate, isPending: mocks.isPending }),
}));
vi.mock("@/components/ui/toast-custom", () => ({
  toastSucesso: mocks.toast,
  toastErro: mocks.toastErro,
}));
vi.mock("../components/form/ServicosManutencao", () => ({
  ServicosManutencao: ({ onChange }: { onChange: (itens: ServicoManutencao[]) => void }) => (
    <>
      <button
        type="button"
        onClick={() =>
          onChange([
            {
              id: "local",
              servico: "uuid",
              local_reparo: "Sala",
              descricao: "Reparo",
              arquivos: [new File(["foto"], "foto.png")],
            },
          ])
        }
      >
        Adicionar serviço de teste
      </button>
      <button
        type="button"
        onClick={() =>
          onChange([
            {
              id: "id-local-outros",
              servico: "outros",
              servico_especifico: "Serralheria",
              local_reparo: "Portão",
              descricao: "Reparar portão",
              arquivos: [new File(["foto1"], "portao.png"), new File(["foto2"], "detalhe.jpg")],
            },
          ])
        }
      >
        Adicionar Outros de teste
      </button>
    </>
  ),
}));

type Callbacks = {
  onSuccess: (resultado: CriarSolicitacaoManutencaoResultado) => void;
  onError: (error: Error) => void;
  onSettled: () => void;
};
function callbacks(): Callbacks {
  return mocks.mutate.mock.calls.at(-1)![1];
}
async function abrirConfirmacao(outros = false) {
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Tipo de atendimento" }), {
    key: "ArrowDown",
  });
  const comum = await screen.findByRole("option", { name: "Comum" });
  await act(async () => {
    fireEvent.click(comum);
  });
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", {
        name: outros ? "Adicionar Outros de teste" : "Adicionar serviço de teste",
      }),
    );
  });
  await act(async () => {
    fireEvent.change(screen.getByLabelText("Informações adicionais (opcional)"), {
      target: { value: "Observação" },
    });
  });
  await waitFor(() => expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  await screen.findByRole("dialog");
}
describe("CadastrarSolicitacaoManutencaoPage", () => {
  it("envia Outros com nome específico, anexos como objetos e sem id local", async () => {
    render(<CadastrarSolicitacaoManutencaoPage />);
    await abrirConfirmacao(true);
    fireEvent.click(screen.getByRole("button", { name: "Enviar para aprovação" }));
    const parametros = mocks.mutate.mock.calls[0][0] as CriarSolicitacaoManutencaoParams;
    expect(parametros.servicos).toEqual([
      {
        servico: "outros",
        servico_especifico: "Serralheria",
        local_reparo: "Portão",
        descricao: "Reparar portão",
        arquivos: [{ arquivo: [expect.any(File)] }, { arquivo: [expect.any(File)] }],
      },
    ]);
    expect(parametros.servicos[0].arquivos.map((item) => item.arquivo[0].name)).toEqual([
      "portao.png",
      "detalhe.jpg",
    ]);
    expect(parametros.servicos[0]).not.toHaveProperty("id");
    expect(parametros.enviar).toBe(true);
  });
  beforeEach(() => {
    useSolicitacaoManutencaoEnviadaStore.getState().fechar();
    vi.clearAllMocks();
    mocks.isPending = false;
    mocks.usuario = {
      unidadeEducacional: {
        uuid: "ue",
        codigo_eol: "123",
        nome: "Escola",
        diretoria_regional: { nome_curto: "DRE Curta" },
        tipo_escola: { sigla: "EMEF" },
        subprefeitura: { nome: "Sub" },
        lote: { nome: "Lote 1" },
        dados: { municipio: "São Paulo" },
      },
    };
  });
  it.each([false, true])(
    "só cadastra após confirmar e envia a opção de aprovação %s",
    async (enviar) => {
      render(<CadastrarSolicitacaoManutencaoPage />);
      await abrirConfirmacao();
      expect(mocks.mutate).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Revisar informações" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Informações adicionais (opcional)")).toHaveValue("Observação");
      fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
      await screen.findByRole("dialog");
      const confirmar = screen.getByRole("button", {
        name: enviar ? "Enviar para aprovação" : "Salvar e continuar depois",
      });
      fireEvent.click(confirmar);
      fireEvent.click(confirmar);
      expect(mocks.mutate).toHaveBeenCalledTimes(1);
      const parametros = mocks.mutate.mock.calls[0][0] as CriarSolicitacaoManutencaoParams;
      expect(parametros.enviar).toBe(enviar);
      expect(parametros).not.toHaveProperty("dados");
      expect(parametros.servicos[0]).not.toHaveProperty("id");
      expect(parametros.servicos[0]).not.toHaveProperty("servico_especifico");
      expect(parametros.servicos[0].arquivos).toEqual([{ arquivo: [expect.any(File)] }]);
      expect(parametros.servicos[0].arquivos[0].arquivo[0].name).toBe("foto.png");
      expect(parametros).toEqual(
        expect.objectContaining({
          unidade_educacional: "ue",
          tipo_atendimento: "comum",
          informacoes_adicionais: "Observação",
        }),
      );
      act(() => {
        callbacks().onSuccess({ success: true, codigo: "SOL-001" });
        callbacks().onSettled();
      });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(mocks.replace).toHaveBeenCalledWith("/solicitacao_manutencao");
      expect(useSolicitacaoManutencaoEnviadaStore.getState().codigo).toBe("SOL-001");
      expect(useSolicitacaoManutencaoEnviadaStore.getState().enviada).toBe(enviar);
      expect(mocks.toast).toHaveBeenCalledExactlyOnceWith({
        titulo: "Sucesso!",
        descricao: enviar
          ? "A solicitação foi enviada com sucesso."
          : "A solicitação foi criada com sucesso.",
      });
      expect(mocks.replace).toHaveBeenCalledTimes(1);
    },
  );
  it("mostra toast e retorna à lista tanto em erros da API quanto em falhas inesperadas", async () => {
    render(<CadastrarSolicitacaoManutencaoPage />);
    await abrirConfirmacao();
    fireEvent.click(screen.getByRole("button", { name: "Enviar para aprovação" }));
    act(() => {
      callbacks().onSuccess({
        success: false,
        error: "api-error",
        title: "Erro",
        message: "Dados inválidos",
        status: 400,
      });
      callbacks().onSettled();
    });
    expect(mocks.toastErro).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao: "Não conseguimos registrar a solicitação. Por favor, tente novamente.",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(mocks.replace).toHaveBeenCalledExactlyOnceWith("/solicitacao_manutencao");
    expect(screen.getByLabelText("Informações adicionais (opcional)")).toHaveValue("Observação");
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    await screen.findByRole("dialog");
    fireEvent.click(screen.getByRole("button", { name: "Enviar para aprovação" }));
    act(() => {
      callbacks().onError(new Error("Sem conexão"));
      callbacks().onSettled();
    });
    expect(mocks.toastErro).toHaveBeenCalledTimes(2);
    expect(mocks.replace).toHaveBeenCalledTimes(2);
    expect(mocks.replace).toHaveBeenLastCalledWith("/solicitacao_manutencao");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mocks.toast).not.toHaveBeenCalled();
  });
  it.each([
    undefined,
    { unidadeEducacional: "Nome da escola" },
    { unidadeEducacional: null, diretoriaRegional: "DRE do usuário" },
  ])("bloqueia cadastro sem unidade vinculada: %j", async (usuario) => {
    mocks.usuario = usuario;
    await act(async () => {
      render(<CadastrarSolicitacaoManutencaoPage />);
    });
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
    expect(
      screen.getByText("O usuário logado precisa ter uma unidade educacional vinculada."),
    ).toBeInTheDocument();
  });
  it("usa nome completo da DRE como fallback e bloqueia enquanto processa", async () => {
    mocks.usuario = {
      unidadeEducacional: { uuid: "ue", diretoria_regional: { nome: "DRE Completa" } },
    };
    mocks.isPending = true;
    await act(async () => {
      render(<CadastrarSolicitacaoManutencaoPage />);
    });
    expect(screen.getByText("DRE Completa")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  });
  it("impede submissão inválida e mostra a necessidade de adicionar serviços", async () => {
    const { container } = render(<CadastrarSolicitacaoManutencaoPage />);
    await act(async () => {
      fireEvent.submit(container.querySelector("form")!);
    });
    expect(screen.getByText("Adicione pelo menos um serviço.")).toBeInTheDocument();
    expect(mocks.mutate).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

vi.mock("../hooks/useOpcoesSolicitacaoManutencao", () => ({
  useOpcoesSolicitacaoManutencao: () => ({
    data: [
      { value: "comum", label: "Comum" },
      { value: "urgente", label: "Urgente" },
    ],
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));
