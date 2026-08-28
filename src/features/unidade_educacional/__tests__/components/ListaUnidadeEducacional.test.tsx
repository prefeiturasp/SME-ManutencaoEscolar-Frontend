import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useTodosSubprefeituras } from "@/features/subprefeitura/hooks/useSubprefeitura";
import { useTodosTiposUnidades } from "@/features/tipo_unidade/hooks/useTipoUnidade";
import { criarColunasUnidadeEducacional } from "@/features/unidade_educacional/components/list/ColunaUnidadeEducacional";
import { UnidadeEducacionalLista } from "@/features/unidade_educacional/components/list/ListaUnidadeEducacional";
import { useTodasUnidadesEducacionais, useUnidadeEducacional } from "@/features/unidade_educacional/hooks/useUnidadeEducacional";
import { UnidadeEducacional } from "@/features/unidade_educacional/types/unidadesEducacionais.types";
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
    <img alt={alt} {...props} />
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


const UNIDADE_EDUCACIONAL: UnidadeEducacional = {
  id: 1,
  uuid: "7f4e8e2a-6b3f-4e2a-8f2a-1b2c3d4e5f60",
  nome: "EMEF Amorim Lima",
  codigo_eol: "123456",
  diretoria_regional: {
    id: 1,
    nome_curto: "DRE Butantã",
  },
  tipo_escola: {
    uuid: "tipo-1",
    sigla: "EMEF",
  },
  subprefeitura: {
    uuid: "subprefeitura-1",
    nome: "Butantã",
  },
  lote: "001",
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
    } as ReturnType<typeof useUnidadeEducacional>);

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
    } as ReturnType<typeof useUnidadeEducacional>);

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

    const quantidadeChamadas =
      mockUseUnidadeEducacional.mock.calls.length;

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
    } as ReturnType<typeof useUnidadeEducacional>);

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
    } as ReturnType<typeof useUnidadeEducacional>);

    renderLista();

    expect(
      screen.getByText("Não há unidades cadastradas"),
    ).toBeInTheDocument();
  });

});