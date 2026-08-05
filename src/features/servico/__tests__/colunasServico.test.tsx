import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

import type { Servico } from "@/features/servico/types/servicos.types";
import { criarColunasServico } from "../components/Servico/colunasServico";

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

const servicoAtivo: Servico = {
  id: 1,
  uuid: "uuid-eletrica",
  nome: "Elétrica",
  status: true,
};

const servicoInativo: Servico = {
  id: 2,
  uuid: "uuid-pintura",
  nome: "Pintura",
  status: false,
};

describe("criarColunasServico", () => {
  it("deve criar as colunas com as configurações corretas", () => {
    const onEditar = vi.fn();

    const colunas = criarColunasServico({ onEditar });

    expect(colunas).toHaveLength(3);

    expect(colunas[0]).toMatchObject({
      id: "nome",
      titulo: "Serviço",
      classNameCabecalho: "text-left font-bold",
    });

    expect(colunas[1]).toMatchObject({
      id: "status",
      titulo: "Status",
      classNameCabecalho: "w-23.5 border-l text-left font-bold",
    });

    expect(colunas[2]).toMatchObject({
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "w-16 border-l",
      classNameCelula: "border-l px-2 py-2 text-center",
    });
  });

  it("deve renderizar o nome e definir sua classe conforme o status", () => {
    const colunas = criarColunasServico({
      onEditar: vi.fn(),
    });

    const colunaNome = colunas[0];

    expect(colunaNome.renderizar(servicoAtivo)).toBe("Elétrica");
    expect(colunaNome.renderizar(servicoInativo)).toBe("Pintura");

    expect(colunaNome.classNameCelula).toBeTypeOf("function");

    const obterClassName = colunaNome.classNameCelula as (
      servico: Servico,
    ) => string;

    expect(obterClassName(servicoAtivo)).toBe("text-[var(--gray)]");

    expect(obterClassName(servicoInativo)).toBe("text-[var(--disabled-text)]");
  });

  it("deve definir a classe da coluna de status para serviço ativo e inativo", () => {
    const colunas = criarColunasServico({
      onEditar: vi.fn(),
    });

    const colunaStatus = colunas[1];

    expect(colunaStatus.classNameCelula).toBeTypeOf("function");

    const obterClassName = colunaStatus.classNameCelula as (
      servico: Servico,
    ) => string;

    expect(obterClassName(servicoAtivo)).toBe(
      "border-l px-2 text-[var(--gray)]",
    );

    expect(obterClassName(servicoInativo)).toBe(
      "border-l px-2 text-[var(--disabled-text)]",
    );
  });

  it("deve renderizar o status ativo", () => {
    const colunas = criarColunasServico({
      onEditar: vi.fn(),
    });

    render(colunas[1].renderizar(servicoAtivo));

    expect(screen.getByText("Ativo")).toBeInTheDocument();

    expect(screen.getByTestId("icone-ativo")).toHaveClass(
      "size-4",
      "text-[#8DC773]",
    );

    expect(screen.queryByTestId("icone-inativo")).not.toBeInTheDocument();
  });

  it("deve renderizar o status inativo", () => {
    const colunas = criarColunasServico({
      onEditar: vi.fn(),
    });

    render(colunas[1].renderizar(servicoInativo));

    expect(screen.getByText("Inativo")).toBeInTheDocument();

    expect(screen.getByTestId("icone-inativo")).toHaveClass(
      "size-4",
      "text-[#FD756D]",
    );

    expect(screen.queryByTestId("icone-ativo")).not.toBeInTheDocument();
  });

  it("deve chamar onEditar com o serviço selecionado", () => {
    const onEditar = vi.fn();

    const colunas = criarColunasServico({ onEditar });

    render(colunas[2].renderizar(servicoAtivo));

    const botaoEditar = screen.getByRole("button", {
      name: "Editar Elétrica",
    });

    expect(botaoEditar).toHaveAttribute("type", "button");

    expect(botaoEditar).toHaveClass(
      "border",
      "border-[var(--color-primary-dark)]",
    );

    expect(screen.getByTestId("icone-editar")).toHaveClass("size-4");

    fireEvent.click(botaoEditar);

    expect(onEditar).toHaveBeenCalledTimes(1);
    expect(onEditar).toHaveBeenCalledWith(servicoAtivo);
  });
});
