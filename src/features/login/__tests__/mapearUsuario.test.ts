import { describe, expect, it } from "vitest";

import type { Usuario } from "../types/login.types";
import { mapearUsuario } from "../utils/mapearUsuario";

const usuarioApi: Usuario = {
  id: 1,
  uuid: "2e7d7d7d-9b8b-4c92-9b3b-123456789abc",
  nome: "Maria Souza",
  email: "maria@email.com",
  registro_funcional: "1234567",
  cpf: "12345678901",
  username: "1234567",
  perfil_acesso: {
    cargo: "DIRETOR DE ESCOLA",
    perfil: { codigo: "UE", descricao: "Diretor Unidade Educacional" },
  },
  funcionalidades: ["RELATORIOS", "SOLICITACAO_MANUTENCAO"],
  diretoria_regional: "DRE Centro",
  unidade_educacional: null,
};

describe("mapearUsuario", () => {
  it("converte o usuário da API para o formato da aplicação", () => {
    expect(mapearUsuario(usuarioApi)).toEqual({
      id: 1,
      uuid: "2e7d7d7d-9b8b-4c92-9b3b-123456789abc",
      nome: "Maria Souza",
      email: "maria@email.com",
      codigoRfOuCpf: "1234567",
      registroFuncional: "1234567",
      cpf: "12345678901",
      cargo: "DIRETOR DE ESCOLA",
      perfil: { codigo: "UE", descricao: "Diretor Unidade Educacional" },
      diretoriaRegional: "DRE Centro",
      unidadeEducacional: null,
      funcionalidades: ["RELATORIOS", "SOLICITACAO_MANUTENCAO"],
    });
  });

  it("usa valores padrão para usuário sem cargo e sem funcionalidades", () => {
    const resultado = mapearUsuario({
      ...usuarioApi,
      perfil_acesso: {},
      funcionalidades: undefined as unknown as Usuario["funcionalidades"],
    });

    expect(resultado).toMatchObject({ cargo: "", perfil: null, funcionalidades: [] });
  });

  it("usa valores padrão quando o perfil de acesso não é informado", () => {
    const resultado = mapearUsuario({
      ...usuarioApi,
      perfil_acesso: undefined as unknown as Usuario["perfil_acesso"],
    });

    expect(resultado).toMatchObject({ cargo: "", perfil: null });
  });
});
