import type { ComponentProps } from "react";

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AlertaErro } from "@/components/shared/AlertaErro/AlertaErro";
import { AlertaErroVinculoCargo } from "../AlertaErroVinculoCargo";

vi.mock("@/components/shared/AlertaErro/AlertaErro", () => ({
  AlertaErro: vi.fn(
    ({
      aberto,
      titulo,
      mensagem,
      children,
      acoes,
      onOpenChange,
    }: ComponentProps<typeof AlertaErro>) => {
      if (!aberto) {
        return null;
      }

      return (
        <div role="dialog" aria-label={titulo}>
          <h2>{titulo}</h2>
          <p>{mensagem}</p>

          {children}
          {acoes}

          <button type="button" onClick={() => onOpenChange(false)}>
            Fechar alerta
          </button>
        </div>
      );
    },
  ),
}));

type Propriedades = ComponentProps<typeof AlertaErroVinculoCargo>;

const textoOrientacao =
  "Você pode remover o vínculo dos profissionais ao cargo que está tentando excluir, " +
  "acessando a listagem de profissionais.";

function criarPropriedades(sobrescritas: Partial<Propriedades> = {}): Propriedades {
  return {
    aberto: true,
    titulo: "Cargo não pode ser excluído",
    mensagem: "O cargo Eletricista não pode ser excluído pois possui vínculos.",
    vinculados: [
      {
        cpf: "12345678901",
        nome: "Ana Silva",
      },
      {
        cpf: "98765432100",
        nome: "Bruno Souza",
      },
    ],
    onOpenChange: vi.fn<Propriedades["onOpenChange"]>(),
    ...sobrescritas,
  };
}

describe("AlertaErroVinculoCargo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("deve exibir o título e a mensagem recebidos", () => {
    const propriedades = criarPropriedades();

    render(<AlertaErroVinculoCargo {...propriedades} />);

    expect(screen.getByRole("dialog", { name: propriedades.titulo })).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: propriedades.titulo })).toBeInTheDocument();

    expect(screen.getByText(propriedades.mensagem)).toBeInTheDocument();
  });

  it("deve apresentar os profissionais com seus respectivos CPFs", () => {
    render(<AlertaErroVinculoCargo {...criarPropriedades()} />);

    const tabela = screen.getByRole("table");
    const linhas = within(tabela).getAllByRole("row");

    expect(linhas).toHaveLength(3);

    expect(within(tabela).getByRole("columnheader", { name: "CPF" })).toBeInTheDocument();

    expect(
      within(tabela).getByRole("columnheader", {
        name: "Nome do profissional",
      }),
    ).toBeInTheDocument();

    expect(within(linhas[1]).getByRole("cell", { name: "123.456.789-01" })).toBeInTheDocument();

    expect(within(linhas[1]).getByRole("cell", { name: "Ana Silva" })).toBeInTheDocument();

    expect(within(linhas[2]).getByRole("cell", { name: "987.654.321-00" })).toBeInTheDocument();

    expect(within(linhas[2]).getByRole("cell", { name: "Bruno Souza" })).toBeInTheDocument();
  });

  it.each([
    {
      descricao: "CPF somente com números",
      cpf: "12345678901",
      esperado: "123.456.789-01",
    },
    {
      descricao: "CPF já formatado",
      cpf: "123.456.789-01",
      esperado: "123.456.789-01",
    },
    {
      descricao: "CPF com espaços",
      cpf: " 123 456 789 01 ",
      esperado: "123.456.789-01",
    },
    {
      descricao: "CPF com menos de onze dígitos",
      cpf: "123.456",
      esperado: "123.456",
    },
    {
      descricao: "CPF com mais de onze dígitos",
      cpf: "123456789012",
      esperado: "123456789012",
    },
  ])("deve apresentar corretamente $descricao", ({ cpf, esperado }) => {
    render(
      <AlertaErroVinculoCargo
        {...criarPropriedades({
          vinculados: [{ cpf, nome: "Ana Silva" }],
        })}
      />,
    );

    expect(screen.getByRole("cell", { name: esperado })).toBeInTheDocument();
  });

  it("deve exibir a orientação quando houver profissionais vinculados", () => {
    render(<AlertaErroVinculoCargo {...criarPropriedades()} />);

    expect(screen.getByText(textoOrientacao)).toBeInTheDocument();
  });

  it("não deve exibir a tabela e a orientação quando não houver vínculos", () => {
    render(<AlertaErroVinculoCargo {...criarPropriedades({ vinculados: [] })} />);

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByText(textoOrientacao)).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Lista de profissionais" })).toBeInTheDocument();
  });

  it("deve disponibilizar o link para a listagem de profissionais", () => {
    render(<AlertaErroVinculoCargo {...criarPropriedades()} />);

    expect(screen.getByRole("link", { name: "Lista de profissionais" })).toHaveAttribute(
      "href",
      "/profissionais",
    );
  });

  it("deve encaminhar a solicitação de fechamento", async () => {
    const user = userEvent.setup();
    const propriedades = criarPropriedades();

    render(<AlertaErroVinculoCargo {...propriedades} />);

    await user.click(screen.getByRole("button", { name: "Fechar alerta" }));

    expect(propriedades.onOpenChange).toHaveBeenCalledOnce();
    expect(propriedades.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("deve encaminhar as propriedades para o AlertaErro", () => {
    const propriedades = criarPropriedades({ aberto: false });

    render(<AlertaErroVinculoCargo {...propriedades} />);

    const propriedadesRecebidas = vi.mocked(AlertaErro).mock.calls[0][0];

    expect(propriedadesRecebidas).toEqual(
      expect.objectContaining({
        aberto: propriedades.aberto,
        titulo: propriedades.titulo,
        mensagem: propriedades.mensagem,
        width: propriedades.width,
        onOpenChange: propriedades.onOpenChange,
      }),
    );
  });
});
