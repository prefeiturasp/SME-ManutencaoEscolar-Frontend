import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { ResponsavelTecnicoStep } from "../components/form/ResponsavelTecnicoStep";
import { empresaSchema, type EmpresaSchema } from "../schemas/empresa.schema";
import { RESPONSAVEL_TECNICO_VAZIO } from "../schemas/responsavelTecnico.schema";
import type { ResponsavelTecnico } from "../types/responsavelTecnico.types";

interface WrapperProps {
  readonly defaultValues?: Partial<EmpresaSchema>;
  readonly modoEdicao?: boolean;
  readonly ultimoAlterado?: ResponsavelTecnico | null;
}

function AnexosFormState() {
  const responsaveis = useWatch<EmpresaSchema>({
    name: "responsaveis_tecnicos",
  });
  const nomes =
    responsaveis?.flatMap((responsavel) =>
      (responsavel.anexos ?? []).map((anexo) =>
        anexo instanceof File ? anexo.name : anexo.nome,
      ),
    ) ?? [];

  return (
    <output data-testid="anexos-form-state" data-value={nomes.join(",")} />
  );
}

function Wrapper({ defaultValues, modoEdicao, ultimoAlterado }: WrapperProps) {
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
      <ResponsavelTecnicoStep
        modoEdicao={modoEdicao}
        ultimoAlterado={ultimoAlterado}
      />
      <AnexosFormState />
    </FormProvider>
  );
}

function renderStep(
  defaultValues?: Partial<EmpresaSchema>,
  opcoes?: Omit<WrapperProps, "defaultValues">,
) {
  return render(
    <Wrapper
      defaultValues={defaultValues}
      modoEdicao={opcoes?.modoEdicao}
      ultimoAlterado={opcoes?.ultimoAlterado}
    />,
  );
}

