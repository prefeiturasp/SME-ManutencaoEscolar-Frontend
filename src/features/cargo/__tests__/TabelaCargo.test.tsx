import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TabelaCargo } from "@/features/cargo/components/TabelaCargo";
import type { Cargo } from "@/features/cargo/types/cargos.types";

const mocks = vi.hoisted(() => ({
  TabelaDeDados: vi.fn(),
}));

vi.mock("@/components/shared/TabelaDeDados/TabelaDeDados", () => ({
  TabelaDeDados: (props: {
    dados: Array<{ uuid?: string; nome: string }>;
    colunas: Array<{ id: string }>;
    obterChave: (cargo: { uuid?: string; nome: string }) => string;
    atualizando: boolean;
  }) => {
    mocks.TabelaDeDados(props);

    return (
      <div data-testid="tabela-de-dados">
        {props.dados.map((cargo) => (
          <span key={cargo.nome}>{cargo.nome}</span>
        ))}
      </div>
    );
  },
}));

const cargos = [
  {
    uuid: "uuid-cargo-1",
    nome: "Engenheiro",
  },
  {
    uuid: "uuid-cargo-2",
    nome: "Arquiteto",
  },
] as Cargo[];

const colunas = [
  {
    id: "nome",
    titulo: "Nome do cargo",
    renderizar: (cargo: Cargo) => cargo.nome,
  },
];

describe("TabelaCargo", () => {
  it("envia os cargos e as colunas para TabelaDeDados", () => {
    render(<TabelaCargo cargos={cargos} colunas={colunas} />);

    expect(screen.getByTestId("tabela-de-dados")).toBeInTheDocument();
    expect(screen.getByText("Engenheiro")).toBeInTheDocument();
    expect(screen.getByText("Arquiteto")).toBeInTheDocument();

    expect(mocks.TabelaDeDados).toHaveBeenCalledWith(
      expect.objectContaining({
        dados: cargos,
        colunas,
      }),
    );
  });

  it("usa o UUID do cargo como chave", () => {
    render(<TabelaCargo cargos={cargos} colunas={colunas} />);

    const props = mocks.TabelaDeDados.mock.calls[0][0] as {
      obterChave: (cargo: Cargo) => string;
    };

    expect(props.obterChave(cargos[0])).toBe("uuid-cargo-1");
    expect(props.obterChave(cargos[1])).toBe("uuid-cargo-2");
  });

  it("retorna uma chave vazia se o cargo não tiver UUID", () => {
    render(<TabelaCargo cargos={cargos} colunas={colunas} />);

    const props = mocks.TabelaDeDados.mock.calls[0][0] as {
      obterChave: (cargo: Cargo) => string;
    };

    expect(props.obterChave({ nome: "Cargo sem UUID" } as Cargo)).toBe("");
  });

  it("não indica atualização por padrão", () => {
    render(<TabelaCargo cargos={cargos} colunas={colunas} />);

    expect(mocks.TabelaDeDados).toHaveBeenCalledWith(
      expect.objectContaining({
        atualizando: false,
      }),
    );
  });

  it("repassa o estado de atualização", () => {
    render(<TabelaCargo cargos={cargos} colunas={colunas} atualizando />);

    expect(mocks.TabelaDeDados).toHaveBeenCalledWith(
      expect.objectContaining({
        atualizando: true,
      }),
    );
  });
});
