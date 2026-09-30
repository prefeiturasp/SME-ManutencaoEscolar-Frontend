import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfissionalApiError } from "../hooks/useCreateProfissional";
import { useUpdateProfissional } from "../hooks/useUpdateProfissional";

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn((config: unknown) => config),
  useQueryClient: vi.fn(),
  invalidateQueries: vi.fn(),
  atualizarProfissional: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
  useQueryClient: mocks.useQueryClient,
}));
vi.mock("../services/profissional.service", () => ({
  atualizarProfissional: mocks.atualizarProfissional,
}));

type MutationConfig = {
  mutationFn: (payload: unknown) => Promise<unknown>;
  onSuccess: (resultado: unknown) => void;
  meta: { loading: { titulo: string; mensagem: string } };
};

describe("useUpdateProfissional", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQueryClient.mockReturnValue({ invalidateQueries: mocks.invalidateQueries });
  });

  it("atualiza e invalida a lista e o detalhe", async () => {
    const payload = { nome: "Maria" };
    const resultado = { success: true, profissional: { uuid: "profissional-1" } };
    mocks.atualizarProfissional.mockResolvedValueOnce(resultado);
    const { result } = renderHook(() => useUpdateProfissional("profissional-1"));
    const config = result.current as unknown as MutationConfig;

    await expect(config.mutationFn(payload)).resolves.toBe(resultado);
    expect(mocks.atualizarProfissional).toHaveBeenCalledWith("profissional-1", payload);
    expect(config.meta.loading.mensagem).toBe("Estamos atualizando o profissional...");
    config.onSuccess(resultado);
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(1, { queryKey: ["profissionais"] });
    expect(mocks.invalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: ["profissional", "profissional-1"],
    });
  });

  it("converte a resposta de erro em ProfissionalApiError", async () => {
    mocks.atualizarProfissional.mockResolvedValueOnce({
      success: false,
      message: "Dados inválidos",
      fieldErrors: { rg: "RG já cadastrado." },
    });
    const { result } = renderHook(() => useUpdateProfissional("profissional-1"));

    await expect(
      (result.current as unknown as MutationConfig).mutationFn({}),
    ).rejects.toEqual(new ProfissionalApiError("Dados inválidos", { rg: "RG já cadastrado." }));
  });
});
