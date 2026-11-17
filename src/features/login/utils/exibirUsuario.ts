import type { DiretoriaRegional, LoginUser } from "@/features/login/types/login.types";

export const PERFIL_NAO_INFORMADO = "Perfil não informado";

function limpar(valor?: string | null) {
  return valor?.trim() ?? "";
}

function obterNomeDiretoriaRegional(diretoria: LoginUser["diretoriaRegional"]) {
  if (typeof diretoria === "string") return limpar(diretoria);
  const { nome_curto, nome, abreviacao } = diretoria ?? ({} as DiretoriaRegional);
  return limpar(nome_curto) || limpar(nome) || limpar(abreviacao);
}

/**
 * Identifica o documento exibido no card do usuário: CPF (11 dígitos) ou RF.
 */
export function obterIdentificacaoUsuario(codigoRfOuCpf?: string | null) {
  const codigo = limpar(codigoRfOuCpf);
  if (!codigo) return "RF: Não informado";

  const rotulo = codigo.replaceAll(/\D/g, "").length === 11 ? "CPF" : "RF";
  return `${rotulo}: ${codigo}`;
}

/**
 * Define o nome do perfil exibido no card do usuário logado, conforme o login:
 * - UE: unidade educacional
 * - DRE: a DRE do usuário;
 * - SME/GME: SME/GME;
 * - Empresa: Empresa.
 */
export function obterNomePerfil(usuario?: LoginUser | null) {
  if (!usuario) return PERFIL_NAO_INFORMADO;

  const descricaoPerfil = limpar(usuario.perfil?.descricao);

  if (usuario.perfil?.codigo === "DRE") {
    return (
      obterNomeDiretoriaRegional(usuario.diretoriaRegional) ||
      descricaoPerfil ||
      PERFIL_NAO_INFORMADO
    );
  }

  return descricaoPerfil || PERFIL_NAO_INFORMADO;
}
