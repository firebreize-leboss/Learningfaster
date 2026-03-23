export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface UserProfile {
  id: string;
  email: string;
  credits: number;
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
  pdf_document_id?: string | null;
  mode: ExerciseMode;
  course_name: string | null;
  chapter?: string | null;
  difficulty_level: DifficultyLevel | null;
  status: ExerciseStatus;
  generated_content?: string[] | null;
  created_at: string;
}

export interface SummarySheet {
  id: string;
  user_id: string;
  pdf_document_id?: string | null;
  chapter?: string | null;
  title: string;
  topic: string;
  content: string;
  created_at: string;
}
