export type LoginCredentials = {
  login: string;
  senha: string;
};

export type LoginUser = {
  usuarioId: string;
  status: number;
  nome: string;
  codigoRf: string;
};

export type LoginSuccess = {
  success: true;
  user: LoginUser;
};

export type LoginResult =
  | {
      success: true;
      user: LoginUser;
    }
  | {
      success: false;
      error: "invalid-credentials" | "inactive-user" | "server-error";
    };
