import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  EditarServicosManutencao,
  type ServicoEmEdicao,
} from "../components/form/EditarServicosManutencao";
import { ServicosManutencao } from "../components/form/ServicosManutencao";
import type { ServicoManutencao } from "../types/solicitacaoManutencao.types";

vi.mock("../components/form/ServicosManutencao", () => ({ ServicosManutencao: vi.fn(() => null) }));
beforeEach(() => vi.clearAllMocks());

const original: ServicoEmEdicao = {
  uuid: "item1",
  chave: "chave1",
  servico_uuid: "pintura",
  nome_servico: "Pintura",
  servico_especifico: "",
  local_reparo: "Sala",
  descricao: "Parede",
  arquivos: [{ uuid: "foto1", arquivo: "/foto.jpg" }],
  novosArquivos: [],
};

function preparar(valor: ServicoEmEdicao[] = [original]) {
  const onChange = vi.fn();
  render(<EditarServicosManutencao valor={valor} onChange={onChange} />);
  const props = vi.mocked(ServicosManutencao).mock.calls[0][0];
  return { props, onChange };
}

describe("EditarServicosManutencao", () => {
  it("converte serviços e anexos existentes para o formulário", () => {
    const { props } = preparar();
    expect(props.valor).toEqual([
      {
        id: "chave1",
        servico: "pintura",
        nome_servico: "Pintura",
        servico_especifico: "",
        local_reparo: "Sala",
        descricao: "Parede",
        arquivos: [],
        arquivosExistentes: original.arquivos,
      },
    ]);
    expect(props.exibirGaleria).toBe(true);
    expect(props.exibirVisualizacao).toBe(true);
  });

  it("converte campos nulos para Outros e valores opcionais", () => {
    const { props } = preparar([
      { ...original, servico_uuid: null, nome_servico: null, servico_especifico: null },
    ]);
    expect(props.valor![0]).toEqual(
      expect.objectContaining({
        servico: "outros",
        nome_servico: undefined,
        servico_especifico: undefined,
      }),
    );
  });

  it.each([
    {
      servico: "outros",
      servico_especifico: "Vidraçaria",
      esperadoNome: null,
      esperadoEspecifico: "Vidraçaria",
    },
    { servico: "outros", esperadoNome: null, esperadoEspecifico: "" },
    { servico: "pintura", esperadoNome: "Pintura", esperadoEspecifico: "" },
    { servico: "eletrica", esperadoNome: null, esperadoEspecifico: "" },
    {
      servico: "eletrica",
      nome_servico: "Elétrica",
      esperadoNome: "Elétrica",
      esperadoEspecifico: "",
    },
  ])(
    "preserva ou redefine o nome ao alterar para $servico ($esperadoNome)",
    ({ esperadoNome, esperadoEspecifico, ...mudanca }) => {
      const { props, onChange } = preparar();
      const arquivo = new File(["nova"], "nova.jpg");
      props.onChange!([
        {
          ...props.valor![0],
          nome_servico: undefined,
          servico_especifico: undefined,
          ...mudanca,
          arquivos: [arquivo],
        },
      ]);
      expect(onChange).toHaveBeenCalledWith([
        expect.objectContaining({
          uuid: "item1",
          chave: "chave1",
          servico_uuid: mudanca.servico === "outros" ? null : mudanca.servico,
          nome_servico: esperadoNome,
          servico_especifico: esperadoEspecifico,
          arquivos: original.arquivos,
          novosArquivos: [arquivo],
        }),
      ]);
    },
  );

  it("adiciona um serviço novo sem herdar identidade ou anexos de outro item", () => {
    const { props, onChange } = preparar();
    const novo: ServicoManutencao = {
      id: "novo",
      servico: "pintura",
      local_reparo: "Quadra",
      descricao: "Reparar",
      arquivos: [],
    };
    props.onChange!([novo]);
    expect(onChange).toHaveBeenCalledWith([
      {
        chave: "novo",
        servico_uuid: "pintura",
        nome_servico: null,
        servico_especifico: "",
        local_reparo: "Quadra",
        descricao: "Reparar",
        arquivos: [],
        novosArquivos: [],
      },
    ]);
  });
});
