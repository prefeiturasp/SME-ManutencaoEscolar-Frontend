import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useTodosSubprefeituras } from "@/features/subprefeitura/hooks/useSubprefeitura";
import { useTodosTiposUnidades } from "@/features/tipo_unidade/hooks/useTipoUnidade";
import { camposEstaoPreenchidos, UnidadeEducacionalForm } from "@/features/unidade_educacional/components/form/FormularioUnidadeEducacional";
import { useUnidadeEducacional } from "@/features/unidade_educacional/hooks/useUnidadeEducacional";

const UUID = "unidade-uuid-1";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("next/image", () => ({
  default: ({
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <span role="img" aria-label={alt} {...props} />
  ),
}));

vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: () => (
    <div data-testid="loading-global">
      Carregando...
    </div>
  ),
}));

vi.mock("@/features/unidade_educacional/hooks/useUnidadeEducacional", () => ({
  useUnidadeEducacional: vi.fn(),
}));

vi.mock("@/features/diretoria_regional/hooks/useDiretoriaRegional", () => ({
  useListarDiretoriasRegionais: vi.fn(),
}));

vi.mock("@/features/subprefeitura/hooks/useSubprefeitura", () => ({
  useTodosSubprefeituras: vi.fn(),
}));

vi.mock("@/features/tipo_unidade/hooks/useTipoUnidade", () => ({
  useTodosTiposUnidades: vi.fn(),
}));

const mockUseUnidadeEducacional = vi.mocked(
  useUnidadeEducacional,
);

const mockUseListarDiretoriasRegionais = vi.mocked(
  useListarDiretoriasRegionais,
);

const mockUseTodosSubprefeituras = vi.mocked(
  useTodosSubprefeituras,
);

const mockUseTodosTiposUnidades = vi.mocked(
  useTodosTiposUnidades,
);

const UNIDADE_EDUCACIONAL = {
  id: 1,
  uuid: UUID,
  codigo_eol: "123456",
  nome: "EMEF Amorim Lima",
  tipo_escola: {
    uuid: "tipo-1",
  },
  diretoria_regional: {
    id: 1,
  },
  subprefeitura: {
    uuid: "subprefeitura-1",
  },
  lote: {
    nome: "Lote 001",
  },
  status: true,
  dados: {
    telefone: "11999999999",
    email: "teste@email.com",
    cep: "05455000",
    logradouro: "Rua das Flores",
    numero: "100",
    bairro: "Butantã",
    municipio: "São Paulo",
    uf: "SP",
  },
};

