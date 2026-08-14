import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import type { Empresa } from "@/features/empresa/types/empresa.types";
import { criarColunasEmpresa } from "../components/list/ColunasEmpresa";

vi.mock("@/components/icons/Close", () => ({
  ErrorCircleIcon: ({ className }: { className?: string }) => (
    <span data-testid="icone-inativo" className={className} />
  ),
}));

vi.mock("@/components/icons/PincelCustom", () => ({
  PencilIcon: ({ className }: { className?: string }) => (
    <span data-testid="icone-editar" className={className} />
  ),
}));

vi.mock("@/components/icons/SimboloAprovado", () => ({
  SuccessCircleIcon: ({ className }: { className?: string }) => (
    <span data-testid="icone-ativo" className={className} />
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant: _variant,
    size: _size,
    ...props
  }: ComponentProps<"button"> & {
    variant?: string;
    size?: string;
  }) => <button {...props}>{children}</button>,
}));

const empresaAtiva: Empresa = {
  id: 1,
  uuid: "uuid-ativa",
  nome: "Empresa Ativa",
  cnpj: "12345678000195",
  status: true,
  razao_social: "Empresa Ativa LTDA",
  link_rastreio: "https://rastreio.exemplo.com/1",
  cep: "01001000",
  logradouro: "Praça da Sé",
  numero: "1",
  cidade: "São Paulo",
  estado: "SP",
};

const empresaInativa: Empresa = {
  id: 2,
  uuid: "uuid-inativa",
  nome: "Empresa Inativa",
  cnpj: "98765432000110",
  status: false,
  razao_social: "Empresa Inativa LTDA",
  cep: "02002000",
  logradouro: "Av. Paulista",
  numero: "2",
  cidade: "São Paulo",
  estado: "SP",
};

describe("criarColunasEmpresa", () => {
  it("deve criar as colunas com as configurações corretas", () => {
    const colunas = criarColunasEmpresa({ onEditar: vi.fn() });

    expect(colunas).toHaveLength(6);

    expect(colunas[0]).toMatchObject({
      id: "nome",
      titulo: "Nome da empresa",
      classNameCabecalho: "w-1/3 text-left font-bold text-gray",
    });

    expect(colunas[1]).toMatchObject({
      id: "razao_social",
      titulo: "Razão Social",
    });

    expect(colunas[2]).toMatchObject({ id: "cnpj", titulo: "CNPJ" });

    expect(colunas[3]).toMatchObject({
      id: "status",
      titulo: "Status",
      classNameCabecalho: "w-23.5 border-l text-left font-bold text-gray",
    });

    expect(colunas[4]).toMatchObject({
      id: "rastreio",
      titulo: "Rastreio",
      classNameCelula: "border-l px-2",
    });

    expect(colunas[5]).toMatchObject({
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "w-16 border-l",
      classNameCelula: "border-l px-2 py-2 text-center",
    });
  });

  it("deve renderizar o nome e definir a classe conforme o status", () => {
    const colunas = criarColunasEmpresa({ onEditar: vi.fn() });
    const colunaNome = colunas[0];

    expect(colunaNome.renderizar(empresaAtiva)).toBe("Empresa Ativa");

    const obterClassName = colunaNome.classNameCelula as (
      empresa: Empresa,
    ) => string;

    expect(obterClassName(empresaAtiva)).toBe("text-gray");
    expect(obterClassName(empresaInativa)).toBe("text-blocked-foreground");
  });

  it("deve renderizar a razão social e definir a classe conforme o status", () => {
    const colunas = criarColunasEmpresa({ onEditar: vi.fn() });
    const colunaRazaoSocial = colunas[1];

    expect(colunaRazaoSocial.renderizar(empresaAtiva)).toBe(
      "Empresa Ativa LTDA",
    );

    const obterClassName = colunaRazaoSocial.classNameCelula as (
      empresa: Empresa,
    ) => string;

    expect(obterClassName(empresaAtiva)).toBe("border-l px-2 text-gray");
    expect(obterClassName(empresaInativa)).toBe(
      "border-l px-2 text-blocked-foreground",
    );
  });

  it("deve renderizar o CNPJ mascarado e definir a classe conforme o status", () => {
    const colunas = criarColunasEmpresa({ onEditar: vi.fn() });
    const colunaCnpj = colunas[2];

    expect(colunaCnpj.renderizar(empresaAtiva)).toBe("12.345.678/0001-95");

    const obterClassName = colunaCnpj.classNameCelula as (
      empresa: Empresa,
    ) => string;

    expect(obterClassName(empresaAtiva)).toBe(
      "border-l px-2 whitespace-nowrap text-gray",
    );
    expect(obterClassName(empresaInativa)).toBe(
      "border-l px-2 whitespace-nowrap text-blocked-foreground",
    );
  });

  it("deve renderizar o status ativo", () => {
    const colunas = criarColunasEmpresa({ onEditar: vi.fn() });

    render(colunas[3].renderizar(empresaAtiva));

    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByTestId("icone-ativo")).toHaveClass(
      "size-4",
      "text-[#8DC773]",
    );
    expect(screen.queryByTestId("icone-inativo")).not.toBeInTheDocument();
  });

  it("deve renderizar o status inativo", () => {
    const colunas = criarColunasEmpresa({ onEditar: vi.fn() });

    render(colunas[3].renderizar(empresaInativa));

    expect(screen.getByText("Inativo")).toBeInTheDocument();
    expect(screen.getByTestId("icone-inativo")).toHaveClass(
      "size-4",
      "text-[#FD756D]",
    );
    expect(screen.queryByTestId("icone-ativo")).not.toBeInTheDocument();
  });

  it("deve renderizar o link de rastreio quando ativa e com link", () => {
    const colunas = criarColunasEmpresa({ onEditar: vi.fn() });

    render(colunas[4].renderizar(empresaAtiva));

    const link = screen.getByRole("link", { name: "Rastrear empresa" });

    expect(link).toHaveAttribute("href", empresaAtiva.link_rastreio);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("deve renderizar rastreio como texto simples quando inativa ou sem link", () => {
    const colunas = criarColunasEmpresa({ onEditar: vi.fn() });

    render(colunas[4].renderizar(empresaInativa));

    expect(
      screen.queryByRole("link", { name: "Rastrear empresa" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Rastrear empresa")).toBeInTheDocument();
  });

  it("deve chamar onEditar com a empresa selecionada", () => {
    const onEditar = vi.fn();
    const colunas = criarColunasEmpresa({ onEditar });

    render(colunas[5].renderizar(empresaAtiva));

    const botaoEditar = screen.getByRole("button", {
      name: "Editar Empresa Ativa LTDA",
    });

    expect(botaoEditar).toHaveAttribute("type", "button");
    expect(botaoEditar).toHaveClass("border", "border-primary-dark");
    expect(screen.getByTestId("icone-editar")).toHaveClass("size-4");

    fireEvent.click(botaoEditar);

    expect(onEditar).toHaveBeenCalledTimes(1);
    expect(onEditar).toHaveBeenCalledWith(empresaAtiva);
  });
});
