import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";


import { criarColunasUnidadeEducacional } from "@/features/unidade_educacional/components/list/ColunaUnidadeEducacional";
import { UnidadeEducacional } from "@/features/unidade_educacional/types/unidadesEducacionais.types";


describe("criarColunasUnidadeEducacional", () => {
  const unidadeAtiva: UnidadeEducacional = {
   id: 9466,
  uuid: "c4e02ffc-fff5-4d36-bfca-29712e311379",
  codigo_eol: "400509",
  nome: "CCI/CIPS CAMARA MUNICIPAL DE SAO PAULO",
  diretoria_regional: {
    id: 6,
    codigo: "108600",
    nome: "DIRETORIA REGIONAL DE EDUCACAO IPIRANGA",
    abreviacao: "DRE - IP",
    nome_curto: "DRE IPIRANGA"
  },
  tipo_escola: {
    id: 12,
    uuid: "c0beab6d-ba44-433f-b85e-40b51901b3e4",
    codigo_eol: 14,
    sigla: "CCI/CIPS"
  },
  subprefeitura: {
    id: 17,
    uuid: "247cf593-6089-4347-b10a-e132e30f5911",
    codigo_eol: "49",
    nome: "SE"
  },
  lote: {
    id: 1,
    uuid: "2809f4cc-5b20-471d-8bea-1ed8148640c8",
    codigo: "010203",
    nome: "Lote 2025/2027"
  },
    status: true
  };

  const unidadeInativa: UnidadeEducacional = {
    id: 7590,
    uuid: "24f77957-2be7-4b6f-ad1d-a34143ecdb1e",
    codigo_eol: "400501",
    nome: "CCI/CIPS CAMPO LIMPO",
    diretoria_regional: {
      id: 8,
      codigo: "108200",
      nome: "DIRETORIA REGIONAL DE EDUCACAO CAMPO LIMPO",
      abreviacao: "DRE - CL",
      nome_curto: "DRE CAMPO LIMPO"
    },
    tipo_escola: {
      id: 12,
      uuid: "c0beab6d-ba44-433f-b85e-40b51901b3e4",
      codigo_eol: 14,
      sigla: "CCI/CIPS"
    },
    subprefeitura: {
      id: 23,
      uuid: "86d4545c-2d04-4cba-b808-5b7c136414f9",
      codigo_eol: "57",
      nome: "CAMPO LIMPO"
    },
    lote: {
      id: 1,
      uuid: "2809f4cc-5b20-471d-8bea-1ed8148640c8",
      codigo: "010203",
      nome: "Lote 2025/2027"
    },
    status: false
  };

  const obterClassNameCelula = (
    coluna: ReturnType<typeof criarColunasUnidadeEducacional>[number],
    unidade: UnidadeEducacional,
  ) => {
    if (typeof coluna.classNameCelula === "function") {
      return coluna.classNameCelula(unidade);
    }

    return coluna.classNameCelula;
  };

  it("deve criar as colunas com as configurações corretas", () => {
    const colunas = criarColunasUnidadeEducacional({
      onEditar: vi.fn(),
    });

    expect(colunas).toHaveLength(8);

    expect(colunas[0]).toMatchObject({
      id: "codigo",
      titulo: "CODESC (Código EOL)",
      classNameCabecalho:
        "w-[99px] min-w-[99px] max-w-[99px] border-l px-1 text-gray",
    });

    expect(colunas[1]).toMatchObject({
      id: "tipo",
      titulo: "Tipo de escola",
      classNameCabecalho:
        "w-[108px] min-w-[108px] max-w-[108px] border-l px-1 text-gray",
    });

    expect(colunas[2]).toMatchObject({
      id: "unidade",
      titulo: "Unidade Educacional",
      classNameCabecalho:
        "w-[419.5px] min-w-[419.5px] max-w-[419.5px] border-l px-1 text-gray",
    });

    expect(colunas[3]).toMatchObject({
      id: "diretoria_regional",
      titulo: "Diretoria Regional (DRE)",
      classNameCabecalho:
        "w-[182px] min-w-[182px] max-w-[182px] border-l px-1 text-gray",
    });

    expect(colunas[4]).toMatchObject({
      id: "subprefeitura",
      titulo: "Subprefeitura",
      classNameCabecalho:
        "w-[200px] min-w-[200px] max-w-[200px] border-l px-1 text-gray",
    });

    expect(colunas[5]).toMatchObject({
      id: "lote",
      titulo: "Lote",
      classNameCabecalho:
        "w-[100px] min-w-[100px] max-w-[100px] border-l px-1 text-gray",
    });

    expect(colunas[6]).toMatchObject({
      id: "status",
      titulo: "Status",
      classNameCabecalho:
        "w-[78px] min-w-[78px] max-w-[78px] border-l px-1 text-gray",
    });

    expect(colunas[7]).toMatchObject({
      id: "acoes",
      tituloAcessivel: "Ações",
      classNameCabecalho: "w-12 min-w-12 max-w-12 border-l px-1",
      classNameCelula:
        "w-12 min-w-12 max-w-12 border-l px-1 py-2 text-center text-gray",
    });
  });

  it("deve configurar corretamente as colunas que exibem os dados da unidade", () => {
    const colunas = criarColunasUnidadeEducacional({
      onEditar: vi.fn(),
    });

    expect(colunas[0].renderizar?.(unidadeAtiva)).toBe("400509");
    expect(colunas[1].renderizar?.(unidadeAtiva)).toBe("CCI/CIPS");
    expect(colunas[2].renderizar?.(unidadeAtiva)).toBe(
      "CCI/CIPS CAMARA MUNICIPAL DE SAO PAULO",
    );
    expect(colunas[3].renderizar?.(unidadeAtiva)).toBe("DRE IPIRANGA");
    expect(colunas[4].renderizar?.(unidadeAtiva)).toBe("SE");
    expect(colunas[5].renderizar?.(unidadeAtiva)).toBe("Lote 2025/2027");
  });

  it("deve renderizar os dados da unidade inativa corretamente", () => {
    const colunas = criarColunasUnidadeEducacional({
      onEditar: vi.fn(),
    });

    expect(colunas[0].renderizar?.(unidadeInativa)).toBe("400501");
    expect(colunas[1].renderizar?.(unidadeInativa)).toBe("CCI/CIPS");
    expect(colunas[2].renderizar?.(unidadeInativa)).toBe(
      "CCI/CIPS CAMPO LIMPO",
    );
    expect(colunas[3].renderizar?.(unidadeInativa)).toBe("DRE CAMPO LIMPO");
    expect(colunas[4].renderizar?.(unidadeInativa)).toBe("CAMPO LIMPO");
    expect(colunas[5].renderizar?.(unidadeInativa)).toBe("Lote 2025/2027");
  });

it("deve renderizar corretamente os dados da unidade ativa", () => {
    const colunas = criarColunasUnidadeEducacional({
      onEditar: vi.fn(),
    });

    expect(colunas[0].renderizar?.(unidadeAtiva)).toBe("400509");
    expect(colunas[1].renderizar?.(unidadeAtiva)).toBe("CCI/CIPS");
    expect(colunas[2].renderizar?.(unidadeAtiva)).toBe(
      "CCI/CIPS CAMARA MUNICIPAL DE SAO PAULO",
    );
    expect(colunas[3].renderizar?.(unidadeAtiva)).toBe("DRE IPIRANGA");
    expect(colunas[4].renderizar?.(unidadeAtiva)).toBe("SE");
    expect(colunas[5].renderizar?.(unidadeAtiva)).toBe("Lote 2025/2027");
  });

  it("deve renderizar corretamente os dados da unidade inativa", () => {
    const colunas = criarColunasUnidadeEducacional({
      onEditar: vi.fn(),
    });

    expect(colunas[0].renderizar?.(unidadeInativa)).toBe("400501");
    expect(colunas[1].renderizar?.(unidadeInativa)).toBe("CCI/CIPS");
    expect(colunas[2].renderizar?.(unidadeInativa)).toBe(
      "CCI/CIPS CAMPO LIMPO",
    );
    expect(colunas[3].renderizar?.(unidadeInativa)).toBe("DRE CAMPO LIMPO");
    expect(colunas[4].renderizar?.(unidadeInativa)).toBe("CAMPO LIMPO");
    expect(colunas[5].renderizar?.(unidadeInativa)).toBe("Lote 2025/2027");
  });

  it("deve aplicar as classes corretas para a unidade ativa", () => {
    const colunas = criarColunasUnidadeEducacional({
      onEditar: vi.fn(),
    });

    expect(obterClassNameCelula(colunas[0], unidadeAtiva)).toBe(
      "text-[var(--gray)]",
    );

    expect(obterClassNameCelula(colunas[1], unidadeAtiva)).toBe(
      "border-l text-[var(--gray)]",
    );

    expect(obterClassNameCelula(colunas[2], unidadeAtiva)).toBe(
      "border-l text-[var(--gray)]",
    );

    expect(obterClassNameCelula(colunas[3], unidadeAtiva)).toBe(
      "border-l text-[var(--gray)]",
    );

    expect(obterClassNameCelula(colunas[4], unidadeAtiva)).toBe(
      "border-l text-[var(--gray)]",
    );

    expect(obterClassNameCelula(colunas[5], unidadeAtiva)).toBe(
      "border-l text-[var(--gray)]",
    );

    expect(obterClassNameCelula(colunas[6], unidadeAtiva)).toBe(
      "border-l px-2 text-[var(--gray)]",
    );
  });

  it("deve aplicar as classes corretas para a unidade inativa", () => {
    const colunas = criarColunasUnidadeEducacional({
      onEditar: vi.fn(),
    });

    expect(obterClassNameCelula(colunas[0], unidadeInativa)).toBe(
      "text-blocked-foreground",
    );

    expect(obterClassNameCelula(colunas[1], unidadeInativa)).toBe(
      "border-ltext-blocked-foreground",
    );

    expect(obterClassNameCelula(colunas[2], unidadeInativa)).toBe(
      "border-l text-blocked-foreground",
    );

    expect(obterClassNameCelula(colunas[3], unidadeInativa)).toBe(
      "border-l text-blocked-foreground",
    );

    expect(obterClassNameCelula(colunas[4], unidadeInativa)).toBe(
      "border-l text-blocked-foreground",
    );

    expect(obterClassNameCelula(colunas[5], unidadeInativa)).toBe(
      "border-l text-blocked-foreground",
    );

    expect(obterClassNameCelula(colunas[6], unidadeInativa)).toBe(
      "border-l px-2 text-blocked-foreground",
    );
  });

  it("deve renderizar o status como Ativo para a unidade ativa", () => {
    const colunas = criarColunasUnidadeEducacional({
      onEditar: vi.fn(),
    });

    const colunaStatus = colunas.find(({ id }) => id === "status");

    expect(colunaStatus).toBeDefined();

    render(<>{colunaStatus?.renderizar?.(unidadeAtiva)}</>);

    expect(screen.getByText("Ativo")).toBeInTheDocument();
  });

  it("deve renderizar o status como Inativo para a unidade inativa", () => {
    const colunas = criarColunasUnidadeEducacional({
      onEditar: vi.fn(),
    });

    const colunaStatus = colunas.find(({ id }) => id === "status");

    expect(colunaStatus).toBeDefined();

    render(<>{colunaStatus?.renderizar?.(unidadeInativa)}</>);

    expect(screen.getByText("Inativo")).toBeInTheDocument();
  });

  it("deve criar o botão de edição com o nome da unidade", () => {
    const colunas = criarColunasUnidadeEducacional({
      onEditar: vi.fn(),
    });

    const colunaAcoes = colunas.find(({ id }) => id === "acoes");

    expect(colunaAcoes).toBeDefined();

    render(<>{colunaAcoes?.renderizar?.(unidadeAtiva)}</>);

    const botao = screen.getByRole("button", {
      name: "Editar CCI/CIPS CAMARA MUNICIPAL DE SAO PAULO",
    });

    expect(botao).toBeInTheDocument();
    expect(botao).toBeDisabled();
    expect(botao).toHaveAttribute("type", "button");
  });

  it("deve criar o botão de edição desabilitado para a unidade inativa", () => {
    const colunas = criarColunasUnidadeEducacional({
      onEditar: vi.fn(),
    });

    const colunaAcoes = colunas.find(({ id }) => id === "acoes");

    expect(colunaAcoes).toBeDefined();

    render(<>{colunaAcoes?.renderizar?.(unidadeInativa)}</>);

    const botao = screen.getByRole("button", {
      name: "Editar CCI/CIPS CAMPO LIMPO",
    });

    expect(botao).toBeInTheDocument();
    expect(botao).toBeDisabled();
  });

  it("deve renderizar o ícone de edição", () => {
    const colunas = criarColunasUnidadeEducacional({
      onEditar: vi.fn(),
    });

    const colunaAcoes = colunas.find(({ id }) => id === "acoes");

    render(<>{colunaAcoes?.renderizar?.(unidadeAtiva)}</>);

    const botao = screen.getByRole("button", {
      name: "Editar CCI/CIPS CAMARA MUNICIPAL DE SAO PAULO",
    });

    const icone = botao.querySelector("svg");

    expect(icone).toBeInTheDocument();
    expect(icone).toHaveClass("size-4");
  });

});
