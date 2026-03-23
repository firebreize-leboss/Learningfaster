import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getCourseExerciseSessionById } from "@/features/exercises/service";
import { getPdfDocumentById } from "@/features/pdf-library/service";
import { createClient } from "@/lib/supabase/server";

type CourseWorkspacePageProps = {
  params: { sessionId: string };
};

export default async function CourseWorkspacePage({ params }: CourseWorkspacePageProps) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const session = await getCourseExerciseSessionById(user.id, params.sessionId);

  if (!session) {
    notFound();
  }

  const pdf = session.pdf_document_id ? await getPdfDocumentById(user.id, session.pdf_document_id) : null;

  return (
    <section className="space-y-5">
      <header className="space-y-2 rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50 to-white p-5">
        <Link href="/exercises/course" className="text-sm text-brand-700 underline">
          ← Retour à Exercises by Course
        </Link>
        <h2 className="text-2xl font-bold">{session.course_name ?? "Cours"}</h2>
        <p className="text-sm text-slate-600">Chapitre ciblé: {session.chapter ?? "Chapitre non précisé"}</p>
      </header>

      <Card className="space-y-3">
        <h3 className="font-semibold">Visualisation du PDF</h3>
        {pdf?.file_url ? (
          <div className="mx-auto h-[70vh] max-w-4xl overflow-hidden rounded-lg border border-slate-200">
            <iframe src={pdf.file_url} title={pdf.title} className="h-full w-full" />
          </div>
        ) : (
          <p className="text-sm text-slate-600">Aucun PDF lié à cette génération.</p>
        )}
      </Card>

      <Card className="space-y-2">
        <h3 className="font-semibold">Exercices générés</h3>
        {session.generated_content?.length ? (
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
            {session.generated_content.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <div className="min-h-40 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Placeholder: future liste d&apos;exercices basée sur le chapitre et le PDF sélectionné.
          </div>
        )}
      </Card>
    </section>
  );
}
