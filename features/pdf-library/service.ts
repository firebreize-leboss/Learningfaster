import { createClient } from "@/lib/supabase/server";
import type { PdfDocument } from "@/types";

const PDF_BUCKET = "pdfs";

export async function getPdfDocuments(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pdf_documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const documents = (data as PdfDocument[]) ?? [];
  const withUrls = await Promise.all(
    documents.map(async (document) => {
      const { data: signed } = await supabase.storage.from(PDF_BUCKET).createSignedUrl(document.file_path, 3600);
      return {
        ...document,
        file_url: signed?.signedUrl ?? null
      };
    })
  );

  return withUrls;
}
