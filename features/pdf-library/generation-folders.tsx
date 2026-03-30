"use client";

import { useMemo, useState } from "react";
import type { GenerationArtifact } from "@/features/generations/service";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

function typeLabel(type: GenerationArtifact["type"]) {
  if (type === "course") return "Exercice par rapport au cours";
  if (type === "level") return "Exercice par niveau";
  return "Fiche révisions";
}

type Props = {
  artifacts: GenerationArtifact[];
};

export function GenerationFolders({ artifacts }: Props) {
  const [sortBy, setSortBy] = useState<"date" | "type">("date");
  const [filterType, setFilterType] = useState<"all" | GenerationArtifact["type"]>("all");

  const filtered = useMemo(() => {
    const base = filterType === "all" ? artifacts : artifacts.filter((item) => item.type === filterType);
    if (sortBy === "type") {
      return [...base].sort((a, b) => a.type.localeCompare(b.type));
    }
    return [...base].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }, [artifacts, filterType, sortBy]);

  const byChapter = useMemo(() => {
    return filtered.reduce<Record<string, GenerationArtifact[]>>((acc, item) => {
      const key = item.chapter || "Sans chapitre";
      acc[key] = acc[key] ? [...acc[key], item] : [item];
      return acc;
    }, {});
  }, [filtered]);

  const chapters = Object.keys(byChapter).sort();

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="text-xs text-slate-500">Filtrer</p>
          <Select value={filterType} onChange={(event) => setFilterType(event.target.value as typeof filterType)}>
            <option value="all">Tous les types</option>
            <option value="course">Exercice par cours</option>
            <option value="level">Exercice par niveau</option>
            <option value="summary">Fiche révision</option>
          </Select>
        </div>
        <div>
          <p className="text-xs text-slate-500">Trier</p>
          <Select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
            <option value="date">Par date</option>
            <option value="type">Par type</option>
          </Select>
        </div>
      </div>

      {chapters.length ? (
        <div className="space-y-4">
          {chapters.map((chapter) => {
            const chapterItems = byChapter[chapter] ?? [];
            return (
              <div key={chapter} className="rounded-xl border border-orange-100 bg-orange-50/40 p-3">
                <p className="mb-2 text-sm font-semibold text-orange-700">📁 {chapter}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {chapterItems.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-slate-500">{typeLabel(item.type)}</p>
                      <a href={item.href} className="text-orange-600 underline">
                        Ouvrir
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Aucune génération classée pour le moment.</p>
      )}
    </Card>
  );
}
