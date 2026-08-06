import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { criarColunasFornecedor } from "../components/list/ColunasFornecedor";
import { TabelaFornecedor } from "../components/list/TabelaFornecedor";
import type { Fornecedor } from "../types/fornecedor.types";

const FORNECEDOR_ATIVO: Fornecedor = {
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

const FORNECEDOR_INATIVO: Fornecedor = {
  ...FORNECEDOR_ATIVO,
  id: 2,
  uuid: "8a5f9f3b-7c4a-4f3b-9a3b-2c3d4e5f6071",
  razao_social: "ProService Predial S.A.",
  status: false,
  link_rastreio: undefined,
};

function renderTabela(fornecedores: Fornecedor[], onEditar = vi.fn()) {
  const colunas = criarColunasFornecedor({ onEditar });

  render(
    <TabelaFornecedor fornecedores={fornecedores} colunas={colunas} />,
  );

  return { onEditar };
}

describe("FornecedorTable", () => {
  it("deve renderizar a tabela sem linhas quando não há fornecedores", () => {
    renderTabela([]);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")).toHaveLength(1);
  });

  it("deve renderizar a razão social e o cnpj mascarado", () => {
    renderTabela([FORNECEDOR_ATIVO]);

    expect(
      screen.getByText("MaxManutenção Serviços Ltda."),
    ).toBeInTheDocument();
    expect(screen.getByText("11.444.777/0001-61")).toBeInTheDocument();
  });

  it("deve exibir o status ativo", () => {
    renderTabela([FORNECEDOR_ATIVO]);

    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("deve exibir o status inativo", () => {
    renderTabela([FORNECEDOR_INATIVO]);

    expect(screen.getByText("Inativo")).toBeInTheDocument();
  });

  it("deve renderizar o link de rastreio quando existir", () => {
    renderTabela([FORNECEDOR_ATIVO]);

    expect(
      screen.getByRole("link", { name: /rastrear fornecedor/i }),
    ).toHaveAttribute("href", "https://rastreio.exemplo.com/1");
  });

  it("não deve renderizar link de rastreio quando não existir", () => {
    renderTabela([FORNECEDOR_INATIVO]);

    expect(
      screen.queryByRole("link", { name: /rastrear fornecedor/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/rastrear fornecedor/i)).toBeInTheDocument();
  });

  it("não deve renderizar link de rastreio quando o fornecedor estiver inativo, mesmo com link cadastrado", () => {
    renderTabela([
      {
        ...FORNECEDOR_INATIVO,
        link_rastreio: FORNECEDOR_ATIVO.link_rastreio,
      },
    ]);

    expect(
      screen.queryByRole("link", { name: /rastrear fornecedor/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/rastrear fornecedor/i)).toBeInTheDocument();
  });

  it("deve chamar onEditar ao clicar no botão de editar do fornecedor", async () => {
    const user = userEvent.setup();
    const { onEditar } = renderTabela([FORNECEDOR_ATIVO]);

    await user.click(
      screen.getByRole("button", {
        name: /editar maxmanutenção serviços ltda\./i,
      }),
    );

    expect(onEditar).toHaveBeenCalledWith(FORNECEDOR_ATIVO);
  });

  it("deve aplicar a classe de linha inativa quando o fornecedor estiver inativo", () => {
    renderTabela([FORNECEDOR_INATIVO]);

    expect(screen.getByText("ProService Predial S.A.").closest("tr")).toHaveClass(
      "bg-gray-light",
      "text-blocked-foreground",
    );
  });

  it("deve exibir indicador de atualização quando estiver atualizando", () => {
    const colunas = criarColunasFornecedor({ onEditar: vi.fn() });

    render(
      <TabelaFornecedor
        fornecedores={[FORNECEDOR_ATIVO]}
        colunas={colunas}
        atualizando
      />,
    );

    expect(screen.getByRole("table").parentElement).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });
});
