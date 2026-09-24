import { beforeEach, describe, expect, it, vi } from "vitest";

const { requisicaoAutenticadaMock } = vi.hoisted(() => ({
  requisicaoAutenticadaMock: vi.fn(),
}));

vi.mock("@/actions/http/requisicao-autenticada", () => ({
  requisicaoAutenticada: requisicaoAutenticadaMock,
}));

import { listarTodosCargosEolAction } from "@/features/cargo_eol/services/cargoEol.service";

describe("listarTodosCargosEOLAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve buscar todos os cargos EOL", async () => {
    const cargos = [
      {
        id: 1,
        codigo: "0002",
        nome: "DIRETOR DE ESCOLA",
        perfil: "UE",
        ativo: true,
      },
    ];
    requisicaoAutenticadaMock.mockResolvedValue({
      count: cargos.length,
      next: null,
      previous: null,
      results: cargos,
    });

    const resultado = await listarTodosCargosEolAction();

    expect(requisicaoAutenticadaMock).toHaveBeenCalledWith({
      method: "GET",
      url: "/cargos-eol/",
      params: { "page_size": "all" },
    });
    expect(resultado).toEqual(cargos);
  });
});
