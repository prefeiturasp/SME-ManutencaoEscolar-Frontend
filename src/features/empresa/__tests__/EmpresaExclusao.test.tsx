import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type EmpresaResultado =
  | { success: true; empresa: { uuid: string } }
  | {
      success: false;
      error: "api-error";
      title: string;
      message: string;
      status?: number;
    };

type MutationOptions = {
  onSuccess?: (resultado: EmpresaResultado) => void;
  onError?: (error: unknown) => void;
};

const {
  mutateExcluirMock,
  replaceMock,
  useDeleteEmpresaMock,
} = vi.hoisted(() => ({
  mutateExcluirMock: vi.fn(),
  replaceMock: vi.fn(),
  useDeleteEmpresaMock: vi.fn(),
}));

const { toastSucessoMock, toastErroMock } = vi.hoisted(() => ({
  toastSucessoMock: vi.fn(),
  toastErroMock: vi.fn(),
}));

const { obterMensagemErroMock } = vi.hoisted(() => ({
  obterMensagemErroMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/features/empresa/hooks/useDeleteEmpresa", () => ({
  useDeleteEmpresa: useDeleteEmpresaMock,
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastSucesso: toastSucessoMock,
  toastErro: toastErroMock,
}));

vi.mock("@/utils/erro", () => ({
  obterMensagemErro: obterMensagemErroMock,
}));

import { EmpresaExclusao } from "../components/form/EmpresaExclusao";

const UUID = "uuid-1";
const CNPJ = "12345678000199";

describe("EmpresaExclusao", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useDeleteEmpresaMock.mockReturnValue({
      isPending: false,
      mutate: mutateExcluirMock,
    });

    obterMensagemErroMock.mockReturnValue({
      titulo: "Erro",
      descricao: "Falha ao excluir empresa",
    });

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve renderizar apenas o botão de excluir, sem o modal aberto", () => {
    render(<EmpresaExclusao uuid={UUID} cnpj={CNPJ} />);

    expect(
      screen.getByRole("button", { name: /excluir empresa/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("deve abrir o modal de confirmação ao clicar em excluir empresa, sem chamar o serviço", async () => {
    const user = userEvent.setup();

    render(<EmpresaExclusao uuid={UUID} cnpj={CNPJ} />);

    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));

    expect(
      screen.getByRole("alertdialog", { name: /excluir empresa/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "A ação não poderá ser desfeita. Tem certeza que deseja continuar?",
      ),
    ).toBeInTheDocument();

    expect(mutateExcluirMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve fechar o modal ao clicar em cancelar", async () => {
    const user = userEvent.setup();

    render(<EmpresaExclusao uuid={UUID} cnpj={CNPJ} />);

    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));
    await user.click(screen.getByRole("button", { name: /^cancelar$/i }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(mutateExcluirMock).not.toHaveBeenCalled();
  });

  it("deve chamar o serviço de exclusão ao confirmar no modal", async () => {
    const user = userEvent.setup();

    render(<EmpresaExclusao uuid={UUID} cnpj={CNPJ} />);

    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));
    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));

    expect(mutateExcluirMock).toHaveBeenCalledTimes(1);
    expect(mutateExcluirMock).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("deve excluir a empresa com sucesso e redirecionar para a listagem", async () => {
    const user = userEvent.setup();

    mutateExcluirMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onSuccess?.({ success: true, empresa: { uuid: UUID } });
      },
    );

    render(<EmpresaExclusao uuid={UUID} cnpj={CNPJ} />);

    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));
    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));

    expect(toastSucessoMock).toHaveBeenCalledWith({
      titulo: "Sucesso",
      descricao: "A empresa com CNPJ 12.345.678/0001-99 foi excluída.",
    });

    expect(replaceMock).toHaveBeenCalledWith("/cadastro/empresas");
    expect(toastErroMock).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("deve tratar falha na exclusão retornada como resultado de erro da API", async () => {
    const user = userEvent.setup();

    mutateExcluirMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onSuccess?.({
          success: false,
          error: "api-error",
          title: "Não é possível excluir",
          message: "Empresa possui vínculos ativos.",
          status: 400,
        });
      },
    );

    render(<EmpresaExclusao uuid={UUID} cnpj={CNPJ} />);

    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));
    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Não é possível excluir",
      descricao:
        "Não conseguimos excluir a empresa. Por favor, tente novamente.",
    });

    expect(toastSucessoMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve tratar falha inesperada na exclusão recebendo Error", async () => {
    const user = userEvent.setup();
    const error = new Error("Erro de rede");

    mutateExcluirMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onError?.(error);
      },
    );

    render(<EmpresaExclusao uuid={UUID} cnpj={CNPJ} />);

    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));
    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));

    expect(obterMensagemErroMock).toHaveBeenCalledWith(error);

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao:
        "Não conseguimos excluir a empresa. Por favor, tente novamente.",
    });

    expect(console.error).toHaveBeenCalledWith(
      "Erro inesperado ao excluir empresa:",
      "Erro de rede",
    );

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve tratar falha inesperada na exclusão que não seja instância de Error", async () => {
    const user = userEvent.setup();
    const error = "Erro inesperado";

    mutateExcluirMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onError?.(error);
      },
    );

    render(<EmpresaExclusao uuid={UUID} cnpj={CNPJ} />);

    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));
    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));

    expect(obterMensagemErroMock).toHaveBeenCalledWith(error);

    expect(console.error).toHaveBeenCalledWith(
      "Erro inesperado ao excluir empresa:",
      "Erro inesperado",
    );

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve desabilitar o botão de fechar o modal enquanto a exclusão está pendente", async () => {
    const user = userEvent.setup();

    useDeleteEmpresaMock.mockReturnValue({
      isPending: true,
      mutate: mutateExcluirMock,
    });

    render(<EmpresaExclusao uuid={UUID} cnpj={CNPJ} />);

    await user.click(screen.getByRole("button", { name: /excluir empresa/i }));

    expect(screen.getByRole("button", { name: /fechar/i })).toBeDisabled();
  });
});
