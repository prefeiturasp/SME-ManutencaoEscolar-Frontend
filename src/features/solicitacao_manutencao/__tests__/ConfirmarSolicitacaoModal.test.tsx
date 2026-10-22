import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmarSolicitacaoModal } from "../components/form/ConfirmarSolicitacaoModal";

describe("ConfirmarSolicitacaoModal", () => {
  it("revisa sem salvar e encaminha cada ação ao callback correto", () => {
    const props = { aberto: true, onOpenChange: vi.fn(), onSalvar: vi.fn(), onEnviar: vi.fn() };
    render(<ConfirmarSolicitacaoModal {...props} />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar e continuar depois" }));
    expect(props.onSalvar).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Enviar para aprovação" }));
    expect(props.onEnviar).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Revisar informações" }));
    expect(props.onOpenChange).toHaveBeenCalledWith(false);
  });
  it("bloqueia ações e fechamento por Escape enquanto processa e mostra erro", () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmarSolicitacaoModal
        aberto
        processando
        erro="Falha ao salvar"
        onOpenChange={onOpenChange}
        onSalvar={vi.fn()}
        onEnviar={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Falha ao salvar");
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
  it("não mostra conteúdo quando fechado", () => {
    render(
      <ConfirmarSolicitacaoModal
        aberto={false}
        onOpenChange={vi.fn()}
        onSalvar={vi.fn()}
        onEnviar={vi.fn()}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
