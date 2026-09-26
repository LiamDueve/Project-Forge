import { ReactNode } from "react";

export function CollapsibleSection({
  title,
  description,
  defaultOpen,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="collapsible card" open={defaultOpen} style={{ padding: 0 }}>
      <summary className="focus-ring flex items-center justify-between gap-4 rounded-card px-4 py-4 sm:px-6 sm:py-5">
        <div>
          <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-graphite">{description}</p>}
        </div>
        <svg className="chevron h-4 w-4 shrink-0 text-graphite" viewBox="0 0 20 20" fill="none">
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="space-y-4 px-4 pb-4 sm:px-6 sm:pb-6">{children}</div>
    </details>
  );
}
