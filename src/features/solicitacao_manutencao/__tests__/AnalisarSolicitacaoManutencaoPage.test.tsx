import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { AnalisarSolicitacaoManutencaoPage } from "../components/form/AnalisarSolicitacaoManutencaoPage";
import type { EnviarSolicitacaoGmeSmeResultado } from "../types/analiseDre.types";

const mocks = vi.hoisted(() => ({
  buscar: vi.fn(),
  enviar: vi.fn(),
  push: vi.fn(),
  toast: vi.fn(),
  perfil: "DRE",
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/components/ui/toast-custom", () => ({ toastSucesso: mocks.toast }));
vi.mock("../services/enviarSolicitacaoGmeSme.api", () => ({
  enviarSolicitacaoGmeSmeAction: mocks.enviar,
}));
vi.mock("../services/buscarSolicitacaoManutencao.api", () => ({
  buscarSolicitacaoManutencaoAction: mocks.buscar,
}));
vi.mock("@/stores/useUsuarioStore", () => ({
  useUsuarioStore: (selector: (state: unknown) => unknown) =>
    selector({ usuario: { perfil: { codigo: mocks.perfil } } }),
}));
vi.mock("../components/form/DetalhesSolicitacaoManutencao", () => ({
  DetalhesSolicitacaoManutencao: () => <p>Dados dos detalhes</p>,
}));

function preparar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <AnalisarSolicitacaoManutencaoPage uuid="sol1" />
    </QueryClientProvider>,
  );
  return client;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.perfil = "DRE";
  mocks.buscar.mockReset();
  mocks.buscar.mockResolvedValue({ situacao: "aguardando_analise_dre" });
  mocks.enviar.mockReset();
  mocks.enviar.mockResolvedValue({
    success: false,
    error: "api-error",
    title: "Erro",
    message: "Não foi possível enviar a solicitação.",
  });
});

it("exibe detalhes e permite selecionar as três decisões sem editar a data", async () => {
  preparar();
  await screen.findByText("Dados dos detalhes");
  expect(screen.getByRole("heading", { name: "Decisão da DRE" })).toBeInTheDocument();
  const usuario = userEvent.setup();
  for (const opcao of ["Aprovada (DRE)", "Reprovada (DRE)", "Necessidade de revisão (UE)"]) {
    await usuario.click(screen.getByRole("combobox", { name: "Situação" }));
    await usuario.click(screen.getByRole("option", { name: opcao }));
    expect(screen.getByRole("combobox", { name: "Situação" })).toHaveTextContent(opcao);
  }
  expect(screen.getByLabelText("Data de alteração")).toHaveAttribute("readonly");
  expect(screen.getByLabelText("Data de alteração")).toHaveValue(
    new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date()),
  );
  expect(screen.queryByRole("link", { name: "Editar solicitação" })).not.toBeInTheDocument();
});

it("habilita Salvar após decidir e exige observações no modal de envio", async () => {
  preparar();
  await screen.findByText("Dados dos detalhes");
  const usuario = userEvent.setup();
  const salvar = screen.getByRole("button", { name: "Salvar" });
  expect(salvar).toBeDisabled();
  expect(screen.getByLabelText("Data de alteração")).toHaveValue("");
  await usuario.click(screen.getByRole("combobox", { name: "Situação" }));
  await usuario.click(screen.getByRole("option", { name: "Aprovada (DRE)" }));
  expect(salvar).toBeEnabled();
  await usuario.click(salvar);
  expect(
    screen.getByRole("alertdialog", { name: "Enviar solicitação para GME/SME" }),
  ).toBeInTheDocument();
  const enviar = screen.getByRole("button", { name: "Enviar para GME/SME" });
  expect(enviar).toBeDisabled();
  const observacoes = screen.getByRole("textbox", { name: "Observações" });
  await usuario.click(observacoes);
  await usuario.tab();
  expect(await screen.findByText("Campo obrigatório")).toBeInTheDocument();
  expect(observacoes).toHaveAttribute("aria-invalid", "true");
  await usuario.type(observacoes, "   ");
  expect(await screen.findByText("Campo obrigatório")).toBeInTheDocument();
  expect(enviar).toBeDisabled();
  await usuario.type(observacoes, "Encaminhar para aprovação.");
  expect(screen.queryByText("Campo obrigatório")).not.toBeInTheDocument();
  expect(observacoes).toHaveAttribute("aria-invalid", "false");
  expect(enviar).toBeEnabled();
  await usuario.click(enviar);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível enviar a solicitação.",
  );
  expect(mocks.push).not.toHaveBeenCalled();
  expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  await usuario.click(screen.getByRole("button", { name: "Voltar e revisar" }));
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Situação" })).toHaveTextContent("Aprovada (DRE)");
  expect(screen.getByLabelText("Data de alteração")).not.toHaveValue("");
});

