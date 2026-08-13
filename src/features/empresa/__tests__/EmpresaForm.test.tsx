import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
interface ButtonMockProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  children?: ReactNode;
}

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    variant: _variant,
    ...props
  }: ButtonMockProps) => {
    if (children === "Anterior") {
      anteriorOnClickMock.mockImplementation(() => {
        onClick?.({} as Parameters<MouseEventHandler<HTMLButtonElement>>[0]);
      });
    }

    return (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    );
  },
}));
const VALID_FORM_VALUES = {
  nome: "Empresa Teste",
  cnpj: "12.345.678/0001-99",
  razao_social: "Empresa Teste LTDA",
  status: "true",
  link_rastreio: "https://exemplo.com",
  cep: "01000-000",
  logradouro: "Rua Teste",
  numero: "123",
  complemento: "Sala 1",
  cidade: "São Paulo",
  estado: "SP",
};

const VALID_WATCH_VALUES = [
  "Empresa Teste",
  "12.345.678/0001-99",
  "Empresa Teste LTDA",
  "true",
  "01000-000",
  "Rua Teste",
  "123",
  "São Paulo",
  "SP",
];

type MutationOptions = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

const {
  mutateMock,
  pushMock,
  replaceMock,
  triggerMock,
  watchMock,
  getValuesMock,
  useCreateEmpresaMock,
  useStateMock,
  setEtapaMock,
  anteriorOnClickMock,
} = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  triggerMock: vi.fn(),
  watchMock: vi.fn(),
  getValuesMock: vi.fn(),
  useCreateEmpresaMock: vi.fn(),
  useStateMock: vi.fn(),
  setEtapaMock: vi.fn(),
  anteriorOnClickMock: vi.fn(),
}));

const { toastSucessoMock, toastErroMock } = vi.hoisted(() => ({
  toastSucessoMock: vi.fn(),
  toastErroMock: vi.fn(),
}));

