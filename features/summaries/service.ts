import { createClient } from "@/lib/supabase/server";
import type { SummarySheet } from "@/types";

export async function getSummaryHistory(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("summary_sheets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data as SummarySheet[]) ?? [];
}

export async function getSummaryById(userId: string, summaryId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("summary_sheets")
    .select("*")
    .eq("id", summaryId)
    .eq("user_id", userId)
    .maybeSingle();

  return (data as SummarySheet | null) ?? null;
}
