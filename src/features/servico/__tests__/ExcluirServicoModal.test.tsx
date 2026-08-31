import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExcluirServicoModal } from "@/features/servico/components/Servico/ExcluirServicoModal";
const {
  mockMutateAsync,
  mockReplace,
  mockToastErro,
  mockToastSucesso,
  mockUseExcluirServico,
} = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockReplace: vi.fn(),
  mockToastErro: vi.fn(),
  mockToastSucesso: vi.fn(),
  mockUseExcluirServico: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastErro: mockToastErro,
  toastSucesso: mockToastSucesso,
}));

vi.mock("@/features/servico/hooks/useDeleteServico", () => ({
  useExcluirServico: mockUseExcluirServico,
}));

vi.mock("lucide-react", () => ({
  Trash2: () => <span data-testid="icone-lixeira" />,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant,
    size,
    ...props
  }: ComponentProps<"button"> & {
    children: ReactNode;
    variant?: string;
    size?: string;
  }) => {
    void variant;
    void size;

    return <button {...props}>{children}</button>;
  },
}));

type ConfirmDialogMockProps = {
  open: boolean;
  loading: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onOpenChange: (open: boolean) => void;
};

vi.mock("@/components/ui/confirmaDialogo", () => ({
  ConfirmDialog: ({
    open,
    loading,
    title,
    description,
    confirmLabel,
    onConfirm,
    onOpenChange,
  }: ConfirmDialogMockProps) => (
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
        Fechar modal
      </button>
    </div>
  ),
}));

describe("ExcluirServicoModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseExcluirServico.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it("renderiza o botão e as informações do modal", () => {
    render(<ExcluirServicoModal uuid="servico-123" />);

    expect(mockUseExcluirServico).toHaveBeenCalledWith("servico-123");

    expect(
      screen.getByRole("button", { name: /excluir serviço/i }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("icone-lixeira")).toBeInTheDocument();
    expect(screen.getByText("Excluir serviço?")).toBeInTheDocument();

    expect(
      screen.getByText(
        "A ação não poderá ser desfeita. Tem certeza que deseja continuar?",
      ),
    ).toBeInTheDocument();

    expect(screen.getByTestId("confirm-dialog")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("abre e fecha o modal de confirmação", () => {
    render(<ExcluirServicoModal uuid="servico-123" />);

    fireEvent.click(screen.getByRole("button", { name: /^excluir serviço$/i }));

    expect(screen.getByTestId("confirm-dialog")).toHaveAttribute(
      "data-open",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: /fechar modal/i }));

    expect(screen.getByTestId("confirm-dialog")).toHaveAttribute(
      "data-open",
      "false",
    );
  });

  it("envia o estado de carregamento para o modal", () => {
    mockUseExcluirServico.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    });

    render(<ExcluirServicoModal uuid="servico-123" />);

    expect(screen.getByTestId("confirm-dialog")).toHaveAttribute(
      "data-loading",
      "true",
    );
  });

  it("exclui o serviço, apresenta sucesso e redireciona", async () => {
    mockMutateAsync.mockResolvedValue(undefined);

    render(<ExcluirServicoModal uuid="servico-123" />);

    fireEvent.click(
      screen.getByRole("button", { name: /confirmar exclusão/i }),
    );

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledOnce();
    });

    expect(mockToastSucesso).toHaveBeenCalledWith({
      titulo: "Sucesso!",
      descricao: "O serviço foi excluído.",
    });

    expect(mockToastErro).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/servicos");
  });

  it("apresenta a mensagem recebida quando a exclusão lança Error", async () => {
    mockMutateAsync.mockRejectedValue(
      new Error("Não foi possível excluir este serviço."),
    );

    render(<ExcluirServicoModal uuid="servico-123" />);

    fireEvent.click(
      screen.getByRole("button", { name: /confirmar exclusão/i }),
    );

    await waitFor(() => {
      expect(mockToastErro).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao: "Não foi possível excluir este serviço.",
      });
    });

    expect(mockToastSucesso).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/servicos");
  });

  it("apresenta mensagem padrão quando o erro não é uma instância de Error", async () => {
    mockMutateAsync.mockRejectedValue("erro desconhecido");

    render(<ExcluirServicoModal uuid="servico-123" />);

    fireEvent.click(
      screen.getByRole("button", { name: /confirmar exclusão/i }),
    );

    await waitFor(() => {
      expect(mockToastErro).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao:
          "Não conseguimos excluir o serviço. Por favor, tente novamente.",
      });
    });

    expect(mockToastSucesso).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/servicos");
  });
});
