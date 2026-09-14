import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EditarLoteForm } from "@/features/lotes/components/EditarLoteForm";
import type { Lote } from "@/features/lotes/types/lotes.types";

const mocks = vi.hoisted(() => ({
  editarLote: vi.fn(),
  useEditarLote: vi.fn(),

  tratarResultado: vi.fn(),
  tratarErroInesperado: vi.fn(),
  useFeedbackLote: vi.fn(),

  useOpcoesLote: vi.fn(),

  calcularDiasParaVencimento: vi.fn(),
  deveExibirAvisoVencimento: vi.fn(),

  formatarDataHora: vi.fn((data: string) => `formatada:${data}`),
}));

vi.mock("@/features/lotes/hooks/useEditarLote", () => ({
  useEditarLote: mocks.useEditarLote,
}));

vi.mock("@/features/lotes/hooks/useFeedbackLote", () => ({
  useFeedbackLote: mocks.useFeedbackLote,
}));

vi.mock("@/features/lotes/hooks/useOpcoesLote", () => ({
  useOpcoesLote: mocks.useOpcoesLote,
}));

vi.mock("@/utils/vencimentoLote", () => ({
  calcularDiasParaVencimento: mocks.calcularDiasParaVencimento,
  deveExibirAvisoVencimento: mocks.deveExibirAvisoVencimento,
}));

vi.mock("@/utils/formatadores", () => ({
  formatarDataHora: mocks.formatarDataHora,
}));

vi.mock("@/features/lotes/components/ExcluirLoteModal", () => ({
  ExcluirLoteModal: ({ uuid }: { uuid: string }) => (
    <button type="button" data-testid="excluir-lote">
      Excluir {uuid}
    </button>
  ),
}));

