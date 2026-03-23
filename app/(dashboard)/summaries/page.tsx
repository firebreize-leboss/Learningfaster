import Link from "next/link";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getPdfDocuments, getUserChapterSuggestions } from "@/features/pdf-library/service";
import { getSummaryHistory } from "@/features/summaries/service";
import { SummaryForm } from "@/features/summaries/summary-form";

export default async function SummariesPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [pdfs, chapterSuggestions, history] = await Promise.all([
    getPdfDocuments(user.id),
    getUserChapterSuggestions(user.id),
    getSummaryHistory(user.id)
  ]);

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-brand-100 bg-gradient-to-r from-white via-brand-50 to-white p-5">
        <h2 className="text-2xl font-bold">Summary Sheets</h2>
        <p className="text-slate-600">Génère des fiches synthèse et rattache-les à un cours + chapitre.</p>
      </header>
      <SummaryForm userId={user.id} pdfs={pdfs} chapterSuggestions={chapterSuggestions} />

      <Card className="space-y-3">
        <h4 className="text-base font-semibold">Fiches déjà générées</h4>
        {history.length ? (
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-brand-700">{item.chapter ?? "Sans chapitre"}</p>
                </div>
                <Link href={{ pathname: "/summaries/[summaryId]", query: { summaryId: item.id } }} className="text-brand-700 underline">
                  Ouvrir
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Aucune fiche générée pour le moment.</p>
        )}
      </Card>
    </section>
  );
}
