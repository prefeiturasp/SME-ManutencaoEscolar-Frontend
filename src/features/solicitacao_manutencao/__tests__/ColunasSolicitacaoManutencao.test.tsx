import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { criarColunasSolicitacaoManutencao } from "../components/list/ColunasSolicitacaoManutencao";

it.each([
  [true, "aguardando_analise_dre", true],
  [true, "nao_enviado_dre", false],
  [true, "aprovada_dre", false],
  [false, "aguardando_analise_dre", false],
] as const)(
  "controla o acesso à página de análise: DRE=%s, situação=%s",
  (ehGestorDre, situacao, permitido) => {
    const colunas = criarColunasSolicitacaoManutencao({
      fases: [],
      situacoes: [],
      tipos: [],
      ehGestorDre,
    });
    render(
      <>
        {colunas.find((coluna) => coluna.id === "acoes")!.renderizar!({
          uuid: "sol1",
          codigo: "0001",
          situacao,
          fase: "solicitacao",
          tipo_atendimento: "comum",
          data_envio: null,
        })}
      </>,
    );
    const nome = `${ehGestorDre ? "Enviar para GME/SME" : "Enviar para DRE"} 0001`;
    if (permitido) {
      expect(screen.getByRole("link", { name: nome })).toHaveAttribute(
        "href",
        "/solicitacao_manutencao/analisar/sol1",
      );
      expect(screen.getByRole("link", { name: "Detalhes da solicitação 0001" })).toHaveAttribute(
        "href",
        "/solicitacao_manutencao/visualizar/sol1",
      );
    } else {
      expect(screen.getByRole("button", { name: nome })).toBeDisabled();
    }
  },
);

it.each(["necessidade_revisao_ue", "nao_enviado_dre"])(
  "oferece edição para solicitação em %s",
  (situacao) => {
    const colunas = criarColunasSolicitacaoManutencao({ fases: [], situacoes: [], tipos: [] });
    const acoes = colunas.find((coluna) => coluna.id === "acoes")!;
    render(
      <>
        {acoes.renderizar!({
          uuid: "sol1",
          codigo: "0001",
          situacao,
          fase: "solicitacao",
          tipo_atendimento: "comum",
          data_envio: null,
        })}
      </>,
    );
    expect(screen.getByRole("link", { name: "Editar solicitação 0001" })).toHaveAttribute(
      "href",
      "/solicitacao_manutencao/sol1/editar",
    );
    expect(screen.getByRole("link", { name: "Detalhes da solicitação 0001" })).toHaveAttribute(
      "href",
      "/solicitacao_manutencao/visualizar/sol1",
    );
  },
);
