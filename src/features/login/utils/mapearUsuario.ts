import type { LoginUser, Usuario } from "@/features/login/types/login.types";

export function mapearUsuario(usuario: Usuario) {
  const { cargo, perfil } = usuario.perfil_acesso ?? {};

  return {
    id: usuario.id,
    uuid: usuario.uuid,
    nome: usuario.nome,
    email: usuario.email,
    codigoRfOuCpf: usuario.username,
    registroFuncional: usuario.registro_funcional,
    cpf: usuario.cpf,
    cargo: cargo ?? "",
    perfil: perfil ?? null,
    diretoriaRegional: usuario.diretoria_regional,
    unidadeEducacional: usuario.unidade_educacional,
    funcionalidades: usuario.funcionalidades ?? [],
  } satisfies LoginUser & Record<string, unknown>;
}
