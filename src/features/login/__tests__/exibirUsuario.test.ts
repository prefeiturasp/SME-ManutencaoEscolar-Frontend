import { describe, expect, it } from "vitest";

import type { LoginUser } from "@/features/login/types/login.types";
import {
  obterIdentificacaoUsuario,
  obterNomePerfil,
} from "@/features/login/utils/exibirUsuario";

function criarUsuario(sobrescrever: Partial<LoginUser> = {}): LoginUser {
  return {
    nome: "João Gabriel de Almeida",
    codigoRfOuCpf: "1234567",
    cargo: "DIRETOR DE ESCOLA",
    perfil: { codigo: "UE", descricao: "Diretor Unidade Educacional" },
    diretoriaRegional: null,
    unidadeEducacional: null,
    funcionalidades: [],
    ...sobrescrever,
  };
}

describe("obterIdentificacaoUsuario", () => {
  it("exibe o RF quando o login é um registro funcional", () => {
    expect(obterIdentificacaoUsuario("1234567")).toBe("RF: 1234567");
  });

  it.each(["12345678901", "123.456.789-01"])("exibe o CPF quando o login é %s", (cpf) => {
    expect(obterIdentificacaoUsuario(cpf)).toBe(`CPF: ${cpf}`);
  });

  it.each([undefined, null, "", "   "])("informa quando não há identificação (%j)", (valor) => {
    expect(obterIdentificacaoUsuario(valor)).toBe("RF: Não informado");
  });
});

describe("obterNomePerfil", () => {
  it("exibe o cargo do usuário da unidade escolar", () => {
    expect(obterNomePerfil(criarUsuario())).toBe("DIRETOR DE ESCOLA");
  });

  it("usa a descrição do perfil quando a unidade escolar não tem cargo", () => {
    expect(obterNomePerfil(criarUsuario({ cargo: "" }))).toBe("Diretor Unidade Educacional");
  });

  it.each([
    [{ nome_curto: "DRE Centro", nome: "DIRETORIA REGIONAL DE EDUCACAO CENTRO" }, "DRE Centro"],
    [{ nome: "DIRETORIA REGIONAL DE EDUCACAO CENTRO", abreviacao: "CT" }, "DIRETORIA REGIONAL DE EDUCACAO CENTRO"],
    [{ abreviacao: "CT" }, "CT"],
    ["DRE Norte", "DRE Norte"],
  ])("exibe a DRE do usuário da DRE (%j)", (diretoria, esperado) => {
    const usuario = criarUsuario({
      perfil: { codigo: "DRE", descricao: "Diretoria Regional de Educação" },
      cargo: "GESTOR DRE",
      diretoriaRegional: diretoria,
    });

    expect(obterNomePerfil(usuario)).toBe(esperado);
  });

  it("usa o cargo da DRE quando o usuário não tem DRE vinculada", () => {
    const usuario = criarUsuario({
      perfil: { codigo: "DRE", descricao: "Diretoria Regional de Educação" },
      cargo: "GESTOR DRE",
    });

    expect(obterNomePerfil(usuario)).toBe("GESTOR DRE");
  });

  it("usa a descrição do perfil da DRE quando não há DRE nem cargo", () => {
    const usuario = criarUsuario({
      perfil: { codigo: "DRE", descricao: "Diretoria Regional de Educação" },
      cargo: "",
      diretoriaRegional: { nome: "   " },
    });

    expect(obterNomePerfil(usuario)).toBe("Diretoria Regional de Educação");
  });

  it("exibe Admin para o usuário SME/GME", () => {
    const usuario = criarUsuario({
      perfil: { codigo: "SME", descricao: "SME / GME" },
      cargo: "ASSISTENTE DE GESTAO",
    });

    expect(obterNomePerfil(usuario)).toBe("Admin");
  });

  it("exibe Empresa para o usuário de empresa", () => {
    const usuario = criarUsuario({
      perfil: { codigo: "EMPRESA", descricao: "Empresa" },
      cargo: "",
    });

    expect(obterNomePerfil(usuario)).toBe("Empresa");
  });

  it("usa o cargo quando o perfil não foi informado", () => {
    expect(obterNomePerfil(criarUsuario({ perfil: null, cargo: "Empresa" }))).toBe("Empresa");
  });

  it.each([undefined, null])("informa quando não há usuário (%j)", (usuario) => {
    expect(obterNomePerfil(usuario)).toBe("Cargo não informado");
  });

  it("informa quando não há perfil nem cargo", () => {
    expect(obterNomePerfil(criarUsuario({ perfil: null, cargo: "" }))).toBe("Cargo não informado");
  });
});
