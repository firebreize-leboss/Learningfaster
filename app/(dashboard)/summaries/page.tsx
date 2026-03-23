import { createClient } from "@/lib/supabase/server";
import { getPdfDocuments, getUserChapterSuggestions } from "@/features/pdf-library/service";
import { SummaryForm } from "@/features/summaries/summary-form";

export default async function SummariesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [pdfs, chapterSuggestions] = await Promise.all([getPdfDocuments(user.id), getUserChapterSuggestions(user.id)]);

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-brand-100 bg-gradient-to-r from-white via-brand-50 to-white p-5">
        <h2 className="text-2xl font-bold">Summary Sheets</h2>
        <p className="text-slate-600">Génère des fiches synthèse et rattache-les à un cours + chapitre.</p>
      </header>
      <SummaryForm userId={user.id} pdfs={pdfs} chapterSuggestions={chapterSuggestions} />
    </section>
  );
}
