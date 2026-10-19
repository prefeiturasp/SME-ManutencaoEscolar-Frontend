import type { UnidadeEducacional } from "@/features/unidade_educacional/types/unidadesEducacionais.types";

export type LoginCredenciais = {
  login: string;
  senha: string;
};

export type LoginUser = {
  nome: string;
  codigoRfOuCpf: string;
  cargo: string;
  diretoriaRegional: string | null;
  unidadeEducacional: UnidadeEducacionalUsuario | string | null;
};

export type ResultadoLogin =
  | {
      success: true;
      user: LoginUser;
    }
  | {
      success: false;
      error: string;
    };

export type Perfil = {
  codigo: string;
  descricao: string;
};

export type PerfilAcesso = {
  cargo: string;
  perfil: Perfil;
};

export type Usuario = {
  id: number;
  uuid: string;
  nome: string;
  email: string;
  registro_funcional: string | null;
  cpf: string | null;
  username: string;
  perfil_acesso: PerfilAcesso;
  diretoria_regional: string | null;
  unidade_educacional: UnidadeEducacionalUsuario | string | null;
};

export type LoginApiResponse = {
  access: string;
  refresh: string;
  usuario: Usuario;
};
export type UnidadeEducacionalUsuario = Pick<
  UnidadeEducacional,
  "id" | "uuid" | "codigo_eol" | "nome"
> & {
  diretoria_regional?: Partial<NonNullable<UnidadeEducacional["diretoria_regional"]>> | null;
  tipo_escola?: Partial<NonNullable<UnidadeEducacional["tipo_escola"]>> | null;
  subprefeitura?: Partial<NonNullable<UnidadeEducacional["subprefeitura"]>> | null;
  lote?: Partial<NonNullable<UnidadeEducacional["lote"]>> | null;
  dados?: Partial<NonNullable<UnidadeEducacional["dados"]>> | null;
  status?: boolean;
};
