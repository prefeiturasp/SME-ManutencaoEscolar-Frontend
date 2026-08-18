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

const EMPRESA = {
  id: 1,
  uuid: "uuid-1",
  nome: "Empresa Teste",
  cnpj: "12345678000199",
  status: true,
  razao_social: "Empresa Teste LTDA",
  link_rastreio: "https://exemplo.com",
  cep: "01000000",
  logradouro: "Rua Teste",
  numero: "123",
  complemento: "Sala 1",
  cidade: "São Paulo",
  estado: "SP",
  criado_por: "Usuário Teste",
  criado_em: "2026-01-01T10:00:00Z",
  atualizado_por: "Usuário Teste",
  atualizado_em: "2026-01-02T10:00:00Z",
};

type EmpresaResultado =
  | { success: true; empresa: typeof EMPRESA }
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
  mutateCriarMock,
  mutateAtualizarMock,
  pushMock,
  replaceMock,
  triggerMock,
  watchMock,
  getValuesMock,
  resetMock,
  useCreateEmpresaMock,
  useUpdateEmpresaMock,
  useEmpresaMock,
  useStateMock,
  setEtapaMock,
  anteriorOnClickMock,
} = vi.hoisted(() => ({
  mutateCriarMock: vi.fn(),
  mutateAtualizarMock: vi.fn(),
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  triggerMock: vi.fn(),
  watchMock: vi.fn(),
  getValuesMock: vi.fn(),
  resetMock: vi.fn(),
  useCreateEmpresaMock: vi.fn(),
  useUpdateEmpresaMock: vi.fn(),
  useEmpresaMock: vi.fn(),
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

vi.mock("../hooks/useUpdateEmpresa", () => ({
  useUpdateEmpresa: useUpdateEmpresaMock,
}));

vi.mock("../hooks/useEmpresa", () => ({
  useEmpresa: useEmpresaMock,
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

vi.mock("../components/form/EmpresaExclusao", () => ({
  EmpresaExclusao: () => (
    <div data-testid="empresa-exclusao">Excluir empresa</div>
  ),
}));

vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: ({ exibir }: { exibir?: boolean }) =>
    exibir ? <div data-testid="loading-global" /> : null,
}));

vi.mock("@/components/shared/ListaVazia/ListaVazia", () => ({
  ListaVazio: ({
    titulo,
    textoBotao,
    href,
  }: {
    titulo: string;
    textoBotao?: string;
    href?: string;
  }) => (
    <div data-testid="lista-vazia">
      <h2>{titulo}</h2>
      {textoBotao && href && <a href={href}>{textoBotao}</a>}
    </div>
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
      reset: resetMock,
      formState: {
        errors: {},
      },
      register: vi.fn(),
      control: {},
      setValue: vi.fn(),
      setError: vi.fn(),
      clearErrors: vi.fn(),
      handleSubmit: vi.fn(),
    }),
  };
});

import { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { EmpresaForm } from "../components/form/EmpresaForm";

describe("EmpresaForm - modo criação", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    watchMock.mockReturnValue(VALID_WATCH_VALUES);
    getValuesMock.mockReturnValue(VALID_FORM_VALUES);
    triggerMock.mockResolvedValue(true);

    useCreateEmpresaMock.mockReturnValue({
      isPending: false,
      mutate: mutateCriarMock,
    });

    useUpdateEmpresaMock.mockReturnValue({
      isPending: false,
      mutate: mutateAtualizarMock,
    });

    useEmpresaMock.mockReturnValue({
      data: undefined,
      isLoading: false,
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

    expect(screen.queryByTestId("empresa-exclusao")).not.toBeInTheDocument();

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
      mutate: mutateCriarMock,
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
    expect(mutateCriarMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve cadastrar a empresa com sucesso", async () => {
    const user = userEvent.setup();

    mutateCriarMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onSuccess?.({ success: true, empresa: EMPRESA });
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
    expect(mutateCriarMock).toHaveBeenCalledTimes(1);
    expect(mutateAtualizarMock).not.toHaveBeenCalled();

    expect(mutateCriarMock).toHaveBeenCalledWith(
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

    const payload = mutateCriarMock.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(payload.status).toBe(true);
    expect(payload.cnpj).toBe("12345678000199");
    expect(payload.cep).toBe("01000000");

    expect(toastSucessoMock).toHaveBeenCalledWith({
      titulo: "Sucesso",
      descricao: "A empresa com CNPJ 12.345.678/0001-99 foi cadastrada.",
    });

    expect(replaceMock).toHaveBeenCalledWith("/cadastro/empresas");
    expect(toastErroMock).not.toHaveBeenCalled();
  });

  it("deve tratar falha no cadastro retornada como resultado de erro da API", async () => {
    const user = userEvent.setup();

    mutateCriarMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onSuccess?.({
          success: false,
          error: "api-error",
          title: "Não é possível cadastrar",
          message: "CNPJ já cadastrado.",
          status: 400,
        });
      },
    );

    render(<EmpresaForm />);

    await user.click(
      screen.getByRole("button", {
        name: /cadastrar empresa/i,
      }),
    );

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Não é possível cadastrar",
      descricao: "CNPJ já cadastrado.",
    });

    expect(toastSucessoMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve tratar falha no cadastro recebendo Error", async () => {
    const user = userEvent.setup();
    const error = new Error("Erro de rede");

    mutateCriarMock.mockImplementation(
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

    mutateCriarMock.mockImplementation(
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
    expect(mutateCriarMock).not.toHaveBeenCalled();
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
    expect(mutateCriarMock).not.toHaveBeenCalled();
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

describe("EmpresaForm - modo edição", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    watchMock.mockReturnValue(VALID_WATCH_VALUES);
    getValuesMock.mockReturnValue(VALID_FORM_VALUES);
    triggerMock.mockResolvedValue(true);

    useCreateEmpresaMock.mockReturnValue({
      isPending: false,
      mutate: mutateCriarMock,
    });

    useUpdateEmpresaMock.mockReturnValue({
      isPending: false,
      mutate: mutateAtualizarMock,
    });

    useEmpresaMock.mockReturnValue({
      data: EMPRESA,
      isLoading: false,
    });

    obterMensagemErroMock.mockReturnValue({
      titulo: "Erro",
      descricao: "Falha ao atualizar empresa",
    });

    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("deve renderizar o formulário com os dados carregados", () => {
    render(<EmpresaForm uuid="uuid-1" />);

    expect(
      screen.getByRole("heading", { name: /edição de empresa/i }),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /cancelar/i })).toBeEnabled();

    expect(screen.getByTestId("empresa-exclusao")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();

    expect(
      screen.getByRole("button", { name: /salvar alterações/i }),
    ).toBeEnabled();

    expect(screen.getByTestId("informacoes-gerais")).toBeInTheDocument();

    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName.toLowerCase() === "p" &&
          element.textContent ===
            "Inserido por Usuário Teste em 01/01/2026 às 07:00",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName.toLowerCase() === "p" &&
          element.textContent ===
            "Alterado por Usuário Teste em 02/01/2026 às 07:00",
      ),
    ).toBeInTheDocument();
  });

  it("deve popular o formulário com os dados da empresa carregada", () => {
    render(<EmpresaForm uuid="uuid-1" />);

    expect(resetMock).toHaveBeenCalledWith({
      nome: "Empresa Teste",
      cnpj: "12345678000199",
      razao_social: "Empresa Teste LTDA",
      status: "true",
      link_rastreio: "https://exemplo.com",
      cep: "01000000",
      logradouro: "Rua Teste",
      numero: "123",
      complemento: "Sala 1",
      cidade: "São Paulo",
      estado: "SP",
    });
  });

  it("deve popular o formulário com valores padrão quando a empresa possuir campos opcionais ausentes", () => {
    useEmpresaMock.mockReturnValue({
      data: {
        ...EMPRESA,
        status: false,
        link_rastreio: undefined,
        complemento: undefined,
      },
      isLoading: false,
    });

    render(<EmpresaForm uuid="uuid-1" />);

    expect(resetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "false",
        link_rastreio: "",
        complemento: "",
      }),
    );
  });

  it("deve exibir 'Não informado' quando não houver autor de criação ou alteração", () => {
    useEmpresaMock.mockReturnValue({
      data: {
        ...EMPRESA,
        criado_por: undefined,
        atualizado_por: undefined,
      },
      isLoading: false,
    });

    render(<EmpresaForm uuid="uuid-1" />);

    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName.toLowerCase() === "p" &&
          element.textContent ===
            "Inserido por Não informado em 01/01/2026 às 07:00",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName.toLowerCase() === "p" &&
          element.textContent ===
            "Alterado por Não informado em 02/01/2026 às 07:00",
      ),
    ).toBeInTheDocument();
  });

  it("deve exibir carregamento e ocultar os campos enquanto busca a empresa", () => {
    useEmpresaMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<EmpresaForm uuid="uuid-1" />);

    expect(screen.queryByTestId("informacoes-gerais")).not.toBeInTheDocument();

    expect(screen.getByTestId("loading-global")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: /salvar alterações/i }),
    ).not.toBeInTheDocument();

    expect(resetMock).not.toHaveBeenCalled();
  });

  it("deve exibir o estado de não encontrado quando a busca retornar erro", () => {
    useEmpresaMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<EmpresaForm uuid="uuid-1" />);

    expect(screen.getByTestId("lista-vazia")).toBeInTheDocument();
    expect(
      screen.getByText("Não encontramos esta página"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /cadastro de empresas/i }),
    ).toHaveAttribute("href", "/cadastro/empresas");

    expect(
      screen.queryByTestId("informacoes-gerais"),
    ).not.toBeInTheDocument();
  });

  it("deve exibir o estado de não encontrado quando a empresa não existir", () => {
    useEmpresaMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    render(<EmpresaForm uuid="uuid-1" />);

    expect(screen.getByTestId("lista-vazia")).toBeInTheDocument();
  });

  it("deve voltar para a listagem ao clicar em cancelar", async () => {
    const user = userEvent.setup();

    render(<EmpresaForm uuid="uuid-1" />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/cadastro/empresas");
  });

  it("deve desabilitar quando um campo obrigatório está vazio", () => {
    watchMock.mockReturnValue([
      "",
      "12.345.678/0001-99",
      "Empresa Teste LTDA",
      "true",
    ]);

    render(<EmpresaForm uuid="uuid-1" />);

    expect(
      screen.getByRole("button", { name: /salvar alterações/i }),
    ).toBeDisabled();
  });

  it("deve desabilitar enquanto a atualização está pendente", () => {
    useUpdateEmpresaMock.mockReturnValue({
      isPending: true,
      mutate: mutateAtualizarMock,
    });

    render(<EmpresaForm uuid="uuid-1" />);

    expect(
      screen.getByRole("button", { name: /salvar alterações/i }),
    ).toBeDisabled();
  });

  it("não deve atualizar quando a validação falhar", async () => {
    const user = userEvent.setup();

    triggerMock.mockResolvedValue(false);

    render(<EmpresaForm uuid="uuid-1" />);

    await user.click(
      screen.getByRole("button", { name: /salvar alterações/i }),
    );

    expect(triggerMock).toHaveBeenCalledTimes(1);
    expect(getValuesMock).not.toHaveBeenCalled();
    expect(mutateAtualizarMock).not.toHaveBeenCalled();
  });

  it("deve atualizar a empresa com sucesso", async () => {
    const user = userEvent.setup();

    mutateAtualizarMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onSuccess?.({ success: true, empresa: EMPRESA });
      },
    );

    render(<EmpresaForm uuid="uuid-1" />);

    await user.click(
      screen.getByRole("button", { name: /salvar alterações/i }),
    );

    expect(triggerMock).toHaveBeenCalledTimes(1);
    expect(mutateAtualizarMock).toHaveBeenCalledTimes(1);
    expect(mutateCriarMock).not.toHaveBeenCalled();

    const payload = mutateAtualizarMock.mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(payload.status).toBe(true);
    expect(payload.cnpj).toBe("12345678000199");
    expect(payload.cep).toBe("01000000");

    expect(toastSucessoMock).toHaveBeenCalledWith({
      titulo: "Sucesso",
      descricao:
        "Alteração de empresa com CNPJ 12.345.678/0001-99 realizada com sucesso.",
    });

    expect(replaceMock).toHaveBeenCalledWith("/cadastro/empresas");
    expect(toastErroMock).not.toHaveBeenCalled();
  });

  it("deve tratar falha na atualização retornada como resultado de erro da API", async () => {
    const user = userEvent.setup();

    mutateAtualizarMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onSuccess?.({
          success: false,
          error: "api-error",
          title: "Não é possível atualizar",
          message: "CNPJ já cadastrado.",
          status: 400,
        });
      },
    );

    render(<EmpresaForm uuid="uuid-1" />);

    await user.click(
      screen.getByRole("button", { name: /salvar alterações/i }),
    );

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Não é possível atualizar",
      descricao: "CNPJ já cadastrado.",
    });

    expect(toastSucessoMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve tratar falha na atualização recebendo Error", async () => {
    const user = userEvent.setup();
    const error = new Error("Erro de rede");

    mutateAtualizarMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onError?.(error);
      },
    );

    render(<EmpresaForm uuid="uuid-1" />);

    await user.click(
      screen.getByRole("button", { name: /salvar alterações/i }),
    );

    expect(obterMensagemErroMock).toHaveBeenCalledWith(error);

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao: "Falha ao atualizar empresa",
    });

    expect(console.error).toHaveBeenCalledWith(
      "Erro inesperado ao atualizar empresa:",
      "Erro de rede",
    );

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("deve tratar falha que não seja instância de Error", async () => {
    const user = userEvent.setup();
    const error = "Erro inesperado";

    mutateAtualizarMock.mockImplementation(
      (_payload: unknown, options?: MutationOptions) => {
        options?.onError?.(error);
      },
    );

    render(<EmpresaForm uuid="uuid-1" />);

    await user.click(
      screen.getByRole("button", { name: /salvar alterações/i }),
    );

    expect(obterMensagemErroMock).toHaveBeenCalledWith(error);

    expect(console.error).toHaveBeenCalledWith(
      "Erro inesperado ao atualizar empresa:",
      "Erro inesperado",
    );

    expect(replaceMock).not.toHaveBeenCalled();
  });
});
