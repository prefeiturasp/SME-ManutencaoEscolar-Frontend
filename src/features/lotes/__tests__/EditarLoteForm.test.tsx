import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EditarLoteForm } from "@/features/lotes/components/EditarLoteForm";
import type { DreVinculada, Lote } from "@/features/lotes/types/lotes.types";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  editarLote: vi.fn(),
  useEditarLote: vi.fn(),
  useEmpresas: vi.fn(),
  useListarDiretoriasRegionais: vi.fn(),
  toastErro: vi.fn(),
  toastSucesso: vi.fn(),
  formatarDataHora: vi.fn((data: string) => `formatada:${data}`),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
  }),
}));

vi.mock("@/features/lotes/hooks/useEditarLote", () => ({
  useEditarLote: mocks.useEditarLote,
}));

vi.mock("@/features/empresa/hooks/useEmpresas", () => ({
  useEmpresas: mocks.useEmpresas,
}));

vi.mock("@/features/diretoria_regional/hooks/useDiretoriaRegional", () => ({
  useListarDiretoriasRegionais: mocks.useListarDiretoriasRegionais,
}));

vi.mock("@/components/ui/toast-custom", () => ({
  toastErro: mocks.toastErro,
  toastSucesso: mocks.toastSucesso,
}));

vi.mock("@/utils/formatadores", () => ({
  formatarDataHora: mocks.formatarDataHora,
}));

vi.mock("@/app/(cadastro)/lotes/components/AlertaErroVinculoLote", () => ({
  AlertaErroVinculoLote: ({
    aberto,
    titulo,
    mensagem,
    width,
    vinculados,
    onOpenChange,
  }: {
    aberto: boolean;
    titulo: string;
    mensagem: string;
    width: number;
    vinculados: DreVinculada[];
    onOpenChange: (aberto: boolean) => void;
  }) => (
    <div data-testid="alerta-vinculo">
      <span data-testid="alerta-aberto">{String(aberto)}</span>

      <span data-testid="alerta-titulo">{titulo}</span>

      <span data-testid="alerta-mensagem">{mensagem}</span>

      <span data-testid="alerta-width">{width}</span>

      <span data-testid="alerta-vinculados">{JSON.stringify(vinculados)}</span>

      {aberto && (
        <button type="button" onClick={() => onOpenChange(false)}>
          Fechar alerta
        </button>
      )}
    </div>
  ),
}));

vi.mock("@/features/lotes/components/FormLote", async () => {
  const { useFormContext } = await import("react-hook-form");

  return {
    FormLote: ({
      empresasOpcoes,
      diretoriasRegionaisOpcoes,
    }: {
      empresasOpcoes: Array<{
        label: string;
        value: string;
      }>;
      diretoriasRegionaisOpcoes: Array<{
        label: string;
        value: string;
      }>;
    }) => {
      const { register } = useFormContext();

      return (
        <div>
          <label htmlFor="codigo_cadastro">Código de cadastro</label>
          <input id="codigo_cadastro" {...register("codigo_cadastro")} />

          <label htmlFor="nome">Nome</label>
          <input id="nome" {...register("nome")} />

          <label htmlFor="empresa">Empresa</label>
          <select id="empresa" {...register("empresa")}>
            <option value="">Selecione</option>

            {empresasOpcoes.map((empresa) => (
              <option key={empresa.value} value={empresa.value}>
                {empresa.label}
              </option>
            ))}
          </select>

          <label htmlFor="periodo_inicial">Período inicial</label>
          <input id="periodo_inicial" {...register("periodo_inicial")} />

          <label htmlFor="periodo_final">Período final</label>
          <input id="periodo_final" {...register("periodo_final")} />

          <label htmlFor="status">Status</label>
          <select id="status" {...register("status")}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>

          <fieldset>
            <legend>Diretorias regionais</legend>

            {diretoriasRegionaisOpcoes.map((diretoria) => (
              <label key={diretoria.value}>
                <input
                  type="checkbox"
                  value={diretoria.value}
                  {...register("diretorias_regionais")}
                />

                {diretoria.label}
              </label>
            ))}
          </fieldset>

          <div data-testid="empresas-opcoes">
            {JSON.stringify(empresasOpcoes)}
          </div>

          <div data-testid="diretorias-opcoes">
            {JSON.stringify(diretoriasRegionaisOpcoes)}
          </div>
        </div>
      );
    },
  };
});

