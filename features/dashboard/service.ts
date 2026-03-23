import { createClient } from "@/lib/supabase/server";
import type { ExerciseSession, PdfDocument } from "@/types";

export interface DashboardData {
  totalGenerated: number;
  totalSheets: number;
  recentPdfs: PdfDocument[];
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();

  const [{ data: sessions }, { data: pdfs }, { count: totalSheets }] = await Promise.all([
    supabase.from("exercise_sessions").select("*").eq("user_id", userId).limit(200),
    supabase.from("pdf_documents").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("summary_sheets").select("id", { count: "exact", head: true }).eq("user_id", userId)
  ]);

  const typedSessions = ((sessions as ExerciseSession[]) ?? []).filter(Boolean);

  return {
    totalGenerated: typedSessions.filter((item) => item.status === "generated").length,
    totalSheets: totalSheets ?? 0,
    recentPdfs: (pdfs as PdfDocument[]) ?? []
  };
}
