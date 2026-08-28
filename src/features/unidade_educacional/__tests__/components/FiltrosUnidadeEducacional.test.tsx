// src/features/unidade_educacional/__tests__/components/FiltrosUnidadeEducacional.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useTodosSubprefeituras } from "@/features/subprefeitura/hooks/useSubprefeitura";
import { useTodosTiposUnidades } from "@/features/tipo_unidade/hooks/useTipoUnidade";
import { useTodasUnidadesEducacionais } from "@/features/unidade_educacional/hooks/useUnidadeEducacional";

import { UnidadeEducacionalFiltros } from "../../components/list/FiltrosUnidadeEducacional";

vi.mock("@/features/diretoria_regional/hooks/useDiretoriaRegional", () => ({
  useListarDiretoriasRegionais: vi.fn(),
}));

vi.mock("@/features/subprefeitura/hooks/useSubprefeitura", () => ({
  useTodosSubprefeituras: vi.fn(),
}));

vi.mock("@/features/tipo_unidade/hooks/useTipoUnidade", () => ({
  useTodosTiposUnidades: vi.fn(),
}));

vi.mock("@/features/unidade_educacional/hooks/useUnidadeEducacional", () => ({
  useTodasUnidadesEducacionais: vi.fn(),
}));

const mockUseListarDiretoriasRegionais = vi.mocked(
  useListarDiretoriasRegionais,
);

const mockUseTodosSubprefeituras = vi.mocked(useTodosSubprefeituras);

const mockUseTodosTiposUnidades = vi.mocked(useTodosTiposUnidades);

const mockUseTodasUnidadesEducacionais = vi.mocked(
  useTodasUnidadesEducacionais,
);

const VALUES_INICIAIS = {
  codigo_eol: "",
  tipo_escola: "",
  diretoria_regional: "",
  unidade_educacional: "",
  subprefeitura: "",
  lote: "",
  status: "",
};

function renderFiltros(overrides?: {
  values?: Record<string, string>;
  onChange?: (name: string, value: string) => void;
  onBuscar?: () => void;
  onLimpar?: () => void;
}) {
  const onChange = overrides?.onChange ?? vi.fn();
  const onBuscar = overrides?.onBuscar ?? vi.fn();
  const onLimpar = overrides?.onLimpar ?? vi.fn();

  render(
    <UnidadeEducacionalFiltros
      values={{
        ...VALUES_INICIAIS,
        ...overrides?.values,
      }}
      onChange={onChange}
      onBuscar={onBuscar}
      onLimpar={onLimpar}
    />,
  );

  return {
    onChange,
    onBuscar,
    onLimpar,
  };
}

function getUnidadeEducacionalButton() {
  return screen.getByRole("button", {
    name: /^unidade educacional$/i,
  });
}

