export type RecuperarSenhaCredenciais = {
  login: string;
};

export type ResultadoRecuperarSenha =
  | {
      success: true;
      email: string;
    }
  | {
      success: false;
      title: string;
      detail: string;
    };

export type RecuperarSenhaApiResponse = {
  email: string;
};

export type RecuperarSenhaApiError = {
  title?: string;
  detail?: string;
};
