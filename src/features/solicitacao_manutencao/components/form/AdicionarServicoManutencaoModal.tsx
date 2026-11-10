"use client";

import { VisualizadorImagens } from "@/components/shared/VisualizadorImagens/VisualizadorImagens";
import { useGaleriaArquivosServico } from "@/features/solicitacao_manutencao/hooks/useGaleriaArquivosServico";
import type {
  AdicionarServicoManutencaoModalProps,
  ServicoManutencao,
} from "@/features/solicitacao_manutencao/types/solicitacaoManutencao.types";
import { Download, Info, Paperclip, Trash2, Upload, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useId, useState, type ChangeEvent } from "react";
import { z } from "zod";

import { FormError } from "@/components/form/FormError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { servicoManutencaoSchema } from "@/features/solicitacao_manutencao/schemas/adicionarServicoManutencaoSchema";

function juntarArquivos(atuais: File[], selecionados: File[]): File[] {
  const novos = selecionados.filter(
    (novo) =>
      !atuais.some(
        (atual) =>
          atual.name === novo.name &&
          atual.size === novo.size &&
          atual.lastModified === novo.lastModified,
      ),
  );
  return [...atuais, ...novos];
}

export function AdicionarServicoManutencaoModal({
  aberto,
  onOpenChange,
  opcoes,
  onAdicionar,
  servicoInicial,
  exibirGaleria = false,
  somenteLeitura = false,
}: AdicionarServicoManutencaoModalProps) {
  const id = useId();
  const [servicoManutencao, setServicoManutencao] = useState(servicoInicial?.servico ?? "");
  const [servicoManutencaoEspecifico, setServicoManutencaoEspecifico] = useState(
    servicoInicial?.servico_especifico ?? "",
  );
  const [local, setLocal] = useState(servicoInicial?.local_reparo ?? "");
  const [descricao, setDescricao] = useState(servicoInicial?.descricao ?? "");
  const [arquivos, setArquivos] = useState<File[]>(servicoInicial?.arquivos ?? []);
  const [arquivosExistentes, setArquivosExistentes] = useState(
    servicoInicial?.arquivosExistentes ?? [],
  );
  const galeria = useGaleriaArquivosServico(arquivos, arquivosExistentes, exibirGaleria);
  const [erroArquivo, setErroArquivo] = useState("");
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const validacao = servicoManutencaoSchema.safeParse({
    id: servicoInicial?.id ?? "novo",
    servico: servicoManutencao,
    servico_especifico: servicoManutencao === "outros" ? servicoManutencaoEspecifico : undefined,
    local_reparo: local,
    descricao,
    arquivos,
    arquivosExistentes,
  });
  const erros = validacao.success ? {} : z.flattenError(validacao.error).fieldErrors;
  const valido = validacao.success;

  function selecionarArquivos(event: ChangeEvent<HTMLInputElement>) {
    const selecionados = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selecionados.length) return;
    if (selecionados.some((arquivo) => !/\.(png|jpe?g)$/i.test(arquivo.name))) {
      setErroArquivo("Selecione arquivos PNG, JPG e JPEG.");
      return;
    }
    setErroArquivo("");
    setArquivos((atuais) => juntarArquivos(atuais, selecionados));
  }

  function removerArquivo(indice: number) {
    setArquivos((atuais) => atuais.filter((_, posicao) => posicao !== indice));
    setTocados((atuais) => ({ ...atuais, arquivos: true }));
  }

  function removerArquivoExistente(uuid: string) {
    setArquivosExistentes((atuais) => atuais.filter((arquivo) => arquivo.uuid !== uuid));
    setTocados((atuais) => ({ ...atuais, arquivos: true }));
  }

  function removerDaGaleria(indice: number) {
    if (indice < arquivosExistentes.length) {
      removerArquivoExistente(arquivosExistentes[indice].uuid);
      return;
    }
    removerArquivo(indice - arquivosExistentes.length);
  }

  function confirmarAdicionar() {
    if (validacao.success) adicionar(validacao.data);
  }

  function adicionar(dados: ServicoManutencao) {
    onAdicionar({
      id: servicoInicial?.id ?? crypto.randomUUID(),
      servico: dados.servico,
      servico_especifico: dados.servico_especifico,
      local_reparo: dados.local_reparo,
      descricao: dados.descricao,
      arquivos: dados.arquivos,
      ...(exibirGaleria ? { arquivosExistentes: dados.arquivosExistentes } : {}),
      ...(exibirGaleria
        ? {
            nome_servico:
              opcoes.find((opcao) => opcao.value === dados.servico)?.label ??
              (servicoInicial?.servico === dados.servico ? servicoInicial.nome_servico : undefined),
          }
        : {}),
    });
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={aberto} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] ${exibirGaleria ? "flex max-w-[1280px] flex-col overflow-hidden" : "max-w-xl overflow-y-auto"} -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 text-gray shadow-lg`}
        >
          <div className="shrink-0">
            <Dialog.Title className="pr-8 text-lg font-semibold">
              Serviço de manutenção
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm">
              {servicoInicial?.id ? "Edite" : "Preencha"} as informações do serviço que precisa ser
              executado.
            </Dialog.Description>
          </div>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Fechar"
              className="absolute cursor-pointer right-5 top-5 rounded p-1 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X className="size-5" />
            </button>
          </Dialog.Close>

          <div
            className={
              exibirGaleria
                ? "mt-6 grid min-h-0 flex-1 gap-6 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden"
                : "mt-6"
            }
          >
            <fieldset
              disabled={somenteLeitura}
              className={
                exibirGaleria
                  ? "flex min-h-0 min-w-0 flex-col gap-3 overflow-y-auto p-1 pb-0 disabled:cursor-not-allowed [&>div]:shrink-0 [&>p]:shrink-0"
                  : "min-w-0 space-y-4 disabled:cursor-not-allowed"
              }
            >
              <div className="space-y-1">
                <Label htmlFor={`${id}-servico`}>Qual o serviço?</Label>
                <Select
                  disabled={somenteLeitura}
                  value={servicoManutencao}
                  onValueChange={setServicoManutencao}
                  onOpenChange={(open) => {
                    if (!open) setTocados((atuais) => ({ ...atuais, servico: true }));
                  }}
                  required
                >
                  <SelectTrigger
                    id={`${id}-servico`}
                    className="w-full cursor-pointer"
                    aria-invalid={Boolean(tocados.servico && erros.servico)}
                  >
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[60]">
                    <OpcoesServico opcoes={opcoes} servicoInicial={servicoInicial} />
                  </SelectContent>
                </Select>
                {tocados.servico && erros.servico && <FormError message={erros.servico[0]} />}
              </div>
              {servicoManutencao === "outros" && (
                <div className="space-y-1 border-l-2 border-gray-light pl-3">
                  <Label htmlFor={`${id}-servico-especifico`}>Nome do serviço específico</Label>
                  <Input
                    disabled={somenteLeitura}
                    id={`${id}-servico-especifico`}
                    placeholder="Descreva o serviço..."
                    value={servicoManutencaoEspecifico}
                    onChange={(event) => setServicoManutencaoEspecifico(event.target.value)}
                    onBlur={() => setTocados((atuais) => ({ ...atuais, servico_especifico: true }))}
                    required
                    aria-invalid={Boolean(tocados.servico_especifico && erros.servico_especifico)}
                  />
                  {tocados.servico_especifico && erros.servico_especifico && (
                    <FormError message={erros.servico_especifico[0]} />
                  )}
                </div>
              )}
              <div className="space-y-1">
                <Label htmlFor={`${id}-local`}>Qual local necessita do reparo?</Label>
                <Input
                  disabled={somenteLeitura}
                  id={`${id}-local`}
                  value={local}
                  onChange={(event) => setLocal(event.target.value)}
                  placeholder="Exemplo: Sala 12, banheiro masculino, quadra..."
                  required
                  onBlur={() => setTocados((atuais) => ({ ...atuais, local_reparo: true }))}
                  aria-invalid={Boolean(tocados.local_reparo && erros.local_reparo)}
                />
                {tocados.local_reparo && erros.local_reparo && (
                  <FormError message={erros.local_reparo[0]} />
                )}
              </div>
              <div className="space-y-1" hidden={somenteLeitura}>
                <Label htmlFor={`${id}-arquivos`}>Fotos do local do reparo</Label>
                <div className="relative flex h-10 items-center overflow-hidden rounded-md border border-input">
                  <span className="min-w-0 flex-1 truncate px-3 text-sm text-muted-foreground">
                    {arquivos.length + arquivosExistentes.length
                      ? "Selecione novos arquivos"
                      : "Nenhum arquivo selecionado"}
                  </span>
                  <span className="flex h-full shrink-0 items-center gap-2 bg-primary px-4 text-sm font-semibold text-white">
                    <Upload className="size-4" />
                    Escolher arquivo
                  </span>
                  <input
                    id={`${id}-arquivos`}
                    type="file"
                    multiple
                    required={arquivos.length + arquivosExistentes.length === 0}
                    onBlur={() => setTocados((atuais) => ({ ...atuais, arquivos: true }))}
                    aria-invalid={Boolean(erroArquivo || (tocados.arquivos && erros.arquivos))}
                    accept=".png,.jpg,.jpeg"
                    aria-describedby={`${id}-formatos`}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    onChange={selecionarArquivos}
                  />
                </div>
                <p id={`${id}-formatos`} className="text-xs">
                  PNG, JPG e JPEG
                </p>
                {erroArquivo && (
                  <p role="alert" className="text-sm text-destructive">
                    {erroArquivo}
                  </p>
                )}
                {tocados.arquivos && !erroArquivo && erros.arquivos && (
                  <FormError message={erros.arquivos[0]} />
                )}
              </div>
              <ListaArquivosServico
                arquivos={arquivos}
                arquivosExistentes={arquivosExistentes}
                exibirGaleria={exibirGaleria}
                somenteLeitura={somenteLeitura}
                removerArquivo={removerArquivo}
                removerArquivoExistente={removerArquivoExistente}
              />
              <p className="flex items-start gap-2 rounded-md bg-primary/10 p-3 text-sm text-primary">
                <Info className="size-5 shrink-0" />
                <span>
                  <strong>Dica:</strong> para uma melhor visualização, prefira fotos no formato
                  paisagem (horizontal).
                </span>
              </p>
              <div className="space-y-1">
                <Label htmlFor={`${id}-descricao`}>Breve descrição do serviço</Label>
                <textarea
                  disabled={somenteLeitura}
                  id={`${id}-descricao`}
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  placeholder="Descreva detalhes importantes..."
                  required
                  onBlur={() => setTocados((atuais) => ({ ...atuais, descricao: true }))}
                  aria-invalid={Boolean(tocados.descricao && erros.descricao)}
                  className="block h-[140px] max-h-[140px] disabled-input resize-none w-full overflow-y-auto rounded-md border border-input p-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-inset aria-invalid:ring-destructive/20"
                />
                {tocados.descricao && erros.descricao && <FormError message={erros.descricao[0]} />}
              </div>
            </fieldset>
            {exibirGaleria && (
              <VisualizadorImagens
                className="min-h-0 [&>div:first-of-type]:max-h-[40dvh]"
                arquivos={galeria.previas}
                indiceAtual={galeria.indiceAtual}
                onIndiceChange={galeria.setIndice}
                onRemover={somenteLeitura ? undefined : removerDaGaleria}
              />
            )}
          </div>
          {galeria.erro && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {galeria.erro}
            </p>
          )}
          <AcoesModalServico
            exibirGaleria={exibirGaleria}
            somenteLeitura={somenteLeitura}
            galeria={galeria}
            valido={valido}
            editar={Boolean(servicoInicial)}
            onAdicionar={confirmarAdicionar}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function OpcoesServico({
  opcoes,
  servicoInicial,
}: Pick<AdicionarServicoManutencaoModalProps, "opcoes" | "servicoInicial">) {
  return (
    <>
      {servicoInicial?.servico &&
        servicoInicial.servico !== "outros" &&
        !opcoes.some((opcao) => opcao.value === servicoInicial.servico) && (
          <SelectItem value={servicoInicial.servico}>
            {servicoInicial.nome_servico ?? servicoInicial.servico}
          </SelectItem>
        )}
      {opcoes.map((opcao) => (
        <SelectItem key={opcao.value} value={opcao.value}>
          {opcao.label}
        </SelectItem>
      ))}
      <SelectItem value="outros">Outros</SelectItem>
    </>
  );
}

type ListaArquivosServicoProps = {
  arquivos: File[];
  arquivosExistentes: NonNullable<ServicoManutencao["arquivosExistentes"]>;
  exibirGaleria: boolean;
  somenteLeitura: boolean;
  removerArquivo: (indice: number) => void;
  removerArquivoExistente: (uuid: string) => void;
};

function ListaArquivosServico({
  arquivos,
  arquivosExistentes,
  exibirGaleria,
  somenteLeitura,
  removerArquivo,
  removerArquivoExistente,
}: Readonly<ListaArquivosServicoProps>) {
  return (
    <>
      {arquivosExistentes.length + arquivos.length > 0 && (
        <div
          className={
            exibirGaleria
              ? "min-h-0 max-h-[232px] space-y-2 overflow-y-auto !shrink"
              : "max-h-[232px] space-y-2 overflow-y-auto"
          }
        >
          {arquivosExistentes.length > 0 && (
            <ul aria-label="Arquivos existentes" className="space-y-2">
              {arquivosExistentes.map((arquivo, indice) => {
                const nome = arquivo.nome_original?.trim() || `Anexo ${indice + 1}`;
                return (
                  <li
                    key={arquivo.uuid}
                    className="flex h-10 items-center gap-3 rounded-md bg-muted/60 px-3 py-2 text-sm"
                  >
                    <span className="rounded bg-primary/10 p-1 text-primary">
                      <Paperclip className="size-4" aria-hidden="true" />
                    </span>
                    <span title={nome} className="min-w-0 flex-1 truncate font-semibold">
                      {nome}
                    </span>
                    <button
                      hidden={somenteLeitura}
                      type="button"
                      aria-label={`Remover arquivo ${nome}`}
                      className="shrink-0 rounded p-1 text-destructive"
                      onClick={() => removerArquivoExistente(arquivo.uuid)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {arquivos.length > 0 && (
            <ul aria-label="Arquivos selecionados" className="space-y-2">
              {arquivos.map((arquivo, indice) => (
                <li
                  key={`${arquivo.name}-${arquivo.size}-${arquivo.lastModified}-${indice}`}
                  className="flex h-10 items-center gap-3 rounded-md bg-muted/60 px-3 py-2 text-sm"
                >
                  <span className="rounded bg-primary/10 p-1 text-primary">
                    <Paperclip className="size-4" aria-hidden="true" />
                  </span>
                  <span title={arquivo.name} className="min-w-0 flex-1 truncate font-semibold">
                    {arquivo.name}
                  </span>
                  <button
                    hidden={somenteLeitura}
                    type="button"
                    aria-label={`Remover arquivo ${arquivo.name}`}
                    className="shrink-0 rounded p-1 text-destructive focus-visible:outline-2 cursor-pointer"
                    onClick={() => removerArquivo(indice)}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}

type AcoesModalServicoProps = {
  exibirGaleria: boolean;
  somenteLeitura: boolean;
  galeria: ReturnType<typeof useGaleriaArquivosServico>;
  valido: boolean;
  editar: boolean;
  onAdicionar: () => void;
};

function AcoesModalServico({
  exibirGaleria,
  somenteLeitura,
  galeria,
  valido,
  editar,
  onAdicionar,
}: Readonly<AcoesModalServicoProps>) {
  return (
    <div className="mt-8 flex shrink-0 flex-wrap justify-end gap-2">
      {exibirGaleria && (
        <Button
          type="button"
          variant="outline"
          disabled={!galeria.podeBaixar || galeria.baixando}
          className="disabled:pointer-events-auto disabled:cursor-not-allowed"
          onClick={() => void galeria.baixar()}
        >
          <Download className="size-4" />
          {galeria.baixando ? "Baixando..." : "Baixar imagem"}
        </Button>
      )}
      <Dialog.Close asChild>
        <Button type="button" variant={somenteLeitura ? "default" : "outline"}>
          {somenteLeitura ? "Fechar" : "Cancelar"}
        </Button>
      </Dialog.Close>
      {!somenteLeitura && (
        <span className={valido ? "inline-flex" : "inline-flex cursor-not-allowed"}>
          <Button
            type="button"
            disabled={!valido}
            variant={valido ? "default" : "blocked"}
            onClick={onAdicionar}
          >
            {editar ? "Salvar alterações" : "Adicionar serviço"}
          </Button>
        </span>
      )}
    </div>
  );
}
