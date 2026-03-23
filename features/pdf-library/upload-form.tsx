"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const PDF_BUCKET = "pdfs";

type UploadPdfFormProps = {
  userId: string;
  chapterSuggestions?: string[];
  titlePlaceholder?: string;
  submitLabel?: string;
};

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
}

export function UploadPdfForm({
  userId,
  chapterSuggestions = [],
  titlePlaceholder = "Titre du PDF (optionnel)",
  submitLabel = "Uploader le PDF"
}: UploadPdfFormProps) {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [chapter, setChapter] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const chapterListId = useMemo(() => `chapter-suggestions-${Math.random().toString(36).slice(2)}`, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!file) {
      setMessage("Choisis un fichier PDF avant de valider.");
      return;
    }

    if (file.type !== "application/pdf") {
      setMessage("Seuls les fichiers PDF sont acceptés.");
      return;
    }

    setLoading(true);

    try {
      const safeName = sanitizeFilename(file.name);
      const storagePath = `${userId}/${Date.now()}-${safeName}`;

      const { error: uploadError } = await supabase.storage.from(PDF_BUCKET).upload(storagePath, file, {
        upsert: false,
        contentType: "application/pdf"
      });

      if (uploadError) {
        setMessage(uploadError.message);
        return;
      }

      const { error: insertError } = await supabase.from("pdf_documents").insert({
        user_id: userId,
        title: title.trim() || file.name.replace(/\.pdf$/i, ""),
        chapter: chapter.trim() || null,
        file_path: storagePath
      });

      if (insertError) {
        setMessage(insertError.message);
        return;
      }

      setTitle("");
      setChapter("");
      setFile(null);
      setFileInputKey((prev) => prev + 1);
      setMessage("PDF uploadé avec succès.");
      router.refresh();
    } catch {
      setMessage("Upload impossible pour le moment. Vérifie la configuration Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={titlePlaceholder}
      />
      <Input
        type="text"
        value={chapter}
        onChange={(event) => setChapter(event.target.value)}
        list={chapterListId}
        placeholder="Chapitre (optionnel)"
      />
      <datalist id={chapterListId}>
        {chapterSuggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      <Input
        key={fileInputKey}
        type="file"
        accept="application/pdf"
        required
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Upload en cours..." : submitLabel}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
