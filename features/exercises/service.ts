import { createClient } from "@/lib/supabase/server";
import type { ExerciseSession } from "@/types";

export async function getCourseExerciseHistory(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exercise_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("mode", "course")
    .order("created_at", { ascending: false });

  return ((data as ExerciseSession[]) ?? []).map((item) => ({
    ...item,
    generated_content: Array.isArray(item.generated_content) ? item.generated_content : []
  }));
}

export async function getCourseExerciseSessionById(userId: string, sessionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exercise_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("mode", "course")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;

  const item = data as ExerciseSession;

  return {
    ...item,
    generated_content: Array.isArray(item.generated_content) ? item.generated_content : []
  };
}
