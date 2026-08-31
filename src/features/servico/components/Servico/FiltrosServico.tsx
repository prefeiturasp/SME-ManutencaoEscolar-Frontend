import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { FiltrosServicoProps } from "@/features/servico/types/servicos.types";

export function FiltrosServico({
  nome,
  status,
  onMudarNome,
  onMudarStatus,
  onBuscar,
  onLimpar,
}: Readonly<FiltrosServicoProps>) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="nome"
            className="text-sm font-bold text-[var(--background-gray)]"
          >
            Nome
          </label>

          <Input
            id="nome"
            value={nome}
            placeholder="Digite o nome do serviço..."
            onChange={(event) => {
              onMudarNome(event.target.value);
            }}
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="status"
            className="text-sm font-bold text-[var(--background-gray)]"
          >
            Status
          </label>

          <Select
            value={status}
            onValueChange={(value) => {
              if (value === "ativo" || value === "inativo") {
                onMudarStatus(value);
              }
            }}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>

            <SelectContent position="popper" align="start" sideOffset={4}>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          size="big-lg"
          onClick={onLimpar}
          className={"max-w-[117px]"}
        >
          Limpar filtros
        </Button>

        <Button
          type="button"
          variant="outline"
          size="big-lg"
          onClick={onBuscar}
          className={"max-w-[165px]"}
        >
          <Search />
          Buscar serviços
        </Button>
      </div>
    </section>
  );
}
