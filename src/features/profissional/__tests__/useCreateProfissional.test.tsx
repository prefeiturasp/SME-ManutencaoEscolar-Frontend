import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfissionalApiError, useCreateProfissional } from "../hooks/useCreateProfissional";

const mocks = vi.hoisted(() => ({
  useMutation: vi.fn((config: unknown) => config),
  useQueryClient: vi.fn(),
  invalidateQueries: vi.fn(),
  criarProfissional: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: mocks.useMutation,
  useQueryClient: mocks.useQueryClient,
}));
vi.mock("../services/profissional.service", () => ({ criarProfissional: mocks.criarProfissional }));

type MutationConfig = {
  mutationFn: (payload: unknown) => Promise<unknown>;
  onSuccess: (resultado: { success: boolean }) => void;
  meta: { loading: { titulo: string; mensagem: string } };
};

describe("useCreateProfissional", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useQueryClient.mockReturnValue({ invalidateQueries: mocks.invalidateQueries });
  });

  it("envia o payload ao serviço e invalida a lista após sucesso", async () => {
    const payload = { nome: "João", rg: "1234567", cpf: "12345678901", status: true, funcoes: [] };
    const resultado = { success: true, profissional: { uuid: "profissional-1" } };
    mocks.criarProfissional.mockResolvedValueOnce(resultado);

    const { result } = renderHook(() => useCreateProfissional());
    const config = result.current as unknown as MutationConfig;
    await expect(config.mutationFn(payload)).resolves.toEqual(resultado);
    expect(mocks.criarProfissional).toHaveBeenCalledWith(payload);
    expect(config.meta.loading.titulo).toBe("Aguarde um momento!");

    config.onSuccess(resultado);
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["profissionais"] });
  });

  it("rejeita a mutation com a mensagem da API sem invalidar a lista", async () => {
    mocks.criarProfissional.mockResolvedValueOnce({ success: false, title: "Dados inválidos", message: "CPF duplicado", fieldErrors: { cpf: "CPF já cadastrado." } });
    const { result } = renderHook(() => useCreateProfissional());
    await expect((result.current as unknown as MutationConfig).mutationFn({})).rejects.toEqual(
      new ProfissionalApiError("CPF duplicado", { cpf: "CPF já cadastrado." }),
    );
    expect(mocks.invalidateQueries).not.toHaveBeenCalled();
  });
});
