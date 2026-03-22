import { LevelExerciseForm } from "@/features/exercises/level-form";

export default function ExercisesByLevelPage() {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Exercises by Level</h2>
        <p className="text-slate-600">Choose a difficulty and generate training questions.</p>
      </header>
      <LevelExerciseForm />
    </section>
  );
}