const ULTIMO_ALTERADO: ResponsavelTecnico = {
  uuid: "uuid-rt-1",
  tipo: "engenheiro_civil",
  nome: "Responsável Teste",
  email: "responsavel@example.com",
  telefone: "11987654321",
  numero_crea: "1234567890/A",
  numero_art: "2026/000000-0",
  criado_por: "Maria Souza",
  criado_em: "2026-03-01T10:00:00Z",
  atualizado_por: "João Lima",
  atualizado_em: "2026-03-05T10:00:00Z",
};

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

    expect(screen.getAllByRole("button", { name: /remover/i })).toHaveLength(2);
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
      screen.queryByRole("heading", {
        name: /dados do responsável técnico 2/i,
      }),
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

  it("deve criar um card e limpar o campo ao selecionar um arquivo de anexo", async () => {
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
    ).toHaveValue("");
    expect(screen.getByText("documento.pdf")).toBeInTheDocument();
  });

  it("não deve exibir a auditoria fora do modo de edição", () => {
    renderStep(undefined, {
      modoEdicao: false,
      ultimoAlterado: ULTIMO_ALTERADO,
    });

    expect(screen.queryByText(/^inserido por/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^alterado por/i)).not.toBeInTheDocument();
  });

  it("não deve exibir a auditoria em modo de edição sem responsável alterado", () => {
    renderStep(undefined, { modoEdicao: true, ultimoAlterado: null });

    expect(screen.queryByText(/^inserido por/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^alterado por/i)).not.toBeInTheDocument();
  });

  it("deve exibir a auditoria do último responsável técnico alterado em modo de edição", () => {
    renderStep(undefined, {
      modoEdicao: true,
      ultimoAlterado: ULTIMO_ALTERADO,
    });

    expect(
      screen.getByText("Inserido por Maria Souza em 01/03/2026 às 07:00"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Alterado por João Lima em 05/03/2026 às 07:00"),
    ).toBeInTheDocument();
  });

  it("deve exibir 'Não informado' quando o responsável alterado não tiver autores", () => {
    renderStep(undefined, {
      modoEdicao: true,
      ultimoAlterado: {
        ...ULTIMO_ALTERADO,
        criado_por: undefined as unknown as string,
        atualizado_por: undefined as unknown as string,
      },
    });

    expect(
      screen.getByText("Inserido por Não informado em 01/03/2026 às 07:00"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Alterado por Não informado em 05/03/2026 às 07:00"),
    ).toBeInTheDocument();
  });

  it("deve exibir cards dos arquivos adicionados após fazer upload", async () => {
    const user = userEvent.setup();

    renderStep();

    const arquivo = new File(["conteudo"], "CREA.pdf", {
      type: "application/pdf",
    });

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    await user.upload(fileInput, arquivo);

    await waitFor(() => {
      expect(screen.getByText("CREA.pdf")).toBeInTheDocument();
    });
  });

  it("deve exibir múltiplos cards quando vários arquivos são adicionados", async () => {
    const user = userEvent.setup();

    renderStep();

    const arquivo1 = new File(["conteudo1"], "CREA.pdf", {
      type: "application/pdf",
    });
    const arquivo2 = new File(["conteudo2"], "ART.pdf", {
      type: "application/pdf",
    });

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    await user.upload(fileInput, [arquivo1, arquivo2]);

    await waitFor(() => {
      expect(screen.getByText("CREA.pdf")).toBeInTheDocument();
      expect(screen.getByText("ART.pdf")).toBeInTheDocument();
    });
  });

  it("deve remover um arquivo adicionado do formulário", async () => {
    const user = userEvent.setup();
    const arquivo = new File(["conteudo"], "CREA.pdf", {
      type: "application/pdf",
    });

    renderStep({
      responsaveis_tecnicos: [
        { ...RESPONSAVEL_TECNICO_VAZIO, anexos: [arquivo] },
      ],
    });

    expect(screen.getByTestId("anexos-form-state")).toHaveAttribute(
      "data-value",
      "CREA.pdf",
    );

    await user.click(
      screen.getByRole("button", { name: /remover arquivo crea\.pdf/i }),
    );

    expect(screen.queryByText("CREA.pdf")).not.toBeInTheDocument();
    expect(screen.getByTestId("anexos-form-state")).toHaveAttribute(
      "data-value",
      "",
    );
  });

  it("deve remover um arquivo salvo do formulário", async () => {
    const user = userEvent.setup();

    renderStep({
      responsaveis_tecnicos: [
        {
          ...RESPONSAVEL_TECNICO_VAZIO,
          anexos: [
            {
              uuid: "anexo-1",
              nome: "CREA backend.pdf",
              arquivo_url: "https://example.com/crea.pdf",
            },
          ],
        },
      ],
    });

    await user.click(
      screen.getByRole("button", {
        name: /remover arquivo crea backend\.pdf/i,
      }),
    );

    expect(screen.queryByText("CREA backend.pdf")).not.toBeInTheDocument();
    expect(screen.getByTestId("anexos-form-state")).toHaveAttribute(
      "data-value",
      "",
    );
  });

  it("deve exibir os arquivos do backend no respectivo responsável técnico", () => {
    renderStep({
      responsaveis_tecnicos: [
        {
          ...RESPONSAVEL_TECNICO_VAZIO,
          tipo: "engenheiro_civil",
          anexos: [
            {
              uuid: "anexo-1",
              nome: "CREA backend.pdf",
              arquivo_url: "https://example.com/crea.pdf",
            },
          ],
        },
        {
          ...RESPONSAVEL_TECNICO_VAZIO,
          tipo: "preposto",
          anexos: [
            {
              uuid: "anexo-2",
              nome: "Documento preposto.pdf",
              arquivo_url: "https://example.com/preposto.pdf",
            },
          ],
        },
      ],
    });

    expect(
      screen.getByRole("link", { name: "Baixar arquivo CREA backend.pdf" }),
    ).toHaveAttribute("href", "https://example.com/crea.pdf");
    expect(
      screen.getByRole("link", {
        name: "Baixar arquivo Documento preposto.pdf",
      }),
    ).toHaveAttribute("href", "https://example.com/preposto.pdf");
  });
});
