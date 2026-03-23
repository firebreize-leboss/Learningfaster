import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getPdfDocumentById } from "@/features/pdf-library/service";

type PdfViewerPageProps = {
  params: {
    pdfId: string;
  };
};

export default async function PdfViewerPage({ params }: PdfViewerPageProps) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const pdf = await getPdfDocumentById(user.id, params.pdfId);

  if (!pdf) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <Link href="/pdf-library" className="text-sm text-brand-700 underline">
          ← Retour à la bibliothèque
        </Link>
        <h2 className="text-2xl font-bold">{pdf.title}</h2>
        <p className="text-sm text-slate-500">Uploadé le {new Date(pdf.created_at).toLocaleString()}</p>
        {pdf.chapter ? <p className="text-xs font-medium text-brand-700">Chapitre: {pdf.chapter}</p> : null}
      </header>

      <Card className="space-y-4">
        <h3 className="font-semibold">Lecteur PDF</h3>
        {pdf.file_url ? (
          <div className="mx-auto h-[75vh] max-w-4xl overflow-hidden rounded-lg border border-slate-200">
            <iframe src={pdf.file_url} title={pdf.title} className="h-full w-full" />
          </div>
        ) : (
          <p className="text-sm text-slate-600">Lien temporaire indisponible pour ce document.</p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-2">
          <h3 className="font-semibold">Fiche 1 page — Formules à savoir</h3>
          <p className="text-sm text-slate-600">
            Zone réservée au futur résumé automatique des formules importantes du PDF.
          </p>
          <div className="min-h-48 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Placeholder: les formules clés générées apparaîtront ici.
          </div>
        </Card>

        <Card className="space-y-2">
          <h3 className="font-semibold">Résumé court et condensé du cours</h3>
          <p className="text-sm text-slate-600">
            Zone réservée au futur résumé concis généré depuis le contenu du PDF.
          </p>
          <div className="min-h-48 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Placeholder: le résumé condensé du cours apparaîtra ici.
          </div>
        </Card>
      </div>
    </section>
  );
}
