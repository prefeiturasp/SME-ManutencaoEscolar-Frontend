import { expect, it } from "vitest";
import { prepararServicosEdicao } from "../utils/prepararServicosEdicao";

it.each(["outros", ""])(
  "envia serviço vazio para específico preenchido, anterior=%s",
  (servico) => {
    const item = {
      uuid: "item1",
      servico,
      servico_especifico: "Limpeza",
      local_reparo: "Sala",
      descricao: "Limpar",
      arquivos: [{ uuid: "anexo1" }],
    };
    expect(prepararServicosEdicao([item])).toEqual([{ ...item, servico: "" }]);
    expect(item.servico).toBe(servico);
  },
);

it.each([undefined, "", " ", "Nome específico anterior"])(
  "limpa o específico ao selecionar o catálogo: %s",
  (servico_especifico) => {
    const item = {
      uuid: "item1",
      servico: "catalogo",
      servico_especifico,
      local_reparo: "Sala",
      descricao: "Reparar",
      arquivos: [],
    };
    expect(prepararServicosEdicao([item])).toEqual([{ ...item, servico_especifico: "" }]);
    expect(item.servico_especifico).toBe(servico_especifico);
  },
);
it.each([undefined, "", " "])(
  "preserva Outros sem nome específico válido: %s",
  (servico_especifico) => {
    const item = {
      uuid: "item1",
      servico: "outros",
      servico_especifico,
      local_reparo: "Sala",
      descricao: "Reparo",
      arquivos: [],
    };
    expect(prepararServicosEdicao([item])).toEqual([item]);
  },
);