vi.mock("@/app/(cadastro)/lotes/components/AlertaErroVinculoLote", () => ({
  AlertaErroVinculoLote: ({
    aberto,
    titulo,
    mensagem,
    width,
  }: {
    aberto: boolean;
    titulo: string;
    mensagem: string;
    width: number;
  }) => (
    <div data-testid="alerta-vinculo">
      <span data-testid="alerta-aberto">{String(aberto)}</span>
      <span data-testid="alerta-titulo">{titulo}</span>
      <span data-testid="alerta-mensagem">{mensagem}</span>
      <span data-testid="alerta-width">{width}</span>
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

function obterLinhaAuditoria(tipo: "INSERIDO" | "ALTERADO") {
  return screen.getByText((_conteudo, elemento) => {
    return (
      elemento?.tagName === "P" &&
      elemento.textContent?.includes(`${tipo} por`) === true
    );
  });
}

async function alterarNome(novoNome = "Lote atualizado") {
  const user = userEvent.setup();

  const inputNome = screen.getByRole("textbox", {
    name: "Nome",
  });

  await user.clear(inputNome);
  await user.type(inputNome, novoNome);

  return user;
}

describe("EditarLoteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.useEditarLote.mockReturnValue({
      mutate: mocks.editarLote,
    });

    mocks.useFeedbackLote.mockReturnValue({
      tratarResultado: mocks.tratarResultado,
      tratarErroInesperado: mocks.tratarErroInesperado,
      alertaProps: {
        aberto: false,
        titulo: "",
        mensagem: "",
        vinculados: [],
        onOpenChange: vi.fn(),
      },
    });

    mocks.useOpcoesLote.mockReturnValue({
      empresasOpcoes: [
        {
          label: "Empresa XPTO",
          value: "empresa-uuid-10",
        },
      ],
      diretoriasRegionaisOpcoes: [
        {
          label: "DRE BT",
          value: "1",
        },
      ],
    });

    mocks.calcularDiasParaVencimento.mockReturnValue(120);
    mocks.deveExibirAvisoVencimento.mockReturnValue(false);
  });

  it("deve configurar os hooks corretamente", () => {
    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    expect(mocks.useEditarLote).toHaveBeenCalledWith(uuid);

    expect(mocks.useFeedbackLote).toHaveBeenCalledWith({
      mensagemSucesso: "As alterações foram salvas.",
      contextoErro: "editar lote",
    });

    expect(mocks.useOpcoesLote).toHaveBeenCalled();

    expect(mocks.calcularDiasParaVencimento).toHaveBeenCalledWith("2026-12-31");

    expect(mocks.deveExibirAvisoVencimento).toHaveBeenCalledWith(120);
  });

  it("deve renderizar todos os valores iniciais do lote", () => {
    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    expect(
      screen.getByRole("heading", {
        name: "Editar Lote",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Preencha as informações e clique em “salvar” para armazenar os dados.",
      ),
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

    expect(screen.getByTestId("excluir-lote")).toHaveTextContent(
      `Excluir ${uuid}`,
    );
  });

  it("deve repassar as opções para o FormLote", () => {
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
      ]),
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

  it("deve utilizar valores padrão quando os campos opcionais não existirem", () => {
    const loteSemCamposOpcionais = {
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

    render(<EditarLoteForm uuid={uuid} lote={loteSemCamposOpcionais} />);

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

    expect(mocks.calcularDiasParaVencimento).toHaveBeenCalledWith("");
  });

  it("deve manter o botão desabilitado quando o formulário estiver inválido", async () => {
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

  it("deve habilitar o botão quando o formulário válido for alterado", async () => {
    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    await alterarNome();

    await waitFor(() => {
      expect(
        screen.getByRole("button", {
          name: "Salvar",
        }),
      ).toBeEnabled();
    });
  });

  it("deve enviar os dados e callbacks para useEditarLote", async () => {
    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    const user = await alterarNome();

    const botaoSalvar = screen.getByRole("button", {
      name: "Salvar",
    });

    await waitFor(() => {
      expect(botaoSalvar).toBeEnabled();
    });

    await user.click(botaoSalvar);

    await waitFor(() => {
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
        {
          onSuccess: mocks.tratarResultado,
          onError: mocks.tratarErroInesperado,
        },
      );
    });
  });

  it("deve exibir o aviso de vencimento para lote ativo próximo do vencimento", () => {
    mocks.calcularDiasParaVencimento.mockReturnValue(5);
    mocks.deveExibirAvisoVencimento.mockReturnValue(true);

    const loteProximoDoVencimento = {
      ...lote,
      status: true,
      periodo_final: "2026-09-09",
    } as Lote;

    render(<EditarLoteForm uuid={uuid} lote={loteProximoDoVencimento} />);

    expect(
      screen.getByText("5 dias", {
        selector: "strong",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText((_conteudo, elemento) => {
        const texto = elemento?.textContent?.replaceAll(/\s+/g, " ").trim();

        return (
          elemento?.tagName === "SPAN" &&
          texto === "Faltam 5 dias para o vencimento da licitação!"
        );
      }),
    ).toBeInTheDocument();
  });

  it("não deve exibir o aviso quando a data não estiver próxima do vencimento", () => {
    mocks.calcularDiasParaVencimento.mockReturnValue(90);
    mocks.deveExibirAvisoVencimento.mockReturnValue(false);

    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    expect(
      screen.queryByText(/para o vencimento da licitação/i),
    ).not.toBeInTheDocument();

    expect(mocks.deveExibirAvisoVencimento).toHaveBeenCalledWith(90);
  });

  it("não deve exibir nem verificar o aviso quando o lote estiver inativo", () => {
    const loteInativo = {
      ...lote,
      status: false,
    } as Lote;

    render(<EditarLoteForm uuid={uuid} lote={loteInativo} />);

    expect(
      screen.queryByText(/para o vencimento da licitação/i),
    ).not.toBeInTheDocument();

    expect(mocks.calcularDiasParaVencimento).toHaveBeenCalledWith("2026-12-31");

    /*
     * O operador && interrompe a avaliação quando o status é false.
     * Portanto, esta função não deve ser executada.
     */
    expect(mocks.deveExibirAvisoVencimento).not.toHaveBeenCalled();
  });

  it("deve repassar as propriedades do alerta e definir a largura como 672", () => {
    mocks.useFeedbackLote.mockReturnValue({
      tratarResultado: mocks.tratarResultado,
      tratarErroInesperado: mocks.tratarErroInesperado,
      alertaProps: {
        aberto: true,
        titulo: "Diretorias já vinculadas",
        mensagem: "Existem diretorias vinculadas a outro lote.",
        vinculados: [
          {
            id: 1,
            nome: "DRE Butantã",
          },
        ],
        onOpenChange: vi.fn(),
      },
    });

    render(<EditarLoteForm uuid={uuid} lote={lote} />);

    expect(screen.getByTestId("alerta-aberto")).toHaveTextContent("true");

    expect(screen.getByTestId("alerta-titulo")).toHaveTextContent(
      "Diretorias já vinculadas",
    );

    expect(screen.getByTestId("alerta-mensagem")).toHaveTextContent(
      "Existem diretorias vinculadas a outro lote.",
    );

    expect(screen.getByTestId("alerta-width")).toHaveTextContent("672");
  });
});
