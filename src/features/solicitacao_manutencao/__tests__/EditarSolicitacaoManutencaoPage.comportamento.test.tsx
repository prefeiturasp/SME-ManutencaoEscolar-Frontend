import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { beforeEach, expect, it, vi } from "vitest";
import { EditarSolicitacaoManutencaoPage } from "../components/form/EditarSolicitacaoManutencaoPage";
import { EditarServicosManutencao } from "../components/form/EditarServicosManutencao";
import { ConfirmarSolicitacaoManutencaoModal } from "../components/form/ConfirmarSolicitacaoManutencaoModal";
import { DadosSolicitacaoManutencao } from "../components/form/DadosSolicitacaoManutencao";
import { useSolicitacaoManutencaoEnviadaStore } from "../stores/useSolicitacaoManutencaoEnviadaStore";

const mocks = vi.hoisted(() => ({
  consulta: {
    data: {} as Record<string, unknown>,
    isPending: false,
    isError: false,
    refetch: vi.fn(),
  },
  editar: vi.fn(),
  buscar: vi.fn(),
  replace: vi.fn(),
  sucesso: vi.fn(),
  erro: vi.fn(),
  isPending: false,
}));
vi.mock("@tanstack/react-query", () => ({ useQuery: () => mocks.consulta }));
vi.mock("@/components/shared/LoadingGlobal/LoadingGlobal", () => ({
  LoadingGlobal: ({ mensagem }: { mensagem?: string }) => <div role="status">{mensagem}</div>,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("@/components/ui/toast-custom", () => ({
  toastSucesso: mocks.sucesso,
  toastErro: mocks.erro,
}));
vi.mock("../hooks/useEditarSolicitacaoManutencao", () => ({
  useEditarSolicitacaoManutencao: () => ({ mutateAsync: mocks.editar, isPending: mocks.isPending }),
}));
vi.mock("../services/buscarSolicitacaoManutencao.api", () => ({
  buscarSolicitacaoManutencaoAction: mocks.buscar,
}));
vi.mock("../components/form/EditarServicosManutencao", () => ({
  EditarServicosManutencao: vi.fn(() => null),
}));
vi.mock("../components/form/DadosSolicitacaoManutencao", () => ({
  DadosSolicitacaoManutencao: vi.fn(() => null),
}));
vi.mock("../components/form/ConfirmarSolicitacaoManutencaoModal", () => ({
  ConfirmarSolicitacaoManutencaoModal: vi.fn(
    (props: ComponentProps<typeof ConfirmarSolicitacaoManutencaoModal>) =>
      props.aberto ? (
        <div role="dialog">
          <button onClick={props.onSalvar}>Salvar e continuar depois</button>
          <button onClick={props.onEnviar}>Confirmar envio</button>
        </div>
      ) : null,
  ),
}));

function servico() {
  return {
    uuid: "item1",
    servico_uuid: "p1",
    nome_servico: "Pintura",
    servico_especifico: null,
    local_reparo: "Sala",
    descricao: "Reparar",
    arquivos: [{ uuid: "a1", arquivo: "/foto.jpg" }],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  useSolicitacaoManutencaoEnviadaStore.getState().fechar();
  mocks.isPending = false;
  mocks.consulta.isPending = false;
  mocks.consulta.isError = false;
  mocks.consulta.data = {
    uuid: "sol1",
    situacao: "necessidade_revisao_ue",
    tipo_atendimento: "comum",
    informacoes_adicionais: null,
    unidade_educacional: {
      uuid: "ue1",
      nome: "Escola",
      diretoria_regional: { nome: "DRE completa" },
    },
    servicos: [servico()],
  };
  mocks.editar.mockResolvedValue({ success: true, codigo: "001" });
});

function modal() {
  return vi.mocked(ConfirmarSolicitacaoManutencaoModal).mock.lastCall![0];
}
function itens() {
  return vi.mocked(EditarServicosManutencao).mock.lastCall![0];
}

it("exibe falha na consulta e permite tentar novamente", () => {
  mocks.consulta.isError = true;
  render(<EditarSolicitacaoManutencaoPage uuid="sol1" />);
  expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar");
  fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
  expect(mocks.consulta.refetch).toHaveBeenCalledOnce();
});

it("salva sem envio, altera tipo e informações e preserva a identidade dos serviços e anexos", async () => {
  mocks.consulta.data.servicos = [
    servico(),
    { ...servico(), uuid: undefined, id: 7 },
    { ...servico(), uuid: undefined, servico_uuid: null, servico_especifico: "Vidraçaria" },
  ];
  render(<EditarSolicitacaoManutencaoPage uuid="sol1" />);
  expect(itens().valor.map((item) => item.chave)).toEqual(["item1", "7", "2"]);
  expect(screen.getByText("DRE completa")).toBeInTheDocument();
  act(() => vi.mocked(DadosSolicitacaoManutencao).mock.lastCall![0].onChange!("urgente"));
  fireEvent.change(screen.getByLabelText("Informações adicionais (opcional)"), {
    target: { value: "Nova observação" },
  });
  const novo = new File(["nova"], "nova.jpg");
  act(() => itens().onChange(itens().valor.map((item) => ({ ...item, novosArquivos: [novo] }))));
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Salvar e continuar depois" }));
  });
  const payload = mocks.editar.mock.calls[0][0];
  expect(payload).toEqual(
    expect.objectContaining({
      enviar: false,
      tipo_atendimento: "urgente",
      informacoes_adicionais: "Nova observação",
    }),
  );
  expect(payload.servicos[0]).toEqual(
    expect.objectContaining({ uuid: "item1", arquivos: [{ uuid: "a1" }, { arquivo: [novo] }] }),
  );
  expect(payload.servicos[2]).toEqual(
    expect.objectContaining({ servico: "outros", servico_especifico: "Vidraçaria" }),
  );
  expect(mocks.sucesso).toHaveBeenCalledWith({
    titulo: "Sucesso!",
    descricao: "As alterações foram salvas.",
  });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(useSolicitacaoManutencaoEnviadaStore.getState()).toEqual(
    expect.objectContaining({
      codigo: "001",
      enviada: false,
      editada: true,
    }),
  );
});

it("impede duas gravações simultâneas e permite tentar novamente após erro da API", async () => {
  let concluir!: (value: unknown) => void;
  mocks.editar.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        concluir = resolve;
      }),
  );
  render(<EditarSolicitacaoManutencaoPage uuid="sol1" />);
  fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
  act(() => {
    modal().onEnviar();
    modal().onEnviar();
  });
  expect(mocks.editar).toHaveBeenCalledOnce();
  await act(async () => {
    concluir({ success: false, title: "Erro", message: "Inválido" });
  });
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(mocks.erro).toHaveBeenCalledWith({ titulo: "Erro", descricao: "Inválido" });
  expect(useSolicitacaoManutencaoEnviadaStore.getState().codigo).toBeNull();
  await act(async () => {
    modal().onEnviar();
  });
  expect(mocks.editar).toHaveBeenCalledTimes(2);
  expect(useSolicitacaoManutencaoEnviadaStore.getState()).toEqual(
    expect.objectContaining({
      codigo: "001",
      enviada: true,
      editada: true,
    }),
  );
  expect(mocks.sucesso).toHaveBeenCalledWith({
    titulo: "Sucesso!",
    descricao: "A solicitação foi enviada com sucesso.",
  });
});

