export type LoginCredentials = {
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

export type LoginResult =
  | {
      success: true;
      user: LoginUser;
    }
  | {
      success: false;
      error: string;
    };
