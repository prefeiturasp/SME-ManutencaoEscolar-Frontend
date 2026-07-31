"use client";

import { Copy, Info } from "lucide-react";
import {
  FieldPath,
  FieldValues,
  useFormContext,
  useWatch,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { FormError } from "./FormError";
import { cn } from "@/lib/utils";

interface FormLinkFieldProps<T extends FieldValues> {
  readonly name: FieldPath<T>;
  readonly label: string;
  readonly placeholder?: string;
  readonly tooltip?: string;
  readonly helperText?: string;
  readonly className?: string;
  readonly showButtons?: boolean;
}

export function FormLinkField<T extends FieldValues>({
  name,
  label,
  placeholder = "https://",
  tooltip,
  helperText,
  className,
  showButtons = true,
}: FormLinkFieldProps<T>) {
  const {
    register,
    clearErrors,
    formState: { errors },
  } = useFormContext<T>();

  const field = register(name);

  const value = useWatch({
    name,
  });

  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <div className={className ?? "space-y-1"}>
      <div className="flex items-center gap-1.5 mb-2">
        <Label htmlFor={String(name)}>{label}</Label>

        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>

            <TooltipContent className="w-56 text-center">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="flex gap-2 mb-1">
        <div className="relative flex-1">
          <Input
            id={String(name)}
            placeholder={placeholder}
            className="pr-10"
            aria-invalid={Boolean(errorMessage)}
            {...field}
            onChange={(e) => {
              field.onChange(e);
              clearErrors(name);
            }}
          />

          {showButtons && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2"
              disabled={!value}
              aria-label="Copiar link"
              onClick={() => {
                if (value) {
                  navigator.clipboard.writeText(value);
                }
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
        </div>

        {showButtons && (
          <Button
            type="button"
            variant="outline"
            className={cn(
              "bg-white",
              value?.startsWith("http://") || value?.startsWith("https://")
                ? ""
                : "text-gray border-blocked-foreground",
            )}
            disabled={
              !value?.startsWith("http://") && !value?.startsWith("https://")
            }
            onClick={() => {
              if (value) {
                window.open(value, "_blank", "noopener,noreferrer");
              }
            }}
          >
            Abrir link
          </Button>
        )}
      </div>

      {errorMessage && <FormError message={errorMessage} />}

      {!errorMessage && helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
