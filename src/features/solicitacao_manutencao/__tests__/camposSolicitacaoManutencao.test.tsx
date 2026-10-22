import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DadosSolicitacaoManutencao } from "../components/form/DadosSolicitacaoManutencao";
import { InformacoesAdicionais } from "../components/form/InformacoesAdicionais";
import { InformacoesUE } from "../components/form/informacoes_ue/InformacoesUE";

describe("campos da solicitação", () => {
  it("informa seleção de atendimento e término da interação", async () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    render(<DadosSolicitacaoManutencao valor="" onChange={onChange} onBlur={onBlur} erro="Obrigatório" />);
    const select = screen.getByRole("combobox", { name: "Tipo de atendimento" });
    fireEvent.keyDown(select, { key: "ArrowDown" });
    const comum = await screen.findByRole("option", { name: "Comum" });
    expect(onBlur).not.toHaveBeenCalled();
    fireEvent.click(comum);
    fireEvent.keyDown(select, { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("option", { name: "Urgente" }));
    fireEvent.blur(select);
    expect(onChange.mock.calls).toEqual([["comum"], ["urgente"]]);
    expect(onBlur).toHaveBeenCalled();
    expect(screen.getByText("Obrigatório")).toBeInTheDocument();
    expect(select).toHaveAttribute("aria-invalid", "true");
    const ids = select.getAttribute("aria-describedby")!.split(" ");
    expect(ids.map((id) => document.getElementById(id)?.textContent)).toEqual([
      "Selecione o tipo de atendimento da sua solicitação.",
      "Obrigatório",
    ]);
  });
  it("permite usar os campos sem callbacks opcionais", async () => {
    render(
      <>
        <DadosSolicitacaoManutencao />
        <InformacoesAdicionais />
      </>,
    );
    const select = screen.getByRole("combobox", { name: "Tipo de atendimento" });
    fireEvent.keyDown(select, { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("option", { name: "Comum" }));
    fireEvent.blur(select);
    expect(select).toHaveAttribute("aria-invalid", "false");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Texto" } });
  });
  it("notifica alterações das informações adicionais", () => {
    const onChange = vi.fn();
    render(<InformacoesAdicionais valor="Inicial" onChange={onChange} className="custom" />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Detalhe" } });
    expect(onChange).toHaveBeenCalledWith("Detalhe");
  });
  it("exibe dados da UE sem espaços extras e usa fallback quando ausentes", () => {
    render(
      <InformacoesUE
        dados={{ codesc: " 000086 ", tipoEscola: "EMEI", cidade: " " }}
        className="custom"
      />,
    );
    expect(screen.getByText("000086")).toBeInTheDocument();
    expect(screen.getByText("EMEI")).toBeInTheDocument();
    expect(screen.getAllByText("Não informado")).toHaveLength(10);
    expect(screen.getByRole("region", { name: "Informações da UE" })).toHaveClass("custom");
  });
});
