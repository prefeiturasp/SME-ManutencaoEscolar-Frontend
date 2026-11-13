import type { DiretoriaRegional, LoginUser } from "@/features/login/types/login.types";

export const PERFIL_NAO_INFORMADO = "Cargo não informado";

const NOME_PERFIL_SME = "Admin";
const NOME_PERFIL_EMPRESA = "Empresa";

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

  const rotulo = codigo.replace(/\D/g, "").length === 11 ? "CPF" : "RF";
  return `${rotulo}: ${codigo}`;
}

/**
 * Define o nome do perfil exibido no card do usuário logado, conforme o login:
 * - UE: cargo do usuário (diretor, secretário...);
 * - DRE: a DRE do usuário;
 * - SME/GME: Admin;
 * - Empresa: Empresa.
 */
export function obterNomePerfil(usuario?: LoginUser | null) {
  if (!usuario) return PERFIL_NAO_INFORMADO;

  const cargo = limpar(usuario.cargo);
  const descricaoPerfil = limpar(usuario.perfil?.descricao);

  switch (usuario.perfil?.codigo) {
    case "SME":
      return NOME_PERFIL_SME;
    case "EMPRESA":
      return NOME_PERFIL_EMPRESA;
    case "DRE":
      return (
        obterNomeDiretoriaRegional(usuario.diretoriaRegional) ||
        cargo ||
        descricaoPerfil ||
        PERFIL_NAO_INFORMADO
      );
    default:
      return cargo || descricaoPerfil || PERFIL_NAO_INFORMADO;
  }
}
