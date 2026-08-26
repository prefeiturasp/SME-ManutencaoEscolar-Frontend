"use client";

import type { ReactNode } from "react";

import { Info } from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CampoSelectFiltroOption = {
  value: string;
  label: string;
};

type CampoSelectFiltroProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  options: CampoSelectFiltroOption[];
  disabled?: boolean;
  tooltip?: string;
  requiredSelectionMessage?: ReactNode;
  onChange: (value: string) => void;
};

export function CampoSelectFiltro({
  id,
  label,
  value,
  placeholder = "Selecione",
  options,
  disabled = false,
  tooltip,
  onChange,
}: Readonly<CampoSelectFiltroProps>) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <Label htmlFor={id}>{label}</Label>

        {tooltip && (
          <div className="group relative flex items-center">
            <Info
              className="h-3.5 w-3.5 cursor-help text-blue-700"
              aria-label={tooltip}
            />

            <div
              role="tooltip"
              className="
                pointer-events-none
                absolute
                bottom-full
                left-1/2
                z-50
                mb-2
                hidden
                w-max
                max-w-[260px]
                -translate-x-1/2
                rounded-md
                bg-neutral-800
                px-3
                py-2
                text-xs
                font-normal
                text-white
                shadow-md
                group-hover:block
                group-focus-within:block
              "
            >
              {tooltip}
            </div>
          </div>
        )}
      </div>

      <Select
        value={value}
        disabled={disabled}
        onValueChange={onChange}
      >
        <SelectTrigger
          id={id}
          className="w-full"
          aria-label={label}
          aria-disabled={disabled}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent position="popper" align="start" sideOffset={0}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}