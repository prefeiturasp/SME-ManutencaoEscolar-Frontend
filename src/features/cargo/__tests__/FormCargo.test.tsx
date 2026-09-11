import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  appendMock,
  getValuesMock,
  removeMock,
  replaceMock,
  setValueMock,
  triggerMock,
  useFieldArrayMock,
  useFormContextMock,
  useWatchMock,
} = vi.hoisted(() => ({
  appendMock: vi.fn(),
  getValuesMock: vi.fn(),
  removeMock: vi.fn(),
  replaceMock: vi.fn(),
  setValueMock: vi.fn(),
  triggerMock: vi.fn(),
  useFieldArrayMock: vi.fn(),
  useFormContextMock: vi.fn(),
  useWatchMock: vi.fn(),
}));

vi.mock("react-hook-form", () => ({
  useFormContext: useFormContextMock,
  useWatch: useWatchMock,
  useFieldArray: useFieldArrayMock,
}));

vi.mock("lucide-react", () => ({
  Plus: () => <span data-testid="icone-adicionar" />,
  Trash2: () => <span data-testid="icone-excluir" />,
}));

type FormFieldMockProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
};

type FormSelectMockProps = {
  name: string;
  label: string;
  placeholder?: string;
  options: Array<{
    label: string;
    value: string;
  }>;
};

vi.mock("@/components/form", () => ({
  FormTextField: ({ name, label, placeholder }: FormFieldMockProps) => (
    <div data-testid={`campo-${name}`}>
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        name={name}
        aria-label={name}
        placeholder={placeholder}
      />
    </div>
  ),

  FormSelectField: ({
    name,
    label,
    placeholder,
    options,
  }: FormSelectMockProps) => (
    <div data-testid={`campo-${name}`}>
      <label htmlFor={name}>{label}</label>

      <select id={name} name={name} aria-label={name} defaultValue="">
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  ),
}));

type ButtonMockProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: string;
};

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, variant, ...props }: ButtonMockProps) => {
    void variant;

    return <button {...props}>{children}</button>;
  },
}));

import { FormCargo } from "@/features/cargo/components/FormCargo";

