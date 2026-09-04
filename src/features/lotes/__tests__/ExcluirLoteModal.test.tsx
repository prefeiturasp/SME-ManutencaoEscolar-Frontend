import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExcluirLoteModal } from "../components/ExcluirLoteModal";
import { useExcluirLote } from "../hooks/useDeleteLote";

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  replace: vi.fn(),
  toastErro: vi.fn(),
  toastSucesso: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("../hooks/useDeleteLote", () => ({
  useExcluirLote: vi.fn(),
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastErro: mocks.toastErro,
  toastSucesso: mocks.toastSucesso,
}));

vi.mock("@/components/ui/confirmaDialogo", () => ({
  ConfirmDialog: ({
    open,
    loading,
    title,
    description,
    confirmLabel,
    onConfirm,
    onOpenChange,
  }: {
    open: boolean;
    loading: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => Promise<void>;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div
      data-testid="confirm-dialog"
      data-open={String(open)}
      data-loading={String(loading)}
    >
      <h2>{title}</h2>
      <p>{description}</p>
      <span>{confirmLabel}</span>

      <button type="button" onClick={() => void onConfirm()}>
        Confirmar exclusão
      </button>

      <button type="button" onClick={() => onOpenChange(false)}>
        Fechar diálogo
      </button>
    </div>
  ),
}));

const mockUseExcluirLote = vi.mocked(useExcluirLote);

describe("ExcluirLoteModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.mutateAsync.mockResolvedValue({
      success: true,
    });

    mockUseExcluirLote.mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    } as never);
  });

  it("deve renderizar o botão e configurar o diálogo", () => {
    render(<ExcluirLoteModal uuid="uuid-lote-1" />);

    expect(mockUseExcluirLote).toHaveBeenCalledTimes(1);
    expect(mockUseExcluirLote).toHaveBeenCalledWith("uuid-lote-1");

    expect(
      screen.getByRole("button", { name: /excluir lote/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Excluir Lote?" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "A ação não poderá ser desfeita. Tem certeza que deseja continuar?",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Excluir lote", { selector: "span" }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("confirm-dialog")).toHaveAttribute(
      "data-open",
      "false",
    );

    expect(screen.getByTestId("confirm-dialog")).toHaveAttribute(
      "data-loading",
      "false",
    );
  });

  it("deve abrir e fechar o diálogo", async () => {
    const user = userEvent.setup();

    render(<ExcluirLoteModal uuid="uuid-lote-1" />);

    await user.click(screen.getByRole("button", { name: /excluir lote/i }));

    expect(screen.getByTestId("confirm-dialog")).toHaveAttribute(
      "data-open",
      "true",
    );

    await user.click(screen.getByRole("button", { name: "Fechar diálogo" }));

    expect(screen.getByTestId("confirm-dialog")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("deve repassar o estado de carregamento ao diálogo", () => {
    mockUseExcluirLote.mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: true,
    } as never);

    render(<ExcluirLoteModal uuid="uuid-lote-1" />);

    expect(screen.getByTestId("confirm-dialog")).toHaveAttribute(
      "data-loading",
      "true",
    );
  });

  it("deve excluir o lote, apresentar sucesso e redirecionar", async () => {
    const user = userEvent.setup();

    render(<ExcluirLoteModal uuid="uuid-lote-1" />);

    await user.click(
      screen.getByRole("button", { name: "Confirmar exclusão" }),
    );

    await waitFor(() => {
      expect(mocks.mutateAsync).toHaveBeenCalledTimes(1);
    });

    expect(mocks.toastSucesso).toHaveBeenCalledTimes(1);
    expect(mocks.toastSucesso).toHaveBeenCalledWith({
      titulo: "Sucesso!",
      descricao: "O lote foi excluído.",
    });

    expect(mocks.toastErro).not.toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith("/lotes");
  });

  it("deve apresentar a mensagem quando a exclusão lançar Error", async () => {
    const user = userEvent.setup();

    mocks.mutateAsync.mockRejectedValueOnce(
      new Error("O lote possui vínculos ativos."),
    );

    render(<ExcluirLoteModal uuid="uuid-lote-1" />);

    await user.click(
      screen.getByRole("button", { name: "Confirmar exclusão" }),
    );

    await waitFor(() => {
      expect(mocks.toastErro).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao: "O lote possui vínculos ativos.",
      });
    });

    expect(mocks.toastSucesso).not.toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith("/lotes");
  });

  it("deve apresentar a mensagem padrão quando o erro não for Error", async () => {
    const user = userEvent.setup();

    mocks.mutateAsync.mockRejectedValueOnce("erro desconhecido");

    render(<ExcluirLoteModal uuid="uuid-lote-1" />);

    await user.click(
      screen.getByRole("button", { name: "Confirmar exclusão" }),
    );

    await waitFor(() => {
      expect(mocks.toastErro).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao:
          "Não conseguimos excluir o serviço. Por favor, tente novamente.",
      });
    });

    expect(mocks.toastSucesso).not.toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith("/lotes");
  });
});
