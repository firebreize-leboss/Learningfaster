import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getPdfDocuments } from "@/features/pdf-library/service";

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
      <div className="grid gap-3">
        {pdfs.length ? (
          pdfs.map((doc) => (
            <Card key={doc.id}>
              <p className="font-semibold">{doc.title}</p>
              <p className="text-sm text-slate-600">Uploaded: {new Date(doc.created_at).toLocaleString()}</p>
              <a href={doc.file_path} className="text-sm text-brand-700 underline" target="_blank">
                Open file
              </a>
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
