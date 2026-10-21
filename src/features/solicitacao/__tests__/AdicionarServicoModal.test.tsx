import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AdicionarServicoModal } from "../components/form/AdicionarServicoModal";
import type { ServicoManutencao } from "../types/solicitacao.types";

const opcoes = [{ value: "pintura", label: "Pintura" }];
async function preencher() {
  const select = screen.getByRole("combobox", { name: "Qual o serviço?" });
  fireEvent.keyDown(select, { key: "ArrowDown" });
  fireEvent.click(await screen.findByRole("option", { name: "Pintura" }));
  fireEvent.change(screen.getByLabelText("Qual local necessita do reparo?"), {
    target: { value: " Sala 1 " },
  });
  fireEvent.blur(screen.getByLabelText("Qual local necessita do reparo?"));
  fireEvent.change(screen.getByLabelText("Breve descrição do serviço"), {
    target: { value: " Pintar parede " },
  });
  fireEvent.blur(screen.getByLabelText("Breve descrição do serviço"));
}
describe("AdicionarServicoModal", () => {
  it("adiciona serviço válido, ignora duplicados e não bloqueia após rejeitar outro arquivo", async () => {
    const onAdicionar = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <AdicionarServicoModal
        aberto
        opcoes={opcoes}
        onAdicionar={onAdicionar}
        onOpenChange={onOpenChange}
      />,
    );
    expect(screen.getByRole("button", { name: "Adicionar serviço" })).toBeDisabled();
    await preencher();
    const input = screen.getByLabelText("Fotos do local do reparo");
    fireEvent.change(input, { target: { files: null } });
    fireEvent.change(input, { target: { files: [] } });
    const arquivo = new File(["foto"], "foto.png", { lastModified: 1 });
    fireEvent.change(input, { target: { files: [arquivo] } });
    fireEvent.change(input, { target: { files: [arquivo] } });
    expect(
      within(screen.getByRole("list", { name: "Arquivos selecionados" })).getAllByRole("listitem"),
    ).toHaveLength(1);
    fireEvent.change(input, { target: { files: [new File(["x"], "invalido.txt")] } });
    expect(screen.getByRole("alert")).toHaveTextContent("Selecione arquivos PNG");
    expect(screen.getByRole("button", { name: "Adicionar serviço" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar serviço" }));
    expect(onAdicionar).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        servico: "pintura",
        local_reparo: "Sala 1",
        descricao: "Pintar parede",
        arquivos: [arquivo],
      }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
  it("edita Outros preservando o id e valida a remoção do último anexo", () => {
    const onAdicionar = vi.fn();
    const arquivo = new File(["pdf"], "anexo.pdf");
    const inicial: ServicoManutencao = {
      id: "mesmo-id",
      servico: "outros",
      servico_especifico: "Serralheria",
      local_reparo: "Portão",
      descricao: "Reparar",
      arquivos: [arquivo],
    };
    render(
      <AdicionarServicoModal
        aberto
        opcoes={opcoes}
        servicoInicial={inicial}
        onAdicionar={onAdicionar}
        onOpenChange={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByLabelText("Nome do serviço específico"), {
      target: { value: " " },
    });
    fireEvent.blur(screen.getByLabelText("Nome do serviço específico"));
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Nome do serviço específico"), {
      target: { value: " Vidraçaria " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Remover arquivo anexo.pdf" }));
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(
      screen.getByText("Adicione pelo menos um arquivo do local do reparo."),
    ).toBeInTheDocument();
    fireEvent.blur(screen.getByLabelText("Fotos do local do reparo"));
    fireEvent.change(screen.getByLabelText("Fotos do local do reparo"), {
      target: { files: [arquivo] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(onAdicionar).toHaveBeenCalledWith(
      expect.objectContaining({ id: "mesmo-id", servico_especifico: "Vidraçaria" }),
    );
  });
  it("exibe erros de campos tocados e cancela sem modificar o serviço", async () => {
    const user = userEvent.setup();
    const onAdicionar = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <AdicionarServicoModal
        aberto
        opcoes={[]}
        onAdicionar={onAdicionar}
        onOpenChange={onOpenChange}
      />,
    );
    const select = screen.getByRole("combobox", { name: "Qual o serviço?" });
    await user.tab();
    expect(select).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(screen.getByRole("option", { name: "Outros" })).toHaveFocus());
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(select).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect(select).toHaveFocus();
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.blur(screen.getByLabelText("Qual local necessita do reparo?"));
    fireEvent.blur(screen.getByLabelText("Breve descrição do serviço"));
    expect(screen.getByRole("button", { name: "Adicionar serviço" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onAdicionar).not.toHaveBeenCalled();
  });
});
