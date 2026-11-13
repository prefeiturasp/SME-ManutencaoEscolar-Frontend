import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FiltrosLista } from "@/components/shared/FiltroLista/FiltroLista";
import type {
  FiltroListaRow,
  FiltroListaValues,
} from "@/components/shared/FiltroLista/types/FiltroLista.type";

const FIELDS: readonly FiltroListaRow[] = [
  [
    {
      name: "nome",
      label: "Nome",
      type: "text",
      placeholder: "Digite o nome",
    },
    {
      name: "cnpj",
      label: "CNPJ",
      type: "masked",
      placeholder: "00.000.000/0000-00",
      mask: (value) => value.replace(/(\d{2})(\d)/, "$1.$2"),
      unmask: (value) => value.replaceAll(".", ""),
    },
  ],
  [
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "true", label: "Ativo" },
        { value: "false", label: "Inativo" },
      ],
    },
  ],
];

function renderFiltrosLista(overrides?: {
  values?: FiltroListaValues;
  onChange?: (name: string, value: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
}) {
  const onChange = overrides?.onChange ?? vi.fn();
  const onSearch = overrides?.onSearch ?? vi.fn();
  const onClear = overrides?.onClear ?? vi.fn();
  const values = overrides?.values ?? { nome: "", cnpj: "", status: "" };

  render(
    <FiltrosLista
      fields={FIELDS}
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
    />,
  );

  return { onChange, onSearch, onClear };
}

describe("FiltrosLista", () => {
  it("deve renderizar o título e a descrição padrão", () => {
    renderFiltrosLista();

    expect(screen.getByText(/refine sua busca/i)).toBeInTheDocument();
    expect(
      screen.getByText(/utilize o filtro para localizar os registros/i),
    ).toBeInTheDocument();
  });

  it("deve renderizar título, descrição e rótulo de busca customizados", () => {
    render(
      <FiltrosLista
        title="Título customizado"
        description="Descrição customizada"
        searchLabel="Buscar empresa"
        fields={FIELDS}
        values={{ nome: "", cnpj: "", status: "" }}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByText(/título customizado/i)).toBeInTheDocument();
    expect(screen.getByText(/descrição customizada/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /buscar empresa/i }),
    ).toBeInTheDocument();
  });

  it("deve renderizar um campo de texto por configuração", () => {
    renderFiltrosLista();

    expect(screen.getByLabelText(/^nome$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite o nome")).toBeInTheDocument();
  });

  it("deve chamar onChange ao digitar em um campo de texto", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFiltrosLista();

    await user.type(screen.getByLabelText(/^nome$/i), "a");

    expect(onChange).toHaveBeenCalledWith("nome", "a");
  });

  it("deve aplicar a máscara no campo mascarado a partir do valor informado", () => {
    renderFiltrosLista({ values: { nome: "", cnpj: "12345678", status: "" } });

    expect(screen.getByLabelText(/^cnpj$/i)).toHaveValue("12.345678");
  });

  it("deve chamar onChange com o valor desmascarado ao digitar no campo mascarado", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFiltrosLista();

    await user.type(screen.getByLabelText(/^cnpj$/i), "1");

    expect(onChange).toHaveBeenCalledWith("cnpj", "1");
  });

  it("deve renderizar as opções do campo select", async () => {
    const user = userEvent.setup();
    renderFiltrosLista();

    const statusTrigger = screen.getByRole("button", { name: /status/i });
    await user.click(statusTrigger);

    expect(
      await screen.findByRole("option", { name: /^ativo$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /^inativo$/i }),
    ).toBeInTheDocument();
  });

  it("não deve exibir a busca quando o select tiver até 5 opções", async () => {
    const user = userEvent.setup();
    const cincoOpcoes: readonly FiltroListaRow[] = [
      [
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "1", label: "Opção 1" },
            { value: "2", label: "Opção 2" },
            { value: "3", label: "Opção 3" },
            { value: "4", label: "Opção 4" },
            { value: "5", label: "Opção 5" },
          ],
        },
      ],
    ];

    render(
      <FiltrosLista
        fields={cincoOpcoes}
        values={{ status: "" }}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /status/i }));

    expect(screen.queryByPlaceholderText(/pesquisar/i)).not.toBeInTheDocument();
  });

  it("deve exibir a busca quando o select tiver mais de 5 opções", async () => {
    const user = userEvent.setup();
    const seisOpcoes: readonly FiltroListaRow[] = [
      [
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "1", label: "Opção 1" },
            { value: "2", label: "Opção 2" },
            { value: "3", label: "Opção 3" },
            { value: "4", label: "Opção 4" },
            { value: "5", label: "Opção 5" },
            { value: "6", label: "Opção 6" },
          ],
        },
      ],
    ];

    render(
      <FiltrosLista
        fields={seisOpcoes}
        values={{ status: "" }}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /status/i }));

    expect(
      await screen.findByPlaceholderText(/pesquisar/i),
    ).toBeInTheDocument();
  });

  it("deve chamar onChange ao selecionar uma opção", async () => {
    const user = userEvent.setup();
    const { onChange } = renderFiltrosLista();

    await user.click(screen.getByRole("button", { name: /status/i }));
    await user.click(await screen.findByRole("option", { name: /^ativo$/i }));

    expect(onChange).toHaveBeenCalledWith("status", "true");
  });

  it("deve chamar onSearch ao clicar em buscar quando houver filtro preenchido", async () => {
    const user = userEvent.setup();
    const { onSearch } = renderFiltrosLista({
      values: { nome: "a", cnpj: "", status: "" },
    });

    await user.click(screen.getByRole("button", { name: /buscar/i }));

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it("deve chamar onClear ao clicar em limpar filtros", async () => {
    const user = userEvent.setup();
    const { onClear } = renderFiltrosLista({
      values: { nome: "a", cnpj: "", status: "" },
    });

    await user.click(screen.getByRole("button", { name: /limpar filtros/i }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("deve exibir valores vazios quando o objeto de values não possuir a chave do campo", () => {
    render(
      <FiltrosLista
        fields={FIELDS}
        values={{}}
        onChange={vi.fn()}
        onSearch={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/^nome$/i)).toHaveValue("");
    expect(screen.getByLabelText(/^cnpj$/i)).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /status/i }),
    ).toHaveTextContent(/selecione/i);
  });

  it("deve manter o botão de buscar habilitado quando nenhum filtro estiver preenchido", () => {
    renderFiltrosLista();

    expect(screen.getByRole("button", { name: /buscar/i })).toBeEnabled();
  });

  it("deve manter o botão de limpar filtros habilitado quando nenhum filtro estiver preenchido", () => {
    renderFiltrosLista();

    expect(
      screen.getByRole("button", { name: /limpar filtros/i }),
    ).toBeEnabled();
  });

  it("deve manter o botão de buscar habilitado quando os filtros contiverem apenas espaços", () => {
    renderFiltrosLista({ values: { nome: "   ", cnpj: "", status: "" } });

    expect(screen.getByRole("button", { name: /buscar/i })).toBeEnabled();
  });

  it("deve habilitar o botão de buscar quando ao menos um filtro estiver preenchido", () => {
    renderFiltrosLista({ values: { nome: "a", cnpj: "", status: "" } });

    expect(screen.getByRole("button", { name: /buscar/i })).toBeEnabled();
  });

  describe("campos com dependência (disabled)", () => {
    const FIELDS_COM_DEPENDENCIA: readonly FiltroListaRow[] = [
      [
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "true", label: "Ativo" },
            { value: "false", label: "Inativo" },
          ],
        },
        {
          name: "motivo",
          label: "Motivo",
          type: "text",
          placeholder: "Digite o motivo",
          disabled: (values) => values.status !== "false",
          tooltip: "Selecione o status inativo para habilitar o campo.",
        },
      ],
    ];

    it("deve desabilitar o campo dependente quando a condição não é satisfeita", () => {
      render(
        <FiltrosLista
          fields={FIELDS_COM_DEPENDENCIA}
          values={{ status: "", motivo: "" }}
          onChange={vi.fn()}
          onSearch={vi.fn()}
          onClear={vi.fn()}
        />,
      );

      expect(screen.getByLabelText(/^motivo$/i)).toBeDisabled();
    });

    it("deve habilitar o campo dependente quando a condição é satisfeita", () => {
      render(
        <FiltrosLista
          fields={FIELDS_COM_DEPENDENCIA}
          values={{ status: "false", motivo: "" }}
          onChange={vi.fn()}
          onSearch={vi.fn()}
          onClear={vi.fn()}
        />,
      );

      expect(screen.getByLabelText(/^motivo$/i)).toBeEnabled();
    });

    it("deve limpar o valor do campo dependente ao ficar desabilitado", () => {
      const onChange = vi.fn();

      render(
        <FiltrosLista
          fields={FIELDS_COM_DEPENDENCIA}
          values={{ status: "true", motivo: "algum motivo" }}
          onChange={onChange}
          onSearch={vi.fn()}
          onClear={vi.fn()}
        />,
      );

      expect(onChange).toHaveBeenCalledWith("motivo", "");
    });

    it("não deve chamar onChange quando o campo dependente já está vazio", () => {
      const onChange = vi.fn();

      render(
        <FiltrosLista
          fields={FIELDS_COM_DEPENDENCIA}
          values={{ status: "true", motivo: "" }}
          onChange={onChange}
          onSearch={vi.fn()}
          onClear={vi.fn()}
        />,
      );

      expect(onChange).not.toHaveBeenCalled();
    });

    it("deve exibir o tooltip do campo enquanto ele estiver desabilitado", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <FiltrosLista
          fields={FIELDS_COM_DEPENDENCIA}
          values={{ status: "", motivo: "" }}
          onChange={vi.fn()}
          onSearch={vi.fn()}
          onClear={vi.fn()}
        />,
      );

      const tooltipTrigger = container.querySelector(
        '[data-slot="tooltip-trigger"]',
      );
      expect(tooltipTrigger).not.toBeNull();

      await user.hover(tooltipTrigger as Element);

      expect(
        await screen.findByRole("tooltip", {
          name: /selecione o status inativo para habilitar o campo/i,
        }),
      ).toBeInTheDocument();
    });

    it("não deve exibir o tooltip do campo quando ele estiver habilitado", () => {
      render(
        <FiltrosLista
          fields={FIELDS_COM_DEPENDENCIA}
          values={{ status: "false", motivo: "" }}
          onChange={vi.fn()}
          onSearch={vi.fn()}
          onClear={vi.fn()}
        />,
      );

      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  describe("layout das linhas de campos", () => {
    it("deve usar uma única coluna quando a linha não tiver campos", () => {
      const { container } = render(
        <FiltrosLista
          fields={[[]]}
          values={{}}
          onChange={vi.fn()}
          onSearch={vi.fn()}
          onClear={vi.fn()}
        />,
      );

      expect(container.querySelector(".grid-cols-1")).toBeInTheDocument();
    });

    it("deve limitar o grid a no máximo 4 colunas quando a linha tiver mais campos", () => {
      const cincoCampos: readonly FiltroListaRow[] = [
        [
          { name: "a", label: "A", type: "text" },
          { name: "b", label: "B", type: "text" },
          { name: "c", label: "C", type: "text" },
          { name: "d", label: "D", type: "text" },
          { name: "e", label: "E", type: "text" },
        ],
      ];

      const { container } = render(
        <FiltrosLista
          fields={cincoCampos}
          values={{ a: "", b: "", c: "", d: "", e: "" }}
          onChange={vi.fn()}
          onSearch={vi.fn()}
          onClear={vi.fn()}
        />,
      );

      expect(container.querySelector(".grid-cols-4")).toBeInTheDocument();
    });

    it("deve tratar um campo select sem opções configuradas", async () => {
      const user = userEvent.setup();
      const semOpcoes: readonly FiltroListaRow[] = [
        [{ name: "status", label: "Status", type: "select" }],
      ];

      render(
        <FiltrosLista
          fields={semOpcoes}
          values={{ status: "" }}
          onChange={vi.fn()}
          onSearch={vi.fn()}
          onClear={vi.fn()}
        />,
      );

      await user.click(screen.getByRole("button", { name: /status/i }));

      expect(
        await screen.findByText(/nenhuma opção encontrada/i),
      ).toBeInTheDocument();
    });
  });
});
