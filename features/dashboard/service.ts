import { createClient } from "@/lib/supabase/server";
import type { ExerciseSession, PdfDocument } from "@/types";

export interface DashboardData {
  totalGenerated: number;
  totalCompleted: number;
  recentPdfs: PdfDocument[];
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();

  const [{ data: sessions }, { data: pdfs }] = await Promise.all([
    supabase.from("exercise_sessions").select("*").eq("user_id", userId).limit(200),
    supabase.from("pdf_documents").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(5)
  ]);

  const typedSessions = ((sessions as ExerciseSession[]) ?? []).filter(Boolean);

  return {
    totalGenerated: typedSessions.filter((item) => item.status === "generated").length,
    totalCompleted: typedSessions.filter((item) => item.status === "completed").length,
    recentPdfs: (pdfs as PdfDocument[]) ?? []
  };
}
