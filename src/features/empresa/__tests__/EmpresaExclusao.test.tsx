import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { EmpresaExclusao } from "../components/form/EmpresaExclusao";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("@/features/empresa/hooks/useDeleteEmpresa", () => ({
  useDeleteEmpresa: () => ({
    mutateAsync: mocks.mutateAsync,
    isPending: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastErro: vi.fn(),
  toastSucesso: vi.fn(),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/confirmaDialogo", () => ({
  ConfirmDialog: ({
    open,
    confirmLabel,
    onConfirm,
  }: {
    open: boolean;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
  }) =>
    open ? (
      <div role="dialog">
        <button type="button" onClick={() => void onConfirm()}>
          {confirmLabel}
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/shared/AlertaErro/AlertaErro", () => ({
  AlertaErro: ({
    aberto,
    titulo,
    mensagem,
    children,
    onOpenChange,
  }: {
    aberto: boolean;
    titulo: string;
    mensagem: string;
    children: ReactNode;
    onOpenChange: (aberto: boolean) => void;
  }) =>
    aberto ? (
      <div role="alertdialog">
        <h2>{titulo}</h2>
        <p>{mensagem}</p>
        {children}

        <button type="button" onClick={() => onOpenChange(false)}>
          Fechar
        </button>
      </div>
    ) : null,
}));

const mockToastErro = vi.mocked(toastErro);
const mockToastSucesso = vi.mocked(toastSucesso);

describe("EmpresaExclusao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mutateAsync.mockReset();
  });

  function confirmarExclusao(): void {
    render(<EmpresaExclusao uuid="uuid-empresa" cnpj="99889215000172" />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir empresa" }));

    const confirmacao = screen.getByRole("dialog");

    fireEvent.click(
      within(confirmacao).getByRole("button", {
        name: "Excluir empresa",
      }),
    );
  }

  it("abre o alerta com a mensagem do backend para um lote", async () => {
    mocks.mutateAsync.mockRejectedValueOnce({
      success: false,
      status: 400,
      title: "Não é possível excluir a empresa",
      message: {
        message: "A empresa possui vínculo com o Lote 001.",
      },
    });

    confirmarExclusao();

    const alerta = await screen.findByRole("alertdialog");

    expect(
      within(alerta).getByText("A empresa possui vínculo com o Lote 001."),
    ).toBeInTheDocument();

    expect(within(alerta).queryByText("Lotes")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    expect(mockToastErro).not.toHaveBeenCalled();
    expect(mockToastSucesso).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("abre o alerta com a lista de vários lotes", async () => {
    mocks.mutateAsync.mockRejectedValueOnce({
      success: false,
      status: 400,
      title: "Não é possível excluir a empresa",
      message: {
        message: "A empresa possui vínculos com vários lotes.",
        vinculados: ["Lote 001", "Lote 002"],
      },
    });

    confirmarExclusao();

    const alerta = await screen.findByRole("alertdialog");

    expect(within(alerta).getByText("Não é possível excluir a empresa")).toBeInTheDocument();

    expect(
      within(alerta)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Lote 001", "Lote 002"]);

    expect(mockToastErro).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("mostra toast para erro 500", async () => {
    mocks.mutateAsync.mockRejectedValueOnce({
      success: false,
      status: 500,
      message: "Erro interno",
    });

    confirmarExclusao();

    await waitFor(() => {
      expect(mockToastErro).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao: "Não conseguimos excluir a empresa. Por favor, tente novamente.",
      });
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(mockToastSucesso).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("mostra toast quando o 400 não tem o formato de vínculo", async () => {
    mocks.mutateAsync.mockRejectedValueOnce({
      success: false,
      status: 400,
      message: "Outro erro de validação",
    });

    confirmarExclusao();

    await waitFor(() => {
      expect(mockToastErro).toHaveBeenCalled();
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("usa o título padrão quando o backend não envia title", async () => {
    mocks.mutateAsync.mockRejectedValueOnce({
      success: false,
      status: 400,
      message: {
        message: "A empresa possui um lote vinculado.",
      },
    });

    confirmarExclusao();

    const alerta = await screen.findByRole("alertdialog");

    expect(within(alerta).getByText("Não é possível excluir a empresa")).toBeInTheDocument();

    expect(within(alerta).getByText("A empresa possui um lote vinculado.")).toBeInTheDocument();

    expect(mockToastErro).not.toHaveBeenCalled();
  });

  it("mostra toast se a lista de lotes vier em formato inválido", async () => {
    mocks.mutateAsync.mockRejectedValueOnce({
      success: false,
      status: 400,
      message: {
        message: "A empresa possui lotes vinculados.",
        vinculados: ["Lote 001", 123],
      },
    });

    confirmarExclusao();

    await waitFor(() => {
      expect(mockToastErro).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao: "Não conseguimos excluir a empresa. Por favor, tente novamente.",
      });
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("mostra toast quando a exclusão rejeita com null", async () => {
    mocks.mutateAsync.mockRejectedValueOnce(null);

    confirmarExclusao();

    await waitFor(() => {
      expect(mockToastErro).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao: "Não conseguimos excluir a empresa. Por favor, tente novamente.",
      });
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("mostra toast quando falta a mensagem do vínculo", async () => {
    mocks.mutateAsync.mockRejectedValueOnce({
      success: false,
      status: 400,
      message: {
        vinculados: ["Lote 001"],
      },
    });

    confirmarExclusao();

    await waitFor(() => {
      expect(mockToastErro).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao: "Não conseguimos excluir a empresa. Por favor, tente novamente.",
      });
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
