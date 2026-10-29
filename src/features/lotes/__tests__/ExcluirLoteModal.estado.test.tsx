import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ExcluirLoteModal } from "../components/ExcluirLoteModal";

vi.mock("../hooks/useDeleteLote", () => ({
  useExcluirLote: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/utils/ExcluirEntidadeModal", () => ({
  ExcluirEntidadeModal: ({ onErro }: { onErro: (erro: unknown) => boolean }) => (
    <button type="button" onClick={() => onErro({ status: 400, message: {} })}>
      Simular bloqueio sem equipes
    </button>
  ),
}));

vi.mock("../components/AlertaErroExclusaoLote", () => ({
  AlertaErroExclusaoLote: ({
    aberto,
    vinculados,
    onOpenChange,
  }: {
    aberto: boolean;
    vinculados: unknown[];
    onOpenChange: (aberto: boolean) => void;
  }) =>
    aberto && (
      <div role="alert">
        <span>{vinculados.length} equipes</span>
        <button type="button" onClick={() => onOpenChange(true)}>
          Notificar abertura
        </button>
        <button type="button" onClick={() => onOpenChange(false)}>
          Fechar alerta
        </button>
      </div>
    ),
}));

it("mantém o erro ao notificar abertura e limpa apenas ao fechar, mesmo sem equipes na resposta", () => {
  render(<ExcluirLoteModal uuid="lote-1" />);
  fireEvent.click(screen.getByRole("button", { name: "Simular bloqueio sem equipes" }));
  expect(screen.getByRole("alert")).toHaveTextContent("0 equipes");
  fireEvent.click(screen.getByRole("button", { name: "Notificar abertura" }));
  expect(screen.getByRole("alert")).toHaveTextContent("0 equipes");
  fireEvent.click(screen.getByRole("button", { name: "Fechar alerta" }));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