function configurarHooksPadrao() {
  mockUseUnidadeEducacional.mockReturnValue({
    data: UNIDADE_EDUCACIONAL,
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useUnidadeEducacional>);

  mockUseTodosTiposUnidades.mockReturnValue({
    data: [
      {
        uuid: "tipo-1",
        sigla: "EMEF",
        codigo_eol: 1,
      },
    ],
  } as ReturnType<typeof useTodosTiposUnidades>);

  mockUseListarDiretoriasRegionais.mockReturnValue({
    data: {
      results: [
        {
          id: 1,
          nome_curto: "DRE Butantã",
          abreviacao: "DRE-BT",
        },
      ],
    },
  } as ReturnType<typeof useListarDiretoriasRegionais>);

  mockUseTodosSubprefeituras.mockReturnValue({
    data: [
      {
        uuid: "subprefeitura-1",
        nome: "Butantã",
        codigo_eol: "1",
      },
    ],
  } as ReturnType<typeof useTodosSubprefeituras>);
}

function renderFormulario() {
  return render(
    <UnidadeEducacionalForm uuid={UUID} />,
  );
}

async function aguardarFormulario() {
  await waitFor(() => {
    expect(
      screen.getByLabelText("CODESC (Código EOL)"),
    ).toHaveValue("123456");
  });
}

describe("UnidadeEducacionalForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configurarHooksPadrao();
  });

  it("deve chamar o hook com o UUID informado", () => {
    renderFormulario();

    expect(mockUseUnidadeEducacional).toHaveBeenCalledWith(
      UUID,
    );
  });

  it("deve renderizar o formulário", async () => {
    renderFormulario();

    await aguardarFormulario();

    expect(
      screen.getByRole("heading", {
        name: "Unidade Educacional",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Cancelar",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Anterior",
      }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    ).toBeInTheDocument();
  });

  it("deve exibir loading durante o carregamento", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    expect(
      screen.getByTestId("loading-global"),
    ).toBeInTheDocument();
  });

  it("deve exibir estado vazio quando ocorrer erro", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    expect(
      screen.getByText(
        "Esta informação não está mais disponível!",
      ),
    ).toBeInTheDocument();
  });

  it("deve exibir estado vazio quando não encontrar a unidade", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    expect(
      screen.getByText(
        "Esta informação não está mais disponível!",
      ),
    ).toBeInTheDocument();
  });

  it("deve navegar ao clicar em Cancelar", async () => {
    const user = userEvent.setup();

    renderFormulario();
    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Cancelar",
      }),
    );

    expect(pushMock).toHaveBeenCalledWith(
      "/unidades-educacionais",
    );
  });

  it("deve preencher os campos com os dados da unidade", async () => {
    renderFormulario();

    await aguardarFormulario();

    expect(
      screen.getByLabelText("Unidade Educacional"),
    ).toHaveValue("EMEF Amorim Lima");

    expect(
      screen.getByLabelText("Lote"),
    ).toHaveValue("Lote 001");

    expect(
      screen.getByLabelText("Telefone"),
    ).toHaveValue("(11) 99999-9999");

    expect(
      screen.getByLabelText("E-mail"),
    ).toHaveValue("teste@email.com");

    expect(
      screen.getByLabelText("CEP"),
    ).toHaveValue("05455-000");

    expect(
      screen.getByLabelText("Logradouro"),
    ).toHaveValue("Rua das Flores");

    expect(
      screen.getByLabelText("Número"),
    ).toHaveValue("100");

    expect(
      screen.getByLabelText("Bairro"),
    ).toHaveValue("Butantã");

    expect(
      screen.getByLabelText("Cidade"),
    ).toHaveValue("São Paulo");
  });

  it("deve avançar para a segunda etapa quando a primeira estiver válida", async () => {
    const user = userEvent.setup();

    renderFormulario();
    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    expect(
      await screen.findByTestId(
        "etapa-contatos-responsaveis",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Salvar alterações",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Anterior",
      }),
    ).not.toBeDisabled();
  });

  it("deve voltar para a primeira etapa", async () => {
    const user = userEvent.setup();

    renderFormulario();
    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId(
      "etapa-contatos-responsaveis",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Anterior",
      }),
    );

    expect(
      screen.getByText("Informações da UE"),
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId(
        "etapa-contatos-responsaveis",
      ),
    ).not.toBeInTheDocument();
  });

  it("deve permanecer na segunda etapa ao clicar em Salvar alterações", async () => {
    const user = userEvent.setup();

    renderFormulario();
    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId(
      "etapa-contatos-responsaveis",
    );

    await user.click(
      screen.getByRole("button", {
        name: "Salvar alterações",
      }),
    );

    expect(
      screen.getByTestId(
        "etapa-contatos-responsaveis",
      ),
    ).toBeInTheDocument();
  });

  it("deve usar codigo_eol quando o tipo não possuir sigla", async () => {
    
    const user = userEvent.setup();

    mockUseTodosTiposUnidades.mockReturnValue({
      data: [
        {
          uuid: "tipo-1",
          sigla: "",
          codigo_eol: "99",
        },
      ],
    } as ReturnType<typeof useTodosTiposUnidades>);

    renderFormulario();
    await aguardarFormulario();

    await user.click(
      screen.getByLabelText("Tipo de escola"),
    );

    expect(
      screen.getByRole("option", {
        name: "99",
      }),
    ).toBeInTheDocument();
  });

  it("deve usar abreviacao quando a diretoria não possuir nome curto", async () => {
    const user = userEvent.setup();

    mockUseListarDiretoriasRegionais.mockReturnValue({
      data: {
        results: [
          {
            id: 1,
            nome_curto: "",
            abreviacao: "DRE-BT",
          },
        ],
      },
    } as ReturnType<typeof useListarDiretoriasRegionais>);

    renderFormulario();
    await aguardarFormulario();

    await user.click(
      screen.getByLabelText(
        "Diretoria Regional de Educação (DRE)",
      ),
    );

    expect(
      screen.getByRole("option", {
        name: "DRE-BT",
      }),
    ).toBeInTheDocument();
  });

  it("deve usar codigo_eol quando a subprefeitura não possuir nome", async () => {
    const user = userEvent.setup();

    mockUseTodosSubprefeituras.mockReturnValue({
      data: [
        {
          uuid: "subprefeitura-1",
          nome: "",
          codigo_eol: "99",
        },
      ],
    } as ReturnType<typeof useTodosSubprefeituras>);

    renderFormulario();
    await aguardarFormulario();

    await user.click(
      screen.getByLabelText("Subprefeitura"),
    );

    expect(
      screen.getByRole("option", {
        name: "99",
      }),
    ).toBeInTheDocument();
  });

  it("deve funcionar sem opções dos hooks auxiliares", async () => {
    mockUseTodosTiposUnidades.mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useTodosTiposUnidades>);

    mockUseListarDiretoriasRegionais.mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useListarDiretoriasRegionais>);

    mockUseTodosSubprefeituras.mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useTodosSubprefeituras>);

    renderFormulario();
    await aguardarFormulario();

    expect(
      screen.getByLabelText("Tipo de escola"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Diretoria Regional de Educação (DRE)",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Subprefeitura"),
    ).toBeInTheDocument();
  });

  it("deve preencher valores padrão quando dados opcionais não existirem", async () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        ...UNIDADE_EDUCACIONAL,
        codigo_eol: undefined,
        nome: undefined,
        tipo_escola: undefined,
        diretoria_regional: undefined,
        subprefeitura: undefined,
        lote: undefined,
        status: false,
        dados: undefined,
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    await waitFor(() => {
      expect(
        screen.getByLabelText("CODESC (Código EOL)"),
      ).toHaveValue("");
    });

    expect(
      screen.getByLabelText("Unidade Educacional"),
    ).toHaveValue("");

    expect(
      screen.getByLabelText("Lote"),
    ).toHaveValue("");

    expect(
      screen.getByLabelText("Telefone"),
    ).toHaveValue("");

    expect(
      screen.getByLabelText("E-mail"),
    ).toHaveValue("");
  });

  it("não deve avançar para a segunda etapa quando a primeira estiver inválida", async () => {
  const user = userEvent.setup();

  mockUseUnidadeEducacional.mockReturnValue({
    data: {
      ...UNIDADE_EDUCACIONAL,
      nome: "",
    },
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useUnidadeEducacional>);

  renderFormulario();

  await waitFor(() => {
    expect(
      screen.getByLabelText("Unidade Educacional"),
    ).toHaveValue("");
  });

  await user.click(
    screen.getByRole("button", {
      name: "Próximo",
    }),
  );

  expect(
    screen.queryByTestId(
      "etapa-contatos-responsaveis",
    ),
  ).not.toBeInTheDocument();

  expect(
    screen.getByRole("button", {
      name: "Próximo",
    }),
  ).toBeInTheDocument();
});

it("deve retornar false quando um campo estiver undefined", () => {
    const resultado = camposEstaoPreenchidos(
      {
        codigo_eol: undefined,
      },
      ["codigo_eol"],
    );

    expect(resultado).toBe(false);
  });

  it("deve retornar false quando não houver campos", () => {
    const resultado = camposEstaoPreenchidos(
      {},
      [],
    );

    expect(resultado).toBe(false);
  });

  it("deve retornar true quando todos os campos estiverem preenchidos", () => {
    const resultado = camposEstaoPreenchidos(
      {
        codigo_eol: "123456",
        nome: "EMEF Teste",
      },
      ["codigo_eol", "nome"],
    );

    expect(resultado).toBe(true);
  });

});

