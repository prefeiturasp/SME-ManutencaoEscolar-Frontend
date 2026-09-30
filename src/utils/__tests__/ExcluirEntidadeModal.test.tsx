import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { toastErro, toastSucesso } from "@/components/ui/toast-custom";
import { ExcluirEntidadeModal } from "@/utils/ExcluirEntidadeModal";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("lucide-react", () => ({
  Trash2: () => <svg data-testid="trash-icon" />,
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
  }) =>
    open ? (
      <div role="dialog">
        <h2>{title}</h2>
        <p>{description}</p>
        <span>{loading ? "Carregando" : "Disponível"}</span>

        <button type="button" onClick={() => void onConfirm()}>
          {confirmLabel}
        </button>

        <button type="button" onClick={() => onOpenChange(false)}>
          Cancelar
        </button>
      </div>
    ) : null,
}));

const mockToastErro = vi.mocked(toastErro);
const mockToastSucesso = vi.mocked(toastSucesso);

describe("ExcluirEntidadeModal", () => {
  const onExcluir = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    onExcluir.mockReset();
  });

  function renderizar(loading = false, onErro?: (erro: unknown) => boolean): void {
    render(
      <ExcluirEntidadeModal
        titulo="Excluir lote?"
        textoBotao="Excluir lote"
        mensagemSucesso="O lote foi excluído."
        mensagemErro="Não conseguimos excluir o lote."
        rotaRetorno="/lotes"
        loading={loading}
        onExcluir={onExcluir}
        onErro={onErro}
      />,
    );
  }

  function abrirModal(): void {
    fireEvent.click(
      screen.getByRole("button", {
        name: "Excluir lote",
      }),
    );
  }

  function confirmarExclusao(): void {
    const modal = screen.getByRole("dialog");

    fireEvent.click(
      within(modal).getByRole("button", {
        name: "Excluir lote",
      }),
    );
  }

  it("deve renderizar o botão de exclusão", () => {
    renderizar();

    expect(
      screen.getByRole("button", {
        name: "Excluir lote",
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("trash-icon")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("deve abrir o modal de confirmação", () => {
    renderizar();
    abrirModal();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Excluir lote?")).toBeInTheDocument();

    expect(
      screen.getByText("A ação não poderá ser desfeita. Tem certeza que deseja continuar?"),
    ).toBeInTheDocument();

    expect(screen.getByText("Disponível")).toBeInTheDocument();
  });

  it("deve fechar o modal de confirmação", () => {
    renderizar();
    abrirModal();

    const modal = screen.getByRole("dialog");

    fireEvent.click(
      within(modal).getByRole("button", {
        name: "Cancelar",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onExcluir).not.toHaveBeenCalled();
  });

  it("deve informar quando estiver carregando", () => {
    renderizar(true);
    abrirModal();

    expect(screen.getByText("Carregando")).toBeInTheDocument();
  });

  it("deve excluir, mostrar sucesso e redirecionar", async () => {
    onExcluir.mockResolvedValueOnce(undefined);

    renderizar();
    abrirModal();
    confirmarExclusao();

    await waitFor(() => {
      expect(onExcluir).toHaveBeenCalledTimes(1);
      expect(mockToastSucesso).toHaveBeenCalledWith({
        titulo: "Sucesso!",
        descricao: "O lote foi excluído.",
      });
      expect(mocks.replace).toHaveBeenCalledWith("/lotes");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(mockToastErro).not.toHaveBeenCalled();
  });

  it("deve mostrar a mensagem padrão quando a exclusão lançar Error", async () => {
    onExcluir.mockRejectedValueOnce(new Error("O lote possui vínculos."));

    renderizar();
    abrirModal();
    confirmarExclusao();

    await waitFor(() => {
      expect(onExcluir).toHaveBeenCalledTimes(1);
      expect(mockToastErro).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao: "Não conseguimos excluir o lote.",
      });
    });

    expect(mockToastSucesso).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("deve mostrar a mensagem padrão para erro desconhecido", async () => {
    onExcluir.mockRejectedValueOnce("erro desconhecido");

    renderizar();
    abrirModal();
    confirmarExclusao();

    await waitFor(() => {
      expect(mockToastErro).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao: "Não conseguimos excluir o lote.",
      });
    });

    expect(mockToastSucesso).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("deve delegar um erro 400 retornado para onErro", async () => {
    const resultado = {
      success: false,
      status: 400,
      title: "Não é possível excluir o lote",
    };
    const onErro = vi.fn().mockReturnValue(true);

    onExcluir.mockResolvedValueOnce(resultado);

    renderizar(false, onErro);
    abrirModal();
    confirmarExclusao();

    await waitFor(() => {
      expect(onErro).toHaveBeenCalledExactlyOnceWith(resultado);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(mockToastErro).not.toHaveBeenCalled();
    expect(mockToastSucesso).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("deve delegar um erro 400 lançado para onErro", async () => {
    const erro = {
      success: false,
      status: 400,
      title: "Não é possível excluir o lote",
    };
    const onErro = vi.fn().mockReturnValue(true);

    onExcluir.mockRejectedValueOnce(erro);

    renderizar(false, onErro);
    abrirModal();
    confirmarExclusao();

    await waitFor(() => {
      expect(onErro).toHaveBeenCalledExactlyOnceWith(erro);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(mockToastErro).not.toHaveBeenCalled();
    expect(mockToastSucesso).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("deve mostrar toast quando onErro não tratar o erro", async () => {
    const erro = { status: 500 };
    const onErro = vi.fn().mockReturnValue(false);

    onExcluir.mockRejectedValueOnce(erro);

    renderizar(false, onErro);
    abrirModal();
    confirmarExclusao();

    await waitFor(() => {
      expect(onErro).toHaveBeenCalledExactlyOnceWith(erro);
      expect(mockToastErro).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao: "Não conseguimos excluir o lote.",
      });
    });

    expect(mockToastSucesso).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("deve mostrar toast para status 500 retornado pela exclusão", async () => {
    const resultado = { success: false, status: 500 };

    onExcluir.mockResolvedValueOnce(resultado);

    renderizar();
    abrirModal();
    confirmarExclusao();

    await waitFor(() => {
      expect(mockToastErro).toHaveBeenCalledWith({
        titulo: "Erro",
        descricao: "Não conseguimos excluir o lote.",
      });
    });

    expect(mockToastSucesso).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("trata como sucesso uma resposta sem status HTTP", async () => {
    const resultado = { success: true };
    const onErro = vi.fn();

    onExcluir.mockResolvedValueOnce(resultado);

    renderizar(false, onErro);
    abrirModal();
    confirmarExclusao();

    await waitFor(() => {
      expect(mockToastSucesso).toHaveBeenCalledWith({
        titulo: "Sucesso!",
        descricao: "O lote foi excluído.",
      });
      expect(mocks.replace).toHaveBeenCalledWith("/lotes");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(onErro).not.toHaveBeenCalled();
    expect(mockToastErro).not.toHaveBeenCalled();
  });
});
