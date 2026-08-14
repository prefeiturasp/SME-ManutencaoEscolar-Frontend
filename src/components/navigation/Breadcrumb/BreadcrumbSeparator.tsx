import { ChevronRight } from "lucide-react";

export function BreadcrumbSeparator() {
  return (
    <span
      aria-hidden="true"
      className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-white"
    >
      <ChevronRight className="size-3" strokeWidth={4} />
    </span>
  );
}
