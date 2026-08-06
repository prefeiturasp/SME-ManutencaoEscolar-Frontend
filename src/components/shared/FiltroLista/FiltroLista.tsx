"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  FiltroListaField,
  FiltroListaValues,
} from "./types/FiltroLista.type";
import { cn } from "@/lib/utils";

interface FiltrosListaProps {
  readonly title?: string;
  readonly description?: string;
  readonly fields: readonly FiltroListaField[];
  readonly values: FiltroListaValues;
  readonly onChange: (name: string, value: string) => void;
  readonly onSearch: () => void;
  readonly onClear: () => void;
  readonly searchLabel?: string;
}

export function FiltrosLista({
  title = "Refine sua busca",
  description = "Utilize o filtro para localizar os registros.",
  fields,
  values,
  onChange,
  onSearch,
  onClear,
  searchLabel = "Buscar",
}: FiltrosListaProps) {
  const hasFilledFilter = Object.values(values).some(
    (value) => value.trim() !== "",
  );

  return (
    <>
      <CardHeader className="p-0">
        <CardTitle className="text-[20px] font-bold text-gray">
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-1">
              <Label htmlFor={field.name}>{field.label}</Label>

              {field.type === "select" ? (
                <Select
                  value={values[field.name] ?? ""}
                  onValueChange={(value) => onChange(field.name, value)}
                >
                  <SelectTrigger
                    id={field.name}
                    className="w-full"
                    aria-label={field.label}
                  >
                    <SelectValue
                      placeholder={field.placeholder ?? "Selecione"}
                    />
                  </SelectTrigger>

                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  placeholder={field.placeholder}
                  value={
                    field.type === "masked" && field.mask
                      ? field.mask(values[field.name] ?? "")
                      : (values[field.name] ?? "")
                  }
                  onChange={(event) => {
                    const rawValue =
                      field.type === "masked" && field.unmask
                        ? field.unmask(event.target.value)
                        : event.target.value;

                    onChange(field.name, rawValue);
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            disabled={!hasFilledFilter}
            className={cn(
              "bg-white",
              hasFilledFilter ? "" : "text-gray border-blocked-foreground",
            )}
          >
            Limpar filtros
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onSearch}
            disabled={!hasFilledFilter}
            className={cn(
              "bg-white",
              hasFilledFilter ? "" : "text-gray border-blocked-foreground",
            )}
          >
            <Search />
            {searchLabel}
          </Button>
        </div>
      </CardContent>
    </>
  );
}
