// src/features/unidade_educacional/components/list/TabelaUnidadeEducacional.test.tsx

import { criarColunasUnidadeEducacional } from "@/features/unidade_educacional/components/list/ColunaUnidadeEducacional";
import { TabelaUnidadeEducional } from "@/features/unidade_educacional/components/list/TabelaUnidadeEducacional";
import { UnidadeEducacional } from "@/features/unidade_educacional/types/unidadesEducacionais.types";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";



const UNIDADE_ATIVA: UnidadeEducacional = {
  id: 9466,
  uuid: "c4e02ffc-fff5-4d36-bfca-29712e311379",
  codigo_eol: "400509",
  nome: "CCI/CIPS CAMARA MUNICIPAL DE SAO PAULO",
  diretoria_regional: {
    id: 6,
    codigo: "108600",
    nome: "DIRETORIA REGIONAL DE EDUCACAO IPIRANGA",
    abreviacao: "DRE - IP",
    nome_curto: "DRE IPIRANGA",
  },
  tipo_escola: {
    id: 12,
    uuid: "c0beab6d-ba44-433f-b85e-40b51901b3e4",
    codigo_eol: 14,
    sigla: "CCI/CIPS",
  },
  subprefeitura: {
    id: 17,
    uuid: "247cf593-6089-4347-b10a-e132e30f5911",
    codigo_eol: "49",
    nome: "SE",
  },
  lote: {
    id: 1,
    uuid: "2809f4cc-5b20-471d-8bea-1ed8148640c8",
    codigo: "010203",
    nome: "Lote 2025/2027",
  },
  status: true,
};

const UNIDADE_INATIVA: UnidadeEducacional = {
  id: 7590,
  uuid: "24f77957-2be7-4b6f-ad1d-a34143ecdb1e",
  codigo_eol: "400501",
  nome: "CCI/CIPS CAMPO LIMPO",
  diretoria_regional: {
    id: 8,
    codigo: "108200",
    nome: "DIRETORIA REGIONAL DE EDUCACAO CAMPO LIMPO",
    abreviacao: "DRE - CL",
    nome_curto: "DRE CAMPO LIMPO",
  },
  tipo_escola: {
    id: 12,
    uuid: "c0beab6d-ba44-433f-b85e-40b51901b3e4",
    codigo_eol: 14,
    sigla: "CCI/CIPS",
  },
  subprefeitura: {
    id: 23,
    uuid: "86d4545c-2d04-4cba-b808-5b7c136414f9",
    codigo_eol: "57",
    nome: "CAMPO LIMPO",
  },
  lote: {
    id: 1,
    uuid: "2809f4cc-5b20-471d-8bea-1ed8148640c8",
    codigo: "010203",
    nome: "Lote 2025/2027",
  },
  status: false,
};

function renderTabela(
  unidades: UnidadeEducacional[],
  atualizando = false,
) {
  const colunas = criarColunasUnidadeEducacional({
    onEditar: vi.fn(),
  });

  render(
    <TabelaUnidadeEducional
      unidades={unidades}
      colunas={colunas}
      atualizando={atualizando}
    />,
  );
}

describe("TabelaUnidadeEducional", () => {
  it("deve renderizar a tabela sem linhas quando não há unidades", () => {
    renderTabela([]);

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.queryAllByRole("row")).toHaveLength(1);
  });

  it("deve renderizar os dados da unidade ativa", () => {
    renderTabela([UNIDADE_ATIVA]);

    expect(
      screen.getByText("CCI/CIPS CAMARA MUNICIPAL DE SAO PAULO"),
    ).toBeInTheDocument();

    expect(screen.getByText("400509")).toBeInTheDocument();
    expect(screen.getByText("CCI/CIPS")).toBeInTheDocument();
    expect(screen.getByText("DRE IPIRANGA")).toBeInTheDocument();
    expect(screen.getByText("SE")).toBeInTheDocument();
    expect(screen.getByText("Lote 2025/2027")).toBeInTheDocument();
  });

  it("deve renderizar os dados da unidade inativa", () => {
    renderTabela([UNIDADE_INATIVA]);

    expect(
      screen.getByText("CCI/CIPS CAMPO LIMPO"),
    ).toBeInTheDocument();

    expect(screen.getByText("400501")).toBeInTheDocument();
    expect(screen.getByText("DRE CAMPO LIMPO")).toBeInTheDocument();
    expect(screen.getByText("CAMPO LIMPO")).toBeInTheDocument();
    expect(screen.getByText("Lote 2025/2027")).toBeInTheDocument();
  });

  it("deve exibir o status ativo", () => {
    renderTabela([UNIDADE_ATIVA]);

    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("deve exibir o status inativo", () => {
    renderTabela([UNIDADE_INATIVA]);

    expect(screen.getByText("Inativo")).toBeInTheDocument();
  });

  it("não deve aplicar classes de bloqueio na linha da unidade ativa", () => {
  renderTabela([UNIDADE_ATIVA]);

  const linha = screen
    .getByText("CCI/CIPS CAMARA MUNICIPAL DE SAO PAULO")
    .closest("tr");

  expect(linha).not.toHaveClass(
    "bg-background",
    "text-blocked-foreground",
  );
});

  it("deve aplicar as classes de bloqueio na linha da unidade inativa", () => {
    renderTabela([UNIDADE_INATIVA]);

    expect(
      screen.getByText("CCI/CIPS CAMPO LIMPO").closest("tr"),
    ).toHaveClass("bg-background text-blocked-foreground");
  });

  it("deve aplicar a classe de linha corretamente quando existem unidades ativas e inativas", () => {
    renderTabela([UNIDADE_ATIVA, UNIDADE_INATIVA]);

    expect(
      screen
        .getByText("CCI/CIPS CAMARA MUNICIPAL DE SAO PAULO")
        .closest("tr"),
    ).not.toHaveClass("bg-background", "text-blocked-foreground");

    expect(
      screen.getByText("CCI/CIPS CAMPO LIMPO").closest("tr"),
    ).toHaveClass("bg-background text-blocked-foreground");
  });

  it("deve exibir o indicador de atualização quando estiver atualizando", () => {
    renderTabela([UNIDADE_ATIVA], true);

    expect(screen.getByRole("table").parentElement).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("não deve marcar a tabela como ocupada quando não estiver atualizando", () => {
    renderTabela([UNIDADE_ATIVA]);

    expect(screen.getByRole("table").parentElement).not.toHaveAttribute(
      "aria-busy",
      "true",
    );
  });
});