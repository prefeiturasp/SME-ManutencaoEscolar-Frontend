import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { criarColunasEmpresa } from "../components/list/ColunasEmpresa";
import { TabelaEmpresa } from "../components/list/TabelaEmpresa";
import type { Empresa } from "../types/empresa.types";

const EMPRESA_ATIVO: Empresa = {
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
  responsaveis_tecnicos: [],
  criado_por: "Usuário Teste",
  criado_em: "2026-01-01T10:00:00Z",
  atualizado_por: "Usuário Teste",
  atualizado_em: "2026-01-02T10:00:00Z",
};

const EMPRESA_INATIVO: Empresa = {
  ...EMPRESA_ATIVO,
  id: 2,
  uuid: "8a5f9f3b-7c4a-4f3b-9a3b-2c3d4e5f6071",
  razao_social: "ProService Predial S.A.",
  status: false,
  link_rastreio: undefined,
};

function renderTabela(empresas: Empresa[], onEditar = vi.fn()) {
  const colunas = criarColunasEmpresa({ onEditar });

  render(<TabelaEmpresa empresas={empresas} colunas={colunas} />);

  return { onEditar };
}

describe("EmpresaTable", () => {
  it("deve renderizar a tabela sem linhas quando não há empresas", () => {
    renderTabela([]);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")).toHaveLength(1);
  });

  it("deve renderizar a razão social e o cnpj mascarado", () => {
    renderTabela([EMPRESA_ATIVO]);

    expect(
      screen.getByText("MaxManutenção Serviços Ltda."),
    ).toBeInTheDocument();
    expect(screen.getByText("11.444.777/0001-61")).toBeInTheDocument();
  });

  it("deve exibir o status ativo", () => {
    renderTabela([EMPRESA_ATIVO]);

    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("deve exibir o status inativo", () => {
    renderTabela([EMPRESA_INATIVO]);

    expect(screen.getByText("Inativo")).toBeInTheDocument();
  });

  it("deve renderizar o link de rastreio quando existir", () => {
    renderTabela([EMPRESA_ATIVO]);

    expect(
      screen.getByRole("link", { name: /rastrear empresa/i }),
    ).toHaveAttribute("href", "https://rastreio.exemplo.com/1");
  });

  it("não deve renderizar link de rastreio quando não existir", () => {
    renderTabela([EMPRESA_INATIVO]);

    expect(
      screen.queryByRole("link", { name: /rastrear empresa/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/rastrear empresa/i)).toBeInTheDocument();
  });

  it("não deve renderizar link de rastreio quando a empresa estiver inativa, mesmo com link cadastrado", () => {
    renderTabela([
      {
        ...EMPRESA_INATIVO,
        link_rastreio: EMPRESA_ATIVO.link_rastreio,
      },
    ]);

    expect(
      screen.queryByRole("link", { name: /rastrear empresa/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/rastrear empresa/i)).toBeInTheDocument();
  });

  it("deve chamar onEditar ao clicar no botão de editar da empresa", async () => {
    const user = userEvent.setup();
    const { onEditar } = renderTabela([EMPRESA_ATIVO]);

    await user.click(
      screen.getByRole("button", {
        name: /editar maxmanutenção serviços ltda\./i,
      }),
    );

    expect(onEditar).toHaveBeenCalledWith(EMPRESA_ATIVO);
  });

  it("deve aplicar a classe de linha inativa quando a empresa estiver inativa", () => {
    renderTabela([EMPRESA_INATIVO]);

    expect(
      screen.getByText("ProService Predial S.A.").closest("tr"),
    ).toHaveClass("bg-background text-blocked-foreground");
  });

  it("deve exibir indicador de atualização quando estiver atualizando", () => {
    const colunas = criarColunasEmpresa({ onEditar: vi.fn() });

    render(
      <TabelaEmpresa
        empresas={[EMPRESA_ATIVO]}
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
