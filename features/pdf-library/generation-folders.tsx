"use client";

import { useMemo, useState } from "react";
import type { GenerationArtifact } from "@/features/generations/service";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { PdfDocument } from "@/types";

type FolderItemType = GenerationArtifact["type"] | "pdf";

type FolderItem = {
  id: string;
  type: FolderItemType;
  chapter: string;
  title: string;
  created_at: string;
  href: string;
};

function typeLabel(type: FolderItemType) {
  if (type === "course") return "Exercice par rapport au cours";
  if (type === "level") return "Exercice par niveau";
  if (type === "summary") return "Fiche révisions";
  return "PDF source";
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

type Props = {
  artifacts: GenerationArtifact[];
  pdfs: PdfDocument[];
};

export function GenerationFolders({ artifacts, pdfs }: Props) {
  const [sortBy, setSortBy] = useState<"date" | "type">("date");
  const [filterType, setFilterType] = useState<"all" | FolderItemType>("all");

  const items = useMemo<FolderItem[]>(() => {
    const generated: FolderItem[] = artifacts.map((item) => ({
      id: item.id,
      type: item.type,
      chapter: item.chapter || "Sans chapitre",
      title: item.title,
      created_at: item.created_at,
      href: item.href
    }));

    const sourcePdfs: FolderItem[] = pdfs.map((pdf) => ({
      id: `pdf-${pdf.id}`,
      type: "pdf",
      chapter: pdf.chapter || "Sans chapitre",
      title: pdf.title,
      created_at: pdf.created_at,
      href: `/pdf-library/${pdf.id}`
    }));

    return [...generated, ...sourcePdfs];
  }, [artifacts, pdfs]);

  const filtered = useMemo(() => {
    const base = filterType === "all" ? items : items.filter((item) => item.type === filterType);
    if (sortBy === "type") {
      return [...base].sort((a, b) => a.type.localeCompare(b.type));
    }
    return [...base].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }, [items, filterType, sortBy]);

  const byChapter = useMemo(() => {
    return filtered.reduce<Record<string, FolderItem[]>>((acc, item) => {
      const key = item.chapter || "Sans chapitre";
      acc[key] = acc[key] ? [...acc[key], item] : [item];
      return acc;
    }, {});
  }, [filtered]);

  const chapters = Object.keys(byChapter).sort();

  return (
    <Card className="space-y-4 bg-white/90">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <p className="text-xs text-slate-500">Filtrer</p>
          <Select value={filterType} onChange={(event) => setFilterType(event.target.value as typeof filterType)}>
            <option value="all">Tous les types</option>
            <option value="pdf">PDF source</option>
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
              <div key={chapter} className="rounded-xl border border-orange-100 bg-gradient-to-r from-orange-50/50 to-white p-3">
                <p className="mb-2 text-sm font-semibold text-orange-700">📁 {chapter}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {chapterItems.map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                          {typeLabel(item.type)}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(item.created_at)}</span>
                      </div>
                      <p className="font-medium text-slate-800">{item.title}</p>
                      <a href={item.href} className="mt-2 inline-flex text-orange-600 underline">
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
