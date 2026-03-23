"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CREDIT_COSTS } from "@/lib/credits";
import { createClient } from "@/lib/supabase/client";
import type { ExerciseSession, PdfDocument } from "@/types";

const PDF_BUCKET = "pdfs";

type CourseExerciseFormProps = {
  userId: string;
  pdfs: PdfDocument[];
  chapterSuggestions: string[];
  history: ExerciseSession[];
};

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
}

export function CourseExerciseForm({ userId, pdfs, chapterSuggestions, history }: CourseExerciseFormProps) {
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
      let courseName = pdfs.find((item) => item.id === selectedPdfId)?.title ?? "Cours";

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

        const { data: insertedPdf, error: insertError } = await supabase
          .from("pdf_documents")
          .insert({
            user_id: userId,
            title: newTitle.trim() || newPdfFile.name.replace(/\.pdf$/i, ""),
            chapter: chapter.trim() || null,
            file_path: storagePath
          })
          .select("id,title")
          .single();

        if (insertError || !insertedPdf?.id) {
          setMessage(insertError?.message || "Impossible de sauvegarder ce PDF.");
          return;
        }

        pdfId = insertedPdf.id;
        courseName = insertedPdf.title;
      }

      if (!pdfId) {
        setMessage("Sélectionne un PDF ou upload un nouveau cours.");
        return;
      }

      const chapterLabel = chapter.trim() || "Chapitre général";
      const generatedExercises = [
        `Résoudre 2 exercices ciblés sur ${chapterLabel}.`,
        `Créer une preuve courte liée à ${chapterLabel}.`,
        `Identifier une application concrète de ${chapterLabel}.`
      ];

      const { error: creditError } = await supabase.rpc("consume_credits", {
        p_user_id: userId,
        p_cost: CREDIT_COSTS.exerciseByCourse
      });

      if (creditError) {
        setMessage("Crédits insuffisants pour générer ce document.");
        return;
      }

      const { data: insertedSession, error: sessionError } = await supabase
        .from("exercise_sessions")
        .insert({
          user_id: userId,
          mode: "course",
          status: "generated",
          course_name: courseName,
          chapter: chapter.trim() || null,
          pdf_document_id: pdfId,
          generated_content: generatedExercises
        })
        .select("id")
        .single();

      if (sessionError || !insertedSession?.id) {
        setMessage(sessionError?.message || "Impossible de sauvegarder la génération.");
        return;
      }

      router.push(`/exercises/course/workspace/${insertedSession.id}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Générer des exercices par cours/chapitre</h3>
        <p className="text-sm text-slate-600">Cette génération coûte {CREDIT_COSTS.exerciseByCourse} crédit.</p>

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

      <Card className="space-y-3">
        <h4 className="text-base font-semibold">Générations précédentes</h4>
        {history.length ? (
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-sm">
                <div>
                  <p className="font-medium">{item.course_name ?? "Cours"}</p>
                  <p className="text-xs text-brand-700">{item.chapter ?? "Sans chapitre"}</p>
                </div>
                <Link href={`/exercises/course/workspace/${item.id}`} className="text-brand-700 underline">
                  Ouvrir
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Aucune génération pour le moment.</p>
        )}
      </Card>
    </section>
  );
}
