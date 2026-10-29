import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DadosSolicitacaoManutencao } from "../components/form/DadosSolicitacaoManutencao";
import { InformacoesAdicionais } from "../components/form/InformacoesAdicionais";
import { InformacoesUE } from "../components/form/informacoes_ue/InformacoesUE";

const consulta = vi.hoisted(() => ({
  data: undefined as { value: string; label: string }[] | undefined,
  isPending: false,
  isError: false,
  refetch: vi.fn(),
}));
beforeEach(() => {
  consulta.data = [
    { value: "comum", label: "Comum" },
    { value: "urgente", label: "Urgente" },
  ];
  consulta.isPending = false;
  consulta.isError = false;
  consulta.refetch.mockClear();
});

describe("campos da solicitação", () => {
  it("informa seleção de atendimento e término da interação", async () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    render(
      <DadosSolicitacaoManutencao
        valor=""
        onChange={onChange}
        onBlur={onBlur}
        erro="Obrigatório"
      />,
    );
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

vi.mock("../hooks/useOpcoesSolicitacaoManutencao", () => ({
  useOpcoesSolicitacaoManutencao: () => consulta,
}));

it("bloqueia o atendimento durante o carregamento sem mostrar erro de lista vazia", () => {
  consulta.data = undefined;
  consulta.isPending = true;
  render(<DadosSolicitacaoManutencao />);
  expect(screen.getByRole("combobox")).toBeDisabled();
  expect(screen.getByText("Carregando...")).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.queryByText(/Nenhum tipo/)).not.toBeInTheDocument();
});

it("informa a falha e permite tentar carregar os atendimentos novamente", () => {
  consulta.data = undefined;
  consulta.isError = true;
  render(<DadosSolicitacaoManutencao />);
  expect(screen.getByRole("combobox")).toBeDisabled();
  expect(screen.getByText(/carregar os tipos de atendimento/)).toHaveAttribute("role", "alert");
  fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  expect(consulta.refetch).toHaveBeenCalledExactlyOnceWith();
  expect(screen.queryByText(/Nenhum tipo/)).not.toBeInTheDocument();
});

it("informa quando o backend retorna uma lista vazia de atendimentos", () => {
  consulta.data = [];
  render(<DadosSolicitacaoManutencao />);
  expect(screen.getByRole("combobox")).toBeDisabled();
  expect(screen.getByText(/Nenhum tipo de atendimento/)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "Tentar novamente" })).not.toBeInTheDocument();
});
