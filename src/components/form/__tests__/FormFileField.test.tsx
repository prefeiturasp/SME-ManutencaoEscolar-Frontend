import { useEffect } from "react";

import { act, fireEvent, render, screen } from "@testing-library/react";
import { FieldPath, FormProvider, useForm, UseFormReturn } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FormFileField } from "@/components/form/FormFileField";

interface TestForm {
  arquivos: File[];
}

function criarArquivo(nome: string, tipo = "application/pdf") {
  return new File(["conteudo"], nome, { type: tipo });
}

function Wrapper({
  name = "arquivos",
  label = "Arquivos",
  multiple,
  accept,
  className,
  errorMessage,
  onMethodsReady,
  valorInicial,
  variant,
  description,
  limparAposSelecao,
  helperText,
}: {
  readonly name?: FieldPath<TestForm>;
  readonly label?: string;
  readonly multiple?: boolean;
  readonly accept?: string;
  readonly className?: string;
  readonly errorMessage?: string;
  readonly onMethodsReady?: (methods: UseFormReturn<TestForm>) => void;
  readonly valorInicial?: File[] | undefined;
  readonly variant?: "default" | "documento";
  readonly description?: string;
  readonly limparAposSelecao?: boolean;
  readonly helperText?: string;
}) {
  const methods = useForm<TestForm>({
    defaultValues: valorInicial === undefined ? {} : { arquivos: valorInicial },
  });

  useEffect(() => {
    onMethodsReady?.(methods);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (errorMessage) {
      methods.setError(name, { type: "manual", message: errorMessage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorMessage]);

  return (
    <FormProvider {...methods}>
      <FormFileField<TestForm>
        name={name}
        label={label}
        multiple={multiple}
        accept={accept}
        className={className}
        variant={variant}
        description={description}
        limparAposSelecao={limparAposSelecao}
        helperText={helperText}
      />
    </FormProvider>
  );
}

function getHiddenFileInput(container: HTMLElement) {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("FormFileField", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve renderizar label, placeholder e botão de escolher arquivo", () => {
    render(<Wrapper />);

    expect(screen.getByText("Arquivos")).toBeInTheDocument();

    const input = screen.getByPlaceholderText("Nenhum arquivo selecionado");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveAttribute("id", "arquivos");
    expect(input).toHaveAttribute("aria-invalid", "false");

    expect(screen.getByRole("button", { name: /escolher arquivo/i })).toBeInTheDocument();
  });

  it("deve manter o input de arquivo oculto e repassar multiple e accept", () => {
    const { container } = render(<Wrapper multiple={false} accept="application/pdf" />);

    const hiddenInput = getHiddenFileInput(container);

    expect(hiddenInput).toHaveClass("hidden");
    expect(hiddenInput).not.toHaveAttribute("multiple");
    expect(hiddenInput).toHaveAttribute("accept", "application/pdf");
  });

  it("deve permitir múltiplos arquivos por padrão", () => {
    const { container } = render(<Wrapper />);

    expect(getHiddenFileInput(container)).toHaveAttribute("multiple");
  });

  it("deve abrir o seletor de arquivos ao clicar no botão", () => {
    const { container } = render(<Wrapper />);

    const hiddenInput = getHiddenFileInput(container);
    const clickSpy = vi.spyOn(hiddenInput, "click");

    fireEvent.click(screen.getByRole("button", { name: /escolher arquivo/i }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("deve abrir o seletor de arquivos ao clicar no input visível", () => {
    const { container } = render(<Wrapper />);

    const hiddenInput = getHiddenFileInput(container);
    const clickSpy = vi.spyOn(hiddenInput, "click");

    fireEvent.click(screen.getByPlaceholderText("Nenhum arquivo selecionado"));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("deve exibir os nomes dos arquivos selecionados e limpar erros", async () => {
    let methodsRef: UseFormReturn<TestForm> | undefined;

    const { container } = render(
      <Wrapper
        onMethodsReady={(methods) => {
          methodsRef = methods;
        }}
      />,
    );

    act(() => {
      methodsRef?.setError("arquivos", {
        type: "manual",
        message: "Selecione um arquivo",
      });
    });

    expect(screen.getByRole("alert")).toHaveTextContent("Selecione um arquivo");

    const arquivo1 = criarArquivo("documento.pdf");
    const arquivo2 = criarArquivo("planilha.xlsx");

    const hiddenInput = getHiddenFileInput(container);

    fireEvent.change(hiddenInput, {
      target: { files: [arquivo1, arquivo2] },
    });

    const input = await screen.findByPlaceholderText("Nenhum arquivo selecionado");

    expect(input).toHaveValue("documento.pdf, planilha.xlsx");
    expect(hiddenInput.value).toBe("");
    expect(screen.queryByText("Selecione um arquivo")).not.toBeInTheDocument();
  });

  it("deve exibir mensagem de erro quando o campo for inválido", () => {
    render(<Wrapper errorMessage="Arquivo é obrigatório" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Arquivo é obrigatório");

    expect(screen.getByPlaceholderText("Nenhum arquivo selecionado")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("não deve exibir mensagem de erro quando não houver erro", () => {
    render(<Wrapper />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("deve aplicar className customizada ao container", () => {
    const { container } = render(<Wrapper className="custom-wrapper" />);

    expect(container.querySelector(".custom-wrapper")).toBeInTheDocument();
  });

  it("deve tratar valor indefinido do campo como lista vazia", () => {
    render(<Wrapper valorInicial={undefined} />);

    expect(screen.getByPlaceholderText("Nenhum arquivo selecionado")).toHaveValue("");
  });

  it("deve tratar seleção sem arquivos como lista vazia", () => {
    const { container } = render(<Wrapper />);

    const hiddenInput = getHiddenFileInput(container);

    fireEvent.change(hiddenInput, {
      target: { files: null },
    });

    expect(screen.getByPlaceholderText("Nenhum arquivo selecionado")).toHaveValue("");
  });

  it("deve renderizar a variação de documento em cartão", () => {
    const { container } = render(
      <Wrapper
        label="Curso Norma NR135"
        variant="documento"
        description="Selecione o arquivo obrigatório deste cargo."
      />,
    );

    expect(screen.getByText("Curso Norma NR135")).toBeInTheDocument();
    expect(screen.getByText("Selecione o arquivo obrigatório deste cargo.")).toBeInTheDocument();
    expect(
      screen.getByText("Selecione um arquivo").parentElement?.querySelector("svg"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /escolher arquivo/i })).toHaveClass("max-w-full");
    expect(container.querySelector(".min-h-48")).toBeInTheDocument();
  });

  it("deve mostrar o arquivo selecionado e permitir substituí-lo ou removê-lo", () => {
    let methodsRef: UseFormReturn<TestForm> | undefined;
    const { container } = render(
      <Wrapper
        variant="documento"
        onMethodsReady={(methods) => {
          methodsRef = methods;
        }}
      />,
    );
    const fileInput = getHiddenFileInput(container);
    const clickSpy = vi.spyOn(fileInput, "click");

    fireEvent.change(fileInput, { target: { files: [criarArquivo("Curso_Norma_NR135.pdf")] } });

    expect(screen.getByText("Curso_Norma_NR135.pdf")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Substituir arquivo" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Substituir arquivo" }));
    expect(clickSpy).toHaveBeenCalledOnce();

    fireEvent.change(fileInput, { target: { files: [criarArquivo("novo.pdf")] } });
    expect(screen.getByText("novo.pdf")).toBeInTheDocument();
    expect(screen.queryByText("Curso_Norma_NR135.pdf")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remover arquivo novo.pdf" }));
    expect(methodsRef?.getValues("arquivos")).toEqual([]);
    expect(screen.getByRole("button", { name: "Escolher arquivo" })).toBeInTheDocument();
  });

  it("deve manter o arquivo quando a seleção for cancelada", () => {
    const { container } = render(
      <Wrapper variant="documento" valorInicial={[criarArquivo("documento.pdf")]} />,
    );

    fireEvent.change(getHiddenFileInput(container), { target: { files: null } });

    expect(screen.getByText("documento.pdf")).toBeInTheDocument();
  });

  it("acumula arquivos e mantém o campo visível vazio quando solicitado", () => {
    let methodsRef: UseFormReturn<TestForm> | undefined;
    const { container } = render(
      <Wrapper
        limparAposSelecao
        onMethodsReady={(methods) => {
          methodsRef = methods;
        }}
      />,
    );
    const input = getHiddenFileInput(container);
    const primeiro = criarArquivo("primeiro.pdf");
    const segundo = criarArquivo("segundo.pdf");

    fireEvent.change(input, { target: { files: [primeiro] } });
    fireEvent.change(input, { target: { files: [segundo] } });

    expect(methodsRef?.getValues("arquivos")).toEqual([primeiro, segundo]);
    expect(screen.getByPlaceholderText("Nenhum arquivo selecionado")).toHaveValue("");
  });

  it("mostra a ajuda somente quando não há erro", () => {
    const { rerender } = render(<Wrapper helperText="Envie um PDF" />);
    expect(screen.getByText("Envie um PDF")).toBeInTheDocument();

    rerender(<Wrapper helperText="Envie um PDF" errorMessage="Arquivo obrigatório" />);
    expect(screen.queryByText("Envie um PDF")).not.toBeInTheDocument();
  });

  it("mostra a descrição e oculta a mensagem de erro na variante de documento", () => {
    render(
      <Wrapper
        variant="documento"
        description="Envie o documento obrigatório"
        errorMessage="Arquivo obrigatório"
      />,
    );
    expect(screen.getByText("Envie o documento obrigatório")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nenhum arquivo selecionado")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
