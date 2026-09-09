import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "ink" | "koi" | "foam" | "deep";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  ink: "bg-ink text-foam ring-2 ring-ink shadow-[0_5px_0_#04203f] hover:bg-ink-soft hover:shadow-[0_7px_0_#04203f] active:shadow-[0_2px_0_#04203f]",
  koi: "bg-koi text-paper ring-2 ring-ink shadow-[0_5px_0_var(--color-ink)] hover:bg-koi-soft hover:shadow-[0_7px_0_var(--color-ink)] active:shadow-[0_2px_0_var(--color-ink)]",
  foam: "bg-paper text-ink ring-2 ring-ink shadow-[0_5px_0_var(--color-ink)] hover:bg-foam hover:shadow-[0_7px_0_var(--color-ink)] active:shadow-[0_2px_0_var(--color-ink)]",
  deep: "bg-deep text-paper ring-2 ring-ink shadow-[0_5px_0_var(--color-ink)] hover:bg-blue hover:shadow-[0_7px_0_var(--color-ink)] active:shadow-[0_2px_0_var(--color-ink)]",
};

const sizes: Record<Size, string> = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3.5 text-base",
};

export function Button({
  children,
  variant = "koi",
  size = "md",
  fullWidth = false,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`display rounded-2xl transition-all duration-150 hover:-translate-y-[2px] active:translate-y-[2px] disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-[0_5px_0_var(--color-ink)] ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
