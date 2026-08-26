import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useListarDiretoriasRegionais } from "@/features/diretoria_regional/hooks/useDiretoriaRegional";
import { useTodasUnidadesEducacionais } from "@/features/unidade_educacional/hooks/useUnidadeeducacional";
import { UnidadeEducacionalFiltros } from "../components/list/FiltrosUnidadeEducacional";

vi.mock("@/features/diretoria_regional/hooks/useDiretoriaRegional", () => ({
  useListarDiretoriasRegionais: vi.fn(),
}));

vi.mock("@/features/unidade_educacional/hooks/useUnidadeeducacional", () => ({
  useTodasUnidadesEducacionais: vi.fn(),
}));

const mockUseListarDiretoriasRegionais = vi.mocked(
  useListarDiretoriasRegionais,
);

const mockUseTodasUnidadesEducacionais = vi.mocked(useTodasUnidadesEducacionais);

const VALUES_INICIAIS = {
  codigo_eol: "",
  tipo_escola: "",
  diretoria_regional: "",
  unidade_educacional: "",
  subprefeitura: "",
  lote: "",
  status: "",
};

function renderFiltros(overrides?: {
  values?: Record<string, string>;
  onChange?: (name: string, value: string) => void;
  onBuscar?: () => void;
  onLimpar?: () => void;
}) {
  const onChange = overrides?.onChange ?? vi.fn();
  const onBuscar = overrides?.onBuscar ?? vi.fn();
  const onLimpar = overrides?.onLimpar ?? vi.fn();

  render(
    <UnidadeEducacionalFiltros
      values={{ ...VALUES_INICIAIS, ...overrides?.values }}
      onChange={onChange}
      onBuscar={onBuscar}
      onLimpar={onLimpar}
    />,
  );

  return { onChange, onBuscar, onLimpar };
}

describe("UnidadeEducacionalFiltros", () => {
  beforeEach(() => {
    mockUseListarDiretoriasRegionais.mockReturnValue({
      data: {
        results: [{ id: 1, nome_curto: "DRE Butantã" }],
      },
    } as ReturnType<typeof useListarDiretoriasRegionais>);

    mockUseTodasUnidadesEducacionais.mockReturnValue({
      data: undefined,
    } as ReturnType<typeof useTodasUnidadesEducacionais>);
  });

  it("deve renderizar os campos do filtro", () => {
    renderFiltros();

    expect(screen.getByLabelText(/codesc/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /tipo de escola/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /diretoria regional/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^unidade educacional$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /subprefeitura/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^lote$/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /status/i }),
    ).toBeInTheDocument();
  });

  it("deve chamar onChange ao digitar no campo CODESC", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFiltros();

    await user.type(screen.getByLabelText(/codesc/i), "1");

    expect(onChange).toHaveBeenCalledWith("codigo_eol", "1");
  });

  it("deve desabilitar Unidade Educacional enquanto nenhuma DRE estiver selecionada", () => {
    renderFiltros();

    expect(
      screen.getByRole("button", { name: /^unidade educacional$/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole("tooltip", { name: /selecione uma dre/i }),
    ).toBeInTheDocument();
  });

  it("deve habilitar Unidade Educacional quando houver uma DRE selecionada", () => {
    renderFiltros({ values: { diretoria_regional: "1" } });

    expect(
      screen.getByRole("button", { name: /^unidade educacional$/i }),
    ).toBeEnabled();
  });

  it("nao deve buscar unidades educacionais enquanto nenhuma DRE estiver selecionada", () => {
    renderFiltros();

    expect(mockUseTodasUnidadesEducacionais).toHaveBeenCalledWith("", {
      enabled: false,
    });
  });

  it("deve buscar as unidades educacionais da DRE selecionada", () => {
    renderFiltros({ values: { diretoria_regional: "1" } });

    expect(mockUseTodasUnidadesEducacionais).toHaveBeenCalledWith("1", {
      enabled: true,
    });
  });

  it("deve preencher as opcoes de Unidade Educacional com os dados da api", async () => {
    const user = userEvent.setup();
    mockUseTodasUnidadesEducacionais.mockReturnValue({
      data: [
        { id: 10, nome: "EMEF Amorim Lima" },
        { id: 20, nome: "EMEI Vila das Belezas" },
      ],
    } as ReturnType<typeof useTodasUnidadesEducacionais>);

    renderFiltros({ values: { diretoria_regional: "1" } });

    await user.click(
      screen.getByRole("button", { name: /^unidade educacional$/i }),
    );

    expect(
      screen.getByRole("option", { name: "EMEF Amorim Lima" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "EMEI Vila das Belezas" }),
    ).toBeInTheDocument();
  });

  it("deve chamar onBuscar ao clicar em Buscar Unidade Educacional", async () => {
    const user = userEvent.setup();
    const { onBuscar } = renderFiltros({ values: { codigo_eol: "123" } });

    await user.click(
      screen.getByRole("button", { name: /buscar unidade educacional/i }),
    );

    expect(onBuscar).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onLimpar ao clicar em Limpar filtros", async () => {
    const user = userEvent.setup();
    const { onLimpar } = renderFiltros();

    await user.click(screen.getByRole("button", { name: /limpar filtros/i }));

    expect(onLimpar).toHaveBeenCalledTimes(1);
  });
});
