import { createClient } from "@/lib/supabase/server";

export type GenerationType = "course" | "level" | "summary";

export interface GenerationArtifact {
  id: string;
  type: GenerationType;
  chapter: string;
  title: string;
  created_at: string;
  pdf_document_id: string | null;
  href: string;
}

export async function getGenerationArtifacts(userId: string, limit = 20): Promise<GenerationArtifact[]> {
  const supabase = await createClient();

  const [{ data: sessions }, { data: summaries }] = await Promise.all([
    supabase
      .from("exercise_sessions")
      .select("id, mode, chapter, course_name, created_at, pdf_document_id")
      .eq("user_id", userId)
      .eq("status", "generated")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("summary_sheets")
      .select("id, chapter, title, created_at, pdf_document_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)
  ]);

  const mappedSessions = (sessions ?? []).map((item) => ({
    id: item.id as string,
    type: (item.mode as "course" | "level") ?? "course",
    chapter: (item.chapter as string | null) ?? (item.mode === "level" ? "Exercices par niveau" : "Sans chapitre"),
    title: (item.course_name as string | null) ?? "Exercices générés",
    created_at: item.created_at as string,
    pdf_document_id: (item.pdf_document_id as string | null) ?? null,
    href:
      item.mode === "course"
        ? `/exercises/course/workspace/${item.id}`
        : `/exercises/level?generationId=${item.id}`
  } satisfies GenerationArtifact));

  const mappedSummaries = (summaries ?? []).map((item) => ({
    id: item.id as string,
    type: "summary" as const,
    chapter: (item.chapter as string | null) ?? "Sans chapitre",
    title: (item.title as string) ?? "Fiche",
    created_at: item.created_at as string,
    pdf_document_id: (item.pdf_document_id as string | null) ?? null,
    href: `/summaries/${item.id}`
  } satisfies GenerationArtifact));

  return [...mappedSessions, ...mappedSummaries]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, limit);
}