const uuid = "07f14275-59ee-4e67-812a-d5aaa2cedb62";

const empresa = {
  id: 10,
  uuid: "empresa-uuid-10",
  nome: "Empresa XPTO",
};

const diretoriaRegional = {
  id: 1,
  nome: "Diretoria Regional de Educação Butantã",
  nome_curto: "DRE BT",
};

const diretoriaSemNomeCurto = {
  id: 2,
  nome: "Diretoria Regional de Educação Ipiranga",
  nome_curto: "",
};

const lote = {
  id: 1,
  uuid,
  codigo_cadastro: "LOTE-001",
  nome: "Lote de manutenção",
  empresa,
  periodo_inicial: "2026-08-01",
  periodo_final: "2026-12-31",
  status: true,
  diretorias_regionais: [diretoriaRegional],
  criado_por_nome: "Matheus",
  atualizado_por_nome: "João",
  username: "44331733621",
  criado_em: "2026-08-12T21:21:00Z",
  atualizado_em: "2026-08-13T14:02:00Z",
} as unknown as Lote;

type ResultadoMutation = {
  success: boolean;
  status?: number;
  title?: string;
  message?: string;
  vinculados?: DreVinculada[];
};

type OpcoesMutation = {
  onSuccess: (resultado: ResultadoMutation) => void;
  onError: (error: Error) => void;
};

function configurarHooks() {
  mocks.useEditarLote.mockReturnValue({
    mutate: mocks.editarLote,
  });

  mocks.useEmpresas.mockReturnValue({
    data: {
      results: [empresa],
    },
  });

  mocks.useListarDiretoriasRegionais.mockReturnValue({
    data: {
      results: [diretoriaRegional, diretoriaSemNomeCurto],
    },
  });
}

function obterOpcoesMutation(): OpcoesMutation {
  return mocks.editarLote.mock.calls[0][1] as OpcoesMutation;
}

function obterLinhaAuditoria(tipo: "INSERIDO" | "ALTERADO") {
  return screen.getByText((_conteudo, elemento) => {
    return (
      elemento?.tagName === "P" &&
      elemento.textContent?.includes(`${tipo} por`) === true
    );
  });
}

async function alterarNomeESalvar(novoNome = "Lote atualizado") {
  const user = userEvent.setup();

  const inputNome = screen.getByRole("textbox", {
    name: "Nome",
  });

  await user.clear(inputNome);
  await user.type(inputNome, novoNome);

  const botaoSalvar = screen.getByRole("button", {
    name: "Salvar",
  });

  await waitFor(() => {
    expect(botaoSalvar).toBeEnabled();
  });

  await user.click(botaoSalvar);

  await waitFor(() => {
    expect(mocks.editarLote).toHaveBeenCalled();
  });

  return user;
}

