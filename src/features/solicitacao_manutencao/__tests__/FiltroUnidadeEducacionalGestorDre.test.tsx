import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { requisicaoAutenticada } from "@/actions/http/requisicao-autenticada";
import type { LoginUser } from "@/features/login/types/login.types";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { FiltroUnidadeEducacionalGestorDre } from "../components/list/FiltrosGestorDre";

vi.mock("@/actions/http/requisicao-autenticada", () => ({ requisicaoAutenticada: vi.fn() }));
const requisicao = vi.mocked(requisicaoAutenticada);
const escola = {
  id: 2074,
  uuid: "ue1",
  nome: "Escola da DRE",
  codigo_eol: "000086",
  diretoria_regional: { id: 3 },
};
const clientes: QueryClient[] = [];

function definirUsuario(unidadeEducacional: LoginUser["unidadeEducacional"] = escola) {
  useUsuarioStore
    .getState()
    .definirUsuario({
      nome: "Usuário",
      codigoRfOuCpf: "123",
      cargo: "Gestor DRE",
      diretoriaRegional: "Nome da DRE",
      unidadeEducacional,
      funcionalidades: [],
    });
}
function preparar() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  clientes.push(client);
  render(
    <QueryClientProvider client={client}>
      <FiltroUnidadeEducacionalGestorDre value="" onChange={vi.fn()} />
    </QueryClientProvider>,
  );
}
beforeEach(() => {
  requisicao.mockReset().mockResolvedValue({ results: [escola] });
  useUsuarioStore.getState().limparUsuario();
});
afterEach(() => {
  clientes.splice(0).forEach((client) => client.clear());
});

it("envia o ID da DRE do usuário na consulta e habilita o campo ao receber as unidades", async () => {
  definirUsuario();
  preparar();
  await waitFor(() =>
    expect(requisicao).toHaveBeenCalledWith({
      method: "GET",
      url: "/unidades-educacionais/",
      params: { diretoria_regional: "3", page_size: "all" },
    }),
  );
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Unidade Educacional" })).toBeEnabled(),
  );
  await userEvent.setup().click(screen.getByRole("button", { name: "Unidade Educacional" }));
  expect(screen.getByRole("option", { name: "Escola da DRE" })).toBeInTheDocument();
});

const SEM_DRE: LoginUser["unidadeEducacional"][] = [
  null,
  "Nome da escola",
  { ...escola, diretoria_regional: undefined },
  { ...escola, diretoria_regional: { nome_curto: "DRE sem ID" } },
];
it.each(SEM_DRE)("não busca sem filtro de DRE quando a unidade não tem ID: %j", (unidade) => {
  definirUsuario(unidade);
  preparar();
  expect(requisicao).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Unidade Educacional" })).toBeDisabled();
  expect(
    screen.getByText("O usuário precisa ter uma DRE vinculada para listar as unidades."),
  ).toBeInTheDocument();
});

it("aguarda o usuário carregar antes de consultar unidades", async () => {
  preparar();
  expect(requisicao).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "Unidade Educacional" })).toBeDisabled();
  act(() => definirUsuario());
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Unidade Educacional" })).toBeEnabled(),
  );
  expect(requisicao).toHaveBeenCalledWith(
    expect.objectContaining({ params: { diretoria_regional: "3", page_size: "all" } }),
  );
});

it("não permite escolher a lista antiga enquanto carrega unidades de outra DRE", async () => {
  definirUsuario();
  preparar();
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Unidade Educacional" })).toBeEnabled(),
  );
  let concluir!: (value: { results: (typeof escola)[] }) => void;
  requisicao.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        concluir = resolve;
      }),
  );
  act(() => definirUsuario({ ...escola, diretoria_regional: { id: 5 } }));
  await waitFor(() =>
    expect(requisicao).toHaveBeenLastCalledWith(
      expect.objectContaining({ params: { diretoria_regional: "5", page_size: "all" } }),
    ),
  );
  expect(screen.getByRole("button", { name: "Unidade Educacional" })).toBeDisabled();
  const outraEscola = {
    ...escola,
    uuid: "ue5",
    nome: "Escola da outra DRE",
    diretoria_regional: { id: 5 },
  };
  await act(async () => {
    concluir({ results: [outraEscola] });
  });
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Unidade Educacional" })).toBeEnabled(),
  );
  await userEvent.setup().click(screen.getByRole("button", { name: "Unidade Educacional" }));
  expect(screen.getByRole("option", { name: "Escola da outra DRE" })).toBeInTheDocument();
  expect(screen.queryByRole("option", { name: "Escola da DRE" })).not.toBeInTheDocument();
});

it("mantém a DRE na nova tentativa após falha da consulta", async () => {
  definirUsuario();
  requisicao.mockRejectedValueOnce(new Error("Falha na API"));
  preparar();
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Não foi possível carregar as unidades educacionais.",
  );
  await userEvent.setup().click(screen.getByRole("button", { name: "Tentar novamente" }));
  await waitFor(() =>
    expect(screen.getByRole("button", { name: "Unidade Educacional" })).toBeEnabled(),
  );
  expect(requisicao).toHaveBeenLastCalledWith(
    expect.objectContaining({ params: { diretoria_regional: "3", page_size: "all" } }),
  );
});
