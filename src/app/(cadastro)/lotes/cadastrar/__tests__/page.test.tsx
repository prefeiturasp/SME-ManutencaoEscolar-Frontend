import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CadastrarLotePage from "../page";

const mocks = vi.hoisted(() => ({
  useForm: vi.fn(),
  zodResolver: vi.fn(),
  mutate: vi.fn(),
  useCriarLote: vi.fn(),
  useFeedbackLote: vi.fn(),
  useOpcoesLote: vi.fn(),
  formLote: vi.fn(),
  alertaErro: vi.fn(),
  handleSubmit: vi.fn(),
  tratarResultado: vi.fn(),
  tratarErroInesperado: vi.fn(),
}));

const dadosValidos = {
  nome: "Lote teste",
  status: "true",
  codigo_cadastro: "LOTE-001",
  empresa: "uuid-empresa",
  periodo_inicial: "01/09/2026",
  periodo_final: "30/09/2026",
  diretorias_regionais: ["1", "2"],
};

const empresasOpcoes = [
  {
    label: "Empresa teste",
    value: "uuid-empresa",
  },
];

const diretoriasRegionaisOpcoes = [
  {
    label: "DRE Butantã",
    value: "1",
  },
];

const alertaProps = {
  aberto: false,
  titulo: "",
  mensagem: "",
  vinculados: [],
  onOpenChange: vi.fn(),
};

vi.mock("react-hook-form", () => ({
  FormProvider: ({ children }: { children: React.ReactNode }) => children,
  useForm: mocks.useForm,
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: mocks.zodResolver,
}));

vi.mock("@/features/lotes/schemas/loteSchema", () => ({
  LoteSchema: {
    descricao: "schema-mock",
  },
}));

vi.mock("@/features/lotes/hooks/useCriarLote", () => ({
  useCriarLote: mocks.useCriarLote,
}));

vi.mock("@/features/lotes/hooks/useFeedbackLote", () => ({
  useFeedbackLote: mocks.useFeedbackLote,
}));

vi.mock("@/features/lotes/hooks/useOpcoesLote", () => ({
  useOpcoesLote: mocks.useOpcoesLote,
}));

vi.mock("@/features/lotes/components/FormLote", () => ({
  FormLote: (props: unknown) => {
    mocks.formLote(props);
    return <div data-testid="form-lote">Formulário do lote</div>;
  },
}));

vi.mock("@/app/(cadastro)/lotes/components/AlertaErroVinculoLote", () => ({
  AlertaErroVinculoLote: (props: unknown) => {
    mocks.alertaErro(props);
    return <div data-testid="alerta-erro-vinculo" />;
  },
}));

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => (
    <div data-testid="cadastro-breadcrumb">Breadcrumb</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <section>{children}</section>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

type ConfigurarUseFormProps = {
  isValid?: boolean;
  isSubmitting?: boolean;
};

function configurarUseForm({
  isValid = true,
  isSubmitting = false,
}: ConfigurarUseFormProps = {}) {
  mocks.handleSubmit.mockImplementation(
    (callback: (dados: typeof dadosValidos) => void) =>
      (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        callback(dadosValidos);
      },
  );

  mocks.useForm.mockReturnValue({
    handleSubmit: mocks.handleSubmit,
    formState: {
      isValid,
      isSubmitting,
    },
  });
}

describe("CadastrarLotePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.zodResolver.mockReturnValue("resolver-mock");

    mocks.useCriarLote.mockReturnValue({
      mutate: mocks.mutate,
    });

    mocks.useOpcoesLote.mockReturnValue({
      empresasOpcoes,
      diretoriasRegionaisOpcoes,
    });

    mocks.useFeedbackLote.mockReturnValue({
      tratarResultado: mocks.tratarResultado,
      tratarErroInesperado: mocks.tratarErroInesperado,
      alertaProps,
    });

    configurarUseForm();
  });

  it("renderiza os elementos da página", () => {
    render(<CadastrarLotePage />);

    expect(screen.getByTestId("cadastro-breadcrumb")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Cadastro de lote",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/preencha as informações e clique em “cadastrar lote”/i),
    ).toBeInTheDocument();

    expect(screen.getByTestId("form-lote")).toBeInTheDocument();
    expect(screen.getByTestId("alerta-erro-vinculo")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Cancelar" })).toHaveAttribute(
      "href",
      "/lotes/",
    );
  });

  it("configura o formulário com os valores iniciais", () => {
    render(<CadastrarLotePage />);

    expect(mocks.zodResolver).toHaveBeenCalledWith({
      descricao: "schema-mock",
    });

    expect(mocks.useForm).toHaveBeenCalledWith({
      resolver: "resolver-mock",
      mode: "onChange",
      defaultValues: {
        nome: "",
        status: undefined,
        codigo_cadastro: "",
        empresa: "",
        periodo_inicial: "",
        periodo_final: "",
        diretorias_regionais: [],
      },
    });
  });

  it("configura o hook de feedback", () => {
    render(<CadastrarLotePage />);

    expect(mocks.useFeedbackLote).toHaveBeenCalledWith({
      mensagemSucesso: "Lote cadastrado com sucesso.",
      contextoErro: "cadastrar lote",
    });
  });

  it("envia as opções para o FormLote", () => {
    render(<CadastrarLotePage />);

    expect(mocks.formLote.mock.calls[0][0]).toEqual({
      empresasOpcoes,
      diretoriasRegionaisOpcoes,
    });
  });

  it("envia as propriedades para o alerta de vínculo", () => {
    render(<CadastrarLotePage />);

    expect(mocks.alertaErro.mock.calls[0][0]).toEqual({
      ...alertaProps,
      width: 672,
    });
  });

  it("envia os dados para a mutation", () => {
    render(<CadastrarLotePage />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Cadastrar lote",
      }),
    );

    expect(mocks.mutate).toHaveBeenCalledWith(dadosValidos, {
      onSuccess: mocks.tratarResultado,
      onError: mocks.tratarErroInesperado,
    });
  });

  it("desabilita o botão quando o formulário é inválido", () => {
    configurarUseForm({
      isValid: false,
      isSubmitting: false,
    });

    render(<CadastrarLotePage />);

    expect(
      screen.getByRole("button", {
        name: "Cadastrar lote",
      }),
    ).toBeDisabled();
  });

  it("desabilita o botão durante o envio", () => {
    configurarUseForm({
      isValid: true,
      isSubmitting: true,
    });

    render(<CadastrarLotePage />);

    expect(
      screen.getByRole("button", {
        name: "Cadastrar lote",
      }),
    ).toBeDisabled();
  });

  it("habilita o botão quando o formulário é válido", () => {
    configurarUseForm({
      isValid: true,
      isSubmitting: false,
    });

    render(<CadastrarLotePage />);

    expect(
      screen.getByRole("button", {
        name: "Cadastrar lote",
      }),
    ).toBeEnabled();
  });
});