it.each([
  ["Aprovada (DRE)", "aprovada_dre"],
  ["Reprovada (DRE)", "reprovada"],
  ["Necessidade de revisão (UE)", "necessidade_revisao"],
])(
  "envia a decisão %s com observações e data ISO e atualiza a listagem",
  async (rotulo, decisao) => {
    mocks.enviar.mockResolvedValue({
      success: true,
      data: {
        dados: {
          uuid: "analise1",
          perfil: "dre",
          decisao,
          observacoes: "Observação",
          data_alteracao: null,
        },
        detail: "A solicitação foi enviada para a GME/SME.",
      },
    });
    const client = preparar();
    const invalidar = vi.spyOn(client, "invalidateQueries");
    await screen.findByText("Dados dos detalhes");
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole("combobox", { name: "Situação" }));
    await usuario.click(screen.getByRole("option", { name: rotulo }));
    await usuario.click(screen.getByRole("button", { name: "Salvar" }));
    await usuario.type(
      screen.getByRole("textbox", { name: "Observações" }),
      "  Análise concluída.  ",
    );
    await usuario.click(screen.getByRole("button", { name: "Enviar para GME/SME" }));
    expect(mocks.enviar).toHaveBeenCalledWith(
      {
        uuid: "sol1",
        decisao,
        observacoes: "Análise concluída.",
        data_alteracao: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      },
      expect.anything(),
    );
    expect(invalidar).toHaveBeenCalledWith({
      queryKey: ["solicitacoes-manutencao"],
      refetchType: "none",
    });
    expect(mocks.push).toHaveBeenCalledWith("/solicitacao_manutencao");
    expect(mocks.toast).toHaveBeenCalledWith({
      titulo: "Sucesso!",
      descricao: "A solicitação foi enviada para a GME/SME.",
    });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  },
);

