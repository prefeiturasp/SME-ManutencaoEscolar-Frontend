import { describe, expect, it } from "vitest";

import type { FuncaoProfissional } from "@/features/profissional/types/profissional.types";
import {
  criarDocumentosDoCargo,
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

const documentoPintura = {
  uuid: "documento-1",
  nome_original: "pintura.pdf",
  arquivo: "https://example.com/pintura.pdf",
  tipo: "documento",
  tipo_mime: "application/pdf",
  tamanho_bytes: 10,
};

function criarFuncao(
  documentosExigidos: NonNullable<FuncaoProfissional["documentos_exigidos"]>,
): FuncaoProfissional {
  return {
    uuid: "funcao-1",
    nome_cargo: "Pintor",
    uuid_cargo: "cargo-1",
    documentos: [],
    documentos_exigidos: documentosExigidos,
  };
}

const exigidoPintura = {
  uuid: "exigido-1",
  nome: "Pintura Técnica",
  ordem: 1,
  documento: documentoPintura,
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
    const funcaoSalva = criarFuncao([exigidoPintura]);

    expect(obterRotulosDocumentos({ cargo, funcaoSalva, uuidCargo: "cargo-1" })).toEqual([
      "Pintura Técnica",
    ]);
  });

  it("não exibe documentos quando o vínculo salvo não tinha nenhum", () => {
    const funcaoSalva = criarFuncao([]);

    expect(obterRotulosDocumentos({ cargo, funcaoSalva, uuidCargo: "cargo-1" })).toEqual([]);
  });

  it("usa os documentos do novo cargo quando o cargo é trocado", () => {
    const funcaoSalva = criarFuncao([exigidoPintura]);

    expect(obterRotulosDocumentos({ cargo, funcaoSalva, uuidCargo: "cargo-2" })).toHaveLength(3);
  });

  it("mantém a ordem dos documentos exigidos gravada no vínculo", () => {
    const funcaoSalva = criarFuncao([
      { uuid: "e-1", nome: "RG", ordem: 1, documento: null },
      { uuid: "e-2", nome: "CPF", ordem: 2, documento: null },
      { uuid: "e-3", nome: "Senai", ordem: 3, documento: null },
    ]);

    expect(obterRotulosDocumentos({ cargo, funcaoSalva, uuidCargo: "cargo-1" })).toEqual([
      "RG",
      "CPF",
      "Senai",
    ]);
  });

  it("não exibe documentos quando o vínculo salvo não informa documentos exigidos", () => {
    const funcaoSalva = { ...criarFuncao([]), documentos_exigidos: undefined };

    expect(obterRotulosDocumentos({ cargo, funcaoSalva, uuidCargo: "cargo-1" })).toEqual([]);
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

describe("criarDocumentosDoCargo", () => {
  it("cria um espaço vazio por documento exigido, com o nome do documento", () => {
    expect(criarDocumentosDoCargo(cargo)).toEqual([
      { arquivo: [], nome_documento: "Belas Artes" },
      { arquivo: [], nome_documento: "Pintura Técnica" },
      { arquivo: [], nome_documento: "Senai" },
    ]);
  });

  it("não cria documentos quando o cargo não exige anexo ou não existe", () => {
    expect(criarDocumentosDoCargo({ exige_documento: false, documentos: [] })).toEqual([]);
    expect(criarDocumentosDoCargo()).toEqual([]);
  });
});

describe("mapearDocumentosSalvos", () => {
  it("converte os documentos exigidos para os valores do formulário", () => {
    expect(
      mapearDocumentosSalvos(
        criarFuncao([exigidoPintura, { uuid: "exigido-2", nome: "Senai", ordem: 2, documento: null }]),
      ),
    ).toEqual([
      {
        uuid: "documento-1",
        nome_documento: "Pintura Técnica",
        nome_original: "pintura.pdf",
        arquivo_url: "https://example.com/pintura.pdf",
        arquivo: [],
      },
      {
        uuid: undefined,
        nome_documento: "Senai",
        nome_original: undefined,
        arquivo_url: undefined,
        arquivo: [],
      },
    ]);
  });

  it("retorna lista vazia quando a função não tem documentos exigidos", () => {
    const funcao = { ...criarFuncao([]), documentos_exigidos: undefined };

    expect(mapearDocumentosSalvos(funcao)).toEqual([]);
  });
});
