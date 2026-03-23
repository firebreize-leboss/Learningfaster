import { createClient } from "@/lib/supabase/server";
import type { PdfDocument } from "@/types";

const PDF_BUCKET = "pdfs";

function isExternalUrl(path: string) {
  return path.startsWith("http://") || path.startsWith("https://");
}

async function getSignedUrl(filePath: string) {
  if (isExternalUrl(filePath)) {
    return filePath;
  }

  const supabase = await createClient();
  const { data } = await supabase.storage.from(PDF_BUCKET).createSignedUrl(filePath, 60 * 30);

  return data?.signedUrl ?? null;
}

export async function getPdfDocuments(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pdf_documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const pdfs = (data as PdfDocument[]) ?? [];

  return Promise.all(
    pdfs.map(async (pdf) => ({
      ...pdf,
      file_url: await getSignedUrl(pdf.file_path)
    }))
  );
}

export async function getPdfDocumentById(userId: string, pdfId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pdf_documents")
    .select("*")
    .eq("id", pdfId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const document = data as PdfDocument;

  return {
    ...document,
    file_url: await getSignedUrl(document.file_path)
  };
}

export async function getUserChapterSuggestions(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pdf_documents")
    .select("chapter")
    .eq("user_id", userId)
    .not("chapter", "is", null)
    .order("created_at", { ascending: false })
    .limit(100);

  const unique = new Set<string>();

  for (const item of data ?? []) {
    const chapter = (item.chapter as string | null)?.trim();
    if (chapter) {
      unique.add(chapter);
    }
  }

  return Array.from(unique);
}
