import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const VALID_FORM_VALUES = {
  nome: "Empresa Teste",
  cnpj: "12.345.678/0001-99",
  razao_social: "Empresa Teste LTDA",
  status: true,
  link_rastreio: "https://exemplo.com",
  cep: "01000-000",
  logradouro: "Rua Teste",
  numero: "123",
  complemento: "Sala 1",
  cidade: "São Paulo",
  estado: "SP",
};

const {
  mutateMock,
  pushMock,
  replaceMock,
  triggerMock,
  watchMock,
  getValuesMock,
  useCreateFornecedorMock,
} = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  triggerMock: vi.fn(),
  watchMock: vi.fn(() => []),
  getValuesMock: vi.fn(() => VALID_FORM_VALUES),
  useCreateFornecedorMock: vi.fn(() => ({
    isPending: false,
    mutate: vi.fn(),
  })),
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
    push: pushMock,
    replace: replaceMock,
  }),
}));

vi.mock("../hooks/useCreateFornecedor", () => ({
  useCreateFornecedor: useCreateFornecedorMock,
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastSucesso: toastSucessoMock,
  toastErro: toastErroMock,
}));

vi.mock("../../../utils/erro", () => ({
  obterMensagemErro: obterMensagemErroMock,
}));

vi.mock("../components/InformacoesGeraisStep", () => ({
  InformacoesGeraisStep: () => <div>Informações gerais</div>,
}));

vi.mock("../components/FornecedorStepper", () => ({
  FornecedorStepper: ({ currentStep }: { currentStep: number }) => (
    <div data-testid="stepper">Step {currentStep}</div>
  ),
}));

vi.mock("react-hook-form", async () => {
  const actual =
    await vi.importActual<typeof import("react-hook-form")>("react-hook-form");

  return {
    ...actual,
    useForm: () => ({
      watch: watchMock,
      getValues: getValuesMock,
      trigger: triggerMock,
      formState: { errors: {} },
      register: vi.fn(),
      control: {},
      setValue: vi.fn(),
      reset: vi.fn(),
      setError: vi.fn(),
      clearErrors: vi.fn(),
      handleSubmit: vi.fn(),
    }),
  };
});

import { useCreateFornecedor } from "../hooks/useCreateFornecedor";
import { FornecedorForm } from "../components/FornecedorForm";

describe("FornecedorForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    watchMock.mockReturnValue([]);
    getValuesMock.mockReturnValue(VALID_FORM_VALUES);
    triggerMock.mockResolvedValue(true);
    obterMensagemErroMock.mockReturnValue({
      titulo: "Erro",
      descricao: "Falha ao criar fornecedor",
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve renderizar o formulário com os botões principais", () => {
    render(<FornecedorForm />);

    expect(
      screen.getByRole("heading", { name: /cadastro de fornecedor/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancelar/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /cadastrar fornecedor/i }),
    ).toBeEnabled();
  });

  it("deve voltar para a listagem ao clicar em cancelar", async () => {
    const user = userEvent.setup();
    render(<FornecedorForm />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(pushMock).toHaveBeenCalledWith("/cadastro/fornecedores");
  });

  it("deve avançar para o próximo passo quando a validação passar", async () => {
    const user = userEvent.setup();
    render(<FornecedorForm />);

    await user.click(
      screen.getByRole("button", { name: /cadastrar fornecedor/i }),
    );

    expect(screen.getByTestId("stepper")).toHaveTextContent("Step 0");
  });

  it("deve voltar para o passo anterior quando já estiver no segundo passo", async () => {
    const user = userEvent.setup();
    render(<FornecedorForm />);

    await user.click(
      screen.getByRole("button", { name: /cadastrar fornecedor/i }),
    );
    await user.click(screen.getByRole("button", { name: /anterior/i }));

    expect(screen.getByTestId("stepper")).toHaveTextContent("Step 0");
  });

  it("deve desabilitar o botão quando há campos obrigatórios vazios", () => {
    watchMock.mockReturnValue(["", null]);

    render(<FornecedorForm />);

    expect(
      screen.getByRole("button", { name: /cadastrar fornecedor/i }),
    ).toBeDisabled();
  });

  it("deve desabilitar o botão quando a mutation está pendente", () => {
    useCreateFornecedorMock.mockReturnValue({
      isPending: true,
      mutate: mutateMock,
    } as never);

    render(<FornecedorForm />);

    expect(
      screen.getByRole("button", { name: /cadastrar fornecedor/i }),
    ).toBeDisabled();
  });

  it("deve cadastrar fornecedor com sucesso", async () => {
    const user = userEvent.setup();
    useCreateFornecedorMock.mockReturnValue({
      isPending: false,
      mutate: mutateMock,
    } as never);
    mutateMock.mockImplementation((_payload, options) =>
      options?.onSuccess?.(),
    );

    render(<FornecedorForm />);

    await user.click(
      screen.getByRole("button", { name: /cadastrar fornecedor/i }),
    );

    expect(mutateMock).toHaveBeenCalled();
    expect(toastSucessoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "Sucesso",
        descricao: "O fornecedor foi cadastrado.",
      }),
    );
    expect(replaceMock).toHaveBeenCalledWith("/cadastro/fornecedores");
  });

  it("deve exibir erro ao falhar no cadastro", async () => {
    const user = userEvent.setup();
    const error = new Error("Erro de rede");
    useCreateFornecedorMock.mockReturnValue({
      isPending: false,
      mutate: mutateMock,
    } as never);
    mutateMock.mockImplementation((_payload, options) =>
      options?.onError?.(error),
    );

    render(<FornecedorForm />);

    await user.click(
      screen.getByRole("button", { name: /cadastrar fornecedor/i }),
    );

    expect(toastErroMock).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "Erro",
        descricao: "Falha ao criar fornecedor",
      }),
    );
    expect(console.error).toHaveBeenCalled();
  });

  it("deve não cadastrar quando a validação falhar", async () => {
    const user = userEvent.setup();
    triggerMock.mockResolvedValue(false);

    render(<FornecedorForm />);

    await user.click(
      screen.getByRole("button", { name: /cadastrar fornecedor/i }),
    );

    expect(mutateMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
