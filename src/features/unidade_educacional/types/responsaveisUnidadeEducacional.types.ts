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