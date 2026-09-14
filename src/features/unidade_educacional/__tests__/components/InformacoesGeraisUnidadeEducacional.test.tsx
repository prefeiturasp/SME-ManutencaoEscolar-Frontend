import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import {
    describe,
    expect,
    it
} from "vitest";

import { InformacoesGeraisUnidadeEducacional } from "@/features/unidade_educacional/components/form/InformacoesGeraisUnidadeEducacional";

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
    value: "dre-1",
    label: "DRE Butantã",
  },
  {
    value: "dre-2",
    label: "DRE Campo Limpo",
  },
];

const SUBPREFEITURAS = [
  {
    value: "subprefeitura-1",
    label: "Butantã",
  },
  {
    value: "subprefeitura-2",
    label: "Pinheiros",
  },
];

function FormWrapper({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const form = useForm({
    defaultValues: {
      codigo_eol: "",
      tipo_escola: "",
      diretoria_regional: "",
      nome: "",
      subprefeitura: "",
      lote: "",
      status: "",
      telefone: "",
      email: "",
      cep: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
}

function renderInformacoesGerais(overrides?: {
  tiposUnidades?: typeof TIPOS_UNIDADES;
  diretoriasRegionais?: typeof DIRETORIAS_REGIONAIS;
  subprefeituras?: typeof SUBPREFEITURAS;
}) {
  return render(
    <FormWrapper>
      <InformacoesGeraisUnidadeEducacional
        tiposUnidades={overrides?.tiposUnidades ?? TIPOS_UNIDADES}
        diretoriasRegionais={
          overrides?.diretoriasRegionais ?? DIRETORIAS_REGIONAIS
        }
        subprefeituras={
          overrides?.subprefeituras ?? SUBPREFEITURAS
        }
      />
    </FormWrapper>,
  );
}

describe("InformacoesGeraisUnidadeEducacional", () => {
  it("deve renderizar as seções do formulário", () => {
    renderInformacoesGerais();

    expect(
      screen.getByText("Informações da UE"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Dados de identificação da Unidade Educacional",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Localização da UE"),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Dados de localização da Unidade Educacional",
      ),
    ).toBeInTheDocument();
  });

  it("deve renderizar os campos de informações da unidade", () => {
    renderInformacoesGerais();

    expect(
      screen.getByLabelText("CODESC (Código EOL)"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Tipo de escola"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Diretoria Regional de Educação (DRE)"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Unidade Educacional"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Subprefeitura"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Lote"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Status"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Telefone"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("E-mail"),
    ).toBeInTheDocument();
  });

  it("deve renderizar os campos de localização", () => {
    renderInformacoesGerais();

    expect(screen.getByLabelText("CEP")).toBeInTheDocument();

    expect(
      screen.getByLabelText("Logradouro"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Número"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Bairro"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Cidade"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Estado"),
    ).toBeInTheDocument();
  });

  it("deve exibir as opções de Tipo de escola", async () => {
    const user = userEvent.setup();

    renderInformacoesGerais();

    await user.click(
      screen.getByLabelText("Tipo de escola"),
    );

    expect(
      screen.getByRole("option", { name: "EMEF" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "EMEI" }),
    ).toBeInTheDocument();
  });

  it("deve permitir selecionar um Tipo de escola", async () => {
    const user = userEvent.setup();

    renderInformacoesGerais();

    const select = screen.getByLabelText("Tipo de escola");

    await user.click(select);

    await user.click(
      screen.getByRole("option", { name: "EMEF" }),
    );

    expect(select).toHaveTextContent("EMEF");
  });

  it("deve exibir as opções de Diretoria Regional", async () => {
    const user = userEvent.setup();

    renderInformacoesGerais();

    await user.click(
      screen.getByLabelText(
        "Diretoria Regional de Educação (DRE)",
      ),
    );

    expect(
      screen.getByRole("option", {
        name: "DRE Butantã",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "DRE Campo Limpo",
      }),
    ).toBeInTheDocument();
  });

  it("deve exibir as opções de Subprefeitura", async () => {
    const user = userEvent.setup();

    renderInformacoesGerais();

    await user.click(
      screen.getByLabelText("Subprefeitura"),
    );

    expect(
      screen.getByRole("option", {
        name: "Butantã",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Pinheiros",
      }),
    ).toBeInTheDocument();
  });

  it("deve permitir preencher os campos de texto", () => {
  renderInformacoesGerais();

  const codigoEol = screen.getByLabelText("CODESC (Código EOL)");
  const nome = screen.getByLabelText("Unidade Educacional");
  const lote = screen.getByLabelText("Lote");
  const email = screen.getByLabelText("E-mail");

  fireEvent.change(codigoEol, {
    target: { value: "123456" },
  });

  fireEvent.change(nome, {
    target: { value: "EMEF Amorim Lima" },
  });

  fireEvent.change(lote, {
    target: { value: "Lote 001" },
  });

  fireEvent.change(email, {
    target: { value: "teste@email.com" },
  });

  expect(codigoEol).toHaveValue("123456");
  expect(nome).toHaveValue("EMEF Amorim Lima");
  expect(lote).toHaveValue("Lote 001");
  expect(email).toHaveValue("teste@email.com");
});

it("deve permitir preencher os campos de endereço", () => {
  renderInformacoesGerais();

  const logradouro = screen.getByLabelText("Logradouro");
  const numero = screen.getByLabelText("Número");
  const bairro = screen.getByLabelText("Bairro");
  const cidade = screen.getByLabelText("Cidade");

  fireEvent.change(logradouro, {
    target: { value: "Rua das Flores" },
  });

  fireEvent.change(numero, {
    target: { value: "100" },
  });

  fireEvent.change(bairro, {
    target: { value: "Centro" },
  });

  fireEvent.change(cidade, {
    target: { value: "São Paulo" },
  });

  expect(logradouro).toHaveValue("Rua das Flores");
  expect(numero).toHaveValue("100");
  expect(bairro).toHaveValue("Centro");
  expect(cidade).toHaveValue("São Paulo");
});

  it("deve renderizar os selects com listas vazias", () => {
    renderInformacoesGerais({
      tiposUnidades: [],
      diretoriasRegionais: [],
      subprefeituras: [],
    });

    expect(
      screen.getByLabelText("Tipo de escola"),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(
        "Diretoria Regional de Educação (DRE)",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Subprefeitura"),
    ).toBeInTheDocument();
  });
});