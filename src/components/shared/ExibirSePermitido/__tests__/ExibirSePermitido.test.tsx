import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { FUNCIONALIDADES } from "@/constants/funcionalidades";
import { useUsuarioStore } from "@/stores/useUsuarioStore";
import { ExibirSePermitido } from "../ExibirSePermitido";

describe("ExibirSePermitido", () => {
  beforeEach(() => {
    localStorage.clear();
    useUsuarioStore.setState({
      usuario: {
        nome: "Ana",
        codigoRfOuCpf: "1234567",
        cargo: "ADM",
        diretoriaRegional: null,
        unidadeEducacional: null,
        funcionalidades: [FUNCIONALIDADES.RELATORIOS],
      },
    });
  });

  it("exibe o conteúdo quando o perfil possui a funcionalidade", () => {
    render(
      <ExibirSePermitido funcionalidade={FUNCIONALIDADES.RELATORIOS}>
        <p>Relatórios</p>
      </ExibirSePermitido>,
    );

    expect(screen.getByText("Relatórios")).toBeInTheDocument();
  });

  it("oculta o conteúdo quando o perfil não possui a funcionalidade", () => {
    render(
      <ExibirSePermitido funcionalidade={FUNCIONALIDADES.CADASTROS}>
        <p>Cadastros</p>
      </ExibirSePermitido>,
    );

    expect(screen.queryByText("Cadastros")).not.toBeInTheDocument();
  });

  it("exibe o fallback quando informado e o acesso é negado", () => {
    render(
      <ExibirSePermitido funcionalidade={FUNCIONALIDADES.CADASTROS} fallback={<p>Sem acesso</p>}>
        <p>Cadastros</p>
      </ExibirSePermitido>,
    );

    expect(screen.getByText("Sem acesso")).toBeInTheDocument();
  });
});
