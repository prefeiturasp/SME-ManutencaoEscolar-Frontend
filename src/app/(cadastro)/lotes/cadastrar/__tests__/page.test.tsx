import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CadastrarLotePage from "@/app/(cadastro)/lotes/cadastrar/page";
import type { Opcao } from "@/components/types/opcao.types";
import type { CriarLoteResultado } from "@/features/lotes/types/lotes.types";

const {
  mutateMock,
  useEmpresasMock,
  useDiretoriasMock,
  toastSucessoMock,
  toastErroMock,
  capturarFormLotePropsMock,
} = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  useEmpresasMock: vi.fn(),
  useDiretoriasMock: vi.fn(),
  toastSucessoMock: vi.fn(),
  toastErroMock: vi.fn(),
  capturarFormLotePropsMock: vi.fn(),
}));

type OpcoesMutacao = {
  onSuccess: (resultado: CriarLoteResultado) => void;
  onError: (error: Error) => void;
};

vi.mock("@/app/(cadastro)/CadastroBreadcrumb", () => ({
  CadastroBreadcrumb: () => <nav>Breadcrumb cadastro</nav>,
}));

vi.mock("@/app/(cadastro)/lotes/components/AlertaErroVinculoLote", () => ({
  AlertaErroVinculoLote: ({
    aberto,
    titulo,
    mensagem,
    vinculados,
  }: {
    aberto: boolean;
    titulo: string;
    mensagem: string;
    vinculados: ReadonlyArray<readonly [string, string]>;
  }) =>
    aberto ? (
      <div role="alertdialog">
        <h2>{titulo}</h2>
        <p>{mensagem}</p>

        {vinculados.map(([dre, lote]) => (
          <div key={`${dre}-${lote}`}>
            <span>{dre}</span>
            <span>{lote}</span>
          </div>
        ))}
      </div>
    ) : null,
}));

vi.mock("@/features/empresa/hooks/useEmpresas", () => ({
  useEmpresas: useEmpresasMock,
}));

vi.mock("@/features/diretoria_regional/hooks/useDiretoriaRegional", () => ({
  useListarDiretoriasRegionais: useDiretoriasMock,
}));

vi.mock("@/features/lotes/hooks/useCriarLote", () => ({
  useCriarLote: () => ({
    mutate: mutateMock,
  }),
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastSucesso: toastSucessoMock,
  toastErro: toastErroMock,
}));

vi.mock("@/features/lotes/components/FormLote", async () => {
  const { useFormContext } = await import("react-hook-form");

  type FormLoteProps = {
    empresasOpcoes: Opcao[];
    diretoriasRegionaisOpcoes: Opcao[];
  };

  return {
    FormLote: (props: FormLoteProps) => {
      capturarFormLotePropsMock(props);

      const { setValue } = useFormContext();

      function preencherFormulario() {
        const opcoes = {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        };

        setValue("codigo_cadastro", "LOTE-001", opcoes);
        setValue("nome", "Lote teste", opcoes);
        setValue("empresa", "empresa-uuid", opcoes);
        setValue("status", "true", opcoes);
        setValue("periodo_inicial", "2026-08-01", opcoes);
        setValue("periodo_final", "2026-08-31", opcoes);
        setValue("diretorias_regionais", ["10"], opcoes);
      }

      return (
        <button type="button" onClick={preencherFormulario}>
          Preencher formulário
        </button>
      );
    },
  };
});

async function preencherEEnviarFormulario() {
  const user = userEvent.setup();

  await user.click(
    screen.getByRole("button", {
      name: "Preencher formulário",
    }),
  );

  const botaoCadastrar = screen.getByRole("button", {
    name: "Cadastrar lote",
  });

  await waitFor(() => {
    expect(botaoCadastrar).toBeEnabled();
  });

  await user.click(botaoCadastrar);
}

