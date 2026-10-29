import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mutateAsyncMock, useExcluirEquipeMock, excluirEntidadeModalMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
  useExcluirEquipeMock: vi.fn(),
  excluirEntidadeModalMock: vi.fn(),
}));

vi.mock("@/features/equipe/hooks/useExcluirEquipe", () => ({
  useExcluirEquipe: useExcluirEquipeMock,
}));

vi.mock("@/utils/ExcluirEntidadeModal", () => ({
  ExcluirEntidadeModal: (props: unknown) => {
    excluirEntidadeModalMock(props);

    return <div data-testid="excluir-entidade-modal" />;
  },
}));

import { ExcluirEquipeModal } from "@/features/equipe/components/form/ExcluirEquipeModal";

const UUID = "equipe-123";

describe("ExcluirEquipeModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useExcluirEquipeMock.mockReturnValue({ mutateAsync: mutateAsyncMock, isPending: false });
  });

  it("busca o hook de exclusão com o UUID da equipe", () => {
    render(<ExcluirEquipeModal uuid={UUID} />);

    expect(useExcluirEquipeMock).toHaveBeenCalledWith(UUID);
  });

  it("configura o modal de confirmação de exclusão da equipe", () => {
    render(<ExcluirEquipeModal uuid={UUID} />);

    expect(screen.getByTestId("excluir-entidade-modal")).toBeInTheDocument();
    expect(excluirEntidadeModalMock).toHaveBeenCalledWith({
      titulo: "Excluir equipe?",
      textoBotao: "Excluir equipe",
      mensagemSucesso: "A equipe foi excluída.",
      mensagemErro: "Não conseguimos excluir a equipe. Por favor, tente novamente.",
      rotaRetorno: "/empresas/equipes",
      loading: false,
      onExcluir: mutateAsyncMock,
    });
  });

  it("informa ao modal quando a exclusão está pendente", () => {
    useExcluirEquipeMock.mockReturnValue({ mutateAsync: mutateAsyncMock, isPending: true });

    render(<ExcluirEquipeModal uuid={UUID} />);

    expect(excluirEntidadeModalMock).toHaveBeenCalledWith(
      expect.objectContaining({ loading: true }),
    );
  });
});
