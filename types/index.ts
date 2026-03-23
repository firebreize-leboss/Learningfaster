export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
}

export interface PdfDocument {
  id: string;
  user_id: string;
  title: string;
  file_path: string;
  file_url?: string | null;
  chapter?: string | null;
  created_at: string;
}

export type ExerciseMode = "course" | "level";
export type ExerciseStatus = "generated" | "completed";

export interface ExerciseSession {
  id: string;
  user_id: string;
  mode: ExerciseMode;
  course_name: string | null;
  difficulty_level: DifficultyLevel | null;
  status: ExerciseStatus;
  created_at: string;
}

export interface SummarySheet {
  id: string;
  user_id: string;
  title: string;
  topic: string;
  content: string;
  created_at: string;
}
