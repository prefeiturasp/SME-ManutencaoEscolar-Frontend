import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TabelaServico } from "@/features/servico/components/Servico/TabelaServico";
import type {
  Servico,
  TabelaServicoProps,
} from "@/features/servico/types/servicos.types";

const mocks = vi.hoisted(() => ({
  tabelaDeDados: vi.fn(),
}));

vi.mock("@/components/shared/TabelaDeDados/TabelaDeDados", () => ({
  TabelaDeDados: mocks.tabelaDeDados,
}));

const servicoAtivo: Servico = {
  id: 1,
  uuid: "uuid-eletrica",
  nome: "Elétrica",
  status: true,
};

const servicoInativo: Servico = {
  id: 2,
  uuid: "uuid-pintura",
  nome: "Pintura",
  status: false,
};

type PropriedadesRecebidas = {
  dados: TabelaServicoProps["servicos"];
  colunas: TabelaServicoProps["colunas"];
  obterChave: (servico: Servico) => string;
  atualizando: boolean;
  classNameLinha: (servico: Servico) => string;
};

describe("TabelaServico", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.tabelaDeDados.mockReturnValue(<div data-testid="tabela-de-dados" />);
  });

  it("deve repassar os serviços e colunas para TabelaDeDados", () => {
    const servicos = [servicoAtivo, servicoInativo];
    const colunas: TabelaServicoProps["colunas"] = [];

    render(<TabelaServico servicos={servicos} colunas={colunas} />);

    expect(screen.getByTestId("tabela-de-dados")).toBeInTheDocument();
    expect(mocks.tabelaDeDados).toHaveBeenCalledTimes(1);

    const propriedades = mocks.tabelaDeDados.mock
      .calls[0][0] as PropriedadesRecebidas;

    expect(propriedades.dados).toBe(servicos);
    expect(propriedades.colunas).toBe(colunas);
  });

  it("deve usar o UUID do serviço como chave", () => {
    render(<TabelaServico servicos={[servicoAtivo]} colunas={[]} />);

    const propriedades = mocks.tabelaDeDados.mock
      .calls[0][0] as PropriedadesRecebidas;

    expect(propriedades.obterChave(servicoAtivo)).toBe("uuid-eletrica");

    expect(propriedades.obterChave(servicoInativo)).toBe("uuid-pintura");
  });

  it("não deve aplicar classe adicional para serviço ativo", () => {
    render(<TabelaServico servicos={[servicoAtivo]} colunas={[]} />);

    const propriedades = mocks.tabelaDeDados.mock
      .calls[0][0] as PropriedadesRecebidas;

    expect(propriedades.classNameLinha(servicoAtivo)).toBe("");
  });

  it("deve aplicar a classe de desabilitado para serviço inativo", () => {
    render(<TabelaServico servicos={[servicoInativo]} colunas={[]} />);

    const propriedades = mocks.tabelaDeDados.mock
      .calls[0][0] as PropriedadesRecebidas;

    expect(propriedades.classNameLinha(servicoInativo)).toBe(
      "bg-background text-blocked-foreground",
    );
  });

  it("deve utilizar false como valor padrão de atualizando", () => {
    render(<TabelaServico servicos={[servicoAtivo]} colunas={[]} />);

    const propriedades = mocks.tabelaDeDados.mock
      .calls[0][0] as PropriedadesRecebidas;

    expect(propriedades.atualizando).toBe(false);
  });

  it("deve repassar atualizando como true", () => {
    render(
      <TabelaServico servicos={[servicoAtivo]} colunas={[]} atualizando />,
    );

    const propriedades = mocks.tabelaDeDados.mock
      .calls[0][0] as PropriedadesRecebidas;

    expect(propriedades.atualizando).toBe(true);
  });

  it("deve usar string vazia quando o UUID não estiver disponível", () => {
    const servicoSemUuid: Servico = {
      ...servicoAtivo,
      uuid: undefined,
    };

    render(<TabelaServico servicos={[servicoSemUuid]} colunas={[]} />);

    const propriedades = mocks.tabelaDeDados.mock
      .calls[0][0] as PropriedadesRecebidas;

    expect(propriedades.obterChave(servicoSemUuid)).toBe("");
  });
});
