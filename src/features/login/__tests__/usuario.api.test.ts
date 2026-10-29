import { beforeEach, describe, expect, it, vi } from "vitest";

const { requisicaoAutenticadaMock } = vi.hoisted(() => ({
  requisicaoAutenticadaMock: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

import { obterUsuarioAutenticado } from "../services/usuario.api";

describe("obterUsuarioAutenticado", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consulta /usuarios/me e converte os dados do usuário", async () => {
    requisicaoAutenticadaMock.mockResolvedValue({
      id: 1,
      uuid: "uuid-1",
      nome: "Ana",
      email: "ana@email.com",
      registro_funcional: null,
      cpf: "12345678901",
      username: "12345678901",
      perfil_acesso: { cargo: "ADM", perfil: { codigo: "SME", descricao: "SME / GME" } },
      funcionalidades: ["CADASTROS", "RELATORIOS", "SOLICITACAO_MANUTENCAO"],
      diretoria_regional: null,
      unidade_educacional: null,
    });

    const usuario = await obterUsuarioAutenticado();

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "GET",
      url: "/usuarios/me/",
    });
    expect(usuario).toMatchObject({
      nome: "Ana",
      codigoRfOuCpf: "12345678901",
      funcionalidades: ["CADASTROS", "RELATORIOS", "SOLICITACAO_MANUTENCAO"],
    });
  });

  it("propaga o erro da requisição", async () => {
    requisicaoAutenticadaMock.mockRejectedValue(new Error("Sessão expirada"));

    await expect(obterUsuarioAutenticado()).rejects.toThrow("Sessão expirada");
  });
});
