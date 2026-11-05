import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRequire } from "node:module";
import { describe, expect, it, vi } from "vitest";
import { AdicionarServicoManutencaoModal } from "../components/form/AdicionarServicoManutencaoModal";
import type { ServicoManutencao } from "../types/solicitacaoManutencao.types";

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
describe("AdicionarServicoManutencaoModal", () => {
  it("adiciona serviço, ignora seleção cancelada e evita duplicação de anexos", async () => {
    const onAdicionar = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <AdicionarServicoManutencaoModal
        aberto
        opcoes={opcoes}
        onAdicionar={onAdicionar}
        onOpenChange={onOpenChange}
      />,
    );
    const input = screen.getByLabelText("Fotos do local do reparo");
    fireEvent.change(input, { target: { files: null } });
    fireEvent.change(input, { target: { files: [] } });
    fireEvent.blur(input);
    expect(
      screen.getByText("Adicione pelo menos um arquivo do local do reparo."),
    ).toBeInTheDocument();
    await preencher();
    const a = new File(["a"], "foto.jpg", { lastModified: 1 });
    const b = new File(["bb"], "foto.jpg", { lastModified: 1 });
    const c = new File(["a"], "foto.jpg", { lastModified: 2 });
    const d = new File(["d"], "outra.png", { lastModified: 1 });
    fireEvent.change(input, { target: { files: [a] } });
    fireEvent.change(input, { target: { files: [a, b, c, d] } });
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    fireEvent.click(screen.getByRole("button", { name: "Adicionar serviço" }));
    expect(onAdicionar).toHaveBeenCalledWith(
      expect.objectContaining({
        servico: "pintura",
        local_reparo: "Sala 1",
        descricao: "Pintar parede",
        arquivos: [a, b, c, d],
      }),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("fecha pelo X e valida o serviço específico vazio", async () => {
    const onOpenChange = vi.fn();
    render(
      <AdicionarServicoManutencaoModal
        aberto
        opcoes={opcoes}
        onAdicionar={vi.fn()}
        onOpenChange={onOpenChange}
      />,
    );
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    fireEvent.click(await screen.findByRole("option", { name: "Outros" }));
    fireEvent.blur(screen.getByLabelText("Nome do serviço específico"));
    expect(screen.getByRole("button", { name: "Adicionar serviço" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
  it("rejeita PDF mesmo quando selecionado fora do filtro de formatos", () => {
    render(
      <AdicionarServicoManutencaoModal
        aberto
        opcoes={opcoes}
        onAdicionar={vi.fn()}
        onOpenChange={vi.fn()}
      />,
    );
    const input = screen.getByLabelText("Fotos do local do reparo");
    expect(input).toHaveAttribute("accept", ".png,.jpg,.jpeg");
    fireEvent.change(input, {
      target: { files: [new File(["pdf"], "anexo.pdf", { type: "application/pdf" })] },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("Selecione arquivos PNG, JPG e JPEG.");
    expect(
      screen.queryByRole("button", { name: "Remover arquivo anexo.pdf" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Adicionar serviço" })).toBeDisabled();
  });
  it.each(["@radix-ui/react-focus-scope", "@radix-ui/react-dismissable-layer"])(
    "Dialog e Select compartilham a mesma instalação de %s",
    (dependencia) => {
      const require = createRequire(import.meta.url);
      const radix = createRequire(require.resolve("radix-ui"));
      const dialog = createRequire(radix.resolve("@radix-ui/react-dialog"));
      const select = createRequire(radix.resolve("@radix-ui/react-select"));
      expect(select.resolve(dependencia)).toBe(dialog.resolve(dependencia));
    },
  );
  it("edita Outros preservando o id e valida a remoção do último anexo", () => {
    const onAdicionar = vi.fn();
    const arquivo = new File(["imagem"], "anexo.jpg", { type: "image/jpeg" });
    const inicial: ServicoManutencao = {
      id: "mesmo-id",
      servico: "outros",
      servico_especifico: "Serralheria",
      local_reparo: "Portão",
      descricao: "Reparar",
      arquivos: [arquivo],
    };
    render(
      <AdicionarServicoManutencaoModal
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
    fireEvent.click(screen.getByRole("button", { name: "Remover arquivo anexo.jpg" }));
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
      <AdicionarServicoManutencaoModal
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
