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
