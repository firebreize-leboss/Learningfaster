import { createClient } from "@/lib/supabase/server";
import { getPdfDocuments, getUserChapterSuggestions } from "@/features/pdf-library/service";
import { CourseExerciseForm } from "@/features/exercises/course-form";

export default async function ExercisesByCoursePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [pdfs, chapterSuggestions] = await Promise.all([getPdfDocuments(user.id), getUserChapterSuggestions(user.id)]);

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-brand-100 bg-gradient-to-r from-white via-brand-50 to-white p-5">
        <h2 className="text-2xl font-bold">Exercises by Course</h2>
        <p className="text-slate-600">
          Sélectionne un PDF existant ou upload un nouveau cours, ajoute un chapitre puis génère un espace de travail.
        </p>
      </header>
      <CourseExerciseForm userId={user.id} pdfs={pdfs} chapterSuggestions={chapterSuggestions} />
    </section>
  );
}
