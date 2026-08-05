import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FornecedorLista } from "../components/list/FornecedorLista";
import { fornecedorService } from "../services/fornecedor.service";
import type { Fornecedor } from "../types/fornecedor.types";

vi.mock("../services/fornecedor.service", () => ({
  fornecedorService: {
    list: vi.fn(),
  },
}));

const mockService = fornecedorService as unknown as {
  list: ReturnType<typeof vi.fn>;
};

const FORNECEDOR: Fornecedor = {
  id: 1,
  uuid: "7f4e8e2a-6b3f-4e2a-8f2a-1b2c3d4e5f60",
  nome: "MaxManutenção",
  cnpj: "11444777000161",
  status: true,
  razao_social: "MaxManutenção Serviços Ltda.",
  link_rastreio: "https://rastreio.exemplo.com/1",
  cep: "01310100",
  logradouro: "Rua",
  numero: "123",
  cidade: "São Paulo",
  estado: "SP",
};

function renderLista() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <FornecedorLista />
    </QueryClientProvider>,
  );
}

describe("FornecedorLista", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockService.list.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [FORNECEDOR],
    });
  });

  it("deve renderizar o título e o link de cadastro", async () => {
    renderLista();

    expect(
      screen.getByRole("heading", { name: /^empresas$/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /cadastrar empresa/i }),
    ).toHaveAttribute("href", "/cadastro/empresas/cadastrar");

    await waitFor(() => expect(mockService.list).toHaveBeenCalled());
  });

  it("deve buscar empresas ao carregar a página", async () => {
    renderLista();

    await waitFor(() => {
      expect(mockService.list).toHaveBeenCalledWith({
        nome: undefined,
        razao_social: undefined,
        cnpj: undefined,
        status: undefined,
        page: 1,
        page_size: 10,
      });
    });

    expect(
      await screen.findByText("MaxManutenção Serviços Ltda."),
    ).toBeInTheDocument();
  });

  it("deve aplicar os filtros ao clicar em buscar empresas", async () => {
    const user = userEvent.setup();
    renderLista();

    await waitFor(() => expect(mockService.list).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/^nome$/i), "Max");
    await user.click(screen.getByRole("button", { name: /buscar empresas/i }));

    await waitFor(() => {
      expect(mockService.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ nome: "Max" }),
      );
    });
  });

  it("deve limpar os filtros ao clicar em limpar filtros", async () => {
    const user = userEvent.setup();
    renderLista();

    await waitFor(() => expect(mockService.list).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/^nome$/i), "Max");
    await user.click(screen.getByRole("button", { name: /buscar empresas/i }));

    await waitFor(() => {
      expect(mockService.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ nome: "Max" }),
      );
    });

    await user.click(screen.getByRole("button", { name: /limpar filtros/i }));

    await waitFor(() => {
      expect(mockService.list).toHaveBeenLastCalledWith(
        expect.objectContaining({ nome: undefined }),
      );
    });

    expect(screen.getByLabelText(/^nome$/i)).toHaveValue("");
  });

  it("deve alterar a quantidade de registros por página", async () => {
    const user = userEvent.setup();
    renderLista();

    await screen.findByText("MaxManutenção Serviços Ltda.");

    await user.click(
      screen.getByRole("combobox", { name: /registros por página/i }),
    );
    await user.click(await screen.findByRole("option", { name: "20" }));

    expect(
      screen.getByRole("combobox", { name: /registros por página/i }),
    ).toHaveTextContent("20");
  });

  it("deve registrar no console ao clicar em editar um fornecedor", async () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const user = userEvent.setup();
    renderLista();

    await user.click(
      await screen.findByRole("button", {
        name: /editar maxmanutenção serviços ltda\./i,
      }),
    );

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Editar fornecedor:",
      FORNECEDOR,
    );

    consoleLogSpy.mockRestore();
  });
});
