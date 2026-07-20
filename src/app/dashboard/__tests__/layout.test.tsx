import { vi } from "vitest";

vi.mock("@/features/login/services/obterUsuarioLogado", () => ({
  obterUsuarioLogado: vi.fn(),
}));

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({
    children,
    usuario,
  }: {
    children: React.ReactNode;
    usuario: {
      nome: string;
    };
  }) => (
    <div data-testid="app-shell" data-usuario={usuario.nome}>
      {children}
    </div>
  ),
}));
