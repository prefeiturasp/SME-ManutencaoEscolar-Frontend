import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExcluirCargoModal } from "../components/ExcluirCargoModal";

const { useExcluirCargoMock, mutateAsyncMock, excluirEntidadeModalMock } = vi.hoisted(() => ({
  useExcluirCargoMock: vi.fn(),
  mutateAsyncMock: vi.fn(),
  excluirEntidadeModalMock: vi.fn((_props: unknown) => null),
}));

vi.mock("../hooks/useDeleteCargo", () => ({
  useExcluirCargo: useExcluirCargoMock,
}));

vi.mock("@/utils/ExcluirEntidadeModal", () => ({
  ExcluirEntidadeModal: excluirEntidadeModalMock,
}));

type PropsExcluirEntidadeModal = {
  titulo: string;
  textoBotao: string;
  mensagemSucesso: string;
  mensagemErro: string;
  rotaRetorno: string;
  loading: boolean;
  onExcluir: () => Promise<unknown>;
};

function obterPropsModal(): PropsExcluirEntidadeModal {
  return excluirEntidadeModalMock.mock.calls.at(-1)?.[0] as PropsExcluirEntidadeModal;
}

describe("ExcluirCargoModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mutateAsyncMock.mockResolvedValue({
      success: true,
    });

    useExcluirCargoMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });
  });

  it("inicializa o hook com o UUID do cargo", () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    render(<ExcluirCargoModal uuid={uuid} />);

    expect(useExcluirCargoMock).toHaveBeenCalledTimes(1);

    expect(useExcluirCargoMock).toHaveBeenCalledWith(uuid);
  });

  it("configura o modal de exclusão do cargo", () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    render(<ExcluirCargoModal uuid={uuid} />);

    const propsModal = obterPropsModal();

    expect(propsModal).toEqual({
      titulo: "Excluir cargo?",
      textoBotao: "Excluir cargo",
      mensagemSucesso: "O cargo foi excluído.",
      mensagemErro: "Não conseguimos excluir o cargo. Por favor, tente novamente.",
      rotaRetorno: "/cargos",
      loading: false,
      onExcluir: mutateAsyncMock,
    });
  });

  it("repassa o estado pendente como loading", () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    useExcluirCargoMock.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: true,
    });

    render(<ExcluirCargoModal uuid={uuid} />);

    const propsModal = obterPropsModal();

    expect(propsModal.loading).toBe(true);
  });

  it("repassa mutateAsync como função de exclusão", async () => {
    const uuid = "9df513b2-a3d4-4da4-a9ec-8681747094ee";

    render(<ExcluirCargoModal uuid={uuid} />);

    const propsModal = obterPropsModal();

    await propsModal.onExcluir();

    expect(mutateAsyncMock).toHaveBeenCalledTimes(1);
  });
});
