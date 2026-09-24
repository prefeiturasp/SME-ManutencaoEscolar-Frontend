import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UnidadeEducacionalForm } from "@/features/unidade_educacional/components/form/FormularioUnidadeEducacional";

const mockPush = vi.fn();
const mockAtualizarUnidade = vi.fn();
const mockTratarResultado = vi.fn();
const mockTratarErroInesperado = vi.fn();

const mockUseUnidadeEducacional = vi.fn();
const mockUseTodosTiposUnidades = vi.fn();
const mockUseListarDiretoriasRegionais = vi.fn();
const mockUseTodosSubprefeituras = vi.fn();
const mockUseTodosCargosEol = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/features/unidade_educacional/hooks/useUnidadeEducacional", () => ({
  useUnidadeEducacional: () => mockUseUnidadeEducacional(),
  useAtualizarUnidadeEducacional: () => ({
    mutateAsync: mockAtualizarUnidade,
  }),
}));

vi.mock("@/features/tipo_unidade/hooks/useTipoUnidade", () => ({
  useTodosTiposUnidades: () => mockUseTodosTiposUnidades(),
}));

vi.mock("@/features/diretoria_regional/hooks/useDiretoriaRegional", () => ({
  useListarDiretoriasRegionais: () => mockUseListarDiretoriasRegionais(),
}));

vi.mock("@/features/subprefeitura/hooks/useSubprefeitura", () => ({
  useTodosSubprefeituras: () => mockUseTodosSubprefeituras(),
}));

vi.mock("@/features/cargo_eol/hooks/useCargoEol", () => ({
  useTodosCargosEol: () => mockUseTodosCargosEol(),
}));

vi.mock("@/hooks/useFeedbackEntidade", () => ({
  useFeedbackEntidade: () => ({
    tratarResultado: mockTratarResultado,
    tratarErroInesperado: mockTratarErroInesperado,
    alertaProps: {
      aberto: false,
      titulo: "",
      mensagem: "",
      onOpenChange: vi.fn(),
    },
  }),
}));

vi.mock("@/features/unidade_educacional/components/form/unidadeEducacionalForm.utils", () => ({
  camposEstaoPreenchidos: () => true,

  montarPayloadAtualizacao: vi.fn((dados) => ({
    email: dados.email,
    telefone: dados.telefone,
    ativo: dados.status === "true",
    responsaveis: dados.responsaveis,
  })),
}));

vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async (values: unknown) => ({
    values,
    errors: {},
  }),
}));

vi.mock("lucide-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("lucide-react")>();

  return {
    ...actual,
    RotateCw: () => <span data-testid="rotate-icon" />,
  };
});

vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: ({ exibir }: { exibir: boolean }) => (
    <div data-testid="loading">{exibir ? "Carregando..." : ""}</div>
  ),
}));

vi.mock("@/components/shared/ListaVazia/ListaVazia", () => ({
  ListaVazio: ({
    titulo,
    descricao,
    textoBotao,
    href,
  }: {
    titulo: string;
    descricao: string;
    textoBotao: string;
    href: string;
  }) => (
    <div data-testid="lista-vazia">
      <h2>{titulo}</h2>
      <p>{descricao}</p>

      <button type="button" onClick={() => mockPush(href)}>
        {textoBotao}
      </button>
    </div>
  ),
}));

vi.mock("@/components/shared/AlertaErro/AlertaErro", () => ({
  AlertaErro: ({
    aberto,
    titulo,
    mensagem,
  }: {
    aberto: boolean;
    titulo: string;
    mensagem: string;
  }) =>
    aberto ? (
      <div data-testid="alerta-erro">
        <span>{titulo}</span>
        <span>{mensagem}</span>
      </div>
    ) : null,
}));

