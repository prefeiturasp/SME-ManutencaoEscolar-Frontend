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

import type { FiltrosCargosProps } from "@/features/cargo/types/cargos.types";

export function FiltrosCargo({
  nome,
  exige_documento,
  onMudarNome,
  onMudarExigeDocumento,
  onBuscar,
  onLimpar,
}: Readonly<FiltrosCargosProps>) {
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
            placeholder="Digite o nome do cargo..."
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
            Exige documento?
          </label>

          <Select
            value={exige_documento}
            onValueChange={(value) => {
              if (value === "sim" || value === "nao") {
                onMudarExigeDocumento(value);
              }
            }}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>

            <SelectContent position="popper" align="start" sideOffset={4}>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
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
          Buscar cargos
        </Button>
      </div>
    </section>
  );
}
