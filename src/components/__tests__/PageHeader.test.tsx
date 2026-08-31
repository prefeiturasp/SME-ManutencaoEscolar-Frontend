import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PageHeader } from "@/components/layout/Header";
import type { LoginUser } from "@/features/login/types/login.types";

const {
  pushMock,
  replaceMock,
  refreshMock,
  limparUsuarioMock,
  logoutMock,
  estadoStore,
  usuarioMock,
} = vi.hoisted(() => {
  const usuario: LoginUser = {
    nome: "Mário de Almeida Silva",
    codigoRfOuCpf: "1234567",
    cargo: "Empresa",
    diretoriaRegional: null,
    unidadeEducacional: null,
  };

  return {
    pushMock: vi.fn(),
    replaceMock: vi.fn(),
    refreshMock: vi.fn(),
    limparUsuarioMock: vi.fn(),
    logoutMock: vi.fn(),
    usuarioMock: usuario,
    estadoStore: {
      usuario: usuario as LoginUser | null,
      limparUsuario: vi.fn(),
    },
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
    refresh: refreshMock,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
  }) => <img alt={alt ?? ""} {...props} />,
}));

vi.mock("@/stores/useUsuarioStore", () => ({
  useUsuarioStore: (
    seletor: (estado: {
      usuario: LoginUser | null;
      limparUsuario: () => void;
    }) => unknown,
  ) => seletor(estadoStore),
}));

vi.mock("@/features/login/hooks/logout", () => ({
  logout: logoutMock,
}));

describe("PageHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    estadoStore.usuario = usuarioMock;
    estadoStore.limparUsuario = limparUsuarioMock;

    logoutMock.mockResolvedValue(undefined);
  });

  it("deve renderizar o logo quando a sidebar estiver fechada", () => {
    render(<PageHeader abrirSidebar={false} />);

    expect(screen.getByAltText("Manutenção Escolar")).toBeInTheDocument();
  });

  it("não deve renderizar o logo quando a sidebar estiver aberta", () => {
    render(<PageHeader abrirSidebar />);

    expect(screen.queryByAltText("Manutenção Escolar")).not.toBeInTheDocument();
  });

  it("deve renderizar os dados do usuário", () => {
    render(<PageHeader abrirSidebar={false} />);

    expect(screen.getByText("RF: 1234567")).toBeInTheDocument();
    expect(screen.getByText("Mário de Almeida Silva")).toBeInTheDocument();
    expect(screen.getByText("Empresa")).toBeInTheDocument();
  });

  it("deve renderizar os dados padrão quando não houver usuário", () => {
    estadoStore.usuario = null;

    render(<PageHeader abrirSidebar={false} />);

    expect(screen.getByText("RF: Não informado")).toBeInTheDocument();
    expect(screen.getByText("Usuário não informado")).toBeInTheDocument();
    expect(screen.getByText("Cargo não informado")).toBeInTheDocument();
  });

  it("deve renderizar os botões de notificações e sair", () => {
    render(<PageHeader abrirSidebar={false} />);

    expect(
      screen.getByRole("button", {
        name: /abrir notificações/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /sair/i,
      }),
    ).toBeInTheDocument();
  });

  it("deve exibir a quantidade de notificações", () => {
    render(<PageHeader abrirSidebar={false} />);

    expect(screen.getByText("Notificações")).toBeInTheDocument();
  });

  it("deve aplicar left-[250px] quando a sidebar estiver aberta", () => {
    render(<PageHeader abrirSidebar />);

    const header = screen.getByRole("banner");

    expect(header).toHaveClass("left-[250px]");
    expect(header).not.toHaveClass("left-[80px]");
  });

  it("deve aplicar left-[80px] quando a sidebar estiver fechada", () => {
    render(<PageHeader abrirSidebar={false} />);

    const header = screen.getByRole("banner");

    expect(header).toHaveClass("left-[80px]");
    expect(header).not.toHaveClass("left-[250px]");
  });

  it("deve fazer logout, limpar o usuário e redirecionar para o login", async () => {
    const user = userEvent.setup();

    render(<PageHeader abrirSidebar={false} />);

    await user.click(
      screen.getByRole("button", {
        name: /sair/i,
      }),
    );

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(limparUsuarioMock).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
  });

  it("deve aguardar o logout antes de limpar e redirecionar", async () => {
    const user = userEvent.setup();

    let resolverLogout: (() => void) | undefined;

    logoutMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolverLogout = resolve;
        }),
    );

    render(<PageHeader abrirSidebar={false} />);

    await user.click(
      screen.getByRole("button", {
        name: /sair/i,
      }),
    );

    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(limparUsuarioMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();

    resolverLogout?.();

    await waitFor(() => {
      expect(limparUsuarioMock).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
  });
});