const unidadeEducacional = {
  codigo_eol: "000001",
  tipo_escola: {
    uuid: "tipo-1",
  },
  diretoria_regional: {
    id: 10,
    nome_curto: "DRE Centro",
    abreviacao: "CENTRO",
  },
  nome: "EMEF Teste",
  subprefeitura: {
    uuid: "sub-1",
  },
  lote: {
    nome: "Lote 1",
  },
  status: true,
  dados: {
    telefone: "1133334444",
    email: "unidade@example.com",
    cep: "36000000",
    logradouro: "Rua Teste",
    numero: "100",
    bairro: "Centro",
    municipio: "Juiz de Fora",
    uf: "MG",
  },
  responsaveis: [
    {
      uuid: "responsavel-1",
      registro_funcional: "1234567",
      nome: "João da Silva",
      cargo: {
        codigo: "DIRETOR",
      },
      email: "joao@example.com",
      telefone: "1133334444",
      celular: "11999998888",
      criado_pelo_sincronizador: true,
    },
  ],
};

function configurarHooks() {
  mockUseUnidadeEducacional.mockReturnValue({
    data: unidadeEducacional,
    isLoading: false,
    isError: false,
  });

  mockUseTodosTiposUnidades.mockReturnValue({
    data: [
      {
        uuid: "tipo-1",
        sigla: "EMEF",
        codigo_eol: "1",
      },
    ],
  });

  mockUseListarDiretoriasRegionais.mockReturnValue({
    data: {
      results: [
        {
          id: 10,
          nome_curto: "DRE Centro",
          abreviacao: "CENTRO",
        },
      ],
    },
  });

  mockUseTodosSubprefeituras.mockReturnValue({
    data: [
      {
        uuid: "sub-1",
        nome: "Subprefeitura Centro",
        codigo_eol: "001",
      },
    ],
  });

  mockUseTodosCargosEol.mockReturnValue({
    data: [
      {
        codigo: "DIRETOR",
        descricao: "Diretor",
      },
    ],
    isLoading: false,
    isError: false,
  });
}

async function avancarParaContatos() {
  const botaoProximo = await screen.findByRole("button", {
    name: "Próximo",
  });

  await waitFor(() => {
    expect(botaoProximo).not.toBeDisabled();
  });

  fireEvent.click(botaoProximo);

  expect(await screen.findByTestId("etapa-contatos-responsaveis")).toBeInTheDocument();
}

