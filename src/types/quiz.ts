export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  time_limit: number; // in seconds
  created_at: string;
  question_count?: number;
  attempts_count?: number;
  average_score?: number;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer?: OptionKey; // hidden during quiz taking, revealed after submit
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number; // percentage or points
  correct_answers: number;
  wrong_answers: number;
  time_taken: number; // in seconds
  completed_at: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
  quiz?: {
    title: string;
    category: string;
  };
}

export interface SubmitQuizPayload {
  user_id: string;
  username?: string;
  email?: string;
  time_taken: number;
  answers: Record<string, OptionKey>;
}

export interface QuestionReviewResult {
  question_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  user_answer?: OptionKey | null;
  correct_answer: OptionKey;
  is_correct: boolean;
  explanation: string;
}

export interface QuizResultResponse {
  attempt_id: string;
  quiz_id: string;
  quiz_title: string;
  user_id: string;
  username: string;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  score: number; // percentage 0-100
  time_taken: number;
  completed_at: string;
  rank_in_quiz: number;
  total_attempts: number;
  breakdown: QuestionReviewResult[];
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  quiz_id?: string;
  quiz_title?: string;
  score: number;
  correct_answers: number;
  wrong_answers: number;
  time_taken: number;
  completed_at: string;
}

export interface UserStats {
  user: User;
  total_attempts: number;
  quizzes_completed: number;
  average_score: number;
  best_score: number;
  total_time_spent: number;
  recent_attempts: QuizAttempt[];
}
