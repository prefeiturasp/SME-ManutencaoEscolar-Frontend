import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { DadosSolicitacaoManutencao } from "../components/form/DadosSolicitacaoManutencao";
import { DetalhesSolicitacaoManutencao } from "../components/form/DetalhesSolicitacaoManutencao";
import type { SolicitacaoManutencaoDetalhe } from "../types/solicitacaoManutencao.types";

const mocks = vi.hoisted(() => ({ semSituacoes: false }));

vi.mock("../hooks/useOpcoesSolicitacaoManutencao", () => ({
  useOpcoesSolicitacaoManutencao: (campo: string) => ({
    data:
      campo === "situacoes" && mocks.semSituacoes
        ? undefined
        : campo === "situacoes"
          ? {
              solicitacao: [
                { value: "aguardando_analise_dre", label: "Situação retornada pelo backend" },
              ],
            }
          : [],
    isPending: false,
    isError: false,
  }),
}));
vi.mock("../components/form/informacoes_ue/InformacoesUE", () => ({ InformacoesUE: () => null }));
vi.mock("../components/form/VisualizarServicosManutencao", () => ({
  VisualizarServicosManutencao: () => null,
}));
vi.mock("../components/form/InformacoesAdicionais", () => ({ InformacoesAdicionais: () => null }));

it("exibe no cabeçalho o rótulo da situação retornado pelo backend", () => {
  render(<DadosSolicitacaoManutencao somenteLeitura situacao="aguardando_analise_dre" />);
  const titulo = screen.getByRole("heading", { name: "Dados da solicitação" });
  expect(titulo.parentElement).toContainElement(
    screen.getByText("Situação retornada pelo backend"),
  );
});

it("exibe o texto padrão enquanto as situações não estão disponíveis", () => {
  mocks.semSituacoes = true;
  try {
    render(<DadosSolicitacaoManutencao somenteLeitura situacao="aguardando_analise_dre" />);
    expect(screen.getByText("Aguardando análise da DRE")).toBeInTheDocument();
  } finally {
    mocks.semSituacoes = false;
  }
});

it("exibe o código quando a situação não consta nas opções", () => {
  render(<DadosSolicitacaoManutencao somenteLeitura situacao="situacao_desconhecida" />);
  expect(screen.getByText("situacao_desconhecida")).toBeInTheDocument();
});

it("exibe a situação nos detalhes quando solicitado", () => {
  const solicitacao: SolicitacaoManutencaoDetalhe = {
    uuid: "sol1",
    codigo: "001",
    data_envio: null,
    fase: "solicitacao",
    situacao: "aguardando_analise_dre",
    tipo_atendimento: "comum",
    unidade_educacional: { id: 1, uuid: "ue1", codigo_eol: "123", nome: "Escola" },
    informacoes_adicionais: "",
    servicos: [],
  };
  render(<DetalhesSolicitacaoManutencao solicitacao={solicitacao} exibirSituacao />);
  expect(screen.getByText("Situação retornada pelo backend")).toBeInTheDocument();
});
