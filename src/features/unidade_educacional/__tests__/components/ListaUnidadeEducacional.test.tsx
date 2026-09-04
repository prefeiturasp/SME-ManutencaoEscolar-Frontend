import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useTodosSubprefeituras } from "@/features/subprefeitura/hooks/useSubprefeitura";
import { useTodosTiposUnidades } from "@/features/tipo_unidade/hooks/useTipoUnidade";
import { UnidadeEducacionalLista } from "@/features/unidade_educacional/components/list/ListaUnidadeEducacional";
import { useTodasUnidadesEducacionais, useUnidadeEducacional } from "@/features/unidade_educacional/hooks/useUnidadeEducacional";
import { UnidadeEducacional } from "@/features/unidade_educacional/types/unidadesEducacionais.types";
import * as ColunaUnidadeEducacional from "@/features/unidade_educacional/components/list/ColunaUnidadeEducacional";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/features/unidade_educacional/hooks/useUnidadeEducacional",  () => ({
    useUnidadeEducacional: vi.fn(),
    useTodasUnidadesEducacionais: vi.fn(),
  }),
);

vi.mock("@/features/diretoria_regional/hooks/useDiretoriaRegional",  () => ({
    useListarDiretoriasRegionais: vi.fn(),
  }),
);

vi.mock("@/features/subprefeitura/hooks/useSubprefeitura",  () => ({
    useTodosSubprefeituras: vi.fn(),
  }),
);

vi.mock("@/features/tipo_unidade/hooks/useTipoUnidade",  () => ({
    useTodosTiposUnidades: vi.fn(),
  }),
);


vi.mock("next/image", () => ({
  default: ({
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <span role="img" aria-label={alt} {...props} />
  ),
}));

const mockUseListarDiretoriasRegionais = vi.mocked(
  useListarDiretoriasRegionais,
);

const mockUseTodosSubprefeituras = vi.mocked(useTodosSubprefeituras);

const mockUseTodosTiposUnidades = vi.mocked(useTodosTiposUnidades);

const mockUseTodasUnidadesEducacionais = vi.mocked(
  useTodasUnidadesEducacionais,
);

const mockUseUnidadeEducacional = vi.mocked(
  useUnidadeEducacional,
);


export const UNIDADE_EDUCACIONAL: UnidadeEducacional = {
  id: 1,
  uuid: "7f4e8e2a-6b3f-4e2a-8f2a-1b2c3d4e5f60",
  nome: "EMEF Amorim Lima",
  codigo_eol: "123456",
  diretoria_regional: {
    id: 1,
    codigo: "100100",
    nome: "DIRETORIA REGIONAL DE EDUCACAO BUTANTA",
    abreviacao: "DRE - BT",
    nome_curto: "DRE Butantã",
  },
  tipo_escola: {
    id: 1,
    uuid: "tipo-1",
    codigo_eol: 1,
    sigla: "EMEF",
  },
  subprefeitura: {
    id: 1,
    uuid: "subprefeitura-1",
    codigo_eol: "1",
    nome: "Butantã",
  },
  lote: {
    id: 1,
    uuid: "lote-1",
    codigo: "001",
    nome: "Lote 001",
  },
  status: true,
};

const RESULTADO_PADRAO = {
  count: 1,
  next: null,
  previous: null,
  results: [UNIDADE_EDUCACIONAL],
};

function criarQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

function renderLista() {
  const queryClient = criarQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <UnidadeEducacionalLista />
    </QueryClientProvider>,
  );
}

