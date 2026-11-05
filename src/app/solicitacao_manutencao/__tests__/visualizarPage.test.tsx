import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import Page from "../visualizar/[uuid]/page";

vi.mock(
  "@/features/solicitacao_manutencao/components/form/VisualizarSolicitacaoManutencaoPage",
  () => ({
    VisualizarSolicitacaoManutencaoPage: ({ uuid }: { uuid: string }) => <p>Solicitação {uuid}</p>,
  }),
);

it("aguarda os parâmetros da rota e encaminha o UUID para os detalhes", async () => {
  render(await Page({ params: Promise.resolve({ uuid: "solicitacao-123" }) }));
  expect(screen.getByText("Solicitação solicitacao-123")).toBeInTheDocument();
});
