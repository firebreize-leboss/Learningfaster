import { CourseExerciseForm } from "@/features/exercises/course-form";

export default function ExercisesByCoursePage() {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Exercises by Course</h2>
        <p className="text-slate-600">Generate math exercises based on a selected chapter or topic.</p>
      </header>
      <CourseExerciseForm />
    </section>
  );
}
