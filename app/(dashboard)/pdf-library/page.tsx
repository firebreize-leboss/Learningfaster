import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getGenerationArtifacts } from "@/features/generations/service";
import { GenerationFolders } from "@/features/pdf-library/generation-folders";
import { getPdfDocuments, getUserChapterSuggestions } from "@/features/pdf-library/service";
import { UploadPdfForm } from "@/features/pdf-library/upload-form";

export default async function PdfLibraryPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [pdfs, chapterSuggestions, artifacts] = await Promise.all([
    getPdfDocuments(user.id),
    getUserChapterSuggestions(user.id),
    getGenerationArtifacts(user.id, 100)
  ]);

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-orange-100 bg-gradient-to-r from-white via-orange-50 to-white p-5">
        <h2 className="text-2xl font-bold">PDF Library</h2>
        <p className="text-slate-600">Organisation par chapitre puis par type de génération.</p>
      </header>

      <GenerationFolders artifacts={artifacts} pdfs={pdfs} />

      <Card>
        <h3 className="mb-2 font-semibold">Upload un nouveau PDF</h3>
        <UploadPdfForm userId={user.id} chapterSuggestions={chapterSuggestions} />
      </Card>
    </section>
  );
}
