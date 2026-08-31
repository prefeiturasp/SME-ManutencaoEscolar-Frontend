import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FiltroComboBoxField } from "@/components/filtro/FiltroComboBoxField";
import type { FiltroListaOption } from "@/components/shared/FiltroLista/types/FiltroLista.type";

const OPCOES: readonly FiltroListaOption[] = [
  { value: "true", label: "Ativo" },
  { value: "false", label: "Inativo" },
];

const OPCOES_COM_PESQUISA: readonly FiltroListaOption[] = [
  { value: "1", label: "Alfa" },
  { value: "2", label: "Beta" },
  { value: "3", label: "Gama" },
  { value: "4", label: "Delta" },
  { value: "5", label: "Épsilon" },
  { value: "6", label: "Zeta" },
];

function renderCampo(
  props?: Partial<Parameters<typeof FiltroComboBoxField>[0]>,
) {
  const onChange = props?.onChange ?? vi.fn();

  render(
    <FiltroComboBoxField
      id="status"
      aria-label="Status"
      value=""
      options={OPCOES}
      onChange={onChange}
      {...props}
    />,
  );

  return { onChange };
}

describe("FiltroComboBoxField", () => {
  it("deve exibir o placeholder quando nenhuma opção está selecionada", () => {
    renderCampo({ placeholder: "Selecione o status" });

    expect(
      screen.getByRole("button", { name: /status/i }),
    ).toHaveTextContent(/selecione o status/i);
  });

  it("deve exibir o rótulo da opção selecionada", () => {
    renderCampo({ value: "true" });

    expect(screen.getByRole("button", { name: /status/i })).toHaveTextContent(
      /ativo/i,
    );
  });

  it("deve desabilitar o botão quando disabled é verdadeiro", () => {
    renderCampo({ disabled: true });

    expect(screen.getByRole("button", { name: /status/i })).toBeDisabled();
  });

  it("deve abrir a lista e exibir as opções ao clicar no botão", async () => {
    const user = userEvent.setup();
    renderCampo();

    await user.click(screen.getByRole("button", { name: /status/i }));

    expect(await screen.findByRole("option", { name: /^ativo$/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /^inativo$/i })).toBeInTheDocument();
  });

  it("deve chamar onChange com o valor ao selecionar uma opção", async () => {
    const user = userEvent.setup();
    const { onChange } = renderCampo();

    await user.click(screen.getByRole("button", { name: /status/i }));
    await user.click(await screen.findByRole("option", { name: /^inativo$/i }));

    expect(onChange).toHaveBeenCalledWith("false");
  });

  it("deve limpar a seleção ao clicar novamente na opção já selecionada", async () => {
    const user = userEvent.setup();
    const { onChange } = renderCampo({ value: "true" });

    await user.click(screen.getByRole("button", { name: /status/i }));
    await user.click(await screen.findByRole("option", { name: /^ativo$/i }));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("não deve exibir o campo de pesquisa quando houver até 5 opções", async () => {
    const user = userEvent.setup();
    renderCampo();

    await user.click(screen.getByRole("button", { name: /status/i }));

    expect(screen.queryByPlaceholderText(/pesquisar/i)).not.toBeInTheDocument();
  });

  it("deve exibir o campo de pesquisa quando houver mais de 5 opções", async () => {
    const user = userEvent.setup();
    renderCampo({ options: OPCOES_COM_PESQUISA });

    await user.click(screen.getByRole("button", { name: /status/i }));

    expect(
      await screen.findByPlaceholderText(/pesquisar/i),
    ).toBeInTheDocument();
  });

  it("deve filtrar as opções ignorando acentos e maiúsculas na pesquisa", async () => {
    const user = userEvent.setup();
    renderCampo({ options: OPCOES_COM_PESQUISA });

    await user.click(screen.getByRole("button", { name: /status/i }));
    await user.type(
      await screen.findByPlaceholderText(/pesquisar/i),
      "epsilon",
    );

    expect(
      await screen.findByRole("option", { name: /épsilon/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /^alfa$/i }),
    ).not.toBeInTheDocument();
  });

  it("deve exibir a mensagem padrão quando a pesquisa não encontrar opções", async () => {
    const user = userEvent.setup();
    renderCampo({ options: OPCOES_COM_PESQUISA });

    await user.click(screen.getByRole("button", { name: /status/i }));
    await user.type(
      await screen.findByPlaceholderText(/pesquisar/i),
      "inexistente",
    );

    expect(
      await screen.findByText(/nenhuma opção encontrada/i),
    ).toBeInTheDocument();
  });

  it("deve exibir uma mensagem de vazio personalizada", async () => {
    const user = userEvent.setup();
    renderCampo({
      options: OPCOES_COM_PESQUISA,
      emptyMessage: "Sem resultados para o filtro",
    });

    await user.click(screen.getByRole("button", { name: /status/i }));
    await user.type(
      await screen.findByPlaceholderText(/pesquisar/i),
      "inexistente",
    );

    expect(
      await screen.findByText(/sem resultados para o filtro/i),
    ).toBeInTheDocument();
  });

  it("deve chamar onBlur ao fechar a lista", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    renderCampo({ onBlur });

    await user.click(screen.getByRole("button", { name: /status/i }));
    await screen.findByRole("option", { name: /^ativo$/i });

    await user.keyboard("{Escape}");

    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("não deve quebrar ao fechar a lista sem onBlur configurado", async () => {
    const user = userEvent.setup();
    renderCampo();

    await user.click(screen.getByRole("button", { name: /status/i }));
    await screen.findByRole("option", { name: /^ativo$/i });

    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("option", { name: /^ativo$/i }),
    ).not.toBeInTheDocument();
  });
});
