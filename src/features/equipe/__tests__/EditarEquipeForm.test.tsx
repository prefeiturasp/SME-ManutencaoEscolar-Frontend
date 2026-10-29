import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditarEquipeForm } from "../components/form/EditarEquipeForm";
import type { EquipeFormData } from "../schema/equipeSchema";

const mocks = vi.hoisted(() => ({
  form: vi.fn(),
  editar: vi.fn(),
  mutate: vi.fn(),
  feedback: vi.fn(),
  sucesso: vi.fn(),
  erro: vi.fn(),
  conteudo: vi.fn(),
  alerta: vi.fn(),
  excluir: vi.fn(),
}));
vi.mock("react-hook-form", () => ({
  useForm: mocks.form,
  FormProvider: ({ children }: { children: ReactNode }) => children,
}));
vi.mock("@/features/equipe/hooks/useEditarEquipe", () => ({ useEditarEquipe: mocks.editar }));
vi.mock("@/hooks/useFeedbackEntidade", () => ({ useFeedbackEntidade: mocks.feedback }));
vi.mock("@/features/equipe/components/form/EquipeFormConteudo", () => ({
  EquipeFormConteudo: (props: unknown) => {
    mocks.conteudo(props);
    return <div>Campos da equipe</div>;
  },
}));
vi.mock("@/features/equipe/components/form/ExcluirEquipeModal", () => ({
  ExcluirEquipeModal: (props: unknown) => {
    mocks.excluir(props);
    return <button type="button">Excluir equipe</button>;
  },
}));
vi.mock("@/features/equipe/components/form/AlertaErroVinculoEquipe", () => ({
  AlertaErroVinculoEquipe: (props: unknown) => {
    mocks.alerta(props);
    return <div data-testid="alerta" />;
  },
}));

const equipe = {
  id: 1,
  uuid: "e1",
  nome: "Equipe",
  situacao: true,
  empresa: { id: 1, uuid: "empresa", nome: "Atual", cnpj: "111" },
  lote: { uuid: "lote", nome: "Atual", periodo_inicial: "2020-01-01", periodo_final: "2020-12-31" },
  profissionais: [
    { profissional: "p1", funcao: "f1", nome: "Ana", cpf: "111", nome_funcao: "Fun??o" },
  ],
};
const dados: EquipeFormData = {
  nome: "Novo nome",
  situacao: "false",
  empresa: "empresa-2",
  lote: "lote-2",
  profissionais: [{ profissional: "p2", funcao: "f2" }],
};
const alerta = {
  aberto: true,
  titulo: "Erro",
  mensagem: "Falha",
  vinculados: [{ profissional: "Ana", equipe: "Equipe B" }],
  onOpenChange: vi.fn(),
};
let state: {
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  dirtyFields: Record<string, unknown>;
};
beforeEach(() => {
  vi.clearAllMocks();
  state = { isValid: true, isDirty: true, isSubmitting: false, dirtyFields: { nome: true } };
  mocks.form.mockImplementation(() => ({
    formState: state,
    handleSubmit:
      (callback: (values: EquipeFormData) => void) => (event: { preventDefault: () => void }) => {
        event.preventDefault();
        callback(dados);
      },
  }));
  mocks.editar.mockReturnValue({ mutate: mocks.mutate, isPending: false });
  mocks.feedback.mockReturnValue({
    tratarResultado: mocks.sucesso,
    tratarErroInesperado: mocks.erro,
    alertaProps: alerta,
  });
});

describe("EditarEquipeForm", () => {
  it.each([true, false])(
    "preenche os valores iniciais com situacao %s e compartilha os dados",
    (situacao) => {
      const atual = { ...equipe, situacao };
      render(<EditarEquipeForm uuid="e1" equipe={atual} />);
      expect(screen.getByRole("heading", { name: "Editar equipe" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Cancelar" })).toHaveAttribute(
        "href",
        "/empresas/equipes",
      );
      expect(mocks.form).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "onChange",
          defaultValues: {
            nome: atual.nome,
            situacao: situacao ? "true" : "false",
            empresa: atual.empresa.uuid,
            lote: atual.lote.uuid,
            profissionais: atual.profissionais.map(({ profissional, funcao }) => ({
              profissional,
              funcao,
            })),
          },
        }),
      );
      expect(mocks.editar).toHaveBeenCalledWith("e1");
      expect(mocks.conteudo).toHaveBeenCalledWith({ equipe: atual });
      expect(mocks.alerta).toHaveBeenCalledWith(alerta);
      expect(mocks.feedback).toHaveBeenCalledWith({
        mensagemSucesso: "As alterações foram salvas.",
        contextoErro: "editar equipe",
        rotaRetorno: "/empresas/equipes/",
      });
    },
  );

  it.each(["nome", "situacao", "empresa", "lote", "profissionais"] as const)(
    "envia somente o campo alterado: %s",
    (campo) => {
      state.dirtyFields = { [campo]: campo === "profissionais" ? [{ profissional: true }] : true };
      render(<EditarEquipeForm uuid="e1" equipe={equipe} />);
      fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
      expect(mocks.mutate).toHaveBeenCalledExactlyOnceWith(
        { [campo]: dados[campo] },
        { onSuccess: mocks.sucesso, onError: mocks.erro },
      );
    },
  );

  it("envia todos os campos quando todos foram alterados", () => {
    state.dirtyFields = {
      nome: true,
      situacao: true,
      empresa: true,
      lote: true,
      profissionais: true,
    };
    render(<EditarEquipeForm uuid="e1" equipe={equipe} />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(mocks.mutate).toHaveBeenCalledWith(dados, expect.any(Object));
  });

  it("exibe o botão de exclusão com o UUID da equipe", () => {
    render(<EditarEquipeForm uuid="e1" equipe={equipe} />);

    expect(screen.getByRole("button", { name: "Excluir equipe" })).toBeInTheDocument();
    expect(mocks.excluir).toHaveBeenCalledWith({ uuid: "e1" });
  });

  it("ignora um envio sem campos alterados", () => {
    state.dirtyFields = {};
    render(<EditarEquipeForm uuid="e1" equipe={equipe} />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it.each([
    [false, true, false, false],
    [true, false, false, false],
    [true, true, true, false],
    [true, true, false, true],
    [true, true, false, false],
  ])(
    "controla Salvar: valido=%s alterado=%s enviando=%s pendente=%s",
    (isValid, isDirty, isSubmitting, isPending) => {
      Object.assign(state, { isValid, isDirty, isSubmitting });
      mocks.editar.mockReturnValue({ mutate: mocks.mutate, isPending });
      render(<EditarEquipeForm uuid="e1" equipe={equipe} />);
      const botao = screen.getByRole("button", { name: "Salvar" });
      if (!isValid || !isDirty || isSubmitting || isPending) {
        expect(botao).toBeDisabled();
        fireEvent.click(botao);
        expect(mocks.mutate).not.toHaveBeenCalled();
      } else {
        expect(botao).toBeEnabled();
      }
    },
  );
});
