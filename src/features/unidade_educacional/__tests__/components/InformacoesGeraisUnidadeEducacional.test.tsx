import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { InformacoesGeraisUnidadeEducacional } from "@/features/unidade_educacional/components/form/InformacoesGeraisUnidadeEducacional";
import type { UnidadeEducacionalSchema } from "@/features/unidade_educacional/schemas/unidadesEducacionais.schema";

vi.mock("@/components/form", () => ({
  FormSection: ({
    title,
    description,
    children,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
  }) => (
    <section>
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
    </section>
  ),

  FormTextField: ({ name, label }: { name: string; label: string }) => (
    <div data-testid={`field-${name}`}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} />
    </div>
  ),

  FormSelectField: ({
    name,
    label,
    options,
  }: {
    name: string;
    label: string;
    options: { value: string; label: string }[];
  }) => (
    <div data-testid={`field-${name}`}>
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),

  FormMaskedField: ({ name, label }: { name: string; label: string }) => (
    <div data-testid={`field-${name}`}>
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} />
    </div>
  ),
}));

const TIPOS_UNIDADES = [
  {
    value: "tipo-1",
    label: "EMEF",
  },
  {
    value: "tipo-2",
    label: "EMEI",
  },
];

const DIRETORIAS_REGIONAIS = [
  {
    value: "1",
    label: "DRE IPIRANGA",
  },
  {
    value: "2",
    label: "DRE PENHA",
  },
];

const SUBPREFEITURAS = [
  {
    value: "sub-1",
    label: "IPIRANGA",
  },
  {
    value: "sub-2",
    label: "PENHA",
  },
];

function renderComponente() {
  const Wrapper = () => {
    const form = useForm<UnidadeEducacionalSchema>({
      defaultValues: {
        codigo_eol: "",
        tipo_escola: "",
        diretoria_regional: "",
        nome: "",
        subprefeitura: "",
        lote: "",
        status: "true",
        telefone: "",
        email: "",
        cep: "",
        logradouro: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        responsaveis: [
          {
            uuid: "",
            registro_funcional: "",
            nome: "",
            cargo: "",
            email: "",
            telefone: "",
            celular: "",
            criado_pelo_sincronizador: false,
          },
        ],
      },
    });

    return (
      <FormProvider {...form}>
        <InformacoesGeraisUnidadeEducacional
          tiposUnidades={TIPOS_UNIDADES}
          diretoriasRegionais={DIRETORIAS_REGIONAIS}
          subprefeituras={SUBPREFEITURAS}
        />
      </FormProvider>
    );
  };

  return render(<Wrapper />);
}

describe("InformacoesGeraisUnidadeEducacional", () => {
  it("deve renderizar o título e a descrição da seção", () => {
    renderComponente();

    expect(screen.getByRole("heading", { name: "Informações da UE" })).toBeInTheDocument();

    expect(screen.getByText("Dados de identificação da Unidade Educacional")).toBeInTheDocument();
  });

  it("deve renderizar todos os campos da primeira etapa", () => {
    renderComponente();

    expect(screen.getByTestId("field-codigo_eol")).toBeInTheDocument();
    expect(screen.getByTestId("field-tipo_escola")).toBeInTheDocument();
    expect(screen.getByTestId("field-diretoria_regional")).toBeInTheDocument();
    expect(screen.getByTestId("field-nome")).toBeInTheDocument();
    expect(screen.getByTestId("field-subprefeitura")).toBeInTheDocument();
    expect(screen.getByTestId("field-lote")).toBeInTheDocument();
    expect(screen.getByTestId("field-status")).toBeInTheDocument();
    expect(screen.getByTestId("field-telefone")).toBeInTheDocument();
    expect(screen.getByTestId("field-email")).toBeInTheDocument();
    expect(screen.getByTestId("field-cep")).toBeInTheDocument();
    expect(screen.getByTestId("field-logradouro")).toBeInTheDocument();
    expect(screen.getByTestId("field-numero")).toBeInTheDocument();
    expect(screen.getByTestId("field-bairro")).toBeInTheDocument();
    expect(screen.getByTestId("field-cidade")).toBeInTheDocument();
    expect(screen.getByTestId("field-estado")).toBeInTheDocument();
  });

  it("deve renderizar os labels dos campos", () => {
    renderComponente();

    expect(screen.getByLabelText("CODESC (Código EOL)")).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo de escola")).toBeInTheDocument();
    expect(screen.getByLabelText("Diretoria Regional de Educação (DRE)")).toBeInTheDocument();
    expect(screen.getByLabelText("Unidade Educacional")).toBeInTheDocument();
    expect(screen.getByLabelText("Subprefeitura")).toBeInTheDocument();
    expect(screen.getByLabelText("Lote")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Telefone")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
    expect(screen.getByLabelText("CEP")).toBeInTheDocument();
    expect(screen.getByLabelText("Logradouro")).toBeInTheDocument();
    expect(screen.getByLabelText("Número")).toBeInTheDocument();
    expect(screen.getByLabelText("Bairro")).toBeInTheDocument();
    expect(screen.getByLabelText("Cidade")).toBeInTheDocument();
    expect(screen.getByLabelText("Estado")).toBeInTheDocument();
  });

  it("deve renderizar as opções recebidas para tipo de escola", () => {
    renderComponente();

    expect(screen.getByRole("option", { name: "EMEF" })).toHaveValue("tipo-1");
    expect(screen.getByRole("option", { name: "EMEI" })).toHaveValue("tipo-2");
  });

  it("deve renderizar as opções recebidas para diretoria regional", () => {
    renderComponente();

    expect(screen.getByRole("option", { name: "DRE IPIRANGA" })).toHaveValue("1");

    expect(screen.getByRole("option", { name: "DRE PENHA" })).toHaveValue("2");
  });

  it("deve renderizar as opções recebidas para subprefeitura", () => {
    renderComponente();

    expect(screen.getByRole("option", { name: "IPIRANGA" })).toHaveValue("sub-1");

    expect(screen.getByRole("option", { name: "PENHA" })).toHaveValue("sub-2");
  });

  it("deve aceitar o data-testid informado", () => {
    const Wrapper = () => {
      const form = useForm<UnidadeEducacionalSchema>({
        defaultValues: {
          codigo_eol: "",
          tipo_escola: "",
          diretoria_regional: "",
          nome: "",
          subprefeitura: "",
          lote: "",
          status: "true",
          telefone: "",
          email: "",
          cep: "",
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          responsaveis: [
            {
              uuid: "",
              registro_funcional: "",
              nome: "",
              cargo: "",
              email: "",
              telefone: "",
              celular: "",
              criado_pelo_sincronizador: false,
            },
          ],
        },
      });

      return (
        <FormProvider {...form}>
          <InformacoesGeraisUnidadeEducacional
            tiposUnidades={TIPOS_UNIDADES}
            diretoriasRegionais={DIRETORIAS_REGIONAIS}
            subprefeituras={SUBPREFEITURAS}
            data-testid="informacoes-gerais"
          />
        </FormProvider>
      );
    };

    render(<Wrapper />);

    expect(screen.getByTestId("informacoes-gerais")).toBeInTheDocument();
  });
});
