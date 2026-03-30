import { createClient } from "@/lib/supabase/server";
import type { ExerciseSession, PdfDocument } from "@/types";
import { getGenerationArtifacts, type GenerationArtifact } from "@/features/generations/service";

export interface DashboardData {
  totalGenerated: number;
  totalSheets: number;
  credits: number;
  recentPdfs: PdfDocument[];
  recentGenerations: GenerationArtifact[];
  generatedPdfIds: Set<string>;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();

  const [{ data: sessions }, { data: pdfs }, { count: totalSheets }, { data: profile }, recentGenerations] = await Promise.all([
    supabase.from("exercise_sessions").select("*").eq("user_id", userId).limit(200),
    supabase.from("pdf_documents").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(6),
    supabase.from("summary_sheets").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("profiles").select("credits").eq("id", userId).maybeSingle(),
    getGenerationArtifacts(userId, 6)
  ]);

  const typedSessions = ((sessions as ExerciseSession[]) ?? []).filter(Boolean);
  const generatedPdfIds = new Set<string>(recentGenerations.map((item) => item.pdf_document_id).filter(Boolean) as string[]);

  return {
    totalGenerated: typedSessions.filter((item) => item.status === "generated").length,
    totalSheets: totalSheets ?? 0,
    credits: profile?.credits ?? 10,
    recentPdfs: (pdfs as PdfDocument[]) ?? [],
    recentGenerations,
    generatedPdfIds
  };
}
