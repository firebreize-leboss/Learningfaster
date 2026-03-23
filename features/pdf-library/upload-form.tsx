"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const PDF_BUCKET = "pdfs";

type UploadPdfFormProps = {
  userId: string;
};

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-");
}

export function UploadPdfForm({ userId }: UploadPdfFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
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
        file_path: storagePath
      });

      if (insertError) {
        setMessage(insertError.message);
        return;
      }

      setTitle("");
      setFile(null);
      setFileInputKey((previous) => previous + 1);
      setMessage("PDF uploadé avec succès.");
      router.refresh();
    } catch {
      setMessage("Upload impossible pour le moment. Vérifie la configuration Supabase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleUpload}>
      <Input
        type="text"
        placeholder="Titre du PDF (optionnel)"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Input
        key={fileInputKey}
        type="file"
        accept="application/pdf"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Upload en cours..." : "Uploader le PDF"}
      </Button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </form>
  );
}
