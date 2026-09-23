export type ResponsavelUnidadeEducacional = {
  uuid: string;
  registro_funcional: string;
  nome: string;
  email: string;
  telefone: string;
  celular: string;
  cargo: {
    codigo: string;
    nome: string;
  };
  ativo: boolean;
  criado_pelo_sincronizador: boolean;
};

export interface ResponsavelPayload {
  uuid?: string;
  registro_funcional: string;
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  celular: string;
  criado_pelo_sincronizador: boolean;
}
