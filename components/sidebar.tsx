"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FileText, Gauge, GraduationCap, ListChecks } from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/pdf-library", label: "PDF Library", icon: FileText },
  { href: "/exercises/course", label: "Exercises by Course", icon: BookOpen },
  { href: "/exercises/level", label: "Exercises by Level", icon: ListChecks },
  { href: "/summaries", label: "Summary Sheets", icon: GraduationCap }
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-slate-200 bg-white p-3 md:h-screen md:w-64 md:border-b-0 md:border-r md:p-6">
      <h1 className="mb-4 text-xl font-bold text-brand-700">LearningFaster</h1>
      <nav className="grid gap-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
              pathname === href ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
