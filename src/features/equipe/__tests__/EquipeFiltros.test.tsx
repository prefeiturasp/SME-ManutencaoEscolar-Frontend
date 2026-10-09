import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { EquipeFiltros } from "../components/list/EquipeFiltros";
import type { FiltroEquipeValues } from "../types/equipe.types";

function preparar() {
  const onMudar = vi.fn();
  const onBuscar = vi.fn();
  const onLimpar = vi.fn();
  function FiltrosControlados() {
    const [valores, setValores] = useState<FiltroEquipeValues>({
      nome: "",
      empresa: "",
      lote: "",
      status: "",
    });
    return (
      <EquipeFiltros
        valores={valores}
        opcoesEmpresas={[
          { label: "Empresa Norte", value: "e1" },
          { label: "Empresa Sul", value: "e2" },
        ]}
        opcoesLotes={[
          { label: "Lote 001", value: "l1" },
          { label: "Lote 002", value: "l2" },
        ]}
        onMudar={(campo, valor) => {
          onMudar(campo, valor);
          setValores((atuais) => ({ ...atuais, [campo]: valor }));
        }}
        onBuscar={onBuscar}
        onLimpar={onLimpar}
      />
    );
  }
  render(<FiltrosControlados />);
  return { user: userEvent.setup(), onMudar, onBuscar, onLimpar };
}

describe("EquipeFiltros", () => {
  it.each([
    {
      campo: "empresa",
      label: "Empresa",
      pesquisa: "Digite o nome da empresa...",
      termo: "Norte",
      escolhida: "Empresa Norte",
      outra: "Empresa Sul",
      valor: "e1",
      vazio: "Nenhuma empresa encontrada.",
    },
    {
      campo: "lote",
      label: "Lote",
      pesquisa: "Digite o nome ou código do lote...",
      termo: "001",
      escolhida: "Lote 001",
      outra: "Lote 002",
      valor: "l1",
      vazio: "Nenhum lote encontrado.",
    },
  ])(
    "pesquisa, seleciona e fecha o campo $label",
    async ({ campo, label, pesquisa, termo, escolhida, outra, valor, vazio }) => {
      const { user, onMudar, onBuscar } = preparar();
      const trigger = screen.getByRole("combobox", { name: label });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("option", { name: outra })).toBeInTheDocument();
      await user.type(screen.getByPlaceholderText(pesquisa), "inexistente");
      expect(screen.getByText(vazio)).toBeInTheDocument();
      await user.clear(screen.getByPlaceholderText(pesquisa));
      await user.type(screen.getByPlaceholderText(pesquisa), termo);
      expect(screen.queryByRole("option", { name: outra })).not.toBeInTheDocument();
      await user.click(screen.getByRole("option", { name: escolhida }));
      expect(onMudar).toHaveBeenLastCalledWith(campo, valor);
      expect(trigger).toHaveTextContent(escolhida);
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(onBuscar).not.toHaveBeenCalled();
      await user.click(trigger);
      expect(screen.getByRole("option", { name: escolhida })).toHaveClass("bg-[#EEEEEE]");
      await user.keyboard("{Escape}");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    },
  );

  it.each(["Ativo", "Inativo"])("seleciona a situação %s", async (situacao) => {
    const { user, onMudar } = preparar();
    await user.click(screen.getByRole("combobox", { name: "Situação" }));
    await user.click(screen.getByRole("option", { name: situacao }));
    expect(onMudar).toHaveBeenLastCalledWith("status", situacao.toLowerCase());
    expect(screen.getByRole("combobox", { name: "Situação" })).toHaveTextContent(situacao);
  });

  it("edita o nome, busca pelo botão e por Enter e aciona a limpeza sem buscar", async () => {
    const { user, onMudar, onBuscar, onLimpar } = preparar();
    await user.type(screen.getByLabelText("Nome da equipe"), "Norte");
    expect(onMudar).toHaveBeenLastCalledWith("nome", "Norte");
    expect(onBuscar).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Buscar equipe" }));
    expect(onBuscar).toHaveBeenCalledTimes(1);
    await user.click(screen.getByLabelText("Nome da equipe"));
    await user.keyboard("{Enter}");
    expect(onBuscar).toHaveBeenCalledTimes(2);
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(onLimpar).toHaveBeenCalledOnce();
    expect(onBuscar).toHaveBeenCalledTimes(2);
  });
});
