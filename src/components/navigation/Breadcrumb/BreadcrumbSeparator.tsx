import { ChevronRight } from "lucide-react";

export function BreadcrumbSeparator() {
  return (
    <span
      aria-hidden="true"
      className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#005CA9] text-white"
    >
      <ChevronRight className="size-3.5" strokeWidth={3} />
    </span>
  );
}
