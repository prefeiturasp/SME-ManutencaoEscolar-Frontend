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
import { UnidadeEducacionalForm } from "@/features/unidade_educacional/components/form/FormularioUnidadeEducacional";
import { useUnidadeEducacional } from "@/features/unidade_educacional/hooks/useUnidadeEducacional";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} />
  ),
}));

vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: ({
    mensagem,
  }: {
    mensagem?: string;
  }) => (
    <div data-testid="loading-global">
      {mensagem ?? "Carregando..."}
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
  uuid: "unidade-uuid-1",
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
    data: undefined,
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

function renderFormulario(uuid?: string) {
  return render(
    <UnidadeEducacionalForm uuid={uuid} />,
  );
}

describe("UnidadeEducacionalForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configurarHooksPadrao();
  });

  it("deve renderizar o formulário no modo de criação", () => {
    renderFormulario();

    expect(
      screen.getByText("Informações da UE"),
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

  it("deve renderizar o título no modo de edição", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: UNIDADE_EDUCACIONAL,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario("unidade-uuid-1");

    expect(
      screen.getByRole("heading", {
        name: "Unidade Educacional",
      }),
    ).toBeInTheDocument();
  });

  it("deve chamar o hook com UUID vazio no modo de criação", () => {
    renderFormulario();

    expect(mockUseUnidadeEducacional).toHaveBeenCalledWith("");
  });

  it("deve chamar o hook com o UUID informado no modo de edição", () => {
    renderFormulario("unidade-uuid-1");

    expect(mockUseUnidadeEducacional).toHaveBeenCalledWith(
      "unidade-uuid-1",
    );
  });

  it("deve navegar para a lista ao clicar em Cancelar", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await user.click(
      screen.getByRole("button", {
        name: "Cancelar",
      }),
    );

    expect(pushMock).toHaveBeenCalledTimes(1);

    expect(pushMock).toHaveBeenCalledWith(
      "/unidades-educacionais",
    );
  });

  it("deve manter o botão Anterior desabilitado na primeira etapa", () => {
    renderFormulario();

    expect(
      screen.getByRole("button", {
        name: "Anterior",
      }),
    ).toBeDisabled();
  });

  it("deve renderizar o loading durante o carregamento da unidade no modo edição", () => {
  mockUseUnidadeEducacional.mockReturnValue({
    data: undefined,
    isLoading: true,
    isError: false,
  } as ReturnType<typeof useUnidadeEducacional>);

  renderFormulario("unidade-uuid-1");
  expect(
      screen.queryByText("Informações da UE"),
    ).not.toBeInTheDocument(); 
  expect(
    screen.getByTestId("loading-global"),
  ).toBeInTheDocument();
});

  it("deve exibir estado vazio quando a unidade não existir", () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario("unidade-inexistente");

    expect(
      screen.getByText(
        "Esta informação não está mais disponível!",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Este item não existe ou foi excluído por outro usuário/i,
      ),
    ).toBeInTheDocument();
  });

  it("deve preencher o formulário com os dados da unidade no modo edição", async () => {
    mockUseUnidadeEducacional.mockReturnValue({
      data: UNIDADE_EDUCACIONAL,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useUnidadeEducacional>);

    renderFormulario("unidade-uuid-1");

    await waitFor(() => {
      expect(
        screen.getByLabelText("CODESC (Código EOL)"),
      ).toHaveValue("123456");
    });

    expect(
      screen.getByLabelText("Unidade Educacional"),
    ).toHaveValue("EMEF Amorim Lima");

    expect(
      screen.getByLabelText("Lote"),
    ).toHaveValue("Lote 001");

    expect(
      screen.getByLabelText("E-mail"),
    ).toHaveValue("teste@email.com");

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

  it("deve utilizar Nenhuma como opção de Subprefeitura", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await user.click(
      screen.getByLabelText("Subprefeitura"),
    );

    expect(
      screen.getByRole("option", {
        name: "Nenhuma",
      }),
    ).toBeInTheDocument();
  });

  it("deve renderizar as opções carregadas pelos hooks", async () => {
    const user = userEvent.setup();

    renderFormulario();

    await user.click(
      screen.getByLabelText("Tipo de escola"),
    );

    expect(
      screen.getByRole("option", {
        name: "EMEF",
      }),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");

    await user.click(
      screen.getByLabelText(
        "Diretoria Regional de Educação (DRE)",
      ),
    );

    expect(
      screen.getByRole("option", {
        name: "DRE Butantã",
      }),
    ).toBeInTheDocument();
  });
});
