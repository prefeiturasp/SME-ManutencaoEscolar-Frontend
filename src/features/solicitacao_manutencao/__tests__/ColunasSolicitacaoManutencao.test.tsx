import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { criarColunasSolicitacaoManutencao } from "../components/list/ColunasSolicitacaoManutencao";

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
