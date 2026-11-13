import { fireEvent, render, screen } from "@testing-library/react";
import type { CSSProperties, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";

const alertaDialogContentMock = vi.hoisted(() => vi.fn());

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({
    open,
    onOpenChange,
    children,
  }: {
    open: boolean;
    onOpenChange: (aberto: boolean) => void;
    children: ReactNode;
  }) => {
    if (!open) {
      return null;
    }

    return (
      <div role="alertdialog">
        <button
          type="button"
          aria-label="Simular fechamento"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          Simular fechamento
        </button>

        {children}
      </div>
    );
  },

  AlertDialogContent: ({
    children,
    className,
    style,
    size,
  }: {
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    size?: string;
  }) => {
    alertaDialogContentMock({
      className,
      style,
      size,
    });

    return (
      <div
        data-testid="alerta-conteudo"
        data-size={size}
        className={className}
        style={style}
      >
        {children}
      </div>
    );
  },

  AlertDialogCancel: ({ children }: { children: ReactNode }) => <>{children}</>,

  AlertDialogAction: ({ children }: { children: ReactNode }) => <>{children}</>,

  AlertDialogHeader: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <header className={className}>{children}</header>,

  AlertDialogFooter: ({ children }: { children: ReactNode }) => (
    <footer>{children}</footer>
  ),

  AlertDialogTitle: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <h2 className={className}>{children}</h2>,

  AlertDialogDescription: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <p className={className}>{children}</p>,
}));

describe("AlertaErro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza título e mensagem", () => {
    render(
      <AlertaErro
        aberto
        titulo="Não foi possível criar o lote"
        mensagem="Ocorreu um erro durante o cadastro."
        onOpenChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "Não foi possível criar o lote",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ocorreu um erro durante o cadastro."),
    ).toBeInTheDocument();
  });

  it("utiliza a largura padrão quando width não for informado", () => {
    render(
      <AlertaErro
        aberto
        titulo="Erro"
        mensagem="Mensagem de erro"
        onOpenChange={vi.fn()}
      />,
    );

    const conteudo = screen.getByTestId("alerta-conteudo");

    expect(conteudo).toHaveClass("max-w-[750px]");
    expect(conteudo).not.toHaveClass("max-w-none");

    expect(conteudo).not.toHaveStyle({
      maxWidth: "calc(100vw - 2rem)",
    });

    expect(alertaDialogContentMock).toHaveBeenCalledWith({
      className: expect.stringContaining("max-w-[750px]"),
      style: undefined,
      size: "lg",
    });
  });

  it("utiliza a largura personalizada quando width for informado", () => {
    render(
      <AlertaErro
        aberto
        titulo="Erro"
        mensagem="Mensagem de erro"
        width={672}
        onOpenChange={vi.fn()}
      />,
    );

    const conteudo = screen.getByTestId("alerta-conteudo");

    expect(conteudo).toHaveClass("max-w-none");
    expect(conteudo).not.toHaveClass("max-w-[750px]");

    expect(conteudo).toHaveStyle({
      width: "672px",
      maxWidth: "calc(100vw - 2rem)",
    });

    expect(alertaDialogContentMock).toHaveBeenCalledWith({
      className: expect.stringContaining("max-w-none"),
      style: {
        width: 672,
        maxWidth: "calc(100vw - 2rem)",
      },
      size: "lg",
    });
  });

  it("renderiza o conteúdo filho", () => {
    render(
      <AlertaErro
        aberto
        titulo="Erro"
        mensagem="Mensagem"
        onOpenChange={vi.fn()}
      >
        <table>
          <tbody>
            <tr>
              <td>DRE PENHA</td>
              <td>LOTE-001</td>
            </tr>
          </tbody>
        </table>
      </AlertaErro>,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("DRE PENHA")).toBeInTheDocument();
    expect(screen.getByText("LOTE-001")).toBeInTheDocument();
  });

  it("repassa o fechamento para onOpenChange", () => {
    const onOpenChange = vi.fn();

    render(
      <AlertaErro
        aberto
        titulo="Erro"
        mensagem="Mensagem"
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Simular fechamento",
      }),
    );

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("não renderiza o conteúdo quando estiver fechado", () => {
    render(
      <AlertaErro
        aberto={false}
        titulo="Erro"
        mensagem="Mensagem"
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    expect(screen.queryByTestId("alerta-conteudo")).not.toBeInTheDocument();
  });
});
