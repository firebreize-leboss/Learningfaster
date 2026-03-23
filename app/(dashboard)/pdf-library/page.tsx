import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getPdfDocuments, getUserChapterSuggestions } from "@/features/pdf-library/service";
import { UploadPdfForm } from "@/features/pdf-library/upload-form";
import { PdfItemActions } from "@/features/pdf-library/pdf-item-actions";

export default async function PdfLibraryPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [pdfs, chapterSuggestions] = await Promise.all([getPdfDocuments(user.id), getUserChapterSuggestions(user.id)]);

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-brand-100 bg-gradient-to-r from-white via-brand-50 to-white p-5">
        <h2 className="text-2xl font-bold">PDF Library</h2>
        <p className="text-slate-600">Ajoute tes cours et ouvre-les directement dans le lecteur intégré.</p>
      </header>
      <Card>
        <h3 className="mb-2 font-semibold">Upload un nouveau PDF</h3>
        <UploadPdfForm userId={user.id} chapterSuggestions={chapterSuggestions} />
      </Card>
      <div className="grid gap-3">
        {pdfs.length ? (
          pdfs.map((doc) => (
            <Card key={doc.id} className="border-slate-200/80">
              <p className="font-semibold">{doc.title}</p>
              {doc.chapter ? <p className="text-xs font-medium text-brand-700">Chapitre: {doc.chapter}</p> : null}
              <p className="text-sm text-slate-600">Uploaded: {new Date(doc.created_at).toLocaleString()}</p>
              <PdfItemActions pdfId={doc.id} filePath={doc.file_path} />
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-sm text-slate-600">No PDFs in your library yet.</p>
          </Card>
        )}
      </div>
    </section>
  );
}
