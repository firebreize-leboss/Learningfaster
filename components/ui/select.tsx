import { clsx } from "clsx";

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={clsx("w-full")} {...props} />;
}
