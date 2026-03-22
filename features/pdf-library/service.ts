import { createClient } from "@/lib/supabase/server";
import type { PdfDocument } from "@/types";

export async function getPdfDocuments(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pdf_documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data as PdfDocument[]) ?? [];
}
