import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { ResponsavelTecnicoStep } from "../components/form/ResponsavelTecnicoStep";
import { empresaSchema, type EmpresaSchema } from "../schemas/empresa.schema";
import { RESPONSAVEL_TECNICO_VAZIO } from "../schemas/responsavelTecnico.schema";

interface WrapperProps {
  readonly defaultValues?: Partial<EmpresaSchema>;
}

function Wrapper({ defaultValues }: WrapperProps) {
  const methods = useForm<EmpresaSchema>({
    mode: "onBlur",
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      razao_social: "",
      status: undefined,
      link_rastreio: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      cidade: "",
      estado: "",
      responsaveis_tecnicos: [RESPONSAVEL_TECNICO_VAZIO],
      ...defaultValues,
    } as EmpresaSchema,
  });

  return (
    <FormProvider {...methods}>
      <ResponsavelTecnicoStep />
    </FormProvider>
  );
}

function renderStep(defaultValues?: Partial<EmpresaSchema>) {
  return render(<Wrapper defaultValues={defaultValues} />);
}

describe("ResponsavelTecnicoStep", () => {
  it("deve renderizar um responsável técnico por padrão", () => {
    renderStep();

    expect(
      screen.getByRole("heading", { name: /dados do responsável técnico 1/i }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/^tipo$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^e-mail$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/número do crea-sp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/número da art/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/anexos/i)).toBeInTheDocument();
  });

  it("não deve exibir o botão remover quando há apenas um responsável técnico", () => {
    renderStep();

    expect(
      screen.queryByRole("button", { name: /remover/i }),
    ).not.toBeInTheDocument();
  });

  it("deve adicionar um novo responsável técnico ao clicar em adicionar", async () => {
    const user = userEvent.setup();

    renderStep();

    await user.click(
      screen.getByRole("button", { name: /adicionar responsável técnico/i }),
    );

    expect(
      screen.getByRole("heading", { name: /dados do responsável técnico 2/i }),
    ).toBeInTheDocument();
  });

  it("deve exibir o botão remover quando há mais de um responsável técnico", async () => {
    const user = userEvent.setup();

    renderStep();

    await user.click(
      screen.getByRole("button", { name: /adicionar responsável técnico/i }),
    );

    expect(
      screen.getAllByRole("button", { name: /remover/i }),
    ).toHaveLength(2);
  });

  it("deve remover um responsável técnico ao clicar em remover", async () => {
    const user = userEvent.setup();

    renderStep();

    await user.click(
      screen.getByRole("button", { name: /adicionar responsável técnico/i }),
    );

    const [primeiroRemover] = screen.getAllByRole("button", {
      name: /remover/i,
    });

    await user.click(primeiroRemover);

    expect(
      screen.queryByRole("heading", { name: /dados do responsável técnico 2/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remover/i }),
    ).not.toBeInTheDocument();
  });

  it("deve desabilitar adicionar quando atingir o limite de tipos", async () => {
    const user = userEvent.setup();

    renderStep();

    await user.click(
      screen.getByRole("button", { name: /adicionar responsável técnico/i }),
    );
    await user.click(
      screen.getByRole("button", { name: /adicionar responsável técnico/i }),
    );

    expect(
      screen.getByRole("button", { name: /adicionar responsável técnico/i }),
    ).toBeDisabled();
  });

  it("não deve oferecer um tipo já selecionado em outro responsável técnico", async () => {
    const user = userEvent.setup();

    renderStep({
      responsaveis_tecnicos: [
        { ...RESPONSAVEL_TECNICO_VAZIO, tipo: "engenheiro_civil" },
        RESPONSAVEL_TECNICO_VAZIO,
      ],
    });

    const tiposTrigger = screen.getAllByRole("combobox", { name: /^tipo$/i });

    await user.click(tiposTrigger[1]);

    expect(
      screen.queryByRole("option", { name: /^engenheiro civil$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /^preposto$/i }),
    ).toBeInTheDocument();
  });

  it("deve preencher o nome do responsável técnico", async () => {
    const user = userEvent.setup();

    renderStep();

    const nomeInput = screen.getByLabelText(/nome completo/i);

    await user.type(nomeInput, "João da Silva");

    expect(nomeInput).toHaveValue("João da Silva");
  });

  it("deve aplicar a máscara no telefone", async () => {
    const user = userEvent.setup();

    renderStep();

    const telefoneInput = screen.getByLabelText(/telefone/i);

    await user.type(telefoneInput, "11987654321");

    await waitFor(() => {
      expect(telefoneInput).toHaveValue("(11) 98765-4321");
    });
  });

  it("não deve exibir o alerta de anexo obrigatório para preposto", () => {
    renderStep({
      responsaveis_tecnicos: [
        { ...RESPONSAVEL_TECNICO_VAZIO, tipo: "preposto" },
      ],
    });

    expect(screen.queryByText(/atenção!/i)).not.toBeInTheDocument();
  });

  it.each(["engenheiro_civil", "engenheiro_eletricista"] as const)(
    "deve exibir o alerta de anexo obrigatório quando o tipo for %s",
    (tipo) => {
      renderStep({
        responsaveis_tecnicos: [{ ...RESPONSAVEL_TECNICO_VAZIO, tipo }],
      });

      expect(screen.getByText(/atenção!/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /é necessário inserir ao menos um documento comprobatório no campo de anexos/i,
        ),
      ).toBeInTheDocument();
    },
  );

  it("deve renderizar sem cards quando não houver responsáveis técnicos observados", () => {
    renderStep({ responsaveis_tecnicos: undefined });

    expect(
      screen.queryByRole("heading", {
        name: /dados do responsável técnico/i,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /adicionar responsável técnico/i }),
    ).toBeInTheDocument();
  });

  it("deve selecionar o arquivo de anexo", async () => {
    const user = userEvent.setup();

    renderStep();

    const arquivo = new File(["conteudo"], "documento.pdf", {
      type: "application/pdf",
    });

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    await user.upload(fileInput, arquivo);

    expect(
      screen.getByPlaceholderText("Nenhum arquivo selecionado"),
    ).toHaveValue("documento.pdf");
  });
});
