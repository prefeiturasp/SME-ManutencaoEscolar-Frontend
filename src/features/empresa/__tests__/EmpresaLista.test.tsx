import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EmpresaLista } from "../components/list/EmpresaLista";
import { empresaService } from "../services/empresa.service";
import type { Empresa } from "../types/empresa.types";

vi.mock("../services/empresa.service", () => ({
  empresaService: {
    list: vi.fn(),
  },
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string | { src: string };
    alt: string;
    className?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={typeof src === "string" ? src : src.src}
      alt={alt}
      className={className}
    />
  ),
}));

const mockService = empresaService as unknown as {
  list: ReturnType<typeof vi.fn>;
};

const EMPRESA: Empresa = {
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
      <EmpresaLista />
    </QueryClientProvider>,
  );
}

describe("EmpresaLista", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockService.list.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [EMPRESA],
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

  it("deve exibir mensagem para cadastrar a primeira empresa quando não houver empresas cadastradas", async () => {
    mockService.list.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });
    renderLista();

    expect(
      await screen.findByText("Não há empresas cadastradas"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Que tal cadastrar a primeira empresa agora?"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /cadastrar empresa/i }),
    ).toHaveLength(2);
  });

  it("deve exibir mensagem de busca sem resultados quando os filtros aplicados não retornarem empresas", async () => {
    const user = userEvent.setup();
    mockService.list.mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [EMPRESA],
    });
    renderLista();

    await waitFor(() => expect(mockService.list).toHaveBeenCalled());

    mockService.list.mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    await user.type(screen.getByLabelText(/^nome$/i), "Inexistente");
    await user.click(screen.getByRole("button", { name: /buscar empresas/i }));

    expect(
      await screen.findByText("Não encontramos dados para esta busca"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Experimente remover alguns filtros ou selecionar outros critérios de busca.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /cadastrar empresa/i }),
    ).toHaveLength(1);
  });

  it("deve exibir mensagem de erro quando a busca falhar", async () => {
    mockService.list.mockRejectedValue(new Error("Erro de rede"));
    renderLista();

    expect(
      await screen.findByText("Não foi possível carregar as empresas."),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("MaxManutenção Serviços Ltda."),
    ).not.toBeInTheDocument();
  });

  it("deve registrar no console ao clicar em editar uma empresa", async () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const user = userEvent.setup();
    renderLista();

    await user.click(
      await screen.findByRole("button", {
        name: /editar maxmanutenção serviços ltda\./i,
      }),
    );

    expect(consoleLogSpy).toHaveBeenCalledWith("Editar empresa:", EMPRESA);

    consoleLogSpy.mockRestore();
  });
});
