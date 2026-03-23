import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getPdfDocumentById } from "@/features/pdf-library/service";
import { getSummaryById } from "@/features/summaries/service";
import { createClient } from "@/lib/supabase/server";

type SummaryDetailPageProps = {
  params: { summaryId: string };
};

export default async function SummaryDetailPage({ params }: SummaryDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const summary = await getSummaryById(user.id, params.summaryId);

  if (!summary) {
    notFound();
  }

  const linkedPdf = summary.pdf_document_id ? await getPdfDocumentById(user.id, summary.pdf_document_id) : null;

  return (
    <section className="space-y-4">
      <header className="space-y-2 rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-5">
        <Link href="/summaries" className="text-sm text-brand-700 underline">
          ← Retour à Summary Sheets
        </Link>
        <h2 className="text-2xl font-bold">{summary.title}</h2>
        <p className="text-sm text-slate-600">Chapitre: {summary.chapter ?? "Sans chapitre"}</p>
      </header>

      <Card className="space-y-3">
        <h3 className="font-semibold">Résumé sauvegardé</h3>
        <pre className="whitespace-pre-wrap text-sm text-slate-700">{summary.content}</pre>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-semibold">PDF lié</h3>
        {linkedPdf?.file_url ? (
          <div className="mx-auto h-[60vh] max-w-4xl overflow-hidden rounded-lg border border-slate-200">
            <iframe src={linkedPdf.file_url} title={linkedPdf.title} className="h-full w-full" />
          </div>
        ) : (
          <p className="text-sm text-slate-500">Aucun PDF associé à cette fiche.</p>
        )}
      </Card>
    </section>
  );
}
