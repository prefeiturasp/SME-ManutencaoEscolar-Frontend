"use client";

import { ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type DialogSize = "sm" | "md" | "lg" | "xl";

type ConfirmDialogProps = {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;

  confirmLabel: string;
  cancelLabel?: string;

  size?: DialogSize;
  loading?: boolean;

  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

const dialogSizes: Record<DialogSize, string> = {
  sm: "!max-w-md sm:!max-w-md",
  md: "!max-w-2xl sm:!max-w-2xl",
  lg: "!max-w-4xl sm:!max-w-4xl",
  xl: "!max-w-6xl sm:!max-w-6xl",
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  size = "md",
  loading = false,
  onOpenChange,
  onConfirm,
}: Readonly<ConfirmDialogProps>) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!loading) {
          onOpenChange(newOpen);
        }
      }}
    >
      <AlertDialogContent
        onClick={(event) => event.stopPropagation()}
        className={cn(dialogSizes[size])}
      >
        <AlertDialogCancel asChild>
          <button
            type="button"
            aria-label="Fechar"
            disabled={loading}
            className="absolute right-4 top-4 cursor-pointer bg-transparent p-1"
          >
            <X className="size-6 text-gray" strokeWidth={2.5} />
          </button>
        </AlertDialogCancel>

        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="text-xl font-bold text-gray">
            {title}
          </AlertDialogTitle>

          {description && (
            <AlertDialogDescription asChild>
              <div className="text-sm text-gray">{description}</div>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel asChild className="cursor-pointer">
            <Button variant="outline">{cancelLabel}</Button>
          </AlertDialogCancel>

          <AlertDialogAction asChild className="cursor-pointer">
            <Button variant="default" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
