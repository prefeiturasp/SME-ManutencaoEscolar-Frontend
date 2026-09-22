import { describe, expect, it } from "vitest";
import { montarPayloadAtualizacao } from "../../components/form/unidadeEducacionalForm.utils";
import { UnidadeEducacionalSchema } from "../../schemas/unidadesEducacionais.schema";


const DADOS_UNIDADE: UnidadeEducacionalSchema = {
  codigo_eol: "123456",
  tipo_escola: "EMEF",
  diretoria_regional: "DRE",
  nome: "EMEF Teste",
  subprefeitura: "SUBPREFEITURA",
  lote: "LOTE",
  status: true,
  email: "unidade@example.com",
  telefone: "1133334444",
  cep: "01234567",
  logradouro: "Rua Teste",
  numero: "100",
  bairro: "Centro",
  cidade: "São Paulo",
  estado: "SP",
  responsaveis: [],
};

describe("unidadeEducacionalForm.utils", () => {
  describe("montarPayloadAtualizacao", () => {
    it("deve enviar somente os campos permitidos da unidade", () => {
      const resultado = montarPayloadAtualizacao({
        ...DADOS_UNIDADE,
        responsaveis: [],
      });

      expect(resultado).toEqual({
        email: "unidade@example.com",
        telefone: "1133334444",
        status: true,
        responsaveis: [],
      });
    });

    it("deve enviar somente os campos permitidos de um responsável existente", () => {
      const resultado = montarPayloadAtualizacao({
        ...DADOS_UNIDADE,
        responsaveis: [
          {
            registro_funcional: "1234567",
            nome: "João da Silva",
            cargo: "DIRETOR",
            email: "joao@example.com",
            telefone: "1133334444",
            celular: "11999998888",
            responsavelExistente: true,
          },
        ],
      });

      expect(resultado.responsaveis).toEqual([
        {
          email: "joao@example.com",
          telefone: "1133334444",
          celular: "11999998888",
        },
      ]);
    });

    it("deve enviar todos os campos de um novo responsável", () => {
      const resultado = montarPayloadAtualizacao({
        ...DADOS_UNIDADE,
        responsaveis: [
          {
            registro_funcional: "7654321",
            nome: "Maria da Silva",
            cargo: "COORDENADOR",
            email: "maria@example.com",
            telefone: "1122223333",
            celular: "11988887777",
            responsavelExistente: false,
          },
        ],
      });

      expect(resultado.responsaveis).toEqual([
        {
          registro_funcional: "7654321",
          nome: "Maria da Silva",
          cargo: "COORDENADOR",
          email: "maria@example.com",
          telefone: "1122223333",
          celular: "11988887777",
        },
      ]);
    });

    it("deve montar corretamente responsáveis existentes e novos", () => {
      const resultado = montarPayloadAtualizacao({
        ...DADOS_UNIDADE,
        responsaveis: [
          {
            registro_funcional: "1234567",
            nome: "João da Silva",
            cargo: "DIRETOR",
            email: "joao@example.com",
            telefone: "1133334444",
            celular: "11999998888",
            responsavelExistente: true,
          },
          {
            registro_funcional: "7654321",
            nome: "Maria da Silva",
            cargo: "COORDENADOR",
            email: "maria@example.com",
            telefone: "1122223333",
            celular: "11988887777",
            responsavelExistente: false,
          },
        ],
      });

      expect(resultado.responsaveis).toEqual([
        {
          email: "joao@example.com",
          telefone: "1133334444",
          celular: "11999998888",
        },
        {
          registro_funcional: "7654321",
          nome: "Maria da Silva",
          cargo: "COORDENADOR",
          email: "maria@example.com",
          telefone: "1122223333",
          celular: "11988887777",
        },
      ]);
    });

    it("deve remover a máscara do telefone e celular", () => {
      const resultado = montarPayloadAtualizacao({
        ...DADOS_UNIDADE,
        telefone: "1133334444",
        responsaveis: [
          {
            registro_funcional: "1234567",
            nome: "João da Silva",
            cargo: "DIRETOR",
            email: "joao@example.com",
            telefone: "1199998888",
            celular: "11999997777",
            responsavelExistente: false,
          },
        ],
      });

      expect(resultado.telefone).toBe("1133334444");
      expect(resultado.responsaveis[0]).toMatchObject({
        telefone: "1199998888",
        celular: "11999997777",
      });
    });
  });
});