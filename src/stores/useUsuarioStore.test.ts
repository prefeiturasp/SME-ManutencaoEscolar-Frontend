import { beforeEach, describe, expect, it } from "vitest";

import type { LoginUser } from "@/features/login/types/login.types";
import { useUsuarioStore } from "./useUsuarioStore";

const usuarioMock: LoginUser = {
  nome: "Mário de Almeida Silva",
  codigoRfOuCpf: "1234567",
  cargo: "Fornecedor",
  diretoriaRegional: null,
  unidadeEducacional: null,
};

describe("useUsuarioStore", () => {
  beforeEach(() => {
    useUsuarioStore.setState({
      usuario: null,
    });

    localStorage.clear();
  });

  it("deve iniciar com usuário nulo", () => {
    const estado = useUsuarioStore.getState();

    expect(estado.usuario).toBeNull();
  });

  it("deve definir o usuário", () => {
    useUsuarioStore.getState().definirUsuario(usuarioMock);

    const estado = useUsuarioStore.getState();

    expect(estado.usuario).toEqual(usuarioMock);
  });

  it("deve limpar o usuário", () => {
    useUsuarioStore.getState().definirUsuario(usuarioMock);

    expect(useUsuarioStore.getState().usuario).toEqual(usuarioMock);

    useUsuarioStore.getState().limparUsuario();

    expect(useUsuarioStore.getState().usuario).toBeNull();
  });

  it("deve persistir o usuário no localStorage", () => {
    useUsuarioStore.getState().definirUsuario(usuarioMock);

    const dadosPersistidos = localStorage.getItem("usuario-logado");

    expect(dadosPersistidos).not.toBeNull();

    expect(JSON.parse(dadosPersistidos as string)).toEqual({
      state: {
        usuario: usuarioMock,
      },
      version: 0,
    });
  });

  it("deve atualizar o usuário persistido ao limpar", () => {
    useUsuarioStore.getState().definirUsuario(usuarioMock);
    useUsuarioStore.getState().limparUsuario();

    const dadosPersistidos = localStorage.getItem("usuario-logado");

    expect(dadosPersistidos).not.toBeNull();

    expect(JSON.parse(dadosPersistidos as string)).toEqual({
      state: {
        usuario: null,
      },
      version: 0,
    });
  });
});
