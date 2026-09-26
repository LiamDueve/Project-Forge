import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-ring disabled:opacity-40 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "prism-glow bg-ink text-paper hover:bg-ink/85 active:scale-[0.98]",
  secondary: "bg-white text-ink border border-line hover:border-ink/30 active:scale-[0.98]",
  ghost: "text-ink hover:bg-ink/5 active:scale-[0.98]",
};

const sizes = "px-6 py-3 text-sm";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; children: ReactNode }) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  href: string;
  variant?: Variant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${sizes} ${className}`}>
      {children}
    </Link>
  );
}
