import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SolicitacaoEnviadaModal } from "../components/SolicitacaoEnviadaModal";
import { useSolicitacaoEnviadaStore } from "../stores/useSolicitacaoEnviadaStore";

describe("SolicitacaoEnviadaModal", () => {
  const copiar = vi.fn();
  beforeEach(() => {
    useSolicitacaoEnviadaStore.getState().fechar();
    copiar.mockReset().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText: copiar } });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("não abre sem confirmação de envio e mostra o código retornado, preservando zeros", async () => {
    render(<SolicitacaoEnviadaModal />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => useSolicitacaoEnviadaStore.getState().abrir("001234567"));
    expect(
      screen.getByRole("heading", { name: "Solicitação criada com sucesso!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("001234567")).toBeInTheDocument();
    const botaoCopiar = screen.getByRole("button", { name: "Copiar número" });
    fireEvent.click(botaoCopiar);
    fireEvent.focus(botaoCopiar);
    expect(await screen.findByRole("tooltip", { name: "Número copiado" })).toBeInTheDocument();
    expect(copiar).toHaveBeenCalledWith("001234567");
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(useSolicitacaoEnviadaStore.getState().codigo).toBeNull();
  });
  it("trata falha de cópia e permite tentar novamente", async () => {
    useSolicitacaoEnviadaStore.getState().abrir(1234567);
    copiar.mockRejectedValueOnce(new Error("Permissão negada"));
    render(<SolicitacaoEnviadaModal />);
    fireEvent.click(screen.getByRole("button", { name: "Copiar número" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível copiar.");
    const botaoCopiar = screen.getByRole("button", { name: "Copiar número" });
    fireEvent.click(botaoCopiar);
    fireEvent.focus(botaoCopiar);
    await screen.findByRole("tooltip", { name: "Número copiado" });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(copiar).toHaveBeenCalledWith("1234567");
    fireEvent.click(screen.getByRole("button", { name: "Fechar modal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("limpa a confirmação ao fechar por Escape", () => {
    useSolicitacaoEnviadaStore.getState().abrir("123", true);
    render(<SolicitacaoEnviadaModal />);
    expect(
      screen.getByRole("heading", { name: "Solicitação enviada com sucesso!" }),
    ).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(useSolicitacaoEnviadaStore.getState().codigo).toBeNull();
    expect(useSolicitacaoEnviadaStore.getState().enviada).toBe(false);
  });
});