describe("UnidadeEducacionalLista", () => {
  beforeEach(() => {
    vi.clearAllMocks();

     mockUseUnidadeEducacional.mockReturnValue({
    data: RESULTADO_PADRAO,
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useUnidadeEducacional>);

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

  it("deve renderizar o título e a descrição da lista", () => {
    renderLista();

    expect(
      screen.getByRole("heading", {
        name: "Unidade Educacional",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Unidades Educacionais cadastradas"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Estas são as UEs que já estão cadastradas no sistema.",
      ),
    ).toBeInTheDocument();
  });

  it("deve chamar o hook com os parâmetros iniciais", () => {
    renderLista();

    expect(mockUseUnidadeEducacional).toHaveBeenCalledWith({
      page: 1,
      page_size: 10,
    });
  });

  it("deve renderizar os dados retornados pela API", () => {
    renderLista();

    expect(
      screen.getByText("EMEF Amorim Lima"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("123456"),
    ).toBeInTheDocument();
  });

  it("deve navegar para a edição a partir da ação configurada nas colunas", () => {
    let onEditar: ((unidade: UnidadeEducacional) => void) | undefined;
    const criarColunasOriginal =
      ColunaUnidadeEducacional.criarColunasUnidadeEducacional;

    vi.spyOn(
      ColunaUnidadeEducacional,
      "criarColunasUnidadeEducacional",
    ).mockImplementation((parametros) => {
      onEditar = parametros.onEditar;
      return criarColunasOriginal(parametros);
    });

    renderLista();
    onEditar?.(UNIDADE_EDUCACIONAL);

    expect(pushMock).toHaveBeenCalledWith(
      `/cadastro/unidades-educacionais/${UNIDADE_EDUCACIONAL.uuid}/editar`,
    );
  });

  it("deve executar a ação de edição configurada na coluna", () => {
    const onEditar = vi.fn();
    const colunaAcoes = ColunaUnidadeEducacional
      .criarColunasUnidadeEducacional({ onEditar })
      .find((coluna) => coluna.id === "acoes");
    const botao = colunaAcoes?.renderizar?.(UNIDADE_EDUCACIONAL) as React.ReactElement<{
      onClick: () => void;
    }>;

    botao.props.onClick();

    expect(onEditar).toHaveBeenCalledWith(UNIDADE_EDUCACIONAL);
  });

  it("deve exibir loading", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderLista();

    expect(
      screen.getByText(
        "Carregando as Unidades Educacionais...",
      ),
    ).toBeInTheDocument();
  });

  it("deve exibir mensagem de erro", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderLista();

    expect(
      screen.getByRole("alert"),
    ).toHaveTextContent(
      "Não foi possível carregar as unidades educacionais.",
    );
  });

  it("deve exibir lista vazia quando não houver registros", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      isLoading: false,
      isError: false,
    }as unknown as ReturnType<typeof useUnidadeEducacional>);

    renderLista();

    expect(
      screen.getByText("Não há unidades cadastradas"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Que tal cadastrar a primeira unidades agora?",
      ),
    ).toBeInTheDocument();
  });

  it("deve exibir mensagem de busca sem resultados quando houver filtros", async () => {
    const user = userEvent.setup();

    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        count: 0,
        next: null,
        previous: null,
        results: [],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useUnidadeEducacional>);

    renderLista();

    await user.type(
      screen.getByLabelText(/codesc/i),
      "999999",
    );

    await user.click(
      screen.getByRole("button", {
        name: /buscar unidade educacional/i,
      }),
    );

    expect(
      screen.getByText(
        "Não encontramos dados para esta busca",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Experimente remover alguns filtros ou selecionar outros critérios de busca.",
      ),
    ).toBeInTheDocument();
  });

  it("deve atualizar o filtro CODESC sem buscar imediatamente", async () => {
    const user = userEvent.setup();

    renderLista();

    await user.type(
      screen.getByLabelText(/codesc/i),
      "123",
    );

    const ultimoParametro =
        mockUseUnidadeEducacional.mock.calls.at(-1)?.[0];

    expect(ultimoParametro).toEqual({
        page: 1,
        page_size: 10,
    });
  });

  it("deve aplicar o filtro CODESC ao buscar", async () => {
    const user = userEvent.setup();

    renderLista();

    await user.type(
      screen.getByLabelText(/codesc/i),
      "123456",
    );

    await user.click(
      screen.getByRole("button", {
        name: /buscar unidade educacional/i,
      }),
    );

    await waitFor(() => {
      expect(mockUseUnidadeEducacional).toHaveBeenLastCalledWith({
        codigo_eol: "123456",
        page: 1,
        page_size: 10,
      });
    });
  });

  it("deve remover filtros vazios dos parâmetros", async () => {
    const user = userEvent.setup();

    renderLista();

    await user.type(
      screen.getByLabelText(/codesc/i),
      "123456",
    );

    await user.click(
      screen.getByRole("button", {
        name: /buscar unidade educacional/i,
      }),
    );

    await waitFor(() => {
      const ultimoParametro =
        mockUseUnidadeEducacional.mock.calls.at(-1)?.[0];

      expect(ultimoParametro).toEqual({
        codigo_eol: "123456",
        page: 1,
        page_size: 10,
      });
    });
  });

  it("deve limpar os filtros", async () => {
    const user = userEvent.setup();

    renderLista();

    await user.type(
      screen.getByLabelText(/codesc/i),
      "123456",
    );

    await user.click(
      screen.getByRole("button", {
        name: /buscar unidade educacional/i,
      }),
    );

    await waitFor(() => {
      expect(mockUseUnidadeEducacional).toHaveBeenLastCalledWith({
        codigo_eol: "123456",
        page: 1,
        page_size: 10,
      });
    });

    await user.click(
      screen.getByRole("button", {
        name: /limpar filtros/i,
      }),
    );

    await waitFor(() => {
      expect(mockUseUnidadeEducacional).toHaveBeenLastCalledWith({
        page: 1,
        page_size: 10,
      });
    });

    expect(
      screen.getByLabelText(/codesc/i),
    ).toHaveValue("");
  });

  it("deve renderizar a paginação quando houver registros", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        count: 25,
        next: null,
        previous: null,
        results: [UNIDADE_EDUCACIONAL],
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderLista();

    expect(
      screen.getByText("EMEF Amorim Lima"),
    ).toBeInTheDocument();
  });

  it("deve alterar a quantidade de registros por página", async () => {
    const user = userEvent.setup();

    mockUseUnidadeEducacional.mockReturnValue({
        data: {
        count: 25,
        next: null,
        previous: null,
        results: [UNIDADE_EDUCACIONAL],
        },
        isLoading: false,
        isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderLista();

    const select = screen.getByRole("combobox");

    await user.click(select);

    await user.click(
        await screen.findByRole("option", {
        name: "20",
        }),
    );

    await waitFor(() => {
        expect(mockUseUnidadeEducacional).toHaveBeenLastCalledWith({
        page: 1,
        page_size: 20,
        });
    });
  });

  it("deve tratar results ausente como lista vazia", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        count: 0,
        next: null,
        previous: null,
        results: undefined,
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useUnidadeEducacional>);

    renderLista();

    expect(
      screen.getByText("Não há unidades cadastradas"),
    ).toBeInTheDocument();
  });

  it("deve tratar count ausente como zero", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        count: undefined,
        next: null,
        previous: null,
        results: [UNIDADE_EDUCACIONAL],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useUnidadeEducacional>);

    renderLista();

    expect(
      screen.getByText("Não há unidades cadastradas"),
    ).toBeInTheDocument();
  });

  it("deve limpar a Subprefeitura ao alterar a Diretoria Regional", async () => {
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
  } as ReturnType<typeof useListarDiretoriasRegionais>);

  renderLista();

  const dre = screen.getByRole("button", {
    name: /diretoria regional/i,
  });

  // Seleciona a primeira DRE.
  await user.click(dre);

  await user.click(
    screen.getByRole("option", {
      name: "DRE Butantã",
    }),
  );

  // Seleciona a Subprefeitura.
  const subprefeitura = screen.getByRole("button", {
    name: /subprefeitura/i,
  });

  await user.click(subprefeitura);

  await user.click(
    screen.getByRole("option", {
      name: "Subprefeitura Butantã",
    }),
  );

  // Agora troca a DRE.
  await user.click(dre);

  await user.click(
    screen.getByRole("option", {
      name: "DRE Campo Limpo",
    }),
  );

  // A regra do handleFiltroChange deve limpar a Subprefeitura.
  expect(
    screen.getByRole("button", {
      name: /subprefeitura/i,
    }),
  ).toHaveTextContent(/selecione/i);
});

  it("deve usar os códigos alternativos nos textos das opções", async () => {
    const user = userEvent.setup();
    mockUseTodosTiposUnidades.mockReturnValue({
      data: [{ uuid: "tipo-2", sigla: "", codigo_eol: 42 }],
    } as unknown as ReturnType<typeof useTodosTiposUnidades>);
    mockUseListarDiretoriasRegionais.mockReturnValue({
      data: {
        results: [{ id: 2, nome_curto: "", abreviacao: "DRE ALT" }],
      },
    } as ReturnType<typeof useListarDiretoriasRegionais>);
    mockUseTodosSubprefeituras.mockReturnValue({
      data: [{ uuid: "sub-2", nome: "", codigo_eol: "SUB-42" }],
    } as ReturnType<typeof useTodosSubprefeituras>);
    mockUseTodasUnidadesEducacionais.mockReturnValue({
      data: [{ ...UNIDADE_EDUCACIONAL, nome: "", codigo_eol: "UE-42" }],
    } as ReturnType<typeof useTodasUnidadesEducacionais>);

    renderLista();

    for (const [nomeCampo, nomeOpcao] of [
      [/tipo de escola/i, "42"],
      [/diretoria regional/i, "DRE ALT"],
      [/subprefeitura/i, "SUB-42"],
    ] as const) {
      await user.click(screen.getByRole("button", { name: nomeCampo }));
      expect(screen.getByRole("option", { name: nomeOpcao })).toBeInTheDocument();
      await user.keyboard("{Escape}");
    }

    await user.click(screen.getByRole("button", { name: /diretoria regional/i }));
    await user.click(screen.getByRole("option", { name: "DRE ALT" }));
    await user.click(screen.getByRole("button", { name: /^unidade educacional/i }));
    expect(screen.getByRole("option", { name: "UE-42" })).toBeInTheDocument();
  });

});
