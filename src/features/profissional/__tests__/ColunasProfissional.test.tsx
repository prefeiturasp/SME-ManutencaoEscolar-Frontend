import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { criarColunasProfissional } from "../components/list/ColunasProfissional";
import type { Profissional } from "../types/profissional.types";

const profissional: Profissional = {
  uuid: "profissional-1",
  nome: "Adriana Gonçalves Mota",
  rg: "123456789",
  cpf: "12345678910",
  status: true,
  funcoes: ["Engenheiro civil", "Engenheiro eletricista"],
};

describe("criarColunasProfissional", () => {
  it("define as larguras proporcionais das colunas", () => {
    const colunas = criarColunasProfissional({ onEditar: vi.fn() });

    expect(
      colunas.map(({ id, classNameCabecalho }) => ({
        id,
        largura: classNameCabecalho?.match(/w-\[[^\]]+\]/)?.[0],
      })),
    ).toEqual([
      { id: "nome", largura: "w-[21%]" },
      { id: "rg", largura: "w-[11%]" },
      { id: "cpf", largura: "w-[11%]" },
      { id: "funcoes", largura: "w-[45.5%]" },
      { id: "status", largura: "w-[7.5%]" },
      { id: "acoes", largura: "w-[4%]" },
    ]);
  });

  it("mantém o título da coluna de RG em uma única linha", () => {
    const colunaRg = criarColunasProfissional({ onEditar: vi.fn() }).find(
      (item) => item.id === "rg",
    );

    expect(colunaRg?.classNameCabecalho).toContain("whitespace-nowrap");
  });

  it("exibe todas as funções do profissional", () => {
    const coluna = criarColunasProfissional({ onEditar: vi.fn() }).find(
      (item) => item.id === "funcoes",
    );

    render(<>{coluna?.renderizar(profissional)}</>);

    expect(screen.getByText("Engenheiro civil")).toBeInTheDocument();
    expect(screen.getByText("Engenheiro eletricista")).toBeInTheDocument();
  });

  it.each([
    [true, "Ativo"],
    [false, "Inativo"],
  ])("renderiza os dados e estilos quando status é %s", (status, textoStatus) => {
    const item = { ...profissional, status };
    const colunas = criarColunasProfissional({ onEditar: vi.fn() });

    for (const coluna of colunas.slice(0, 5)) {
      if (typeof coluna.classNameCelula === "function") {
        expect(coluna.classNameCelula(item)).toEqual(expect.any(String));
      }
    }

    render(
      <>
        {colunas
          .filter((coluna) => ["nome", "rg", "cpf", "status"].includes(coluna.id))
          .map((coluna) => <div key={coluna.id}>{coluna.renderizar(item)}</div>)}
      </>,
    );

    expect(screen.getByText(item.nome)).toBeInTheDocument();
    expect(screen.getByText(item.rg)).toBeInTheDocument();
    expect(screen.getByText("123.456.789-10")).toBeInTheDocument();
    expect(screen.getByText(textoStatus)).toBeInTheDocument();
  });

  it("mantém a ação de edição desabilitada", () => {
    const onEditar = vi.fn();
    const coluna = criarColunasProfissional({ onEditar }).find((item) => item.id === "acoes");
    const botao = coluna?.renderizar(profissional) as ReactElement<{
      onClick: () => void;
      disabled: boolean;
    }>;

    expect(botao.props.disabled).toBe(true);
    botao.props.onClick();
    expect(onEditar).toHaveBeenCalledWith(profissional);
  });
});
