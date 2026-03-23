import { createClient } from "@/lib/supabase/server";
import { LevelExerciseForm } from "@/features/exercises/level-form";

export default async function ExercisesByLevelPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Exercises by Level</h2>
        <p className="text-slate-600">Generate math exercises based on difficulty from level 1 to 5.</p>
      </header>
      <LevelExerciseForm userId={user.id} />
    </section>
  );
}
