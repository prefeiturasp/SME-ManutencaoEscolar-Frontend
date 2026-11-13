import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { useUsuarioAutenticado } from "../hooks/useUsuarioAutenticado";
import { obterUsuarioAutenticado } from "../services/usuario.api";
import type { LoginUser } from "../types/login.types";

vi.mock("../services/usuario.api", () => ({
  obterUsuarioAutenticado: vi.fn(),
}));

const usuario: LoginUser = {
  nome: "Ana",
  codigoRfOuCpf: "1234567",
  cargo: "ADM",
  diretoriaRegional: null,
  unidadeEducacional: null,
  funcionalidades: ["CADASTROS"],
};

function criarWrapper() {
  const client = new QueryClient();
  return function Wrapper({ children }: Readonly<{ children: ReactNode }>) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useUsuarioAutenticado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useUsuarioStore.setState({ usuario: null });
  });

  it("consulta o usuário e sincroniza o store", async () => {
    vi.mocked(obterUsuarioAutenticado).mockResolvedValue(usuario as never);

    const { result } = renderHook(() => useUsuarioAutenticado(), {
      wrapper: criarWrapper(),
    });

    await waitFor(() => expect(result.current.data).toEqual(usuario));
    expect(useUsuarioStore.getState().usuario).toEqual(usuario);
  });

  it("não altera o store quando a consulta falha", async () => {
    vi.mocked(obterUsuarioAutenticado).mockRejectedValue(new Error("falha"));

    const { result } = renderHook(() => useUsuarioAutenticado(), {
      wrapper: criarWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(useUsuarioStore.getState().usuario).toBeNull();
  });
});
