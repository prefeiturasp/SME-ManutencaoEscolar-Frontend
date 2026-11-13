import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { AlertaErroVinculoEmpresa } from "@/app/(cadastro)/empresas/components/AlertaErroVinculoEmpresa";

vi.mock("@/components/shared/AlertaErro/AlertaErro", () => ({
  AlertaErro: ({
    aberto,
    titulo,
    mensagem,
    children,
    onOpenChange,
  }: {
    aberto: boolean;
    titulo: string;
    mensagem: string;
    children: ReactNode;
    onOpenChange: (aberto: boolean) => void;
  }) =>
    aberto ? (
      <div role="alertdialog">
        <h2>{titulo}</h2>
        <p>{mensagem}</p>
        {children}

        <button type="button" onClick={() => onOpenChange(false)}>
          Fechar
        </button>
      </div>
    ) : null,
}));

describe("AlertaErroVinculoEmpresa", () => {
  it("não exibe o alerta quando está fechado", () => {
    render(
      <AlertaErroVinculoEmpresa
        aberto={false}
        titulo="Não é possível excluir a empresa"
        mensagem="Existe um vínculo."
        vinculados={["Lote 001"]}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("mostra a mensagem sem lista para um único lote", () => {
    render(
      <AlertaErroVinculoEmpresa
        aberto
        titulo="Não é possível excluir a empresa"
        mensagem="A empresa possui vínculo com o Lote 001."
        vinculados={["Lote 001"]}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("A empresa possui vínculo com o Lote 001.")).toBeInTheDocument();

    expect(screen.queryByText("Lotes")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("lista os lotes quando há mais de um vínculo", () => {
    render(
      <AlertaErroVinculoEmpresa
        aberto
        titulo="Não é possível excluir a empresa"
        mensagem="A empresa possui vínculos."
        vinculados={["Lote 001", "Lote 002"]}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Lotes")).toBeInTheDocument();

    const lista = screen.getByRole("list");

    expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Lote 001",
      "Lote 002",
    ]);

    expect(lista).toBeInTheDocument();
  });

  it("solicita o fechamento do alerta", () => {
    const onOpenChange = vi.fn();

    render(
      <AlertaErroVinculoEmpresa
        aberto
        titulo="Não é possível excluir a empresa"
        mensagem="A empresa possui vínculos."
        vinculados={[]}
        onOpenChange={onOpenChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));

    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });
});
