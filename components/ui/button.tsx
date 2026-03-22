import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
        {
          "bg-brand-500 text-white hover:bg-brand-700": variant === "primary",
          "bg-slate-200 text-slate-900 hover:bg-slate-300": variant === "secondary",
          "text-slate-700 hover:bg-slate-100": variant === "ghost"
        },
        className
      )}
      {...props}
    />
  );
}
