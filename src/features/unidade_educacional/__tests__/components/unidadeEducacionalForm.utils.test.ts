import { describe, expect, it } from "vitest";

import {
  camposEstaoPreenchidos,
  montarPayloadAtualizacao,
} from "../../components/form/unidadeEducacionalForm.utils";
import type { UnidadeEducacionalSchema } from "../../schemas/unidadesEducacionais.schema";

const DADOS_UNIDADE: UnidadeEducacionalSchema = {
  codigo_eol: "123456",
  tipo_escola: "EMEF",
  diretoria_regional: "DRE",
  nome: "EMEF Teste",
  subprefeitura: "SUBPREFEITURA",
  lote: "LOTE",
  status: "true",
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
  describe("camposEstaoPreenchidos", () => {
    it("deve retornar false quando a lista de campos estiver vazia", () => {
      const resultado = camposEstaoPreenchidos(DADOS_UNIDADE, []);

      expect(resultado).toBe(false);
    });

    it("deve retornar true quando todos os campos informados estiverem preenchidos", () => {
      const resultado = camposEstaoPreenchidos(DADOS_UNIDADE, [
        "codigo_eol",
        "tipo_escola",
        "nome",
      ]);

      expect(resultado).toBe(true);
    });

    it("deve retornar false quando algum campo estiver vazio", () => {
      const resultado = camposEstaoPreenchidos(
        {
          ...DADOS_UNIDADE,
          nome: "",
        },
        ["codigo_eol", "tipo_escola", "nome"],
      );

      expect(resultado).toBe(false);
    });

    it("deve considerar campos contendo apenas espaços como vazios", () => {
      const resultado = camposEstaoPreenchidos(
        {
          ...DADOS_UNIDADE,
          nome: "   ",
        },
        ["nome"],
      );

      expect(resultado).toBe(false);
    });

    it("deve retornar false quando o campo não for uma string preenchida", () => {
      const resultado = camposEstaoPreenchidos(
        {
          ...DADOS_UNIDADE,
          nome: undefined,
        },
        ["nome"],
      );

      expect(resultado).toBe(false);
    });

    it("deve retornar false quando responsaveis não estiver informado", () => {
      const resultado = camposEstaoPreenchidos(
        {
          ...DADOS_UNIDADE,
          responsaveis: undefined,
        },
        ["responsaveis"],
      );

      expect(resultado).toBe(false);
    });

    it("deve retornar false quando não houver responsáveis", () => {
      const resultado = camposEstaoPreenchidos(
        {
          ...DADOS_UNIDADE,
          responsaveis: [],
        },
        ["responsaveis"],
      );

      expect(resultado).toBe(false);
    });

    it("deve retornar true quando todos os campos obrigatórios do responsável estiverem preenchidos", () => {
      const resultado = camposEstaoPreenchidos(
        {
          ...DADOS_UNIDADE,
          responsaveis: [
            {
              registro_funcional: "1234567",
              nome: "João da Silva",
              cargo: "DIRETOR",
              email: "joao@example.com",
              telefone: "",
              celular: "",
              criado_pelo_sincronizador: false,
            },
          ],
        },
        ["responsaveis"],
      );

      expect(resultado).toBe(true);
    });

    it("deve retornar false quando o registro funcional do responsável estiver vazio", () => {
      const resultado = camposEstaoPreenchidos(
        {
          ...DADOS_UNIDADE,
          responsaveis: [
            {
              registro_funcional: "",
              nome: "João da Silva",
              cargo: "DIRETOR",
              email: "joao@example.com",
              telefone: "",
              celular: "",
              criado_pelo_sincronizador: false,
            },
          ],
        },
        ["responsaveis"],
      );

      expect(resultado).toBe(false);
    });

    it("deve retornar false quando o nome do responsável estiver vazio", () => {
      const resultado = camposEstaoPreenchidos(
        {
          ...DADOS_UNIDADE,
          responsaveis: [
            {
              registro_funcional: "1234567",
              nome: "",
              cargo: "DIRETOR",
              email: "joao@example.com",
              telefone: "",
              celular: "",
              criado_pelo_sincronizador: false,
            },
          ],
        },
        ["responsaveis"],
      );

      expect(resultado).toBe(false);
    });

    it("deve retornar false quando o cargo do responsável estiver vazio", () => {
      const resultado = camposEstaoPreenchidos(
        {
          ...DADOS_UNIDADE,
          responsaveis: [
            {
              registro_funcional: "1234567",
              nome: "João da Silva",
              cargo: "",
              email: "joao@example.com",
              telefone: "",
              celular: "",
              criado_pelo_sincronizador: false,
            },
          ],
        },
        ["responsaveis"],
      );

      expect(resultado).toBe(false);
    });

    it("deve retornar false quando o e-mail do responsável estiver vazio", () => {
      const resultado = camposEstaoPreenchidos(
        {
          ...DADOS_UNIDADE,
          responsaveis: [
            {
              registro_funcional: "1234567",
              nome: "João da Silva",
              cargo: "DIRETOR",
              email: "",
              telefone: "",
              celular: "",
              criado_pelo_sincronizador: false,
            },
          ],
        },
        ["responsaveis"],
      );

      expect(resultado).toBe(false);
    });

    it("deve retornar false quando um dos responsáveis possuir campo obrigatório vazio", () => {
      const resultado = camposEstaoPreenchidos(
        {
          ...DADOS_UNIDADE,
          responsaveis: [
            {
              registro_funcional: "1234567",
              nome: "João da Silva",
              cargo: "DIRETOR",
              email: "joao@example.com",
              telefone: "",
              celular: "",
              criado_pelo_sincronizador: false,
            },
            {
              registro_funcional: "7654321",
              nome: "Maria da Silva",
              cargo: "",
              email: "maria@example.com",
              telefone: "",
              celular: "",
              criado_pelo_sincronizador: false,
            },
          ],
        },
        ["responsaveis"],
      );

      expect(resultado).toBe(false);
    });

    it("deve considerar somente os campos obrigatórios do responsável", () => {
      const resultado = camposEstaoPreenchidos(
        {
          ...DADOS_UNIDADE,
          responsaveis: [
            {
              registro_funcional: "1234567",
              nome: "João da Silva",
              cargo: "DIRETOR",
              email: "joao@example.com",
              telefone: "",
              celular: "",
              criado_pelo_sincronizador: true,
            },
          ],
        },
        ["responsaveis"],
      );

      expect(resultado).toBe(true);
    });
  });

  describe("montarPayloadAtualizacao", () => {
    it("deve enviar somente os campos permitidos da unidade", () => {
      const resultado = montarPayloadAtualizacao(DADOS_UNIDADE);

      expect(resultado).toEqual({
        email: "unidade@example.com",
        telefone: "1133334444",
        ativo: true,
        responsaveis: [],
      });
    });

    it("deve enviar ativo como false quando o status for false", () => {
      const resultado = montarPayloadAtualizacao({
        ...DADOS_UNIDADE,
        status: "false",
      });

      expect(resultado.ativo).toBe(false);
    });

    it("deve enviar todos os campos de um responsável existente", () => {
      const resultado = montarPayloadAtualizacao({
        ...DADOS_UNIDADE,
        responsaveis: [
          {
            uuid: "b5c5a1b0-6b5e-4a7e-9b6f-123456789abc",
            registro_funcional: "1234567",
            nome: "João da Silva",
            cargo: "DIRETOR",
            email: "joao@example.com",
            telefone: "1133334444",
            celular: "11999998888",
            criado_pelo_sincronizador: true,
          },
        ],
      });

      expect(resultado.responsaveis).toEqual([
        {
          uuid: "b5c5a1b0-6b5e-4a7e-9b6f-123456789abc",
          registro_funcional: "1234567",
          nome: "João da Silva",
          cargo: "DIRETOR",
          email: "joao@example.com",
          telefone: "1133334444",
          celular: "11999998888",
          criado_pelo_sincronizador: true,
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
            criado_pelo_sincronizador: false,
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
          criado_pelo_sincronizador: false,
        },
      ]);
    });

    it("deve montar corretamente responsáveis existentes e novos", () => {
      const resultado = montarPayloadAtualizacao({
        ...DADOS_UNIDADE,
        responsaveis: [
          {
            uuid: "uuid-responsavel-existente",
            registro_funcional: "1234567",
            nome: "João da Silva",
            cargo: "DIRETOR",
            email: "joao@example.com",
            telefone: "1133334444",
            celular: "11999998888",
            criado_pelo_sincronizador: true,
          },
          {
            registro_funcional: "7654321",
            nome: "Maria da Silva",
            cargo: "COORDENADOR",
            email: "maria@example.com",
            telefone: "1122223333",
            celular: "11988887777",
            criado_pelo_sincronizador: false,
          },
        ],
      });

      expect(resultado.responsaveis).toEqual([
        {
          uuid: "uuid-responsavel-existente",
          registro_funcional: "1234567",
          nome: "João da Silva",
          cargo: "DIRETOR",
          email: "joao@example.com",
          telefone: "1133334444",
          celular: "11999998888",
          criado_pelo_sincronizador: true,
        },
        {
          registro_funcional: "7654321",
          nome: "Maria da Silva",
          cargo: "COORDENADOR",
          email: "maria@example.com",
          telefone: "1122223333",
          celular: "11988887777",
          criado_pelo_sincronizador: false,
        },
      ]);
    });

    it("deve não enviar uuid quando o responsável não possuir uuid", () => {
      const resultado = montarPayloadAtualizacao({
        ...DADOS_UNIDADE,
        responsaveis: [
          {
            registro_funcional: "7654321",
            nome: "Maria da Silva",
            cargo: "COORDENADOR",
            email: "maria@example.com",
            telefone: "",
            celular: "",
            criado_pelo_sincronizador: false,
          },
        ],
      });

      expect(resultado.responsaveis[0]).not.toHaveProperty("uuid");
    });

    it("deve preservar os telefones sem máscara", () => {
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
            criado_pelo_sincronizador: false,
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