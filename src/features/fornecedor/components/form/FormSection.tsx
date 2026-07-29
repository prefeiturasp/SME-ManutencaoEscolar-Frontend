import { ReactNode } from "react";

interface FormSectionProps {
  readonly title: string;
  readonly description?: string;
  readonly children: ReactNode;
}

export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">{title}</h2>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </header>

      {children}
    </section>
  );
}