it("bloqueia envio duplicado e fechamento durante a requisição", async () => {
  let concluir!: (resultado: EnviarSolicitacaoGmeSmeResultado) => void;
  mocks.enviar.mockReturnValue(
    new Promise<EnviarSolicitacaoGmeSmeResultado>((resolve) => {
      concluir = resolve;
    }),
  );
  preparar();
  await screen.findByText("Dados dos detalhes");
  const usuario = userEvent.setup();
  await usuario.click(screen.getByRole("combobox", { name: "Situação" }));
  await usuario.click(screen.getByRole("option", { name: "Aprovada (DRE)" }));
  await usuario.click(screen.getByRole("button", { name: "Salvar" }));
  await usuario.type(screen.getByRole("textbox", { name: "Observações" }), "Análise concluída.");
  await usuario.click(screen.getByRole("button", { name: "Enviar para GME/SME" }));
  const enviando = await screen.findByRole("button", { name: "Enviando..." });
  expect(enviando).toBeDisabled();
  expect(screen.getByRole("button", { name: "Fechar" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Voltar e revisar" })).toBeDisabled();
  await usuario.click(enviando);
  expect(mocks.enviar).toHaveBeenCalledTimes(1);
  await act(async () =>
    concluir({ success: false, error: "api-error", title: "Erro", message: "Tente novamente." }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent("Tente novamente.");
  expect(screen.getByRole("button", { name: "Enviar para GME/SME" })).toBeEnabled();
});

it("fecha o modal pelo X sem perder a decisão", async () => {
  preparar();
  await screen.findByText("Dados dos detalhes");
  const usuario = userEvent.setup();
  await usuario.click(screen.getByRole("combobox", { name: "Situação" }));
  await usuario.click(screen.getByRole("option", { name: "Reprovada (DRE)" }));
  await usuario.click(screen.getByRole("button", { name: "Salvar" }));
  await usuario.click(screen.getByRole("button", { name: "Fechar" }));
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Situação" })).toHaveTextContent("Reprovada (DRE)");
});

it("mostra Campo obrigatório ao sair do select vazio e limpa o erro ao selecionar", async () => {
  preparar();
  await screen.findByText("Dados dos detalhes");
  const usuario = userEvent.setup();
  const situacao = screen.getByRole("combobox", { name: "Situação" });
  await usuario.click(situacao);
  await usuario.keyboard("{Escape}");
  expect(await screen.findByText("Campo obrigatório")).toBeInTheDocument();
  expect(situacao).toHaveAttribute("aria-invalid", "true");
  await usuario.click(situacao);
  await usuario.click(screen.getByRole("option", { name: "Aprovada (DRE)" }));
  expect(screen.queryByText("Campo obrigatório")).not.toBeInTheDocument();
  expect(situacao).toHaveAttribute("aria-invalid", "false");
});

it("bloqueia acesso direto de outro perfil", () => {
  mocks.perfil = "UE";
  preparar();
  expect(screen.getByRole("alert")).toHaveTextContent("apenas para o perfil DRE");
  expect(mocks.buscar).not.toHaveBeenCalled();
  expect(screen.queryByText("Decisão da DRE")).not.toBeInTheDocument();
});

it("bloqueia a análise quando a situação mudou", async () => {
  mocks.buscar.mockResolvedValue({ situacao: "aprovada_dre" });
  preparar();
  expect(await screen.findByRole("alert")).toHaveTextContent("não está aguardando análise");
  expect(screen.queryByText("Decisão da DRE")).not.toBeInTheDocument();
});

it("não abre o modal ao submeter após a situação da solicitação mudar", async () => {
  const client = preparar();
  await screen.findByText("Dados dos detalhes");
  const usuario = userEvent.setup();
  await usuario.click(screen.getByRole("combobox", { name: "Situação" }));
  await usuario.click(screen.getByRole("option", { name: "Aprovada (DRE)" }));
  expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();

  act(() => {
    client.setQueryData(["solicitacoes-manutencao", "detalhe", "sol1"], {
      situacao: "aprovada_dre",
    });
  });
  expect(await screen.findByRole("alert")).toHaveTextContent("não está aguardando análise");
  expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  const formulario = screen
    .getByRole("heading", { name: "Detalhes da solicitação" })
    .closest("form");
  expect(formulario).not.toBeNull();
  await act(async () => {
    fireEvent.submit(formulario!);
  });
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(mocks.enviar).not.toHaveBeenCalled();
});

it("permite repetir uma consulta com erro", async () => {
  mocks.buscar.mockRejectedValueOnce(new Error("Falha"));
  preparar();
  await userEvent.click(await screen.findByRole("button", { name: "Tentar novamente" }));
  expect(await screen.findByText("Dados dos detalhes")).toBeInTheDocument();
});

it("informa falha inesperada no envio e permite tentar novamente", async () => {
  mocks.enviar.mockRejectedValueOnce(new Error("Falha inesperada"));
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    preparar();
    await screen.findByText("Dados dos detalhes");
    const usuario = userEvent.setup();
    await usuario.click(screen.getByRole("combobox", { name: "Situação" }));
    await usuario.click(screen.getByRole("option", { name: "Aprovada (DRE)" }));
    await usuario.click(screen.getByRole("button", { name: "Salvar" }));
    await usuario.type(screen.getByRole("textbox", { name: "Observações" }), "Análise concluída.");
    await usuario.click(screen.getByRole("button", { name: "Enviar para GME/SME" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível enviar a solicitação. Tente novamente.",
    );
    expect(screen.getByRole("button", { name: "Enviar para GME/SME" })).toBeEnabled();
    expect(log).toHaveBeenCalled();
  } finally {
    log.mockRestore();
  }
});