describe("CadastrarLotePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useEmpresasMock.mockReturnValue({
      data: {
        results: [
          {
            uuid: "empresa-uuid",
            nome: "Empresa teste",
            cnpj: 99889215000172,
          },
        ],
      },
    });

    useDiretoriasMock.mockReturnValue({
      data: {
        results: [
          {
            id: 10,
            nome: "DIRETORIA REGIONAL DE EDUCACAO PENHA",
            nome_curto: "DRE PENHA",
          },
          {
            id: 11,
            nome: "DIRETORIA REGIONAL DE EDUCACAO BUTANTA",
            nome_curto: "",
          },
        ],
      },
    });
  });

  it("renderiza os elementos principais da página", () => {
    render(<CadastrarLotePage />);

    expect(
      screen.getByRole("heading", {
        name: "Cadastro de lote",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Preencha as informações e clique em “cadastrar lote”/),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Cancelar",
      }),
    ).toHaveAttribute("href", "/lotes");
  });

  it("transforma empresas e DREs em opções do formulário", () => {
    render(<CadastrarLotePage />);

    expect(capturarFormLotePropsMock).toHaveBeenLastCalledWith({
      empresasOpcoes: [
        {
          label: "Empresa teste",
          value: "empresa-uuid",
          cnpj: "99889215000172",
        },
      ],
      diretoriasRegionaisOpcoes: [
        {
          label: "DRE PENHA",
          value: "10",
        },
        {
          label: "DIRETORIA REGIONAL DE EDUCACAO BUTANTA",
          value: "11",
        },
      ],
    });
  });

  it("trata CNPJ nulo e indefinido", () => {
    useEmpresasMock.mockReturnValue({
      data: {
        results: [
          {
            uuid: "empresa-cnpj-nulo",
            nome: "Empresa com CNPJ nulo",
            cnpj: null,
          },
          {
            uuid: "empresa-sem-cnpj",
            nome: "Empresa sem CNPJ",
          },
        ],
      },
    });

    render(<CadastrarLotePage />);

    expect(capturarFormLotePropsMock).toHaveBeenLastCalledWith({
      empresasOpcoes: [
        {
          label: "Empresa com CNPJ nulo",
          value: "empresa-cnpj-nulo",
          cnpj: undefined,
        },
        {
          label: "Empresa sem CNPJ",
          value: "empresa-sem-cnpj",
          cnpj: undefined,
        },
      ],
      diretoriasRegionaisOpcoes: [
        {
          label: "DRE PENHA",
          value: "10",
        },
        {
          label: "DIRETORIA REGIONAL DE EDUCACAO BUTANTA",
          value: "11",
        },
      ],
    });
  });

  it("utiliza opções vazias quando os hooks não retornam dados", () => {
    useEmpresasMock.mockReturnValue({
      data: undefined,
    });

    useDiretoriasMock.mockReturnValue({
      data: undefined,
    });

    render(<CadastrarLotePage />);

    expect(capturarFormLotePropsMock).toHaveBeenLastCalledWith({
      empresasOpcoes: [],
      diretoriasRegionaisOpcoes: [],
    });
  });

  it("envia os dados e exibe toast de sucesso", async () => {
    mutateMock.mockImplementation((_dados: unknown, opcoes: OpcoesMutacao) => {
      opcoes.onSuccess({
        success: true,
      } as CriarLoteResultado);
    });

    render(<CadastrarLotePage />);

    await preencherEEnviarFormulario();

    expect(mutateMock).toHaveBeenCalledWith(
      {
        codigo_cadastro: "LOTE-001",
        nome: "Lote teste",
        empresa: "empresa-uuid",
        status: "true",
        periodo_inicial: "2026-08-01",
        periodo_final: "2026-08-31",
        diretorias_regionais: ["10"],
      },
      expect.any(Object),
    );

    expect(toastSucessoMock).toHaveBeenCalledWith({
      titulo: "Sucesso!",
      descricao: "O lote foi cadastrado.",
    });

    expect(toastErroMock).not.toHaveBeenCalled();
  });

  it("abre o alerta quando a API retorna erro 400", async () => {
    mutateMock.mockImplementation((_dados: unknown, opcoes: OpcoesMutacao) => {
      opcoes.onSuccess({
        success: false,
        status: 400,
        title: "DRE já vinculada",
        message: "Existem DREs vinculadas a outros lotes.",
        vinculados: [["DRE PENHA", "LOTE-002"]],
      } as CriarLoteResultado);
    });

    render(<CadastrarLotePage />);

    await preencherEEnviarFormulario();

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("DRE já vinculada")).toBeInTheDocument();

    expect(
      screen.getByText("Existem DREs vinculadas a outros lotes."),
    ).toBeInTheDocument();

    expect(screen.getByText("DRE PENHA")).toBeInTheDocument();
    expect(screen.getByText("LOTE-002")).toBeInTheDocument();

    expect(toastErroMock).not.toHaveBeenCalled();
  });

  it("abre o alerta com lista vazia quando vinculados não é informado", async () => {
    mutateMock.mockImplementation((_dados: unknown, opcoes: OpcoesMutacao) => {
      opcoes.onSuccess({
        success: false,
        status: 400,
        title: "DRE já vinculada",
        message: "Não foi possível vincular as DREs.",
      } as CriarLoteResultado);
    });

    render(<CadastrarLotePage />);

    await preencherEEnviarFormulario();

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("DRE já vinculada")).toBeInTheDocument();

    expect(
      screen.getByText("Não foi possível vincular as DREs."),
    ).toBeInTheDocument();

    expect(screen.queryByText("DRE PENHA")).not.toBeInTheDocument();
  });

  it("exibe toast para erro da API diferente de 400", async () => {
    mutateMock.mockImplementation((_dados: unknown, opcoes: OpcoesMutacao) => {
      opcoes.onSuccess({
        success: false,
        status: 500,
        title: "Erro interno",
        message: "Não foi possível criar o lote.",
      } as CriarLoteResultado);
    });

    render(<CadastrarLotePage />);

    await preencherEEnviarFormulario();

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro interno",
      descricao: "Não foi possível criar o lote.",
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("utiliza a mensagem padrão quando a API não retorna mensagem", async () => {
    mutateMock.mockImplementation((_dados: unknown, opcoes: OpcoesMutacao) => {
      opcoes.onSuccess({
        success: false,
        status: 500,
        title: "Erro interno",
        message: "",
      } as CriarLoteResultado);
    });

    render(<CadastrarLotePage />);

    await preencherEEnviarFormulario();

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro interno",
      descricao: "Não conseguimos cadastrar o lote. Tente novamente.",
    });
  });

  it("exibe toast quando ocorre um erro inesperado", async () => {
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    mutateMock.mockImplementation((_dados: unknown, opcoes: OpcoesMutacao) => {
      opcoes.onError(new Error("Falha de rede"));
    });

    render(<CadastrarLotePage />);

    await preencherEEnviarFormulario();

    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Erro inesperado ao cadastrar lote:",
      expect.any(Error),
    );

    expect(toastErroMock).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao: "Ocorreu um erro inesperado ao cadastrar o lote.",
    });

    consoleErrorMock.mockRestore();
  });
});
