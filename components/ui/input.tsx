import { clsx } from "clsx";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx("w-full")} {...props} />;
}
