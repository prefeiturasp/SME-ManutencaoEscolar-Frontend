export type AlterarSenhaCredenciais = {
  registro_funcional_ou_cpf: string;
  token: string;
  senha: string;
  confirmacao_senha: string;
};

export type ResultadoAlterarSenha =
  | {
      success: true;
    }
  | {
      success: false;
      title: string;
      detail: string;
    };

export type ResultadoRedefinicao =
  | {
      tipo: "sucesso";
    }
  | {
      tipo: "token-expirado";
      title: string;
      detail: string;
    }
  | null;

export type ErroApi = {
  title: string;
  detail: string;
};

export type RedefinirSenhaFormProps = Readonly<{
  token: string;
  id: string;
}>;
