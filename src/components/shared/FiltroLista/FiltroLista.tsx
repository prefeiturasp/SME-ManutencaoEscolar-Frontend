"use client";

import { Info, Search } from "lucide-react";
import { useEffect } from "react";

import { FiltroComboBoxField } from "@/components/filtro/FiltroComboBoxField";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { FiltrosListaProps } from "./types/FiltroLista.type";

const GRID_COLS_CLASS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
};

const MAX_GRID_COLS = 4;

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
  useEffect(() => {
    fields.forEach((row) => {
      row.forEach((field) => {
        if (field.disabled?.(values) && values[field.name]) {
          onChange(field.name, "");
        }
      });
    });
  }, [fields, values, onChange]);

  return (
    <>
      <CardHeader className="p-0">
        <CardTitle className="text-[20px] font-bold text-gray">
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        <div className="space-y-4">
          {fields.map((row) => {
            const cols = Math.min(row.length, MAX_GRID_COLS) || 1;

            return (
              <div
                key={row.map((field) => field.name).join("-")}
                className={`grid gap-4 ${GRID_COLS_CLASS[cols]}`}
              >
                {row.map((field) => {
                  const isDisabled = field.disabled?.(values) ?? false;

                  return (
                    <div key={field.name} className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Label htmlFor={field.name}>{field.label}</Label>

                        {field.tooltip && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-primary" />
                            </TooltipTrigger>

                            <TooltipContent className="w-56 text-center">
                              {field.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      {field.type === "select" ? (
                        <FiltroComboBoxField
                          id={field.name}
                          aria-label={field.label}
                          value={values[field.name] ?? ""}
                          disabled={isDisabled}
                          options={field.options ?? []}
                          placeholder={field.placeholder ?? "Selecione"}
                          onChange={(value) => onChange(field.name, value)}
                        />
                      ) : (
                        <Input
                          id={field.name}
                          placeholder={field.placeholder}
                          disabled={isDisabled}
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
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            className="bg-white"
          >
            Limpar filtros
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onSearch}
            className="bg-white"
          >
            <Search />
            {searchLabel}
          </Button>
        </div>
      </CardContent>
    </>
  );
}
