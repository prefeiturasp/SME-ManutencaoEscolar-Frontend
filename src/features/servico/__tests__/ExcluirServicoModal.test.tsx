import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mutateAsyncMock, useExcluirServicoMock, excluirEntidadeModalMock } =
  vi.hoisted(() => ({
    mutateAsyncMock: vi.fn(),
    useExcluirServicoMock: vi.fn(),
    excluirEntidadeModalMock: vi.fn(),
  }));

vi.mock("@/features/servico/hooks/useDeleteServico", () => ({
  useExcluirServico: useExcluirServicoMock,
}));

vi.mock("@/utils/ExcluirEntidadeModal", () => ({
  ExcluirEntidadeModal: (props: unknown) => {
    excluirEntidadeModalMock(props);

    return <div data-testid="excluir-entidade-modal" />;
  },
}));

import { ExcluirServicoModal } from "@/features/servico/components/Servico/ExcluirServicoModal";

const UUID = "servico-123";

describe("ExcluirServicoModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useExcluirServicoMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });
  });

  it("deve buscar o hook de exclusão com o UUID do serviço", () => {
    render(<ExcluirServicoModal uuid={UUID} />);

    expect(useExcluirServicoMock).toHaveBeenCalledWith(UUID);
  });

  it("deve configurar o modal de exclusão do serviço", () => {
    render(<ExcluirServicoModal uuid={UUID} />);

    expect(screen.getByTestId("excluir-entidade-modal")).toBeInTheDocument();

    expect(excluirEntidadeModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "Excluir serviço?",
        textoBotao: "Excluir serviço",
        mensagemSucesso: "O serviço foi excluído.",
        mensagemErro:
          "Não conseguimos excluir o serviço. Por favor, tente novamente.",
        rotaRetorno: "/servicos",
        loading: false,
        onExcluir: mutateAsyncMock,
      }),
    );
  });

  it("deve informar ao modal quando a exclusão estiver pendente", () => {
    useExcluirServicoMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: true,
    });

    render(<ExcluirServicoModal uuid={UUID} />);

    expect(excluirEntidadeModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        loading: true,
      }),
    );
  });
});
