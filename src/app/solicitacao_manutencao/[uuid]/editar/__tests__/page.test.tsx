import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import Page from "../page";

vi.mock(
  "@/features/solicitacao_manutencao/components/form/EditarSolicitacaoManutencaoPage",
  () => ({
    EditarSolicitacaoManutencaoPage: ({ uuid }: { uuid: string }) => <div>Editar {uuid}</div>,
  }),
);

it("resolve o UUID da rota e abre a página de edição correspondente", async () => {
  render(await Page({ params: Promise.resolve({ uuid: "solicitacao-123" }) }));
  expect(screen.getByText("Editar solicitacao-123")).toBeInTheDocument();
});
