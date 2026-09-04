import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
interface ButtonMockProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  children?: ReactNode;
}

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, variant, ...props }: ButtonMockProps) => {
    void variant;

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

const VALID_RESPONSAVEL_TECNICO = {
  tipo: "engenheiro_civil",
  nome: "Responsável Teste",
  telefone: "11987654321",
  email: "responsavel@example.com",
  numero_crea: "1234567890/A",
  numero_art: "2026/000000-0",
  anexos: [
    new File(["conteudo"], "documento.pdf", { type: "application/pdf" }),
  ],
};

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
  responsaveis_tecnicos: [VALID_RESPONSAVEL_TECNICO],
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

const VALID_WATCH_RESPONSAVEIS_TECNICOS = [
  {
    tipo: "engenheiro_civil",
    nome: "Responsável Teste",
    telefone: "11987654321",
    email: "responsavel@example.com",
    numero_crea: "1234567890/A",
    numero_art: "2026/000000-0",
    anexos: VALID_RESPONSAVEL_TECNICO.anexos,
  },
];

const RESPONSAVEL_TECNICO_BACKEND = {
  tipo: "engenheiro_civil",
  nome: "Responsável Teste",
  telefone: "11987654321",
  email: "responsavel@example.com",
  numero_crea: "1234567890/A",
  numero_art: "2026/000000-0",
  criado_por: "Usuário Teste",
  criado_em: "2026-01-01T10:00:00Z",
  atualizado_por: "Usuário Teste",
  atualizado_em: "2026-01-02T10:00:00Z",
};

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
  responsaveis_tecnicos: [RESPONSAVEL_TECNICO_BACKEND],
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

type MutationOptions<TResultado> = {
  onSuccess?: (resultado: TResultado) => void;
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

vi.mock("../components/form/ResponsavelTecnicoStep", () => ({
  ResponsavelTecnicoStep: ({
    modoEdicao,
    ultimoAlterado,
  }: {
    modoEdicao?: boolean;
    ultimoAlterado?: { criado_por?: string; atualizado_por?: string } | null;
  }) => (
    <div data-testid="responsavel-tecnico">
      Responsável técnico
      <span data-testid="responsavel-tecnico-modo-edicao">
        {String(Boolean(modoEdicao))}
      </span>
      <span data-testid="responsavel-tecnico-ultimo-alterado">
        {ultimoAlterado
          ? `${ultimoAlterado.criado_por ?? "-"}|${ultimoAlterado.atualizado_por ?? "-"}`
          : "nenhum"}
      </span>
    </div>
  ),
}));

vi.mock("../components/form/EmpresaStepper", () => ({
  EmpresaStepper: ({ currentStep }: { currentStep: number }) => (
    <div data-testid="stepper">Step {currentStep}</div>
  ),
}));

vi.mock("../components/form/EmpresaExclusao", () => ({
  EmpresaExclusao: ({ cnpj }: { cnpj: string }) => (
    <div data-testid="empresa-exclusao" data-cnpj={cnpj}>
      Excluir empresa
    </div>
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
    useWatch: ({ name }: { name: unknown }) => watchMock(name),
    useForm: () => ({
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

function configurarWatch({
  empresa = VALID_WATCH_VALUES,
  responsaveisTecnicos = VALID_WATCH_RESPONSAVEIS_TECNICOS,
}: {
  empresa?: unknown[];
  responsaveisTecnicos?: unknown[];
} = {}) {
  watchMock.mockImplementation((campos: unknown) => {
    if (campos === "responsaveis_tecnicos") return responsaveisTecnicos;
    return empresa;
  });
}

function renderNaUltimaEtapa() {
  useStateMock.mockImplementationOnce(() => [1, setEtapaMock]);
}

describe("EmpresaForm - modo criação", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    configurarWatch();
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
        name: /^próximo$/i,
      }),
    ).toBeEnabled();

    expect(screen.getByTestId("stepper")).toHaveTextContent("Step 0");

    expect(screen.getByTestId("informacoes-gerais")).toBeInTheDocument();
    expect(screen.queryByTestId("responsavel-tecnico")).not.toBeInTheDocument();
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
    expect(pushMock).toHaveBeenCalledWith("/empresas");
  });

  it("deve desabilitar enquanto a criação está pendente", () => {
    useCreateEmpresaMock.mockReturnValue({
      isPending: true,
      mutate: mutateCriarMock,
    });

    render(<EmpresaForm />);

    expect(
      screen.getByRole("button", {
        name: /^próximo$/i,
      }),
    ).toBeDisabled();
  });

  describe("na última etapa (responsável técnico)", () => {
    beforeEach(() => {
      renderNaUltimaEtapa();
    });

    it("deve exibir a etapa de responsável técnico", () => {
      render(<EmpresaForm />);

      expect(screen.getByTestId("stepper")).toHaveTextContent("Step 1");
      expect(screen.getByTestId("responsavel-tecnico")).toBeInTheDocument();
      expect(
        screen.queryByTestId("informacoes-gerais"),
      ).not.toBeInTheDocument();

      expect(screen.getByRole("button", { name: /anterior/i })).toBeEnabled();
      expect(
        screen.getByRole("button", { name: /cadastrar empresa/i }),
      ).toBeEnabled();
    });

    it("deve desabilitar quando um campo obrigatório da empresa está vazio", () => {
      configurarWatch({ empresa: ["", ...VALID_WATCH_VALUES.slice(1)] });

      render(<EmpresaForm />);

      expect(
        screen.getByRole("button", { name: /cadastrar empresa/i }),
      ).toBeDisabled();
    });

    it("deve desabilitar quando não há responsável técnico", () => {
      configurarWatch({ responsaveisTecnicos: [] });

      render(<EmpresaForm />);

      expect(
        screen.getByRole("button", { name: /cadastrar empresa/i }),
      ).toBeDisabled();
    });

    it("deve desabilitar quando o responsável técnico está incompleto", () => {
      configurarWatch({
        responsaveisTecnicos: [{ tipo: "", nome: "", email: "" }],
      });

      render(<EmpresaForm />);

      expect(
        screen.getByRole("button", { name: /cadastrar empresa/i }),
      ).toBeDisabled();
    });

    it("deve desabilitar quando o engenheiro não possui anexos", () => {
      configurarWatch({
        responsaveisTecnicos: [
          { ...VALID_RESPONSAVEL_TECNICO, anexos: [] },
        ],
      });

      render(<EmpresaForm />);

      expect(
        screen.getByRole("button", { name: /cadastrar empresa/i }),
      ).toBeDisabled();
    });

    it("deve desabilitar quando um campo obrigatório não vazio não é string", () => {
      configurarWatch({
        empresa: [
          ...VALID_WATCH_VALUES.slice(0, 3),
          undefined,
          ...VALID_WATCH_VALUES.slice(4),
        ],
      });

      render(<EmpresaForm />);

      expect(
        screen.getByRole("button", { name: /cadastrar empresa/i }),
      ).toBeDisabled();
    });

    it("deve manter habilitado quando os campos obrigatórios estão preenchidos", () => {
      render(<EmpresaForm />);

      expect(
        screen.getByRole("button", { name: /cadastrar empresa/i }),
      ).toBeEnabled();
    });

    it("deve manter habilitado quando o responsável técnico não é engenheiro e possui os campos obrigatórios preenchidos", () => {
      configurarWatch({
        responsaveisTecnicos: [
          {
            tipo: "preposto",
            nome: "Responsável Teste",
            telefone: "11987654321",
            email: "responsavel@example.com",
          },
        ],
      });

      render(<EmpresaForm />);

      expect(
        screen.getByRole("button", { name: /cadastrar empresa/i }),
      ).toBeEnabled();
    });

    it("deve tratar responsaveis_tecnicos indefinido do watch como lista vazia", () => {
      watchMock.mockImplementation((campos: unknown) => {
        if (campos === "responsaveis_tecnicos") return undefined;
        return VALID_WATCH_VALUES;
      });

      render(<EmpresaForm />);

      expect(
        screen.getByRole("button", { name: /cadastrar empresa/i }),
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

    it("deve cadastrar a empresa e os responsáveis técnicos em uma única requisição", async () => {
      const user = userEvent.setup();

      mutateCriarMock.mockImplementation(
        (_payload: unknown, options?: MutationOptions<EmpresaResultado>) => {
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

      const payloadEmpresa = mutateCriarMock.mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(payloadEmpresa.status).toBe(true);
      expect(payloadEmpresa.cnpj).toBe("12345678000199");
      expect(payloadEmpresa.cep).toBe("01000000");
      expect(payloadEmpresa.responsaveis_tecnicos).toEqual([
        {
          tipo: "engenheiro_civil",
          nome: "Responsável Teste",
          telefone: "11987654321",
          email: "responsavel@example.com",
          numero_crea: "1234567890/A",
          numero_art: "2026/000000-0",
          anexos: VALID_RESPONSAVEL_TECNICO.anexos,
        },
      ]);

      expect(toastSucessoMock).toHaveBeenCalledWith({
        titulo: "Sucesso",
        descricao: "A empresa com CNPJ 12.345.678/0001-99 foi cadastrada.",
      });

      expect(replaceMock).toHaveBeenCalledWith("/empresas");
      expect(toastErroMock).not.toHaveBeenCalled();
    });

    it("deve enviar múltiplos responsáveis técnicos no mesmo payload da empresa", async () => {
      const user = userEvent.setup();

      const segundoResponsavel = {
        tipo: "preposto",
        nome: "Segundo Responsável",
        telefone: "11987654321",
        email: "segundo@example.com",
        numero_crea: "",
        numero_art: "",
        anexos: [],
      };

      getValuesMock.mockReturnValue({
        ...VALID_FORM_VALUES,
        responsaveis_tecnicos: [VALID_RESPONSAVEL_TECNICO, segundoResponsavel],
      });

      mutateCriarMock.mockImplementation(
        (_payload: unknown, options?: MutationOptions<EmpresaResultado>) => {
          options?.onSuccess?.({ success: true, empresa: EMPRESA });
        },
      );

      render(<EmpresaForm />);

      await user.click(
        screen.getByRole("button", { name: /cadastrar empresa/i }),
      );

      const payloadEmpresa = mutateCriarMock.mock.calls[0][0] as Record<
        string,
        unknown
      >;
      const responsaveisEnviados =
        payloadEmpresa.responsaveis_tecnicos as Array<Record<string, unknown>>;

      expect(responsaveisEnviados).toHaveLength(2);
      expect(responsaveisEnviados[0]).toMatchObject({
        tipo: "engenheiro_civil",
      });
      expect(responsaveisEnviados[1]).toMatchObject({ tipo: "preposto" });
      expect(responsaveisEnviados[0].anexos).toEqual(
        VALID_RESPONSAVEL_TECNICO.anexos,
      );
      expect(responsaveisEnviados[1].anexos).toEqual([]);

      expect(toastSucessoMock).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledWith("/empresas");
    });

    it("deve tratar falha no cadastro da empresa retornada como resultado de erro da API", async () => {
      const user = userEvent.setup();

      mutateCriarMock.mockImplementation(
        (_payload: unknown, options?: MutationOptions<EmpresaResultado>) => {
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

    it("deve tratar falha no cadastro da empresa recebendo Error", async () => {
      const user = userEvent.setup();
      const error = new Error("Erro de rede");

      mutateCriarMock.mockImplementation(
        (_payload: unknown, options?: MutationOptions<EmpresaResultado>) => {
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

    it("deve tratar falha no cadastro da empresa que não seja instância de Error", async () => {
      const user = userEvent.setup();
      const error = "Erro inesperado";

      mutateCriarMock.mockImplementation(
        (_payload: unknown, options?: MutationOptions<EmpresaResultado>) => {
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

      expect(console.error).toHaveBeenCalledWith(
        "Erro inesperado ao cadastrar empresa:",
        "Erro inesperado",
      );

      expect(replaceMock).not.toHaveBeenCalled();
    });

    it("deve voltar para a etapa anterior", async () => {
      const user = userEvent.setup();

      render(<EmpresaForm />);

      await user.click(
        screen.getByRole("button", {
          name: /anterior/i,
        }),
      );

      expect(setEtapaMock).toHaveBeenCalledTimes(1);
      expect(setEtapaMock.mock.results[0].value).toBe(0);
    });
  });

  it("deve avançar para a etapa de responsável técnico quando a validação da primeira etapa passar", async () => {
    const user = userEvent.setup();

    triggerMock.mockResolvedValue(true);
    useStateMock.mockImplementationOnce(() => [0, setEtapaMock]);

    render(<EmpresaForm />);

    await user.click(
      screen.getByRole("button", {
        name: /^próximo$/i,
      }),
    );

    expect(triggerMock).toHaveBeenCalledWith([
      "link_rastreio",
      "complemento",
      "nome",
      "cnpj",
      "razao_social",
      "status",
      "cep",
      "logradouro",
      "numero",
      "cidade",
      "estado",
    ]);
    expect(setEtapaMock).toHaveBeenCalledTimes(1);

    const atualizador = setEtapaMock.mock.calls[0][0] as (
      atual: number,
    ) => number;
    expect(atualizador(0)).toBe(1);

    expect(mutateCriarMock).not.toHaveBeenCalled();
  });

  it("não deve avançar quando a validação da primeira etapa falhar", async () => {
    const user = userEvent.setup();

    triggerMock.mockResolvedValue(false);

    render(<EmpresaForm />);

    await user.click(
      screen.getByRole("button", {
        name: /^próximo$/i,
      }),
    );

    expect(setEtapaMock).not.toHaveBeenCalled();
    expect(mutateCriarMock).not.toHaveBeenCalled();
  });

  it("deve voltar para a listagem ao executar anterior na etapa inicial", () => {
    render(<EmpresaForm />);

    anteriorOnClickMock();

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/empresas");
    expect(setEtapaMock).not.toHaveBeenCalled();
  });
});

describe("EmpresaForm - modo edição", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    configurarWatch();
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

    expect(screen.getByRole("button", { name: /^próximo$/i })).toBeEnabled();

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

    expect(resetMock).toHaveBeenCalledWith(
      expect.objectContaining({
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
        responsaveis_tecnicos: [
          {
            tipo: "engenheiro_civil",
            nome: "Responsável Teste",
            telefone: "11987654321",
            email: "responsavel@example.com",
            numero_crea: "1234567890/A",
            numero_art: "2026/000000-0",
            anexos: [],
          },
        ],
      }),
    );
  });

  it("deve popular o formulário com os anexos do responsável técnico", () => {
    const anexos = [
      {
        uuid: "anexo-1",
        nome: "CREA.pdf",
        arquivo_url: "https://example.com/crea.pdf",
      },
      {
        uuid: "anexo-2",
        nome: "ART.pdf",
        arquivo_url: "https://example.com/art.pdf",
      },
    ];

    useEmpresaMock.mockReturnValue({
      data: {
        ...EMPRESA,
        responsaveis_tecnicos: [
          { ...RESPONSAVEL_TECNICO_BACKEND, arquivos: anexos },
        ],
      },
      isLoading: false,
    });

    render(<EmpresaForm uuid="uuid-1" />);

    expect(resetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        responsaveis_tecnicos: [expect.objectContaining({ anexos })],
      }),
    );
  });

  it("deve popular o formulário com um responsável técnico vazio quando a empresa não possuir nenhum", () => {
    useEmpresaMock.mockReturnValue({
      data: { ...EMPRESA, responsaveis_tecnicos: [] },
      isLoading: false,
    });

    render(<EmpresaForm uuid="uuid-1" />);

    expect(resetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        responsaveis_tecnicos: [
          {
            tipo: "",
            nome: "",
            telefone: "",
            email: "",
            numero_crea: "",
            numero_art: "",
            anexos: [],
          },
        ],
      }),
    );
  });

  it("deve fornecer CNPJ vazio à exclusão quando a API não retornar o campo", () => {
    useEmpresaMock.mockReturnValue({
      data: { ...EMPRESA, cnpj: undefined },
      isLoading: false,
    });

    render(<EmpresaForm uuid="uuid-1" />);

    expect(screen.getByTestId("empresa-exclusao")).toHaveAttribute(
      "data-cnpj",
      "",
    );
  });

  it("deve popular o formulário com valores padrão quando a empresa possuir campos opcionais ausentes", () => {
    useEmpresaMock.mockReturnValue({
      data: {
        ...EMPRESA,
        status: false,
        link_rastreio: undefined,
        complemento: undefined,
        responsaveis_tecnicos: [
          {
            ...RESPONSAVEL_TECNICO_BACKEND,
            numero_crea: undefined,
            numero_art: undefined,
          },
        ],
      },
      isLoading: false,
    });

    render(<EmpresaForm uuid="uuid-1" />);

    expect(resetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "false",
        link_rastreio: "",
        complemento: "",
        responsaveis_tecnicos: [
          expect.objectContaining({
            numero_crea: "",
            numero_art: "",
          }),
        ],
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
      screen.getByText("Esta informação não está mais disponível!"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /atualizar página/i }),
    ).toHaveAttribute("href", "/empresas");

    expect(screen.queryByTestId("informacoes-gerais")).not.toBeInTheDocument();
  });

  it("deve exibir o estado de não encontrado quando a empresa não existir", () => {
    useEmpresaMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    render(<EmpresaForm uuid="uuid-1" />);

    expect(screen.getByTestId("lista-vazia")).toBeInTheDocument();
    expect(screen.queryByTestId("informacoes-gerais")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /edição de empresa/i }),
    ).not.toBeInTheDocument();
  });

  it("deve voltar para a listagem ao clicar em cancelar", async () => {
    const user = userEvent.setup();

    render(<EmpresaForm uuid="uuid-1" />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/empresas");
  });

  it("deve desabilitar enquanto a atualização está pendente", () => {
    useUpdateEmpresaMock.mockReturnValue({
      isPending: true,
      mutate: mutateAtualizarMock,
    });

    render(<EmpresaForm uuid="uuid-1" />);

    expect(screen.getByRole("button", { name: /^próximo$/i })).toBeDisabled();
  });

  describe("na última etapa (responsável técnico)", () => {
    beforeEach(() => {
      renderNaUltimaEtapa();
    });

    it("deve exibir 'Salvar alterações' e a etapa de responsável técnico", () => {
      render(<EmpresaForm uuid="uuid-1" />);

      expect(screen.getByTestId("responsavel-tecnico")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /salvar alterações/i }),
      ).toBeEnabled();
    });

    it("deve repassar o responsável técnico alterado mais recentemente para a etapa", () => {
      useEmpresaMock.mockReturnValue({
        data: {
          ...EMPRESA,
          responsaveis_tecnicos: [
            {
              ...RESPONSAVEL_TECNICO_BACKEND,
              criado_por: "Ana Antiga",
              atualizado_por: "Ana Antiga",
              atualizado_em: "2026-01-05T10:00:00Z",
            },
            {
              ...RESPONSAVEL_TECNICO_BACKEND,
              criado_por: "Maria Souza",
              atualizado_por: "João Lima",
              atualizado_em: "2026-03-05T10:00:00Z",
            },
            {
              ...RESPONSAVEL_TECNICO_BACKEND,
              criado_por: "Carlos Meio",
              atualizado_por: "Carlos Meio",
              atualizado_em: "2026-02-10T10:00:00Z",
            },
          ],
        },
        isLoading: false,
      });

      render(<EmpresaForm uuid="uuid-1" />);

      expect(
        screen.getByTestId("responsavel-tecnico-modo-edicao"),
      ).toHaveTextContent("true");
      expect(
        screen.getByTestId("responsavel-tecnico-ultimo-alterado"),
      ).toHaveTextContent("Maria Souza|João Lima");
    });

    it("não deve repassar responsável técnico alterado quando a empresa não possuir nenhum", () => {
      useEmpresaMock.mockReturnValue({
        data: { ...EMPRESA, responsaveis_tecnicos: [] },
        isLoading: false,
      });

      render(<EmpresaForm uuid="uuid-1" />);

      expect(
        screen.getByTestId("responsavel-tecnico-ultimo-alterado"),
      ).toHaveTextContent("nenhum");
    });

    it("deve desabilitar quando um campo obrigatório está vazio", () => {
      configurarWatch({ empresa: ["", ...VALID_WATCH_VALUES.slice(1)] });

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

    it("deve atualizar a empresa com os responsáveis técnicos em uma única requisição", async () => {
      const user = userEvent.setup();

      mutateAtualizarMock.mockImplementation(
        (_payload: unknown, options?: MutationOptions<EmpresaResultado>) => {
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

      const payloadEmpresa = mutateAtualizarMock.mock.calls[0][0] as Record<
        string,
        unknown
      >;
      expect(payloadEmpresa.status).toBe(true);
      expect(payloadEmpresa.cnpj).toBe("12345678000199");
      expect(payloadEmpresa.cep).toBe("01000000");
      expect(payloadEmpresa.responsaveis_tecnicos).toEqual([
        {
          tipo: "engenheiro_civil",
          nome: "Responsável Teste",
          telefone: "11987654321",
          email: "responsavel@example.com",
          numero_crea: "1234567890/A",
          numero_art: "2026/000000-0",
          anexos: VALID_RESPONSAVEL_TECNICO.anexos,
        },
      ]);

      expect(toastSucessoMock).toHaveBeenCalledWith({
        titulo: "Sucesso",
        descricao:
          "Alteração de empresa com CNPJ 12.345.678/0001-99 realizada com sucesso.",
      });

      expect(replaceMock).toHaveBeenCalledWith("/empresas");
      expect(toastErroMock).not.toHaveBeenCalled();
    });

    it("deve tratar falha na atualização retornada como resultado de erro da API", async () => {
      const user = userEvent.setup();

      mutateAtualizarMock.mockImplementation(
        (_payload: unknown, options?: MutationOptions<EmpresaResultado>) => {
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
        (_payload: unknown, options?: MutationOptions<EmpresaResultado>) => {
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
        (_payload: unknown, options?: MutationOptions<EmpresaResultado>) => {
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
});
