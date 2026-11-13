import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useEditarEquipe } from "../hooks/useEditarEquipe";
import { editarEquipeAction } from "../services/editarEquipe.api";
import type { CriarEquipeResultado } from "../types/equipe.types";
import type { EquipeFormData } from "../schema/equipeSchema";

const mocks = vi.hoisted(() => ({ mutation: vi.fn(), invalidate: vi.fn() }));
vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.mutation,
  useQueryClient: () => ({ invalidateQueries: mocks.invalidate }),
}));
vi.mock("../services/editarEquipe.api", () => ({ editarEquipeAction: vi.fn() }));

type Options = {
  mutationFn: (dados: Partial<EquipeFormData>) => Promise<CriarEquipeResultado>;
  onSuccess: (resultado: CriarEquipeResultado) => Promise<void>;
  meta: { loading: { titulo: string; mensagem: string } };
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

describe("useEditarEquipe", () => {
  it("retorna a mutation e encaminha o UUID com os dados parciais", async () => {
    const { result } = renderHook(() => useEditarEquipe("e1"));
    expect(result.current).toBe(mutation);
    expect(options.meta.loading).toEqual({
      titulo: "Aguarde um momento!",
      mensagem: "Estamos salvando as informações...",
    });
    const resultado: CriarEquipeResultado = {
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Falha",
    };
    vi.mocked(editarEquipeAction).mockResolvedValue(resultado);
    expect(await options.mutationFn({ nome: "Novo nome" })).toBe(resultado);
    expect(editarEquipeAction).toHaveBeenCalledExactlyOnceWith({
      uuid: "e1",
      dados: { nome: "Novo nome" },
    });
  });
  it("invalida a lista e somente o detalhe atualizado no sucesso", async () => {
    renderHook(() => useEditarEquipe("e1"));
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
    expect(mocks.invalidate).toHaveBeenCalledTimes(2);
    expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["equipes"] });
    expect(mocks.invalidate).toHaveBeenCalledWith({ queryKey: ["equipe", "e1"] });
  });
  it("preserva o cache quando a API retorna falha", async () => {
    renderHook(() => useEditarEquipe("e1"));
    await options.onSuccess({
      success: false,
      error: "api-error",
      title: "Erro",
      message: "Falha",
    });
    expect(mocks.invalidate).not.toHaveBeenCalled();
  });
});