describe("UnidadeEducacionalForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configurarHooks();
  });

  it("deve renderizar o formulário da unidade educacional", async () => {
    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    expect(
      await screen.findByRole("heading", {
        name: "Unidade Educacional",
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("etapa-informacoes-gerais")).toBeInTheDocument();
  });

  it("deve exibir o carregamento enquanto busca a unidade", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    expect(screen.getByTestId("loading")).toHaveTextContent("Carregando...");
    expect(screen.queryByText("Unidade Educacional")).not.toBeInTheDocument();
  });

  it("deve exibir a mensagem quando a unidade não estiver disponível", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    expect(screen.getByTestId("lista-vazia")).toBeInTheDocument();
    expect(screen.getByText("Esta informação não está mais disponível!")).toBeInTheDocument();
    expect(screen.getByText("Atualizar página")).toBeInTheDocument();
  });

  it("deve redirecionar ao clicar em Atualizar página", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    fireEvent.click(screen.getByText("Atualizar página"));

    expect(mockPush).toHaveBeenCalledWith("/unidades-educacionais");
  });

  it("deve redirecionar ao clicar em Cancelar", () => {
    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(mockPush).toHaveBeenCalledWith("/unidades-educacionais");
  });

  it("deve iniciar na etapa de informações gerais", () => {
    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    expect(screen.getByTestId("etapa-informacoes-gerais")).toBeInTheDocument();

    expect(screen.queryByTestId("etapa-contatos-responsaveis")).not.toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Próximo" })).toBeInTheDocument();
  });

  it("deve avançar para a etapa de contatos ao clicar em Próximo", async () => {
    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    await avancarParaContatos();

    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("deve voltar para informações gerais ao clicar em Anterior", async () => {
    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    await avancarParaContatos();

    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));

    expect(await screen.findByTestId("etapa-informacoes-gerais")).toBeInTheDocument();

    expect(screen.queryByTestId("etapa-contatos-responsaveis")).not.toBeInTheDocument();
  });

  it("deve desabilitar Anterior na primeira etapa", () => {
    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
  });

  it("deve exibir as opções de tipos, diretorias e subprefeituras", () => {
    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    expect(screen.getByText("EMEF")).toBeInTheDocument();
    expect(screen.getByText("DRE Centro")).toBeInTheDocument();
    expect(screen.getByText("Subprefeitura Centro")).toBeInTheDocument();
  });

  it("deve desabilitar Salvar quando não houver alteração", async () => {
    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    await avancarParaContatos();

    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  });

  it("deve habilitar Salvar quando houver alteração no formulário", async () => {
    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    await avancarParaContatos();

    const campoEmail = screen.getByRole("textbox", {
      name: /e-mail/i,
    });

    fireEvent.change(campoEmail, {
      target: {
        value: "alterado@example.com",
      },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Salvar" })).not.toBeDisabled();
    });
  });

  it("deve chamar a atualização ao salvar", async () => {
    mockAtualizarUnidade.mockResolvedValue({
      success: true,
    });

    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    await avancarParaContatos();

    const campoEmail = screen.getByRole("textbox", {
      name: /e-mail/i,
    });

    fireEvent.change(campoEmail, {
      target: {
        value: "alterado@example.com",
      },
    });

    const botaoSalvar = screen.getByRole("button", {
      name: "Salvar",
    });

    await waitFor(() => {
      expect(botaoSalvar).not.toBeDisabled();
    });

    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(mockAtualizarUnidade).toHaveBeenCalledTimes(1);
    });

    expect(mockAtualizarUnidade).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "unidade@example.com",
        responsaveis: expect.arrayContaining([
          expect.objectContaining({
            email: "alterado@example.com",
          }),
        ]),
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("deve chamar tratarResultado quando a atualização for concluída com sucesso", async () => {
    mockAtualizarUnidade.mockImplementation(
      async (
        _payload: unknown,
        options: {
          onSuccess: (resultado: { success: boolean }) => void;
        },
      ) => {
        options.onSuccess({
          success: true,
        });
      },
    );

    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    await avancarParaContatos();

    const campoEmail = screen.getByRole("textbox", {
      name: /e-mail/i,
    });

    fireEvent.change(campoEmail, {
      target: {
        value: "alterado@example.com",
      },
    });

    const botaoSalvar = screen.getByRole("button", {
      name: "Salvar",
    });

    await waitFor(() => {
      expect(botaoSalvar).not.toBeDisabled();
    });

    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(mockTratarResultado).toHaveBeenCalledWith({
        success: true,
      });
    });
  });

  it("deve chamar tratarErroInesperado quando ocorrer erro ao salvar", async () => {
    const erro = new Error("Erro inesperado");

    mockAtualizarUnidade.mockImplementation(
      async (
        _payload: unknown,
        options: {
          onError: (erro: unknown) => void;
        },
      ) => {
        options.onError(erro);
      },
    );

    render(<UnidadeEducacionalForm uuid="unidade-1" />);

    await avancarParaContatos();

    const campoEmail = screen.getByRole("textbox", {
      name: /e-mail/i,
    });

    fireEvent.change(campoEmail, {
      target: {
        value: "alterado@example.com",
      },
    });

    const botaoSalvar = screen.getByRole("button", {
      name: "Salvar",
    });

    await waitFor(() => {
      expect(botaoSalvar).not.toBeDisabled();
    });

    fireEvent.click(botaoSalvar);

    await waitFor(() => {
      expect(mockTratarErroInesperado).toHaveBeenCalledWith(erro);
    });
  });
});