describe("EditarLoteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configurarHooks();
  });

  it("deve carregar os hooks com os parâmetros corretos", async () => {
    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    await waitFor(() => {
      expect(mocks.useEditarLote).toHaveBeenCalledWith(uuid);

      expect(mocks.useEmpresas).toHaveBeenCalledWith({
        page_size: "all",
      });

      expect(mocks.useListarDiretoriasRegionais).toHaveBeenCalled();
    });
  });

  it("deve renderizar os valores iniciais", () => {
    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    expect(
      screen.getByRole("heading", {
        name: "Editar Lote",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("textbox", {
        name: "Código de cadastro",
      }),
    ).toHaveValue("LOTE-001");

    expect(
      screen.getByRole("textbox", {
        name: "Nome",
      }),
    ).toHaveValue("Lote de manutenção");

    expect(
      screen.getByRole("combobox", {
        name: "Empresa",
      }),
    ).toHaveValue("empresa-uuid-10");

    expect(
      screen.getByRole("textbox", {
        name: "Período inicial",
      }),
    ).toHaveValue("2026-08-01");

    expect(
      screen.getByRole("textbox", {
        name: "Período final",
      }),
    ).toHaveValue("2026-12-31");

    expect(
      screen.getByRole("combobox", {
        name: "Status",
      }),
    ).toHaveValue("true");

    expect(
      screen.getByRole("checkbox", {
        name: "DRE BT",
      }),
    ).toBeChecked();

    expect(
      screen.getByRole("link", {
        name: "Cancelar",
      }),
    ).toHaveAttribute("href", "/lotes");

    expect(
      screen.getByRole("button", {
        name: "Salvar",
      }),
    ).toBeDisabled();
  });

  it("deve montar opções de empresas e DREs", () => {
    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    expect(screen.getByTestId("empresas-opcoes")).toHaveTextContent(
      JSON.stringify([
        {
          label: "Empresa XPTO",
          value: "empresa-uuid-10",
        },
      ]),
    );

    expect(screen.getByTestId("diretorias-opcoes")).toHaveTextContent(
      JSON.stringify([
        {
          label: "DRE BT",
          value: "1",
        },
        {
          label: "Diretoria Regional de Educação Ipiranga",
          value: "2",
        },
      ]),
    );
  });

  it("deve aceitar empresas retornadas como array", () => {
    mocks.useEmpresas.mockReturnValue({
      data: [empresa],
    });

    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    expect(screen.getByTestId("empresas-opcoes")).toHaveTextContent(
      JSON.stringify([
        {
          label: "Empresa XPTO",
          value: "empresa-uuid-10",
        },
      ]),
    );
  });

  it("deve usar listas vazias sem respostas dos hooks", () => {
    mocks.useEmpresas.mockReturnValue({
      data: undefined,
    });

    mocks.useListarDiretoriasRegionais.mockReturnValue({
      data: undefined,
    });

    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    expect(screen.getByTestId("empresas-opcoes")).toHaveTextContent("[]");

    expect(screen.getByTestId("diretorias-opcoes")).toHaveTextContent("[]");
  });

  it("deve usar valores padrão nos campos opcionais", () => {
    const loteSemOpcionais = {
      ...lote,
      nome: null,
      empresa: null,
      periodo_inicial: null,
      periodo_final: null,
      status: false,
      diretorias_regionais: undefined,
      criado_por_nome: null,
      atualizado_por_nome: null,
    } as unknown as Lote;

    render(<EditarLoteForm uuid={uuid} lote={loteSemOpcionais} />);

    expect(
      screen.getByRole("textbox", {
        name: "Nome",
      }),
    ).toHaveValue("");

    expect(
      screen.getByRole("combobox", {
        name: "Empresa",
      }),
    ).toHaveValue("");

    expect(
      screen.getByRole("textbox", {
        name: "Período inicial",
      }),
    ).toHaveValue("");

    expect(
      screen.getByRole("textbox", {
        name: "Período final",
      }),
    ).toHaveValue("");

    expect(
      screen.getByRole("combobox", {
        name: "Status",
      }),
    ).toHaveValue("false");

    expect(
      screen.getByRole("checkbox", {
        name: "DRE BT",
      }),
    ).not.toBeChecked();

    expect(obterLinhaAuditoria("INSERIDO")).toHaveTextContent(
      "INSERIDO por Não informado",
    );

    expect(obterLinhaAuditoria("ALTERADO")).toHaveTextContent(
      "ALTERADO por Não informado",
    );
  });

  it("deve renderizar os dados de auditoria", () => {
    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    expect(obterLinhaAuditoria("INSERIDO")).toHaveTextContent(
      "INSERIDO por Matheus (44331733621) em formatada:2026-08-12T21:21:00Z",
    );

    expect(obterLinhaAuditoria("ALTERADO")).toHaveTextContent(
      "ALTERADO por João (44331733621) em formatada:2026-08-13T14:02:00Z",
    );

    expect(mocks.formatarDataHora).toHaveBeenCalledWith("2026-08-12T21:21:00Z");

    expect(mocks.formatarDataHora).toHaveBeenCalledWith("2026-08-13T14:02:00Z");
  });

  it("deve permanecer desabilitado quando inválido", async () => {
    const user = userEvent.setup();

    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    await user.clear(
      screen.getByRole("textbox", {
        name: "Nome",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Salvar",
        }),
      ).toBeDisabled();
    });

    expect(mocks.editarLote).not.toHaveBeenCalled();
  });

  it("deve enviar os dados para a edição", async () => {
    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    await alterarNomeESalvar();

    expect(mocks.editarLote).toHaveBeenCalledWith(
      {
        codigo_cadastro: "LOTE-001",
        nome: "Lote atualizado",
        empresa: "empresa-uuid-10",
        periodo_inicial: "2026-08-01",
        periodo_final: "2026-12-31",
        status: "true",
        diretorias_regionais: ["1"],
      },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      }),
    );
  });

  it("deve tratar a edição realizada com sucesso", async () => {
    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    await alterarNomeESalvar();

    act(() => {
      obterOpcoesMutation().onSuccess({
        success: true,
      });
    });

    expect(mocks.toastSucesso).toHaveBeenCalledWith({
      titulo: "Sucesso!",
      descricao: "As alterações foram salvas.",
    });

    expect(mocks.replace).toHaveBeenCalledWith("/lotes");

    expect(mocks.toastErro).not.toHaveBeenCalled();
  });

  it("deve abrir alerta no erro 400 com vínculos", async () => {
    const vinculados = [
      {
        id: 1,
        nome: "DRE Butantã",
      },
    ] as unknown as DreVinculada[];

    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    const user = await alterarNomeESalvar();

    act(() => {
      obterOpcoesMutation().onSuccess({
        success: false,
        status: 400,
        title: "Diretorias já vinculadas",
        message: "Existem diretorias vinculadas a outro lote.",
        vinculados,
      });
    });

    expect(screen.getByTestId("alerta-aberto")).toHaveTextContent("true");

    expect(screen.getByTestId("alerta-titulo")).toHaveTextContent(
      "Diretorias já vinculadas",
    );

    expect(screen.getByTestId("alerta-mensagem")).toHaveTextContent(
      "Existem diretorias vinculadas a outro lote.",
    );

    expect(screen.getByTestId("alerta-vinculados")).toHaveTextContent(
      JSON.stringify(vinculados),
    );

    expect(screen.getByTestId("alerta-width")).toHaveTextContent("672");

    expect(mocks.toastErro).not.toHaveBeenCalled();

    expect(mocks.replace).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", {
        name: "Fechar alerta",
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("alerta-aberto")).toHaveTextContent("false");
    });
  });

  it("deve usar lista vazia no erro 400 sem vínculos", async () => {
    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    await alterarNomeESalvar();

    act(() => {
      obterOpcoesMutation().onSuccess({
        success: false,
        status: 400,
        title: "Erro de validação",
        message: "Não foi possível atualizar o lote.",
      });
    });

    expect(screen.getByTestId("alerta-aberto")).toHaveTextContent("true");

    expect(screen.getByTestId("alerta-vinculados")).toHaveTextContent("[]");

    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("deve tratar erro diferente de 400", async () => {
    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    await alterarNomeESalvar();

    act(() => {
      obterOpcoesMutation().onSuccess({
        success: false,
        status: 500,
        title: "Erro interno",
        message: "Não foi possível atualizar o lote.",
      });
    });

    expect(mocks.toastErro).toHaveBeenCalledWith({
      titulo: "Erro interno",
      descricao: "Não foi possível atualizar o lote.",
    });

    expect(mocks.replace).toHaveBeenCalledWith("/lotes");

    expect(mocks.toastSucesso).not.toHaveBeenCalled();
  });

  it("deve exibir o aviso quando o lote ativo estiver próximo do vencimento", () => {
    vi.useFakeTimers();

    try {
      vi.setSystemTime(new Date(2026, 8, 3, 12, 0, 0));

      const loteProximoDoVencimento = {
        ...lote,
        status: true,
        periodo_final: "2026-09-04",
      } as Lote;

      render(<EditarLoteForm uuid={uuid} lote={loteProximoDoVencimento} />);

      expect(
        screen.getByText("1 dias", {
          selector: "strong",
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByText((_conteudo, elemento) => {
          const textoNormalizado = elemento?.textContent
            ?.replaceAll(/\s+/g, " ")
            .trim();

          return (
            elemento?.tagName === "SPAN" &&
            textoNormalizado === "Faltam 1 dias para o vencimento da licitação!"
          );
        }),
      ).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("deve tratar erro inesperado da mutation", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    await alterarNomeESalvar();

    const error = new Error("Falha inesperada");

    act(() => {
      obterOpcoesMutation().onError(error);
    });

    expect(consoleError).toHaveBeenCalledWith(
      "Erro inesperado ao editar lote:",
      error,
    );

    expect(mocks.toastErro).toHaveBeenCalledWith({
      titulo: "Erro",
      descricao:
        "Não conseguimos salvar as alterações. Por favor, tente novamente.",
    });

    expect(mocks.replace).not.toHaveBeenCalled();

    expect(mocks.toastSucesso).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
