import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { FUNCIONALIDADES } from "@/constants/funcionalidades";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { usePermissoes } from "../usePermissoes";

const base = {
  nome: "Ana",
  codigoRfOuCpf: "1234567",
  cargo: "ADM",
  diretoriaRegional: null,
  unidadeEducacional: null,
};

describe("usePermissoes", () => {
  beforeEach(() => {
    localStorage.clear();
    useUsuarioStore.setState({ usuario: null });
  });

  it("não libera nada sem usuário autenticado", () => {
    const { result } = renderHook(() => usePermissoes());

    expect(result.current.temAcesso(FUNCIONALIDADES.CADASTROS)).toBe(false);
  });

  it("libera somente as funcionalidades do usuário", () => {
    useUsuarioStore.setState({
      usuario: { ...base, funcionalidades: [FUNCIONALIDADES.RELATORIOS] },
    });

    const { result } = renderHook(() => usePermissoes());

    expect(result.current.temAcesso(FUNCIONALIDADES.RELATORIOS)).toBe(true);
    expect(result.current.temAcesso(FUNCIONALIDADES.CADASTROS)).toBe(false);
  });

  it("trata usuário salvo antes das permissões como sem acesso", () => {
    useUsuarioStore.setState({ usuario: base as never });

    const { result } = renderHook(() => usePermissoes());

    expect(result.current.temAcesso(FUNCIONALIDADES.SOLICITACAO_MANUTENCAO)).toBe(false);
  });
});
