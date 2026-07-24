export type LoginCredenciais = {
  login: string;
  senha: string;
};

export type LoginUser = {
  nome: string;
  codigoRfOuCpf: string;
  cargo: string;
  diretoriaRegional: string | null;
  unidadeEducacional: string | null;
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
  unidade_educacional: string | null;
};

export type LoginApiResponse = {
  access: string;
  refresh: string;
  usuario: Usuario;
};