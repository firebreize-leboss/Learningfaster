"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { generateMockSummary } from "@/features/summaries/mock";
import type { PdfDocument } from "@/types";

const PDF_BUCKET = "pdfs";

type SummaryFormProps = {
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

export function SummaryForm({ userId, pdfs, chapterSuggestions }: SummaryFormProps) {
  const supabase = createClient();
  const [topic, setTopic] = useState("");
  const [chapter, setChapter] = useState("");
  const [source, setSource] = useState<"existing" | "upload">(pdfs.length ? "existing" : "upload");
  const [selectedPdfId, setSelectedPdfId] = useState(pdfs[0]?.id ?? "");
  const [newTitle, setNewTitle] = useState("");
  const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const chapterListId = useMemo(() => `summary-chapter-${Math.random().toString(36).slice(2)}`, []);

  const onGenerate = async () => {
    const cleanTopic = topic.trim() || chapter.trim() || "General math topic";
    setMessage(null);
    setLoading(true);

    try {
      let attachedPdfId = selectedPdfId;

      if (source === "upload") {
        if (!newPdfFile) {
          setMessage("Ajoute un PDF si tu choisis l'option upload.");
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

        const { data: insertedPdf, error: insertPdfError } = await supabase
          .from("pdf_documents")
          .insert({
            user_id: userId,
            title: newTitle.trim() || newPdfFile.name.replace(/\.pdf$/i, ""),
            chapter: chapter.trim() || null,
            file_path: storagePath
          })
          .select("id")
          .single();

        if (insertPdfError || !insertedPdf?.id) {
          setMessage(insertPdfError?.message || "Impossible de sauvegarder le PDF.");
          return;
        }

        attachedPdfId = insertedPdf.id;
      }

      const generated = generateMockSummary(cleanTopic);
      setSummary(generated);

      const title = chapter.trim() ? `Fiche ${chapter.trim()}` : `Fiche ${cleanTopic}`;
      const content = attachedPdfId ? `${generated}\n\nPDF lié: ${attachedPdfId}` : generated;

      const { error } = await supabase.from("summary_sheets").insert({
        user_id: userId,
        title,
        topic: cleanTopic,
        content
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Fiche générée (mode mock) et sauvegardée.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Generate summary sheet</h3>

        <Select value={source} onChange={(event) => setSource(event.target.value as "existing" | "upload")}> 
          {pdfs.length ? <option value="existing">Utiliser un PDF déjà importé</option> : null}
          <option value="upload">Uploader un nouveau PDF</option>
        </Select>

        {source === "existing" ? (
          <Select value={selectedPdfId} onChange={(event) => setSelectedPdfId(event.target.value)}>
            <option value="">Aucun PDF lié (optionnel)</option>
            {pdfs.map((pdf) => (
              <option key={pdf.id} value={pdf.id}>
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
          placeholder="Chapitre (suggestions automatiques)"
        />
        <datalist id={chapterListId}>
          {chapterSuggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>

        <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Derivatives" />

        <Button onClick={onGenerate} disabled={loading}>
          {loading ? "Generation..." : "Generate summary"}
        </Button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </Card>

      {summary && (
        <Card>
          <h4 className="mb-2 font-semibold">Mock summary</h4>
          <pre className="whitespace-pre-wrap text-sm text-slate-700">{summary}</pre>
        </Card>
      )}
    </section>
  );
}
