import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "../components/LoginForm/LoginForm";
import { useLogin } from "../hooks/useLogin";
import type {
  LoginCredentials,
  LoginResult,
  LoginUser,
} from "../types/login.types";

const replaceMock = vi.fn();
const refreshMock = vi.fn();

const mutateAsyncMock =
  vi.fn<(credentials: LoginCredentials) => Promise<LoginResult>>();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
    refresh: refreshMock,
  }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("../hooks/useLogin", () => ({
  useLogin: vi.fn(),
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => children,
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => children,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

type LoginMutationMock = {
  mutateAsync: typeof mutateAsyncMock;
  isPending: boolean;
  data: LoginResult | undefined;
};

const userMock: LoginUser = {
  nome: "Mário de Almeida Silva",
  codigoRfOuCpf: "1234567",
  cargo: "Fornecedor",
  diretoriaRegional: null,
  unidadeEducacional: null,
};

const loginErrorCases = [
  "Usuário e/ou senha inválidos.",
  "Certifique-se de que este campo não tenha mais de 11 caracteres.",
  "Parece que estamos com uma instabilidade. Tente novamente em alguns instantes.",
];

const useLoginMock = vi.mocked(useLogin);

function mockLoginMutation(
  overrides: Partial<LoginMutationMock> = {},
): LoginMutationMock {
  const mutation: LoginMutationMock = {
    mutateAsync: mutateAsyncMock,
    isPending: false,
    data: undefined,
    ...overrides,
  };

  useLoginMock.mockReturnValue(
    mutation as unknown as ReturnType<typeof useLogin>,
  );

  return mutation;
}

async function preencherFormulario() {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("RF ou CPF"), "1234567");
  await user.type(screen.getByLabelText("Senha"), "senha123");

  return user;
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginMutation();
  });

  it("deve renderizar os campos e o botão de acesso", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("RF ou CPF")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Acessar" })).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Esqueci minha senha" }),
    ).toHaveAttribute("href", "/");
  });

  it("deve iniciar com o botão desabilitado", () => {
    render(<LoginForm />);

    expect(screen.getByRole("button", { name: "Acessar" })).toBeDisabled();
  });

  it("deve habilitar o botão quando o formulário estiver válido", async () => {
    render(<LoginForm />);

    await preencherFormulario();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Acessar" })).toBeEnabled();
    });
  });

  it("deve enviar login e senha preenchidos", async () => {
    mutateAsyncMock.mockResolvedValue({
      success: true,
      user: userMock,
    });

    render(<LoginForm />);

    const user = await preencherFormulario();

    await user.click(screen.getByRole("button", { name: "Acessar" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        login: "1234567",
        senha: "senha123",
      });
    });

    expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
  });

  // it("não deve redirecionar quando o login falhar", async () => {
  //   mutateAsyncMock.mockResolvedValue({
  //     success: false,
  //     error: "Usuário e/ou senha inválidos.",
  //   });

  //   render(<LoginForm />);

  //   const user = await preencherFormulario();

  //   await user.click(screen.getByRole("button", { name: "Acessar" }));

  //   expect(await screen.findByRole("alert")).toHaveTextContent(
  //     "Usuário e/ou senha inválidos.",
  //   );

  //   expect(replaceMock).not.toHaveBeenCalled();
  //   expect(refreshMock).not.toHaveBeenCalled();
  // });

  // it.each(loginErrorCases)(
  //   "deve exibir a mensagem de erro: %s",
  //   async (expectedMessage) => {
  //     mutateAsyncMock.mockResolvedValue({
  //       success: false,
  //       error: expectedMessage,
  //     });

  //     render(<LoginForm />);

  //     const user = await preencherFormulario();

  //     await user.click(screen.getByRole("button", { name: "Acessar" }));

  //     expect(await screen.findByRole("alert")).toHaveTextContent(
  //       expectedMessage,
  //     );

  //     expect(replaceMock).not.toHaveBeenCalled();
  //     expect(refreshMock).not.toHaveBeenCalled();
  //   },
  // );

  it("deve mostrar o estado de carregamento durante o login", () => {
    mockLoginMutation({
      isPending: true,
    });

    render(<LoginForm />);

    expect(screen.getByText("Entrando...")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Entrando..." })).toBeDisabled();
  });

  it("deve exibir a explicação do campo de login", () => {
    render(<LoginForm />);

    expect(
      screen.getByText(/Caso faça parte de uma Diretoria Regional de Ensino/),
    ).toBeInTheDocument();
  });
});