it("não abre confirmação nem envia quando os dados estão inválidos", async () => {
  mocks.consulta.data.unidade_educacional = undefined;
  render(<EditarSolicitacaoManutencaoPage uuid="sol1" />);
  expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  fireEvent.submit(screen.getByRole("button", { name: "Salvar" }).closest("form")!);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  await act(async () => {
    modal().onEnviar();
  });
  expect(mocks.editar).not.toHaveBeenCalled();
});

it("não abre confirmação enquanto uma gravação está pendente", () => {
  mocks.isPending = true;
  render(<EditarSolicitacaoManutencaoPage uuid="sol1" />);
  fireEvent.submit(screen.getByRole("button", { name: "Salvar" }).closest("form")!);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(mocks.editar).not.toHaveBeenCalled();
});

it("envia serviço novo com arquivo sem exigir uma lista de anexos existentes", async () => {
  render(<EditarSolicitacaoManutencaoPage uuid="sol1" />);
  const novo = new File(["nova"], "nova.jpg");
  act(() =>
    itens().onChange([
      { ...itens().valor[0], arquivos: undefined, novosArquivos: [novo] },
    ] as unknown as ComponentProps<typeof EditarServicosManutencao>["valor"]),
  );
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Enviar para DRE" }));
  });
  expect(mocks.editar).toHaveBeenCalledWith(
    expect.objectContaining({
      servicos: [expect.objectContaining({ arquivos: [{ arquivo: [novo] }] })],
    }),
  );
});
