import type { DifficultyLevel } from "@/types";

export function generateMockCourseExercises(course: string) {
  return [
    `Solve 2 equations related to ${course}.`,
    `Create a short proof from ${course} definitions.`,
    `Find one real-world application of ${course}.`
  ];
}

export function generateMockLevelExercises(level: DifficultyLevel) {
  return [
    `Level ${level}: simplify and solve 5 expressions.`,
    `Level ${level}: complete a mini quiz of 3 problems.`,
    `Level ${level}: explain your solving strategy in one paragraph.`
  ];
}
