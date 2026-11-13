import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProfissionalExclusao } from "@/features/profissional/components/form/ProfissionalExclusao";

const mocks = vi.hoisted(() => ({
  useDeleteProfissional: vi.fn(),
  mutateAsync: vi.fn(),
  excluirEntidadeModal: vi.fn(),
}));

vi.mock("@/features/profissional/hooks/useDeleteProfissional", () => ({
  useDeleteProfissional: mocks.useDeleteProfissional,
}));

vi.mock("@/utils/ExcluirEntidadeModal", () => ({
  ExcluirEntidadeModal: (props: unknown) => {
    mocks.excluirEntidadeModal(props);
    return <div data-testid="excluir-profissional" />;
  },
}));

describe("ProfissionalExclusao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useDeleteProfissional.mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: false,
    });
  });

  it("inicializa a exclusão com o UUID do profissional", () => {
    render(<ProfissionalExclusao uuid="profissional-1" />);

    expect(mocks.useDeleteProfissional).toHaveBeenCalledExactlyOnceWith("profissional-1");
  });

  it("configura o modal com os textos, retorno e ação esperados", () => {
    render(<ProfissionalExclusao uuid="profissional-1" />);

    expect(mocks.excluirEntidadeModal).toHaveBeenCalledWith({
      titulo: "Excluir profissional",
      textoBotao: "Excluir profissional",
      mensagemSucesso: "O profissional foi excluído.",
      mensagemErro: "Não conseguimos excluir o profissional. Por favor, tente novamente.",
      rotaRetorno: "/profissionais",
      loading: false,
      onExcluir: mocks.mutateAsync,
    });
  });

  it("repassa ao modal o estado pendente da exclusão", () => {
    mocks.useDeleteProfissional.mockReturnValue({
      mutateAsync: mocks.mutateAsync,
      isPending: true,
    });

    render(<ProfissionalExclusao uuid="profissional-1" />);

    expect(mocks.excluirEntidadeModal).toHaveBeenCalledWith(
      expect.objectContaining({ loading: true }),
    );
  });
});
