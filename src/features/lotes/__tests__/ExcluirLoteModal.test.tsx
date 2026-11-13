import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExcluirLoteModal } from "../components/ExcluirLoteModal";
import { useExcluirLote } from "../hooks/useDeleteLote";

vi.mock("../hooks/useDeleteLote", () => ({
  useExcluirLote: vi.fn(),
}));

vi.mock("@/utils/ExcluirEntidadeModal", () => ({
  ExcluirEntidadeModal: ({
    titulo,
    textoBotao,
    mensagemSucesso,
    mensagemErro,
    rotaRetorno,
    loading,
    onExcluir,
  }: {
    titulo: string;
    textoBotao: string;
    mensagemSucesso: string;
    mensagemErro: string;
    rotaRetorno: string;
    loading: boolean;
    onExcluir: () => Promise<unknown>;
  }) => (
    <div>
      <span>{titulo}</span>
      <span>{textoBotao}</span>
      <span>{mensagemSucesso}</span>
      <span>{mensagemErro}</span>
      <span>{rotaRetorno}</span>
      <span>{loading ? "carregando" : "parado"}</span>

      <button type="button" onClick={() => void onExcluir()}>
        Executar exclusão
      </button>
    </div>
  ),
}));

const mockUseExcluirLote = vi.mocked(useExcluirLote);

describe("ExcluirLoteModal", () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseExcluirLote.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useExcluirLote>);
  });

  it("deve configurar o modal de exclusão do lote", () => {
    render(<ExcluirLoteModal uuid="uuid-lote" />);

    expect(mockUseExcluirLote).toHaveBeenCalledWith("uuid-lote");

    expect(screen.getByText("Excluir lote?")).toBeInTheDocument();
    expect(screen.getByText("Excluir lote")).toBeInTheDocument();
    expect(screen.getByText("O lote foi excluído.")).toBeInTheDocument();

    expect(
      screen.getByText(
        "Não conseguimos excluir o lote. Por favor, tente novamente.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByText("/lotes")).toBeInTheDocument();
    expect(screen.getByText("parado")).toBeInTheDocument();
  });

  it("deve repassar o estado de carregamento", () => {
    mockUseExcluirLote.mockReturnValue({
      mutateAsync,
      isPending: true,
    } as unknown as ReturnType<typeof useExcluirLote>);

    render(<ExcluirLoteModal uuid="uuid-lote" />);

    expect(screen.getByText("carregando")).toBeInTheDocument();
  });

  it("deve repassar mutateAsync para o componente genérico", () => {
    mutateAsync.mockResolvedValueOnce(undefined);

    render(<ExcluirLoteModal uuid="uuid-lote" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Executar exclusão",
      }),
    );

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith();
  });
});