const { obterMensagemErroMock } = vi.hoisted(() => ({
  obterMensagemErroMock: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  useStateMock.mockImplementation((initialValue: unknown) =>
    actual.useState(initialValue),
  );

  return {
    ...actual,
    useState: useStateMock,
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
}));

vi.mock("../hooks/useCreateEmpresa", () => ({
  useCreateEmpresa: useCreateEmpresaMock,
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastSucesso: toastSucessoMock,
  toastErro: toastErroMock,
}));

vi.mock("../../../utils/erro", () => ({
  obterMensagemErro: obterMensagemErroMock,
}));

vi.mock("../components/form/InformacoesGeraisStep", () => ({
  InformacoesGeraisStep: () => (
    <div data-testid="informacoes-gerais">Informações gerais</div>
  ),
}));

vi.mock("../components/form/EmpresaStepper", () => ({
  EmpresaStepper: ({ currentStep }: { currentStep: number }) => (
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
      formState: {
        errors: {},
      },
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

import { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { EmpresaForm } from "../components/form/EmpresaForm";

describe("EmpresaForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    watchMock.mockReturnValue(VALID_WATCH_VALUES);
    getValuesMock.mockReturnValue(VALID_FORM_VALUES);
    triggerMock.mockResolvedValue(true);

    useCreateEmpresaMock.mockReturnValue({
      isPending: false,
      mutate: mutateMock,
    });

    setEtapaMock.mockImplementation(
      (atualizador: number | ((atual: number) => number)) => {
        if (typeof atualizador === "function") {
          return atualizador(1);
        }

        return atualizador;
      },
    );

    obterMensagemErroMock.mockReturnValue({
      titulo: "Erro",
      descricao: "Falha ao criar empresa",
    });

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("deve renderizar o formulário na etapa inicial", () => {
    render(<EmpresaForm />);

    expect(
      screen.getByRole("heading", {
        name: /cadastro de empresa/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /cancelar/i,
      }),
    ).toBeEnabled();

    expect(
      screen.getByRole("button", {
        name: /anterior/i,
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: /cadastrar empresa/i,
      }),
    ).toBeEnabled();

    expect(screen.getByTestId("stepper")).toHaveTextContent("Step 0");

    expect(screen.getByTestId("informacoes-gerais")).toBeInTheDocument();
  });

  it("deve voltar para a listagem ao clicar em cancelar", async () => {
    const user = userEvent.setup();

    render(<EmpresaForm />);

    await user.click(
      screen.getByRole("button", {
        name: /cancelar/i,
      }),
    );

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/cadastro/empresas");
  });

  it("deve desabilitar quando um campo string está vazio", () => {
    watchMock.mockReturnValue([
      "",
      "12.345.678/0001-99",
      "Empresa Teste LTDA",
      true,
    ]);

    render(<EmpresaForm />);

    expect(
      screen.getByRole("button", {
        name: /cadastrar empresa/i,
      }),
    ).toBeDisabled();
  });

  it("deve desabilitar quando um campo possui somente espaços", () => {
    watchMock.mockReturnValue([
      "   ",
      "12.345.678/0001-99",
      "Empresa Teste LTDA",
      true,
    ]);

    render(<EmpresaForm />);

    expect(
      screen.getByRole("button", {
        name: /cadastrar empresa/i,
      }),
    ).toBeDisabled();
  });

  it("deve desabilitar quando um campo obrigatório é null", () => {
    watchMock.mockReturnValue([
      "Empresa Teste",
      "12.345.678/0001-99",
      "Empresa Teste LTDA",
      null,
    ]);

    render(<EmpresaForm />);

    expect(
      screen.getByRole("button", {
        name: /cadastrar empresa/i,
      }),
    ).toBeDisabled();
  });

  it("deve desabilitar quando um campo obrigatório é undefined", () => {
    watchMock.mockReturnValue([
      "Empresa Teste",
      "12.345.678/0001-99",
      "Empresa Teste LTDA",
      undefined,
    ]);

    render(<EmpresaForm />);

    expect(
      screen.getByRole("button", {
        name: /cadastrar empresa/i,
      }),
    ).toBeDisabled();
  });

  it("deve manter habilitado quando os campos obrigatórios estão preenchidos", () => {
    watchMock.mockReturnValue([
      "Empresa Teste",
      "12.345.678/0001-99",
      "Empresa Teste LTDA",
      "true",
      "01000-000",
      "Rua Teste",
      "123",
      "São Paulo",
      "SP",
    ]);

    render(<EmpresaForm />);

    expect(
      screen.getByRole("button", {
        name: /cadastrar empresa/i,
      }),
    ).toBeEnabled();
  });

  it("deve desabilitar enquanto a criação está pendente", () => {
    useCreateEmpresaMock.mockReturnValue({
      isPending: true,
      mutate: mutateMock,
    });

    render(<EmpresaForm />);

    expect(
      screen.getByRole("button", {
        name: /cadastrar empresa/i,
      }),
    ).toBeDisabled();
  });

  it("não deve cadastrar quando a validação final falhar", async () => {
    const user = userEvent.setup();

    triggerMock.mockResolvedValue(false);

    render(<EmpresaForm />);

    await user.click(
      screen.getByRole("button", {
        name: /cadastrar empresa/i,
      }),
    );

    expect(triggerMock).toHaveBeenCalledTimes(1);
    expect(getValuesMock).not.toHaveBeenCalled();
    expect(mutateMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve cadastrar a empresa com sucesso", async () => {
    const user = userEvent.setup();

    mutateMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onSuccess?.();
      },
    );

    render(<EmpresaForm />);

    await user.click(
      screen.getByRole("button", {
        name: /cadastrar empresa/i,
      }),
    );

    expect(triggerMock).toHaveBeenCalledTimes(1);
    expect(getValuesMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledTimes(1);

    expect(mutateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: "Empresa Teste",
        razao_social: "Empresa Teste LTDA",
        logradouro: "Rua Teste",
        numero: "123",
        cidade: "São Paulo",
        estado: "SP",
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );

    const payload = mutateMock.mock.calls[0][0] as Record<string, unknown>;
    expect(payload.status).toBe(true);
    expect(payload.cnpj).toBe("12345678000199");
    expect(payload.cep).toBe("01000000");

    expect(toastSucessoMock).toHaveBeenCalledWith({
      titulo: "Sucesso!",
      descricao: "A empresa foi cadastrada.",
    });

    expect(replaceMock).toHaveBeenCalledWith("/cadastro/empresas");
    expect(toastErroMock).not.toHaveBeenCalled();
  });

  it("deve tratar falha no cadastro recebendo Error", async () => {
    const user = userEvent.setup();
    const error = new Error("Erro de rede");

    mutateMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onError?.(error);
      },
    );

    render(<EmpresaForm />);

    await user.click(
      screen.getByRole("button", {
        name: /cadastrar empresa/i,
      }),
    );

    expect(obterMensagemErroMock).toHaveBeenCalledWith(error);

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao: "Falha ao criar empresa",
    });

    expect(console.error).toHaveBeenCalledWith(
      "Erro inesperado ao cadastrar empresa:",
      "Erro de rede",
    );

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve tratar falha que não seja instância de Error", async () => {
    const user = userEvent.setup();
    const error = "Erro inesperado";

    mutateMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onError?.(error);
      },
    );

    render(<EmpresaForm />);

    await user.click(
      screen.getByRole("button", {
        name: /cadastrar empresa/i,
      }),
    );

    expect(obterMensagemErroMock).toHaveBeenCalledWith(error);

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao: "Falha ao criar empresa",
    });

    expect(console.error).toHaveBeenCalledWith(
      "Erro inesperado ao cadastrar empresa:",
      "Erro inesperado",
    );

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve renderizar uma etapa intermediária", () => {
    useStateMock.mockImplementationOnce(() => [1, setEtapaMock]);

    render(<EmpresaForm />);

    expect(screen.getByTestId("stepper")).toHaveTextContent("Step 1");

    expect(
      screen.getByRole("button", {
        name: /anterior/i,
      }),
    ).toBeEnabled();

    expect(
      screen.getByRole("button", {
        name: /próximo/i,
      }),
    ).toBeEnabled();

    expect(screen.queryByTestId("informacoes-gerais")).not.toBeInTheDocument();
  });

  it("deve avançar quando a validação intermediária passar", async () => {
    const user = userEvent.setup();

    useStateMock.mockImplementationOnce(() => [1, setEtapaMock]);
    triggerMock.mockResolvedValue(true);

    render(<EmpresaForm />);

    await user.click(
      screen.getByRole("button", {
        name: /próximo/i,
      }),
    );

    /*
     * O índice 1 não existe em STEP_FIELDS atualmente.
     * Por isso, o argumento recebido é undefined.
     */
    expect(triggerMock).toHaveBeenCalledWith(undefined);
    expect(setEtapaMock).toHaveBeenCalledTimes(1);

    expect(setEtapaMock.mock.results[0].value).toBe(2);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("não deve avançar quando a validação intermediária falhar", async () => {
    const user = userEvent.setup();

    useStateMock.mockImplementationOnce(() => [1, setEtapaMock]);
    triggerMock.mockResolvedValue(false);

    render(<EmpresaForm />);

    await user.click(
      screen.getByRole("button", {
        name: /próximo/i,
      }),
    );

    expect(triggerMock).toHaveBeenCalledWith(undefined);
    expect(setEtapaMock).not.toHaveBeenCalled();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it("deve voltar para a etapa anterior", async () => {
    const user = userEvent.setup();

    useStateMock.mockImplementationOnce(() => [1, setEtapaMock]);

    render(<EmpresaForm />);

    await user.click(
      screen.getByRole("button", {
        name: /anterior/i,
      }),
    );

    expect(setEtapaMock).toHaveBeenCalledTimes(1);
    expect(setEtapaMock.mock.results[0].value).toBe(0);
  });

  it("deve voltar para a listagem ao executar anterior na etapa inicial", () => {
    render(<EmpresaForm />);

    anteriorOnClickMock();

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/cadastro/empresas");
    expect(setEtapaMock).not.toHaveBeenCalled();
  });
});
