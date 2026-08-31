import { ReactNode } from "react";

interface FormSectionProps {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function FormSection({
  title,
  description,
  action,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <section className={`space-y-4 ${className}`}>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray">{title}</h2>

          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {action}
      </header>

      {children}
    </section>
  );
}
