import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getPdfDocuments } from "@/features/pdf-library/service";
import { UploadPdfForm } from "@/features/pdf-library/upload-form";

export default async function PdfLibraryPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const pdfs = await getPdfDocuments(user.id);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">PDF Library</h2>
        <p className="text-slate-600">History of imported documents for future parsing and summaries.</p>
      </header>
      <Card>
        <h3 className="mb-2 font-semibold">Upload un nouveau PDF</h3>
        <UploadPdfForm userId={user.id} />
      </Card>
      <div className="grid gap-3">
        {pdfs.length ? (
          pdfs.map((doc) => (
            <Card key={doc.id}>
              <p className="font-semibold">{doc.title}</p>
              <p className="text-sm text-slate-600">Uploaded: {new Date(doc.created_at).toLocaleString()}</p>
              {doc.file_url ? (
                <a href={doc.file_url} className="text-sm text-brand-700 underline" target="_blank" rel="noreferrer">
                  Open file
                </a>
              ) : (
                <p className="text-sm text-slate-500">Lien temporaire indisponible</p>
              )}
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
