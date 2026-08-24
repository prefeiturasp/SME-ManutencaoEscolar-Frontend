import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AlertaErroVinculoLote } from "@/app/cadastro/lotes/components/AlertaErroVinculoLote";

const alertaErroMock = vi.hoisted(() => vi.fn());

vi.mock("@/components/shared/AlertaErro/AlertaErro", () => ({
  AlertaErro: ({
    aberto,
    titulo,
    mensagem,
    width,
    children,
    onOpenChange,
  }: {
    aberto: boolean;
    titulo: string;
    mensagem: string;
    width?: number;
    children?: ReactNode;
    onOpenChange: (aberto: boolean) => void;
  }) => {
    alertaErroMock({
      aberto,
      titulo,
      mensagem,
      width,
      onOpenChange,
    });

    if (!aberto) {
      return null;
    }

    return (
      <div role="alertdialog" aria-label={titulo} data-width={width}>
        <h2>{titulo}</h2>
        <p>{mensagem}</p>

        {children}

        <button
          type="button"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          Fechar alerta
        </button>
      </div>
    );
  },
}));

describe("AlertaErroVinculoLote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("repassa as propriedades para o AlertaErro", () => {
    const onOpenChange = vi.fn();

    render(
      <AlertaErroVinculoLote
        aberto
        titulo="DREs já vinculadas"
        mensagem="Algumas DREs já pertencem a outros lotes."
        width={672}
        vinculados={[]}
        onOpenChange={onOpenChange}
      />,
    );

    expect(alertaErroMock).toHaveBeenCalledWith(
      expect.objectContaining({
        aberto: true,
        titulo: "DREs já vinculadas",
        mensagem: "Algumas DREs já pertencem a outros lotes.",
        width: 672,
        onOpenChange,
      }),
    );

    expect(screen.getByRole("alertdialog")).toHaveAttribute(
      "data-width",
      "672",
    );
  });

  it("renderiza a tabela com as DREs vinculadas", () => {
    render(
      <AlertaErroVinculoLote
        aberto
        titulo="DREs já vinculadas"
        mensagem="Revise as DREs abaixo."
        vinculados={[
          ["DRE PENHA", "LOTE-001"],
          ["DRE BUTANTÃ", "LOTE-002"],
        ]}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: "DRE",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: "Lote",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("DRE PENHA")).toBeInTheDocument();
    expect(screen.getByText("LOTE-001")).toBeInTheDocument();
    expect(screen.getByText("DRE BUTANTÃ")).toBeInTheDocument();
    expect(screen.getByText("LOTE-002")).toBeInTheDocument();

    // Uma linha do cabeçalho e duas linhas de dados.
    expect(screen.getAllByRole("row")).toHaveLength(3);
  });

  it("não renderiza a tabela quando não existem vínculos", () => {
    render(
      <AlertaErroVinculoLote
        aberto
        titulo="Erro"
        mensagem="Não existem vínculos para exibir."
        vinculados={[]}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.getByText("Não existem vínculos para exibir."),
    ).toBeInTheDocument();
  });

  it("não renderiza o conteúdo quando o alerta está fechado", () => {
    render(
      <AlertaErroVinculoLote
        aberto={false}
        titulo="Erro"
        mensagem="Mensagem do erro"
        vinculados={[["DRE PENHA", "LOTE-001"]]}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("repassa a alteração de abertura do alerta", () => {
    const onOpenChange = vi.fn();

    render(
      <AlertaErroVinculoLote
        aberto
        titulo="Erro"
        mensagem="Mensagem do erro"
        vinculados={[]}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Fechar alerta",
      }),
    );

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
