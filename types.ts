
export enum Difficulty {
  EASY = 'Facile',
  MEDIUM = 'Moyen',
  HARD = 'Difficile'
}

export interface MathTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  progress: number;
  cheatSheet?: {
    formulas: string[];
    definitions: string[];
  };
  realWorldApplications?: {
    title: string;
    description: string;
    icon: string;
  }[];
  isDownloaded?: boolean;
  gameConfig?: GameConfig;
}

export type GameType = 'mental-math' | 'fraction-match' | 'equation-balance' | 'logic-puzzle';

export interface GameConfig {
  type: GameType;
  title: string;
  description: string;
}

export interface OfflineContent {
  topicId: string;
  lesson: {
    content: string;
    example: string;
  };
  exercises: Exercise[];
  quiz?: Exercise[];
  lastUpdated: string;
}

export interface Exercise {
  id: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topicId: string;
}

export interface ExerciseAttempt {
  id: string;
  topicId: string;
  topicTitle: string;
  points: number;
  date: Date;
}

export interface UserStats {
  completedExercises: number;
  streak: number;
  totalPoints: number;
  topicMastery: Record<string, number>;
  history: ExerciseAttempt[];
  avatarUrl?: string;
  lastVisitDate?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface LastActivity {
  topicId: string;
  type: 'lesson' | 'exercise';
  timestamp: number;
}
