import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { ExcluirLoteModal } from "../components/ExcluirLoteModal";

const mocks = vi.hoisted(() => ({
  excluir: vi.fn(),
  replace: vi.fn(),
  sucesso: vi.fn(),
  erro: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("@/components/ui/toast-custom", () => ({
  toastErro: mocks.erro,
  toastSucesso: mocks.sucesso,
}));
vi.mock("../hooks/useDeleteLote", () => ({
  useExcluirLote: () => ({ mutateAsync: mocks.excluir, isPending: false }),
}));
beforeEach(() => vi.clearAllMocks());

it("lista todas as equipes da resposta real e exibe o título e a mensagem da API sem mostrar o JSON", async () => {
  const equipes = [
    { uuid: "d8cde485-cc48-4a3d-8c19-bda31cd5558e", nome: '""' },
    { uuid: "8609ca21-024b-4580-abcf-48d8872f1b05", nome: "Teste com outra empresa 72.9622" },
    { uuid: "c46862ed-eaa7-4ffc-8b6f-5065a1760b40", nome: "teste criar" },
    { uuid: "b5d6d697-df8f-4edd-8440-cc590b7ee1eb", nome: "Teste Criacao" },
    { uuid: "8c25759e-22bf-4c0e-9c67-cdf4dec3d908", nome: "Equipe Teste" },
  ];
  mocks.excluir.mockResolvedValueOnce({
    success: false,
    status: 400,
    title: "Excluir Lote",
    message: {
      message: "Não é possível excluir este registro. O Lote está vinculado às equipes abaixo.",
      equipes,
    },
  });
  render(<ExcluirLoteModal uuid="lote-1" />);
  await confirmar();
  const alerta = await screen.findByRole("alertdialog", { name: "Excluir Lote" });
  expect(within(alerta).getAllByRole("cell")).toHaveLength(equipes.length);
  for (const equipe of equipes) {
    expect(within(alerta).getByRole("cell", { name: equipe.nome })).toBeInTheDocument();
  }
  expect(
    within(alerta).getByText(
      "Não é possível excluir este registro. O Lote está vinculado às equipes abaixo.",
    ),
  ).toBeInTheDocument();
  expect(alerta).not.toHaveTextContent('"success":false');
  expect(within(alerta).getByRole("heading", { name: "Excluir Lote" })).toBeInTheDocument();
});

async function confirmar() {
  fireEvent.click(screen.getByRole("button", { name: "Excluir lote" }));
  fireEvent.click(
    within(screen.getByRole("alertdialog")).getByRole("button", { name: "Excluir lote" }),
  );
}

it.each([400])(
  "mostra as equipes vinculadas após o bloqueio (%s), permite navegar e fechar",
  async (status) => {
    mocks.excluir.mockRejectedValueOnce({
      success: false,
      status,
      title: "Excluir Lote",
      message: {
        message: "Remova os vínculos para prosseguir com a exclusão.",
        equipes: [
          { uuid: "equipe-03", nome: "Equipe 03" },
          { uuid: "equipe-05", nome: "Equipe 05" },
        ],
      },
    });
    render(<ExcluirLoteModal uuid="lote-1" />);
    await confirmar();
    const alerta = await screen.findByRole("alertdialog", {
      name: "Excluir Lote",
    });
    expect(
      within(alerta).getByText("Remova os vínculos para prosseguir com a exclusão."),
    ).toBeInTheDocument();
    expect(within(alerta).getByRole("columnheader", { name: "Equipes" })).toBeInTheDocument();
    expect(within(alerta).getByRole("cell", { name: "Equipe 03" })).toBeInTheDocument();
    expect(within(alerta).getByRole("cell", { name: "Equipe 05" })).toBeInTheDocument();
    expect(within(alerta).getByRole("link", { name: "Cadastro de equipes" })).toHaveAttribute(
      "href",
      "/empresas/equipes",
    );
    expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
    expect(mocks.erro).not.toHaveBeenCalled();
    expect(mocks.sucesso).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
    fireEvent.click(within(alerta).getAllByRole("button", { name: "Fechar" }).at(-1)!);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  },
);

it("usa os textos padrão, lista os nomes recebidos em equipes e fecha pelo X", async () => {
  mocks.excluir.mockRejectedValueOnce({
    status: 400,
    message: { equipes: [{ uuid: "equipe-03", nome: "Equipe 03" }] },
  });
  render(<ExcluirLoteModal uuid="lote-1" />);
  await confirmar();
  const alerta = await screen.findByRole("alertdialog", { name: "Não é possível excluir o lote" });
  expect(within(alerta).getByText(/Este lote está vinculado/)).toBeInTheDocument();
  expect(within(alerta).getByRole("cell", { name: "Equipe 03" })).toBeInTheDocument();
  fireEvent.click(within(alerta).getAllByRole("button", { name: "Fechar" })[0]);
  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
});

it("aceita erro textual sem renderizar tabela vazia", async () => {
  mocks.excluir.mockResolvedValueOnce({
    success: false,
    status: 400,
    message: "Lote com vínculos ativos.",
  });
  render(<ExcluirLoteModal uuid="lote-1" />);
  await confirmar();
  const alerta = await screen.findByRole("alertdialog", { name: "Não é possível excluir o lote" });
  expect(within(alerta).getByText("Lote com vínculos ativos.")).toBeInTheDocument();
  expect(within(alerta).queryByRole("table")).not.toBeInTheDocument();
});

it.each([
  new Error("Sem conexão"),
  { status: 500, message: "Falha" },
  { status: 409, message: "Conflito" },
])("mantém o toast para erros inesperados (%s)", async (erro) => {
  mocks.excluir.mockRejectedValueOnce(erro);
  render(<ExcluirLoteModal uuid="lote-1" />);
  await confirmar();
  await waitFor(() => expect(mocks.erro).toHaveBeenCalledOnce());
  expect(
    screen.queryByRole("alertdialog", { name: "Não é possível excluir o lote" }),
  ).not.toBeInTheDocument();
  expect(mocks.replace).not.toHaveBeenCalled();
});

it("mantém a exclusão com sucesso e o retorno à listagem", async () => {
  mocks.excluir.mockResolvedValueOnce({ success: true });
  render(<ExcluirLoteModal uuid="lote-1" />);
  await confirmar();
  await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/lotes"));
  expect(mocks.sucesso).toHaveBeenCalledWith({
    titulo: "Sucesso!",
    descricao: "O lote foi excluído.",
  });
});