describe("FormCargo", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    triggerMock.mockResolvedValue(true);

    useFormContextMock.mockReturnValue({
      control: {},
      getValues: getValuesMock,
      setValue: setValueMock,
      trigger: triggerMock,
    });

    useWatchMock.mockReturnValue("true");

    useFieldArrayMock.mockReturnValue({
      fields: [],
      append: appendMock,
      remove: removeMock,
      replace: replaceMock,
    });

    getValuesMock.mockImplementation((campo: string) => {
      if (campo === "novo_documento") {
        return "";
      }

      if (campo === "documentos") {
        return [];
      }

      return undefined;
    });
  });

  it("renderiza os campos principais do cargo", () => {
    render(<FormCargo />);

    expect(screen.getByLabelText("nome")).toBeInTheDocument();

    expect(screen.getByLabelText("exige_documento")).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "Sim" })).toHaveValue("true");

    expect(screen.getByRole("option", { name: "Não" })).toHaveValue("false");
  });

  it("exibe a seção de documentos quando o cargo exige documento", () => {
    useWatchMock.mockReturnValue("true");

    render(<FormCargo />);

    expect(
      screen.getByRole("heading", {
        name: "Documentos exigidos",
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("novo_documento")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Adicionar documento",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Limpar documento",
      }),
    ).toBeInTheDocument();

    expect(screen.getByTestId("icone-adicionar")).toBeInTheDocument();
  });

  it("oculta e limpa os documentos quando o cargo não exige documento", () => {
    useWatchMock.mockReturnValue("false");

    render(<FormCargo />);

    expect(
      screen.queryByRole("heading", {
        name: "Documentos exigidos",
      }),
    ).not.toBeInTheDocument();

    expect(replaceMock).toHaveBeenCalledWith([]);

    expect(setValueMock).toHaveBeenCalledWith("novo_documento", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  });

  it("não limpa documentos quando exige documento está selecionado", () => {
    useWatchMock.mockReturnValue("true");

    render(<FormCargo />);

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("valida o campo quando tenta adicionar um documento vazio", async () => {
    getValuesMock.mockReturnValueOnce(undefined);

    render(<FormCargo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Adicionar documento",
      }),
    );

    await waitFor(() => {
      expect(triggerMock).toHaveBeenCalledWith("novo_documento");
    });

    expect(appendMock).not.toHaveBeenCalled();
  });

  it("valida o campo quando o documento possui somente espaços", async () => {
    getValuesMock.mockReturnValueOnce("   ");

    render(<FormCargo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Adicionar documento",
      }),
    );

    await waitFor(() => {
      expect(triggerMock).toHaveBeenCalledWith("novo_documento");
    });

    expect(appendMock).not.toHaveBeenCalled();
  });

  it("não adiciona documento com nome duplicado", async () => {
    getValuesMock.mockImplementation((campo: string) => {
      if (campo === "novo_documento") {
        return "  CERTIFICADO NR-10  ";
      }

      if (campo === "documentos") {
        return [
          {
            nome: "Certificado NR-10",
          },
        ];
      }

      return undefined;
    });

    render(<FormCargo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Adicionar documento",
      }),
    );

    await waitFor(() => {
      expect(setValueMock).toHaveBeenCalledWith(
        "novo_documento",
        "CERTIFICADO NR-10",
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
    });

    expect(triggerMock).toHaveBeenCalledWith("novo_documento");
    expect(appendMock).not.toHaveBeenCalled();
  });

  it("adiciona documento quando o array ainda não existe", async () => {
    getValuesMock.mockImplementation((campo: string) => {
      if (campo === "novo_documento") {
        return "  Certificado NR-10  ";
      }

      return undefined;
    });

    render(<FormCargo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Adicionar documento",
      }),
    );

    await waitFor(() => {
      expect(appendMock).toHaveBeenCalledWith(
        {
          nome: "Certificado NR-10",
        },
        {
          shouldFocus: false,
        },
      );
    });

    expect(setValueMock).toHaveBeenCalledWith("novo_documento", "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    expect(triggerMock).toHaveBeenCalledWith("documentos");
  });

  it("adiciona documento diferente dos documentos existentes", async () => {
    getValuesMock.mockImplementation((campo: string) => {
      if (campo === "novo_documento") {
        return "  RG  ";
      }

      if (campo === "documentos") {
        return [
          {
            nome: "CPF",
          },
        ];
      }

      return undefined;
    });

    render(<FormCargo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Adicionar documento",
      }),
    );

    await waitFor(() => {
      expect(appendMock).toHaveBeenCalledWith(
        {
          nome: "RG",
        },
        {
          shouldFocus: false,
        },
      );
    });

    expect(setValueMock).toHaveBeenCalledWith("novo_documento", "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    expect(triggerMock).toHaveBeenCalledWith("documentos");
  });

  it("renderiza os documentos adicionados", () => {
    useFieldArrayMock.mockReturnValue({
      fields: [
        {
          id: "documento-1",
        },
        {
          id: "documento-2",
        },
      ],
      append: appendMock,
      remove: removeMock,
      replace: replaceMock,
    });

    render(<FormCargo />);

    expect(screen.getByLabelText("documentos.0.nome")).toBeInTheDocument();

    expect(screen.getByLabelText("documentos.1.nome")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Excluir documento 1",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Excluir documento 2",
      }),
    ).toBeInTheDocument();
  });

  it("exclui um documento da lista pelo índice", async () => {
    useFieldArrayMock.mockReturnValue({
      fields: [
        {
          id: "documento-1",
        },
      ],
      append: appendMock,
      remove: removeMock,
      replace: replaceMock,
    });

    render(<FormCargo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Excluir documento 1",
      }),
    );

    await waitFor(() => {
      expect(removeMock).toHaveBeenCalledWith(0);
    });

    expect(triggerMock).toHaveBeenCalledWith(["documentos", "novo_documento"]);
  });

  it("limpa o documento principal quando não existem documentos na lista", async () => {
    getValuesMock.mockImplementation((campo: string) => {
      if (campo === "documentos") {
        return undefined;
      }

      return undefined;
    });

    render(<FormCargo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Limpar documento",
      }),
    );

    await waitFor(() => {
      expect(setValueMock).toHaveBeenCalledWith("novo_documento", "", {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    });

    expect(removeMock).not.toHaveBeenCalled();
  });

  it("move o documento mais novo para o campo principal", async () => {
    getValuesMock.mockImplementation((campo: string) => {
      if (campo === "documentos") {
        return [
          {
            nome: "Documento antigo",
          },
          {
            nome: "Documento mais novo",
          },
        ];
      }

      return undefined;
    });

    render(<FormCargo />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Limpar documento",
      }),
    );

    await waitFor(() => {
      expect(removeMock).toHaveBeenCalledWith(1);
    });

    expect(setValueMock).toHaveBeenCalledWith(
      "novo_documento",
      "Documento mais novo",
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      },
    );

    expect(triggerMock).toHaveBeenCalledWith(["novo_documento", "documentos"]);
  });
});
