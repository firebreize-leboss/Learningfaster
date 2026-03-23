"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { PdfDocument } from "@/types";

const PDF_BUCKET = "pdfs";

type CourseExerciseFormProps = {
  userId: string;
  pdfs: PdfDocument[];
  chapterSuggestions: string[];
};

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
}

export function CourseExerciseForm({ userId, pdfs, chapterSuggestions }: CourseExerciseFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [chapter, setChapter] = useState("");
  const [source, setSource] = useState<"existing" | "upload">(pdfs.length ? "existing" : "upload");
  const [selectedPdfId, setSelectedPdfId] = useState(pdfs[0]?.id ?? "");
  const [newTitle, setNewTitle] = useState("");
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const chapterListId = useMemo(() => `course-chapter-${Math.random().toString(36).slice(2)}`, []);

  const onGenerate = async () => {
    setMessage(null);
    setLoading(true);

    try {
      let pdfId = selectedPdfId;

      if (source === "upload") {
        if (!newPdfFile) {
          setMessage("Ajoute un PDF pour continuer.");
          return;
        }

        if (newPdfFile.type !== "application/pdf") {
          setMessage("Le fichier doit être un PDF.");
          return;
        }

        const safeName = sanitizeFilename(newPdfFile.name);
        const storagePath = `${userId}/${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage.from(PDF_BUCKET).upload(storagePath, newPdfFile, {
          upsert: false,
          contentType: "application/pdf"
        });

        if (uploadError) {
          setMessage(uploadError.message);
          return;
        }

        const { data: inserted, error: insertError } = await supabase
          .from("pdf_documents")
          .insert({
            user_id: userId,
            title: newTitle.trim() || newPdfFile.name.replace(/\.pdf$/i, ""),
            chapter: chapter.trim() || null,
            file_path: storagePath
          })
          .select("id")
          .single();

        if (insertError || !inserted?.id) {
          setMessage(insertError?.message || "Impossible de sauvegarder ce PDF.");
          return;
        }

        pdfId = inserted.id;
      }

      if (!pdfId) {
        setMessage("Sélectionne un PDF ou upload un nouveau cours.");
        return;
      }

      router.push(`/exercises/course/workspace/${pdfId}?chapter=${encodeURIComponent(chapter.trim())}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Générer des exercices par cours/chapitre</h3>

        <Select value={source} onChange={(event) => setSource(event.target.value as "existing" | "upload")}> 
          {pdfs.length ? <option value="existing">Utiliser un PDF déjà importé</option> : null}
          <option value="upload">Uploader un nouveau PDF</option>
        </Select>

        {source === "existing" ? (
          <Select value={selectedPdfId} onChange={(event) => setSelectedPdfId(event.target.value)}>
            {pdfs.map((pdf) => (
              <option value={pdf.id} key={pdf.id}>
                {pdf.title}
                {pdf.chapter ? ` — ${pdf.chapter}` : ""}
              </option>
            ))}
          </Select>
        ) : (
          <div className="space-y-2 rounded-lg border border-dashed border-slate-300 p-3">
            <Input value={newTitle} onChange={(event) => setNewTitle(event.target.value)} placeholder="Titre du cours (optionnel)" />
            <Input type="file" accept="application/pdf" onChange={(event) => setNewPdfFile(event.target.files?.[0] ?? null)} />
          </div>
        )}

        <Input
          value={chapter}
          onChange={(event) => setChapter(event.target.value)}
          list={chapterListId}
          placeholder="Chapitre ciblé (ex: Probabilités conditionnelles)"
        />
        <datalist id={chapterListId}>
          {chapterSuggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>

        <Button onClick={onGenerate} disabled={loading}>
          {loading ? "Préparation..." : "Generate"}
        </Button>
        {message ? <p className="text-sm text-red-600">{message}</p> : null}
      </Card>
    </section>
  );
}
