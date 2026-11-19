import { expect, it } from "vitest";
import Page from "./page";
import { AnalisarSolicitacaoManutencaoPage } from "@/features/solicitacao_manutencao/components/form/AnalisarSolicitacaoManutencaoPage";

it("encaminha o UUID da rota para a página de análise", async () => {
  const resultado = await Page({ params: Promise.resolve({ uuid: "sol-123" }) });
  expect(resultado.type).toBe(AnalisarSolicitacaoManutencaoPage);
  expect(resultado.props).toEqual({ uuid: "sol-123" });
});
