import { describe, expect, it } from "vitest";

import type { FuncaoProfissional } from "@/features/profissional/types/profissional.types";
import {
  mapearDocumentosSalvos,
  obterRotulosDocumentos,
} from "@/features/profissional/utils/documentosFuncao";

const cargo = {
  exige_documento: true,
  documentos: [
    { id: 1, nome: "Belas Artes" },
    { id: 2, nome: "Pintura Técnica" },
    { id: 3, nome: "Senai" },
  ],
};

function criarFuncao(documentos: FuncaoProfissional["documentos"]): FuncaoProfissional {
  return {
    uuid: "funcao-1",
    nome_cargo: "Pintor",
    uuid_cargo: "cargo-1",
    documentos,
  };
}

const documentoPintura = {
  uuid: "documento-1",
  nome_documento: "Pintura Técnica",
  nome_original: "pintura.pdf",
  arquivo: "https://example.com/pintura.pdf",
  tipo: "documento",
  tipo_mime: "application/pdf",
  tamanho_bytes: 10,
};

describe("obterRotulosDocumentos", () => {
  it("usa os documentos do cargo em um vínculo novo", () => {
    expect(obterRotulosDocumentos({ cargo, uuidCargo: "cargo-1" })).toEqual([
      "Belas Artes",
      "Pintura Técnica",
      "Senai",
    ]);
  });

  it("mantém os documentos salvos enquanto o cargo é o mesmo do vínculo", () => {
    const funcaoSalva = criarFuncao([documentoPintura]);

    expect(obterRotulosDocumentos({ cargo, funcaoSalva, uuidCargo: "cargo-1" })).toEqual([
      "Pintura Técnica",
    ]);
  });

  it("não exibe documentos quando o vínculo salvo não tinha nenhum", () => {
    const funcaoSalva = criarFuncao([]);

    expect(obterRotulosDocumentos({ cargo, funcaoSalva, uuidCargo: "cargo-1" })).toEqual([]);
  });

  it("usa os documentos do novo cargo quando o cargo é trocado", () => {
    const funcaoSalva = criarFuncao([documentoPintura]);

    expect(obterRotulosDocumentos({ cargo, funcaoSalva, uuidCargo: "cargo-2" })).toHaveLength(3);
  });

  it("segue o cargo atual em vínculos antigos sem o nome do documento", () => {
    const funcaoSalva = criarFuncao([{ ...documentoPintura, nome_documento: undefined }]);

    expect(obterRotulosDocumentos({ cargo, funcaoSalva, uuidCargo: "cargo-1" })).toHaveLength(3);
  });

  it("não retorna documentos quando o cargo não exige anexo", () => {
    expect(
      obterRotulosDocumentos({
        cargo: { exige_documento: false, documentos: [] },
        uuidCargo: "cargo-2",
      }),
    ).toEqual([]);
    expect(obterRotulosDocumentos({ uuidCargo: undefined })).toEqual([]);
  });
});

describe("mapearDocumentosSalvos", () => {
  it("converte os documentos salvos para os valores do formulário", () => {
    expect(mapearDocumentosSalvos(criarFuncao([documentoPintura]))).toEqual([
      {
        uuid: "documento-1",
        nome_documento: "Pintura Técnica",
        nome_original: "pintura.pdf",
        arquivo_url: "https://example.com/pintura.pdf",
        arquivo: [],
      },
    ]);
  });

  it("retorna lista vazia quando a função não tem documentos", () => {
    const funcao = { ...criarFuncao([]), documentos: undefined } as unknown as FuncaoProfissional;

    expect(mapearDocumentosSalvos(funcao)).toEqual([]);
  });
});
