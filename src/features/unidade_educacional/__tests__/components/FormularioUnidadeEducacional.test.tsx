import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useTodosCargosEol } from "@/features/cargo_eol/hooks/useCargoEol";
import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useTodosSubprefeituras } from "@/features/subprefeitura/hooks/useSubprefeitura";
import { useTodosTiposUnidades } from "@/features/tipo_unidade/hooks/useTipoUnidade";
import { UnidadeEducacionalForm } from "@/features/unidade_educacional/components/form/FormularioUnidadeEducacional";
import {
  useAtualizarUnidadeEducacional,
  useUnidadeEducacional,
} from "@/features/unidade_educacional/hooks/useUnidadeEducacional";
import { camposEstaoPreenchidos } from "../../components/form/unidadeEducacionalForm.utils";

const UUID = "unidade-uuid-1";

const { pushMock, montarPayloadAtualizacaoMock, mutateAsyncMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  montarPayloadAtualizacaoMock: vi.fn(),
  mutateAsyncMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <span role="img" aria-label={alt} {...props} />
  ),
}));

vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: () => <div data-testid="loading-global">Carregando...</div>,
}));

vi.mock("@/features/unidade_educacional/hooks/useUnidadeEducacional", () => ({
  useUnidadeEducacional: vi.fn(),
  useAtualizarUnidadeEducacional: vi.fn(),
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

vi.mock("@/features/cargo_eol/hooks/useCargoEol", () => ({
  useTodosCargosEol: vi.fn(),
}));

vi.mock("@/features/unidade_educacional/components/form/unidadeEducacionalForm.utils", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/unidade_educacional/components/form/unidadeEducacionalForm.utils")
  >("@/features/unidade_educacional/components/form/unidadeEducacionalForm.utils");

  return {
    ...actual,
    montarPayloadAtualizacao: montarPayloadAtualizacaoMock,
  };
});

const mockUseUnidadeEducacional = vi.mocked(useUnidadeEducacional);
const mockUseAtualizarUnidadeEducacional = vi.mocked(useAtualizarUnidadeEducacional);

const mockUseListarDiretoriasRegionais = vi.mocked(useListarDiretoriasRegionais);

const mockUseTodosSubprefeituras = vi.mocked(useTodosSubprefeituras);

const mockUseTodosTiposUnidades = vi.mocked(useTodosTiposUnidades);

const mockUseTodosCargosEol = vi.mocked(useTodosCargosEol);

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
  responsaveis: [
    {
      uuid: "responsavel-uuid-1",
      registro_funcional: "1234567",
      nome: "João da Silva",
      email: "joao@example.com",
      telefone: "1133334444",
      celular: "11999998888",
      cargo: {
        codigo: "DIRETOR",
        nome: "Diretor",
      },
      ativo: true,
      criado_pelo_sincronizador: false,
    },
  ],
};

function configurarHooksPadrao() {
  mockUseUnidadeEducacional.mockReturnValue({
    data: UNIDADE_EDUCACIONAL,
    isLoading: false,
    isError: false,
  } as ReturnType<typeof useUnidadeEducacional>);

  mockUseAtualizarUnidadeEducacional.mockReturnValue({
    mutateAsync: mutateAsyncMock,
  } as unknown as ReturnType<typeof useAtualizarUnidadeEducacional>);

  mockUseTodosTiposUnidades.mockReturnValue({
    data: [
      {
        uuid: "tipo-1",
        sigla: "EMEF",
        id: 1,
        codigo_eol: "1",
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

  mockUseTodosCargosEol.mockReturnValue({
    data: [
      {
        codigo: "DIRETOR",
        nome: "Diretor",
        id: 1,
        perfil: "UE",
        ativo: true,
      },
    ],
  } as ReturnType<typeof useTodosCargosEol>);
}

function renderFormulario() {
  return render(<UnidadeEducacionalForm uuid={UUID} />);
}

async function aguardarFormulario() {
  await waitFor(() => {
    expect(screen.getByLabelText("CODESC (Código EOL)")).toHaveValue("123456");
  });
}

describe("UnidadeEducacionalForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsyncMock.mockResolvedValue({
      success: true,
    });
    configurarHooksPadrao();
    montarPayloadAtualizacaoMock.mockReset();
    montarPayloadAtualizacaoMock.mockReturnValue({
      email: "unidade@example.com",
      telefone: "1133334444",
      ativo: true,
      responsaveis: [],
    });
  });

  it("deve chamar o hook com o UUID informado", () => {
    renderFormulario();

    expect(mockUseUnidadeEducacional).toHaveBeenCalledWith(UUID);
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

    expect(screen.getByTestId("loading-global")).toBeInTheDocument();
  });

  it("deve exibir estado vazio quando ocorrer erro", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    expect(screen.getByText("Esta informação não está mais disponível!")).toBeInTheDocument();
  });

  it("deve exibir estado vazio quando não encontrar a unidade", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    expect(screen.getByText("Esta informação não está mais disponível!")).toBeInTheDocument();
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

    expect(pushMock).toHaveBeenCalledWith("/unidades-educacionais");
  });

  it("deve preencher os campos com os dados da unidade", async () => {
    renderFormulario();

    await aguardarFormulario();

    expect(screen.getByLabelText("Unidade Educacional")).toHaveValue("EMEF Amorim Lima");

    expect(screen.getByLabelText("Lote")).toHaveValue("Lote 001");

    expect(screen.getByLabelText("Telefone")).toHaveValue("(11) 99999-9999");

    expect(screen.getByLabelText("E-mail")).toHaveValue("teste@email.com");

    expect(screen.getByLabelText("CEP")).toHaveValue("05455-000");

    expect(screen.getByLabelText("Logradouro")).toHaveValue("Rua das Flores");

    expect(screen.getByLabelText("Número")).toHaveValue("100");

    expect(screen.getByLabelText("Bairro")).toHaveValue("Butantã");

    expect(screen.getByLabelText("Cidade")).toHaveValue("São Paulo");
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

    expect(await screen.findByTestId("etapa-contatos-responsaveis")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Anterior",
      }),
    ).not.toBeDisabled();
  });

  it("deve permanecer na segunda etapa ao clicar em Salvar", async () => {
    const user = userEvent.setup();

    renderFormulario();
    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    await user.click(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    );

    expect(screen.getByTestId("etapa-contatos-responsaveis")).toBeInTheDocument();
  });

  it("deve montar o payload ao salvar as alterações", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    const campoEmail = screen.getByLabelText("E-mail");

    await user.clear(campoEmail);
    await user.type(campoEmail, "novo-email@example.com");

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Salvar",
        }),
      ).toBeEnabled();
    });

    await user.click(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    );

    await waitFor(() => {
      expect(montarPayloadAtualizacaoMock).toHaveBeenCalledTimes(1);
    });
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

    await user.click(screen.getByLabelText("Tipo de escola"));

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

    await user.click(screen.getByLabelText("Diretoria Regional de Educação (DRE)"));

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

    await user.click(screen.getByLabelText("Subprefeitura"));

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

    expect(screen.getByLabelText("Tipo de escola")).toBeInTheDocument();

    expect(screen.getByLabelText("Diretoria Regional de Educação (DRE)")).toBeInTheDocument();

    expect(screen.getByLabelText("Subprefeitura")).toBeInTheDocument();
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
      expect(screen.getByLabelText("CODESC (Código EOL)")).toHaveValue("");
    });

    expect(screen.getByLabelText("Unidade Educacional")).toHaveValue("");

    expect(screen.getByLabelText("Lote")).toHaveValue("");

    expect(screen.getByLabelText("Telefone")).toHaveValue("");

    expect(screen.getByLabelText("E-mail")).toHaveValue("");
  });

  it("não deve avançar para a segunda etapa quando a primeira estiver inválida", async () => {
    const user = userEvent.setup();

    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        ...UNIDADE_EDUCACIONAL,
        dados: {
          ...UNIDADE_EDUCACIONAL.dados,
          email: "email-invalido",
        },
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    await aguardarFormulario();

    const botaoProximo = screen.getByRole("button", {
      name: "Próximo",
    });

    expect(botaoProximo).toBeEnabled();

    await user.click(botaoProximo);

    expect(screen.getByText("Informações da UE")).toBeInTheDocument();

    expect(screen.queryByTestId("etapa-contatos-responsaveis")).not.toBeInTheDocument();
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
    const resultado = camposEstaoPreenchidos({}, []);

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
  it("deve permanecer na segunda etapa quando o formulário for inválido ao salvar", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    const campoEmail = screen.getByLabelText("E-mail");

    await user.clear(campoEmail);
    await user.type(campoEmail, "email-invalido");

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Salvar",
        }),
      ).toBeEnabled();
    });

    await user.click(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    );

    expect(screen.getByTestId("etapa-contatos-responsaveis")).toBeInTheDocument();

    expect(montarPayloadAtualizacaoMock).not.toHaveBeenCalled();
  });
  it("deve chamar a atualização quando o formulário for válido", async () => {
    const user = userEvent.setup();

    const mutateAsyncMock = vi.fn().mockResolvedValue({
      success: true,
    });

    mockUseAtualizarUnidadeEducacional.mockReturnValue({
      mutateAsync: mutateAsyncMock,
    } as unknown as ReturnType<typeof useAtualizarUnidadeEducacional>);

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    const campoEmail = screen.getByLabelText("E-mail");

    await user.clear(campoEmail);
    await user.type(campoEmail, "joao.novo@example.com");

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Salvar",
        }),
      ).toBeEnabled();
    });

    await user.click(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    );

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
    });
  });
  it("deve navegar para a lista ao cancelar na segunda etapa", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    await user.click(
      screen.getByRole("button", {
        name: "Cancelar",
      }),
    );

    expect(pushMock).toHaveBeenCalledWith("/unidades-educacionais");
  });

  it("deve permanecer na segunda etapa quando os contatos forem inválidos", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    const campoRegistroFuncional = screen.getByLabelText("RF ou CPF");

    await user.clear(campoRegistroFuncional);

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Salvar",
        }),
      ).toBeEnabled();
    });

    await user.click(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    );

    expect(screen.getByTestId("etapa-contatos-responsaveis")).toBeInTheDocument();

    expect(montarPayloadAtualizacaoMock).not.toHaveBeenCalled();
  });

  it("deve avançar para a segunda etapa sem lote preenchido", async () => {
    const user = userEvent.setup();

    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        ...UNIDADE_EDUCACIONAL,
        lote: undefined,
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    await waitFor(() => {
      expect(screen.getByLabelText("Lote")).toHaveValue("");
    });

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    expect(await screen.findByTestId("etapa-contatos-responsaveis")).toBeInTheDocument();
  });
  it("deve criar um responsável vazio quando a unidade não possuir responsáveis", async () => {
    const user = userEvent.setup();

    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        ...UNIDADE_EDUCACIONAL,
        responsaveis: [],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    expect(screen.getByLabelText("RF ou CPF")).toHaveValue("");

    expect(screen.getByLabelText("Nome completo")).toHaveValue("");

    expect(screen.getByLabelText("E-mail")).toHaveValue("");
  });
  it("deve preencher os dados do responsável existente", async () => {
    const user = userEvent.setup();

    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        ...UNIDADE_EDUCACIONAL,
        responsaveis: [
          {
            uuid: "responsavel-uuid-1",
            registro_funcional: "7654321",
            nome: "Maria Silva",
            email: "maria@example.com",
            telefone: "1133334444",
            celular: "11999998888",
            cargo: {
              codigo: "DIRETOR",
              nome: "Diretor",
            },
            ativo: true,
            criado_pelo_sincronizador: false,
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    expect(screen.getByLabelText("RF ou CPF")).toHaveValue("7654321");

    expect(screen.getByLabelText("Nome completo")).toHaveValue("Maria Silva");

    expect(screen.getByLabelText("E-mail")).toHaveValue("maria@example.com");

    expect(screen.getByLabelText("Telefone")).toHaveValue("(11) 3333-4444");

    expect(screen.getByLabelText("Celular")).toHaveValue("(11) 99999-8888");
  });
  it("deve renderizar contato quando o responsável não possuir cargo", async () => {
    const user = userEvent.setup();

    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        ...UNIDADE_EDUCACIONAL,
        responsaveis: [
          {
            uuid: "responsavel-uuid-1",
            registro_funcional: "7654321",
            nome: "Maria Silva",
            email: "maria@example.com",
            telefone: "",
            celular: "",
            cargo: undefined,
            ativo: true,
            criado_pelo_sincronizador: false,
          },
          ,
        ],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    expect(screen.getByLabelText("Cargo")).toBeInTheDocument();
  });
  it("deve usar valores vazios quando telefone e celular do responsável não existirem", async () => {
    const user = userEvent.setup();

    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        ...UNIDADE_EDUCACIONAL,
        responsaveis: [
          {
            uuid: "responsavel-uuid-1",
            registro_funcional: "7654321",
            nome: "Maria Silva",
            email: "maria@example.com",
            telefone: "",
            celular: "",
            cargo: {
              codigo: "DIRETOR",
              nome: "Diretor",
            },
            ativo: true,
            criado_pelo_sincronizador: false,
          },
          ,
        ],
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    expect(screen.getByLabelText("Telefone")).toHaveValue("");
    expect(screen.getByLabelText("Celular")).toHaveValue("");
  });
  it("deve manter o botão Salvar desabilitado quando não houver alterações", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    expect(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    ).toBeDisabled();
  });

  it("deve exibir os títulos da etapa de informações gerais", () => {
    renderFormulario();

    expect(screen.getByText("Informações da UE")).toBeInTheDocument();
    expect(screen.getByText("Localização da UE")).toBeInTheDocument();
  });
  it("deve exibir o título da etapa de contatos ao avançar", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    expect(
      await screen.findByRole("heading", {
        name: "Informações dos contatos responsáveis",
      }),
    ).toBeInTheDocument();
  });
  it("deve renderizar os campos do responsável na etapa de contatos", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    expect(await screen.findByLabelText("RF ou CPF")).toBeInTheDocument();

    expect(screen.getByLabelText("Nome completo")).toBeInTheDocument();

    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();

    expect(screen.getByLabelText("Telefone")).toBeInTheDocument();

    expect(screen.getByLabelText("Celular")).toBeInTheDocument();
  });
  it("deve habilitar o botão Salvar quando houver alteração", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    const telefone = await screen.findByLabelText("Telefone");

    await user.clear(telefone);
    await user.type(telefone, "1144445555");

    expect(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    ).toBeEnabled();
  });
  it("deve adicionar um novo contato", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    await user.click(
      screen.getByRole("button", {
        name: "Adicionar novo contato",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Contato 2",
      }),
    ).toBeInTheDocument();
  });
  it("deve remover um contato adicional", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    await user.click(
      screen.getByRole("button", {
        name: "Adicionar novo contato",
      }),
    );

    expect(
      screen.getByRole("heading", {
        name: "Contato 2",
      }),
    ).toBeInTheDocument();

    const botoesRemover = screen.getAllByRole("button", {
      name: "Remover contato",
    });

    await user.click(botoesRemover[1]);

    expect(
      screen.queryByRole("heading", {
        name: "Contato 2",
      }),
    ).not.toBeInTheDocument();
  });

  it("deve tratar o resultado de sucesso após salvar", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    await user.click(
      screen.getByRole("button", {
        name: "Anterior",
      }),
    );

    expect(screen.getByLabelText("CODESC (Código EOL)")).toBeInTheDocument();
  });

  it("deve retornar ao salvar quando o formulário completo for inválido", async () => {
    const user = userEvent.setup();

    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        ...UNIDADE_EDUCACIONAL,
        lote: {
          nome: "a".repeat(201),
        },
      },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    const email = screen.getByLabelText("E-mail");

    await user.clear(email);
    await user.type(email, "novo.email@teste.com");

    const botaoSalvar = screen.getByRole("button", {
      name: "Salvar",
    });

    expect(botaoSalvar).toBeEnabled();

    await user.click(botaoSalvar);

    expect(screen.getByTestId("etapa-contatos-responsaveis")).toBeInTheDocument();

    expect(montarPayloadAtualizacaoMock).not.toHaveBeenCalled();
    expect(mutateAsyncMock).not.toHaveBeenCalled();
  });
  it("deve usar valores vazios quando os dados do responsável forem undefined", async () => {
    const user = userEvent.setup();

    mockUseUnidadeEducacional.mockReturnValue({
      data: {
        ...UNIDADE_EDUCACIONAL,
        responsaveis: [
          {
            uuid: undefined,
            registro_funcional: undefined,
            nome: undefined,
            email: undefined,
            telefone: undefined,
            celular: undefined,
            cargo: undefined,
            ativo: true,
            criado_pelo_sincronizador: false,
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario();

    await aguardarFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Próximo",
      }),
    );

    await screen.findByTestId("etapa-contatos-responsaveis");

    expect(screen.getByLabelText("RF ou CPF")).toHaveValue("");
    expect(screen.getByLabelText("Nome completo")).toHaveValue("");
    expect(screen.getByLabelText("E-mail")).toHaveValue("");
    expect(screen.getByLabelText("Telefone")).toHaveValue("");
    expect(screen.getByLabelText("Celular")).toHaveValue("");
  });
});
