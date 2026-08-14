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
        className={cn("rounded-xl border-[#1689E5] p-8", dialogSizes[size])}
      >
        <AlertDialogCancel asChild>
          <button
            type="button"
            aria-label="Fechar"
            disabled={loading}
            className="absolute right-4 top-4 cursor-pointer bg-transparent p-1"
          >
            <X className="size-6 text-[#06366B]" strokeWidth={2.5} />
          </button>
        </AlertDialogCancel>

        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="text-3xl font-bold text-[#3F444A]">
            {title}
          </AlertDialogTitle>

          {description && (
            <AlertDialogDescription asChild>
              <div className="mt-8 text-xl text-[#4B4F54]">{description}</div>
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
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
