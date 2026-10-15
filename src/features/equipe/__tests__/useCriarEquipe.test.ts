import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCriarEquipe } from "../hooks/useCriarEquipe";
import { criarEquipeAction } from "../services/criarEquipe.api";
import type { CriarEquipeResultado } from "../types/equipe.types";

const mocks = vi.hoisted(() => ({ mutation: vi.fn(), invalidate: vi.fn(), replace: vi.fn() }));
vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.mutation,
  useQueryClient: () => ({ invalidateQueries: mocks.invalidate }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("../services/criarEquipe.api", () => ({ criarEquipeAction: vi.fn() }));
type Options = {
  mutationFn: typeof criarEquipeAction;
  meta: { loading: { titulo: string; mensagem: string } };
  onSuccess: (resultado: CriarEquipeResultado) => Promise<void>;
  onError: (error: unknown) => void;
};
let options: Options;
const mutation = { mutate: vi.fn(), isPending: false };
beforeEach(() => {
  vi.clearAllMocks();
  mocks.invalidate.mockResolvedValue(undefined);
  mocks.mutation.mockImplementation((value: Options) => {
    options = value;
    return mutation;
  });
});
describe("useCriarEquipe", () => {
  it("configura a action, mensagem de carregamento e retorna a mutation", () => {
    const { result } = renderHook(() => useCriarEquipe());
    expect(result.current).toBe(mutation);
    expect(options.mutationFn).toBe(criarEquipeAction);
    expect(options.meta.loading).toEqual({
      titulo: "Aguarde um momento!",
      mensagem: "Estamos cadastrando a equipe...",
    });
  });
  it("invalida as equipes antes de redirecionar após sucesso", async () => {
    renderHook(() => useCriarEquipe());
    await act(async () => {
      await options.onSuccess({
        success: true,
        equipe: {
          id: 1,
          uuid: "e1",
          nome: "Equipe",
          situacao: true,
          empresa: "empresa",
          lote: "lote",
          profissionais: [],
        },
      });
    });
    expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["equipes"] });
    expect(mocks.replace).toHaveBeenCalledWith("/empresas/equipes");
    expect(mocks.invalidate.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.replace.mock.invocationCallOrder[0],
    );
  });
  it("não invalida nem redireciona quando a API retorna erro", async () => {
    renderHook(() => useCriarEquipe());
    await act(async () => {
      await options.onSuccess({
        success: false,
        error: "api-error",
        title: "Erro",
        message: "Falha",
      });
    });
    expect(mocks.invalidate).not.toHaveBeenCalled();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
  it("registra erros inesperados", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    try {
      renderHook(() => useCriarEquipe());
      const error = new Error("Falha");
      options.onError(error);
      expect(spy).toHaveBeenCalledWith("Erro ao criar equipe:", error);
    } finally {
      spy.mockRestore();
    }
  });
});
