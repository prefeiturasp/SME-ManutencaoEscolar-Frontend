import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PageHeader } from "@/components/layout/Header";
import type { LoginUser } from "@/features/login/types/login.types";

const pushMock = vi.fn();
const replaceMock = vi.fn();
const refreshMock = vi.fn();

const usuarioMock: LoginUser = {
  nome: "Mário de Almeida Silva",
  codigoRfOuCpf: "1234567",
  cargo: "Fornecedor",
  diretoriaRegional: null,
  unidadeEducacional: null,
};

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
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
  }) => <img {...props} />,
}));

describe("PageHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o logo quando a sidebar estiver fechada", () => {
    render(<PageHeader abrirSidebar={false} usuario={usuarioMock} />);

    expect(screen.getByAltText("Manutenção Escolar")).toBeInTheDocument();
  });

  it("não deve renderizar o logo quando a sidebar estiver aberta", () => {
    render(<PageHeader abrirSidebar usuario={usuarioMock} />);

    expect(screen.queryByAltText("Manutenção Escolar")).not.toBeInTheDocument();
  });

  it("deve renderizar os dados do usuário", () => {
    render(<PageHeader abrirSidebar={false} usuario={usuarioMock} />);

    expect(screen.getByText("RF: 1234567")).toBeInTheDocument();
    expect(screen.getByText("Mário de Almeida Silva")).toBeInTheDocument();
    expect(screen.getByText("Fornecedor")).toBeInTheDocument();
  });

  it("deve renderizar os botões de notificações e sair", () => {
    render(<PageHeader abrirSidebar={false} usuario={usuarioMock} />);

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
    render(<PageHeader abrirSidebar={false} usuario={usuarioMock} />);

    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("Notificações")).toBeInTheDocument();
  });

  it("deve aplicar left-[250px] quando a sidebar estiver aberta", () => {
    render(<PageHeader abrirSidebar usuario={usuarioMock} />);

    const header = screen.getByRole("banner");

    expect(header).toHaveClass("left-[250px]");
    expect(header).not.toHaveClass("left-[80px]");
  });

  it("deve aplicar left-[80px] quando a sidebar estiver fechada", () => {
    render(<PageHeader abrirSidebar={false} usuario={usuarioMock} />);

    const header = screen.getByRole("banner");

    expect(header).toHaveClass("left-[80px]");
    expect(header).not.toHaveClass("left-[250px]");
  });
});
