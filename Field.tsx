import { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-graphite">{hint}</span>}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-graphite/60 focus-ring transition-colors ${
        props.className || ""
      }`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-graphite/60 focus-ring transition-colors ${
        props.className || ""
      }`}
    />
  );
}
