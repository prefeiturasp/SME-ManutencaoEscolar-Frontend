import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TabelaDeDados } from "@/components/shared/TabelaDeDados/TabelaDeDados";

type ServicoTeste = {
  uuid: string;
  nome: string;
  status: boolean;
};

const servicoAtivo: ServicoTeste = {
  uuid: "uuid-eletrica",
  nome: "Elétrica",
  status: true,
};

const servicoInativo: ServicoTeste = {
  uuid: "uuid-pintura",
  nome: "Pintura",
  status: false,
};

describe("TabelaDeDados", () => {
  it("deve renderizar cabeçalhos, título acessível e dados", () => {
    const obterChave = vi.fn((servico: ServicoTeste) => servico.uuid);

    const renderizarNome = vi.fn((servico: ServicoTeste) => servico.nome);

    const renderizarStatus = vi.fn((servico: ServicoTeste) =>
      servico.status ? "Ativo" : "Inativo",
    );

    render(
      <TabelaDeDados<ServicoTeste>
        dados={[servicoAtivo, servicoInativo]}
        obterChave={obterChave}
        atualizando
        classNameLinha={(servico) =>
          servico.status ? "linha-ativa" : "linha-inativa"
        }
        colunas={[
          {
            id: "nome",
            titulo: "Nome",
            classNameCabecalho: "cabecalho-nome",
            classNameCelula: (servico) =>
              servico.status ? "nome-ativo" : "nome-inativo",
            renderizar: renderizarNome,
          },
          {
            id: "status",
            tituloAcessivel: "Status do serviço",
            classNameCelula: "celula-status",
            renderizar: renderizarStatus,
          },
        ]}
      />,
    );

    const tabela = screen.getByRole("table");
    const container = tabela.parentElement;

    expect(container).toHaveAttribute("aria-busy", "true");

    const cabecalhoNome = screen.getByRole("columnheader", {
      name: "Nome",
    });

    expect(cabecalhoNome).toHaveClass(
      "border-b",
      "px-2",
      "py-4",
      "cabecalho-nome",
    );

    const cabecalhoStatus = screen.getByRole("columnheader", {
      name: "Status do serviço",
    });

    expect(cabecalhoStatus).toBeInTheDocument();

    expect(screen.getByText("Status do serviço")).toHaveClass("sr-only");

    expect(screen.getByText("Elétrica")).toBeInTheDocument();
    expect(screen.getByText("Pintura")).toBeInTheDocument();
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getByText("Inativo")).toBeInTheDocument();

    expect(obterChave).toHaveBeenCalledTimes(2);
    expect(obterChave).toHaveBeenNthCalledWith(1, servicoAtivo);
    expect(obterChave).toHaveBeenNthCalledWith(2, servicoInativo);

    expect(renderizarNome).toHaveBeenCalledTimes(2);
    expect(renderizarNome).toHaveBeenNthCalledWith(1, servicoAtivo);
    expect(renderizarNome).toHaveBeenNthCalledWith(2, servicoInativo);

    expect(renderizarStatus).toHaveBeenCalledTimes(2);
    expect(renderizarStatus).toHaveBeenNthCalledWith(1, servicoAtivo);
    expect(renderizarStatus).toHaveBeenNthCalledWith(2, servicoInativo);
  });

  it("deve aplicar classes calculadas nas linhas e células", () => {
    const classNameLinha = vi.fn((servico: ServicoTeste) =>
      servico.status ? "linha-ativa" : "linha-inativa",
    );

    const classNameCelula = vi.fn((servico: ServicoTeste) =>
      servico.status ? "texto-ativo" : "texto-inativo",
    );

    render(
      <TabelaDeDados<ServicoTeste>
        dados={[servicoAtivo, servicoInativo]}
        obterChave={(servico) => servico.uuid}
        classNameLinha={classNameLinha}
        colunas={[
          {
            id: "nome",
            titulo: "Nome",
            classNameCelula,
            renderizar: (servico) => servico.nome,
          },
        ]}
      />,
    );

    const linhas = screen.getAllByRole("row");

    expect(linhas).toHaveLength(3);
    expect(linhas[1]).toHaveClass("linha-ativa");
    expect(linhas[2]).toHaveClass("linha-inativa");

    expect(screen.getByText("Elétrica").closest("td")).toHaveClass(
      "border-b",
      "px-2",
      "py-4",
      "texto-ativo",
    );

    expect(screen.getByText("Pintura").closest("td")).toHaveClass(
      "border-b",
      "px-2",
      "py-4",
      "texto-inativo",
    );

    expect(classNameLinha).toHaveBeenCalledTimes(2);
    expect(classNameLinha).toHaveBeenNthCalledWith(1, servicoAtivo);
    expect(classNameLinha).toHaveBeenNthCalledWith(2, servicoInativo);

    expect(classNameCelula).toHaveBeenCalledTimes(2);
    expect(classNameCelula).toHaveBeenNthCalledWith(1, servicoAtivo);
    expect(classNameCelula).toHaveBeenNthCalledWith(2, servicoInativo);
  });

  it("deve aplicar classes fixas na linha e na célula", () => {
    render(
      <TabelaDeDados<ServicoTeste>
        dados={[servicoAtivo]}
        obterChave={(servico) => servico.uuid}
        classNameLinha="linha-fixa"
        colunas={[
          {
            id: "nome",
            titulo: "Nome",
            classNameCabecalho: "text-left",
            classNameCelula: "celula-fixa",
            renderizar: (servico) => servico.nome,
          },
        ]}
      />,
    );

    const linhas = screen.getAllByRole("row");

    expect(linhas[1]).toHaveClass("linha-fixa");

    expect(screen.getByRole("columnheader", { name: "Nome" })).toHaveClass(
      "border-b",
      "px-2",
      "py-4",
      "text-left",
    );

    expect(screen.getByText("Elétrica").closest("td")).toHaveClass(
      "border-b",
      "px-2",
      "py-4",
      "celula-fixa",
    );
  });

  it("não deve aplicar classes opcionais quando não forem informadas", () => {
    render(
      <TabelaDeDados<ServicoTeste>
        dados={[servicoAtivo]}
        obterChave={(servico) => servico.uuid}
        colunas={[
          {
            id: "nome",
            titulo: "Nome",
            renderizar: (servico) => servico.nome,
          },
        ]}
      />,
    );

    const cabecalho = screen.getByRole("columnheader", {
      name: "Nome",
    });

    const celula = screen.getByText("Elétrica").closest("td");
    const linhas = screen.getAllByRole("row");

    expect(cabecalho).toHaveClass("border-b", "px-2", "py-4");

    expect(celula).toHaveClass("border-b", "px-2", "py-4");

    expect(linhas[1]).not.toHaveAttribute("class");
  });

  it("deve utilizar false como valor padrão de atualizando", () => {
    render(
      <TabelaDeDados<ServicoTeste>
        dados={[]}
        colunas={[]}
        obterChave={(servico) => servico.uuid}
      />,
    );

    const tabela = screen.getByRole("table");

    expect(tabela.parentElement).toHaveAttribute("aria-busy", "false");

    expect(screen.getAllByRole("row")).toHaveLength(1);
  });

  it("deve renderizar uma tabela sem registros", () => {
    render(
      <TabelaDeDados<ServicoTeste>
        dados={[]}
        obterChave={(servico) => servico.uuid}
        colunas={[
          {
            id: "nome",
            titulo: "Nome",
            renderizar: (servico) => servico.nome,
          },
        ]}
      />,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", { name: "Nome" }),
    ).toBeInTheDocument();

    expect(screen.queryByText("Elétrica")).not.toBeInTheDocument();
  });
});
