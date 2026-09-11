import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { excluirEntidadeModalMock, mutateAsyncMock, useDeleteEmpresaMock } =
  vi.hoisted(() => ({
    excluirEntidadeModalMock: vi.fn(() => null),
    mutateAsyncMock: vi.fn(),
    useDeleteEmpresaMock: vi.fn(),
  }));

vi.mock("@/features/empresa/hooks/useDeleteEmpresa", () => ({
  useDeleteEmpresa: useDeleteEmpresaMock,
}));

vi.mock("@/utils/ExcluirEntidadeModal", () => ({
  ExcluirEntidadeModal: excluirEntidadeModalMock,
}));

import { EmpresaExclusao } from "../components/form/EmpresaExclusao";

const UUID = "uuid-1";
const CNPJ = "12345678000199";

describe("EmpresaExclusao", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDeleteEmpresaMock.mockReturnValue({
      isPending: false,
      mutateAsync: mutateAsyncMock,
    });
  });

  it("deve configurar o modal de exclusão da empresa", () => {
    render(<EmpresaExclusao uuid={UUID} cnpj={CNPJ} />);

    expect(useDeleteEmpresaMock).toHaveBeenCalledWith(UUID);
    expect(excluirEntidadeModalMock).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: "Excluir empresa",
        textoBotao: "Excluir empresa",
        mensagemSucesso:
          "A empresa com CNPJ 12.345.678/0001-99 foi excluída.",
        mensagemErro:
          "Não conseguimos excluir a empresa. Por favor, tente novamente.",
        rotaRetorno: "/empresas",
        loading: false,
        onExcluir: mutateAsyncMock,
      }),
      undefined,
    );
  });

  it("deve repassar o estado pendente ao modal", () => {
    useDeleteEmpresaMock.mockReturnValue({
      isPending: true,
      mutateAsync: mutateAsyncMock,
    });
    render(<EmpresaExclusao uuid={UUID} cnpj={CNPJ} />);

    expect(excluirEntidadeModalMock).toHaveBeenCalledWith(
      expect.objectContaining({ loading: true }),
      undefined,
    );
  });

});
