"use client";

import { Info, Paperclip, Trash2, Upload, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { useId, useState } from "react";
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
import {
  servicoManutencaoSchema,
  type ServicoManutencao,
} from "../../schemas/adicionarServicoSchema";

export type { ServicoManutencao } from "../../schemas/adicionarServicoSchema";

type AdicionarServicoModalProps = Readonly<{
  aberto: boolean;
  onOpenChange: (aberto: boolean) => void;
  opcoes: readonly { value: string; label: string }[];
  onAdicionar: (servico: ServicoManutencao) => void;
  servicoInicial?: ServicoManutencao;
}>;

export function AdicionarServicoModal({
  aberto,
  onOpenChange,
  opcoes,
  onAdicionar,
  servicoInicial,
}: AdicionarServicoModalProps) {
  const id = useId();
  const [servico, setServico] = useState(servicoInicial?.servico ?? "");
  const [servicoEspecifico, setServicoEspecifico] = useState(
    servicoInicial?.servico_especifico ?? "",
  );
  const [local, setLocal] = useState(servicoInicial?.local ?? "");
  const [descricao, setDescricao] = useState(servicoInicial?.descricao ?? "");
  const [arquivos, setArquivos] = useState<File[]>(servicoInicial?.arquivos ?? []);
  const [erroArquivo, setErroArquivo] = useState("");
  const [tocados, setTocados] = useState<Record<string, boolean>>({});
  const validacao = servicoManutencaoSchema.safeParse({
    id: servicoInicial?.id ?? "novo",
    servico,
    servico_especifico: servico === "outros" ? servicoEspecifico : undefined,
    local,
    descricao,
    arquivos,
  });
  const erros = validacao.success ? {} : z.flattenError(validacao.error).fieldErrors;
  const valido = validacao.success && !erroArquivo;

  function adicionar() {
    if (!valido || !validacao.success) return;
    onAdicionar({
      id: servicoInicial?.id ?? crypto.randomUUID(),
      servico: validacao.data.servico,
      servico_especifico: validacao.data.servico_especifico,
      local: validacao.data.local,
      descricao: validacao.data.descricao,
      arquivos: validacao.data.arquivos,
    });
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={aberto} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 text-gray shadow-lg">
          <Dialog.Title className="pr-8 text-lg font-semibold">Serviço de manutenção</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm">
            Preencha as informações do serviço que precisa ser executado.
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="Fechar"
              className="absolute right-5 top-5 rounded p-1 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <X className="size-5" />
            </button>
          </Dialog.Close>

          <div className="mt-6 space-y-4">
            <div className="space-y-1">
              <Label htmlFor={`${id}-servico`}>Qual o serviço?</Label>
              <Select
                value={servico}
                onValueChange={setServico}
                onOpenChange={(open) => {
                  if (!open) setTocados((atuais) => ({ ...atuais, servico: true }));
                }}
                required
              >
                <SelectTrigger
                  id={`${id}-servico`}
                  className="w-full"
                  aria-invalid={Boolean(tocados.servico && erros.servico)}
                >
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent position="popper" className="z-[60]">
                  {opcoes.map((opcao) => (
                    <SelectItem key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
              {tocados.servico && erros.servico && <FormError message={erros.servico[0]} />}
            </div>
            {servico === "outros" && (
              <div className="space-y-1 border-l-2 border-gray-light pl-3">
                <Label htmlFor={`${id}-servico-especifico`}>Nome do serviço específico</Label>
                <Input
                  id={`${id}-servico-especifico`}
                  placeholder="Descreva o serviço..."
                  value={servicoEspecifico}
                  onChange={(event) => setServicoEspecifico(event.target.value)}
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
                id={`${id}-local`}
                value={local}
                onChange={(event) => setLocal(event.target.value)}
                placeholder="Exemplo: Sala 12, banheiro masculino, quadra..."
                required
                onBlur={() => setTocados((atuais) => ({ ...atuais, local: true }))}
                aria-invalid={Boolean(tocados.local && erros.local)}
              />
              {tocados.local && erros.local && <FormError message={erros.local[0]} />}
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${id}-arquivos`}>Fotos do local do reparo</Label>
              <div className="relative flex h-10 items-center overflow-hidden rounded-md border border-input">
                <span className="min-w-0 flex-1 truncate px-3 text-sm text-muted-foreground">
                  {arquivos.length ? "Selecione novos arquivos" : "Nenhum arquivo selecionado"}
                </span>
                <span className="flex h-full shrink-0 items-center gap-2 bg-primary px-4 text-sm font-semibold text-white">
                  <Upload className="size-4" />
                  Escolher arquivo
                </span>
                <input
                  id={`${id}-arquivos`}
                  type="file"
                  multiple
                  required={arquivos.length === 0}
                  onBlur={() => setTocados((atuais) => ({ ...atuais, arquivos: true }))}
                  aria-invalid={Boolean(erroArquivo || (tocados.arquivos && erros.arquivos))}
                  accept=".png,.jpg,.jpeg,.pdf"
                  aria-describedby={`${id}-formatos`}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={(event) => {
                    const selecionados = Array.from(event.target.files ?? []);
                    event.target.value = "";
                    if (!selecionados.length) return;
                    if (selecionados.some((arquivo) => !/\.(png|jpe?g|pdf)$/i.test(arquivo.name))) {
                      setErroArquivo("Selecione arquivos PNG, JPG, JPEG ou PDF.");
                      return;
                    }
                    setErroArquivo("");
                    setArquivos((atuais) => [
                      ...atuais,
                      ...selecionados.filter(
                        (novo) =>
                          !atuais.some(
                            (atual) =>
                              atual.name === novo.name &&
                              atual.size === novo.size &&
                              atual.lastModified === novo.lastModified,
                          ),
                      ),
                    ]);
                  }}
                />
              </div>
              <p id={`${id}-formatos`} className="text-xs">
                PNG, JPG, JPEG ou PDF
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
            {arquivos.length > 0 && (
              <ul aria-label="Arquivos selecionados" className="space-y-2">
                {arquivos.map((arquivo, indice) => (
                  <li
                    key={`${arquivo.name}-${arquivo.size}-${arquivo.lastModified}-${indice}`}
                    className="flex items-center gap-3 rounded-md bg-muted/60 px-3 py-2 text-sm"
                  >
                    <span className="rounded bg-primary/10 p-1 text-primary">
                      <Paperclip className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 break-all font-semibold">{arquivo.name}</span>
                    <button
                      type="button"
                      aria-label={`Remover arquivo ${arquivo.name}`}
                      className="shrink-0 rounded p-1 text-destructive focus-visible:outline-2"
                      onClick={() => {
                        setArquivos((atuais) => atuais.filter((_, posicao) => posicao !== indice));
                        setTocados((atuais) => ({ ...atuais, arquivos: true }));
                      }}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
                id={`${id}-descricao`}
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Descreva detalhes importantes..."
                required
                onBlur={() => setTocados((atuais) => ({ ...atuais, descricao: true }))}
                aria-invalid={Boolean(tocados.descricao && erros.descricao)}
                className="resize-none min-h-48 w-full rounded-md border border-input p-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
              />
              {tocados.descricao && erros.descricao && <FormError message={erros.descricao[0]} />}
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Dialog.Close>
            <Button
              type="button"
              disabled={!valido}
              variant={valido ? "default" : "blocked"}
              onClick={adicionar}
            >
              {servicoInicial ? "Salvar alterações" : "Adicionar serviço"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