describe("UnidadeEducacionalFiltros", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseListarDiretoriasRegionais.mockReturnValue({
      data: {
        results: [
          {
            id: 1,
            nome_curto: "DRE Butantã",
          },
        ],
      },
    } as ReturnType<typeof useListarDiretoriasRegionais>);

    mockUseTodosSubprefeituras.mockReturnValue({
      data: [
        {
          uuid: "subprefeitura-1",
          nome: "Subprefeitura Butantã",
        },
      ],
    } as ReturnType<typeof useTodosSubprefeituras>);

    mockUseTodosTiposUnidades.mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useTodosTiposUnidades>);

    mockUseTodasUnidadesEducacionais.mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useTodasUnidadesEducacionais>);
  });

  it("deve renderizar os campos do filtro", () => {
    renderFiltros();

    expect(
      screen.getByLabelText(/codesc/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /tipo de escola/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /diretoria regional/i,
      }),
    ).toBeInTheDocument();

    expect(
      getUnidadeEducacionalButton(),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /subprefeitura/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/^lote$/i),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /status/i,
      }),
    ).toBeInTheDocument();
  });

  it("deve chamar onChange ao digitar no campo CODESC", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFiltros();

    await user.type(
      screen.getByLabelText(/codesc/i),
      "1",
    );

    expect(onChange).toHaveBeenCalledWith(
      "codigo_eol",
      "1",
    );
  });

  it("deve desabilitar Unidade Educacional quando nenhuma DRE ou Subprefeitura estiver selecionada", () => {
    renderFiltros();

    expect(
      getUnidadeEducacionalButton(),
    ).toBeDisabled();
  });

  it("deve habilitar Unidade Educacional quando uma DRE estiver selecionada", () => {
    renderFiltros({
      values: {
        diretoria_regional: "1",
      },
    });

    expect(
      getUnidadeEducacionalButton(),
    ).toBeEnabled();
  });

  it("deve habilitar Unidade Educacional quando uma Subprefeitura estiver selecionada", () => {
    renderFiltros({
      values: {
        subprefeitura: "subprefeitura-1",
      },
    });

    expect(
      getUnidadeEducacionalButton(),
    ).toBeEnabled();
  });

  it("deve habilitar Unidade Educacional quando DRE e Subprefeitura estiverem selecionadas", () => {
    renderFiltros({
      values: {
        diretoria_regional: "1",
        subprefeitura: "subprefeitura-1",
      },
    });

    expect(
      getUnidadeEducacionalButton(),
    ).toBeEnabled();
  });

  it("nao deve buscar unidades educacionais enquanto nenhuma DRE ou Subprefeitura estiver selecionada", () => {
    renderFiltros();

    expect(
      mockUseTodasUnidadesEducacionais,
    ).toHaveBeenCalledWith(
      "",
      "",
      "",
      {
        enabled: false,
      },
    );
  });

  it("deve buscar unidades educacionais quando uma DRE estiver selecionada", () => {
    renderFiltros({
      values: {
        diretoria_regional: "1",
      },
    });

    expect(
      mockUseTodasUnidadesEducacionais,
    ).toHaveBeenCalledWith(
      "1",
      "",
      "",
      {
        enabled: true,
      },
    );
  });

  it("deve buscar unidades educacionais quando uma Subprefeitura estiver selecionada", () => {
    renderFiltros({
      values: {
        subprefeitura: "subprefeitura-1",
      },
    });

    expect(
      mockUseTodasUnidadesEducacionais,
    ).toHaveBeenCalledWith(
      "",
      "",
      "subprefeitura-1",
      {
        enabled: true,
      },
    );
  });

  it("deve buscar unidades educacionais quando DRE e Subprefeitura estiverem selecionadas", () => {
    renderFiltros({
      values: {
        diretoria_regional: "1",
        subprefeitura: "subprefeitura-1",
      },
    });

    expect(
      mockUseTodasUnidadesEducacionais,
    ).toHaveBeenCalledWith(
      "1",
      "",
      "subprefeitura-1",
      {
        enabled: true,
      },
    );
  });

  it("deve preencher as opcoes de Unidade Educacional com os dados da API", async () => {
    const user = userEvent.setup();

    mockUseTodasUnidadesEducacionais.mockReturnValue({
      data: [
        {
          id: 10,
          uuid: "unidade-10",
          nome: "EMEF Amorim Lima",
        },
        {
          id: 20,
          uuid: "unidade-20",
          nome: "EMEI Vila das Belezas",
        },
      ],
    } as ReturnType<typeof useTodasUnidadesEducacionais>);

    renderFiltros({
      values: {
        diretoria_regional: "1",
      },
    });

    await user.click(
      getUnidadeEducacionalButton(),
    );

    expect(
      screen.getByRole("option", {
        name: "EMEF Amorim Lima",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "EMEI Vila das Belezas",
      }),
    ).toBeInTheDocument();
  });

  it("deve chamar onBuscar ao clicar em Buscar Unidade Educacional", async () => {
    const user = userEvent.setup();

    const { onBuscar } = renderFiltros({
      values: {
        codigo_eol: "123",
      },
    });

    await user.click(
      screen.getByRole("button", {
        name: /buscar unidade educacional/i,
      }),
    );

    expect(onBuscar).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onLimpar ao clicar em Limpar filtros", async () => {
    const user = userEvent.setup();

    const { onLimpar } = renderFiltros();

    await user.click(
      screen.getByRole("button", {
        name: /limpar filtros/i,
      }),
    );

    expect(onLimpar).toHaveBeenCalledTimes(1);
  });
  //////
  it("deve preencher as opcoes de Tipo de escola com os dados da API", async () => {
  const user = userEvent.setup();

  mockUseTodosTiposUnidades.mockReturnValue({
    data: [
      {
        uuid: "tipo-1",
        sigla: "EMEF",
      },
      {
        uuid: "tipo-2",
        sigla: "EMEI",
      },
    ],
  } as unknown as ReturnType<typeof useTodosTiposUnidades>);

  renderFiltros();

  await user.click(
    screen.getByRole("button", {
      name: /tipo de escola/i,
    }),
  );

  expect(
    screen.getByRole("option", {
      name: "EMEF",
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("option", {
      name: "EMEI",
    }),
  ).toBeInTheDocument();
});

it("deve preencher as opcoes de Diretoria Regional com os dados da API", async () => {
  const user = userEvent.setup();

  mockUseListarDiretoriasRegionais.mockReturnValue({
    data: {
      results: [
        {
          id: 1,
          nome_curto: "DRE Butantã",
        },
        {
          id: 2,
          nome_curto: "DRE Campo Limpo",
        },
      ],
    },
  } as unknown as ReturnType<typeof useListarDiretoriasRegionais>);

  renderFiltros();

  await user.click(
    screen.getByRole("button", {
      name: /diretoria regional/i,
    }),
  );

  expect(
    screen.getByRole("option", {
      name: "DRE Butantã",
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("option", {
      name: "DRE Campo Limpo",
    }),
  ).toBeInTheDocument();
});

it("deve usar lista vazia quando Diretoria Regional não possuir results", () => {
  mockUseListarDiretoriasRegionais.mockReturnValue({
    data: undefined,
  } as unknown as ReturnType<typeof useListarDiretoriasRegionais>);

  renderFiltros();

  expect(
    screen.getByRole("button", {
      name: /diretoria regional/i,
    }),
  ).toBeInTheDocument();
});

it("deve preencher as opcoes de Subprefeitura com os dados da API", async () => {
  const user = userEvent.setup();

  mockUseTodosSubprefeituras.mockReturnValue({
    data: [
      {
        uuid: "sub-1",
        nome: "Butantã",
      },
      {
        uuid: "sub-2",
        nome: "Pinheiros",
      },
    ],
  } as unknown as ReturnType<typeof useTodosSubprefeituras>);

  renderFiltros();

  await user.click(
    screen.getByRole("button", {
      name: /subprefeitura/i,
    }),
  );

  expect(
    screen.getByRole("option", {
      name: "Nenhuma",
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("option", {
      name: "Butantã",
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("option", {
      name: "Pinheiros",
    }),
  ).toBeInTheDocument();
});

it("deve manter somente a opção Nenhuma quando não houver Subprefeituras", async () => {
  const user = userEvent.setup();

  mockUseTodosSubprefeituras.mockReturnValue({
    data: undefined,
  } as unknown as ReturnType<typeof useTodosSubprefeituras>);

  renderFiltros();

  await user.click(
    screen.getByRole("button", {
      name: /subprefeitura/i,
    }),
  );

  expect(
    screen.getByRole("option", {
      name: "Nenhuma",
    }),
  ).toBeInTheDocument();
});

it("deve usar o nome da Unidade Educacional como label", async () => {
  const user = userEvent.setup();

  mockUseTodasUnidadesEducacionais.mockReturnValue({
    data: [
      {
        id: 10,
        uuid: "unidade-10",
        nome: "EMEF Amorim Lima",
        codigo_eol: "123456",
      },
    ],
  } as unknown as ReturnType<typeof useTodasUnidadesEducacionais>);

  renderFiltros({
    values: {
      diretoria_regional: "1",
    },
  });

  await user.click(
    screen.getByRole("button", {
      name: /^unidade educacional$/i,
    }),
  );

  expect(
    screen.getByRole("option", {
      name: "EMEF Amorim Lima",
    }),
  ).toBeInTheDocument();
});

it("deve passar o tipo de escola selecionado para a busca de unidades educacionais", () => {
  renderFiltros({
    values: {
      diretoria_regional: "1",
      tipo_escola: "tipo-1",
    },
  });

  expect(
    mockUseTodasUnidadesEducacionais,
  ).toHaveBeenCalledWith(
    "1",
    "tipo-1",
    "",
    {
      enabled: true,
    },
  );
});

it("deve habilitar a busca quando somente a Subprefeitura estiver selecionada", () => {
  renderFiltros({
    values: {
      subprefeitura: "sub-1",
    },
  });

  expect(
    mockUseTodasUnidadesEducacionais,
  ).toHaveBeenCalledWith(
    "",
    "",
    "sub-1",
    {
      enabled: true,
    },
  );

  expect(
    screen.getByRole("button", {
      name: /^unidade educacional$/i,
    }),
  ).toBeEnabled();
});

it("deve desabilitar a busca quando DRE e Subprefeitura estiverem vazias", () => {
  renderFiltros({
    values: {
      diretoria_regional: "",
      subprefeitura: "",
    },
  });

  expect(
    mockUseTodasUnidadesEducacionais,
  ).toHaveBeenCalledWith(
    "",
    "",
    "",
    {
      enabled: false,
    },
  );

  expect(
    screen.getByRole("button", {
      name: /^unidade educacional$/i,
    }),
  ).toBeDisabled();
});
  
});