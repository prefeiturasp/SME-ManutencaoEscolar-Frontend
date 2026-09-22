export type ResponsavelUnidadeEducacional = {
  responsavel: {
    registro_funcional: string;
    nome: string;
    email: string;
    telefone: string;
    celular: string;
  };
  cargo: {
    codigo: string;
    nome: string;
  };
  ativo: boolean;
};


export interface ResponsavelExistentePayload {
  email: string;
  telefone: string;
  celular: string;
}

export interface NovoResponsavelPayload {
  registro_funcional: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  celular: string;
}
