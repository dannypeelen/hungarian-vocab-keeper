export type Tag = 'verb' | 'noun' | 'adjective' | 'phrase' | 'idiom' | 'adverb' | 'conjunction' | 'vonzat';

export interface VocabCard {
  id: string;
  hungarian: string;
  english: string;
  example?: string;
  exampleTranslation?: string;
  tags: Tag[];
  notes?: string;
  createdAt: string;
  // Review tracking
  reviewCount: number;
  correctCount: number;
  lastReviewed?: string;
  streak: number;
  mastery: number; // 0-100
}

export interface ReviewSession {
  date: string;
  total: number;
  correct: number;
  cards: string[]; // card IDs
}

export interface AppStats {
  totalCards: number;
  totalReviews: number;
  totalCorrect: number;
  sessionsCompleted: number;
  currentStreak: number; // days in a row
  lastSessionDate?: string;
  masteredCards: number; // mastery >= 80
  reviewHistory: ReviewSession[];
}

export const TAG_COLORS: Record<Tag, string> = {
  verb: '#D97706',
  noun: '#2563EB',
  adjective: '#7C3AED',
  phrase: '#059669',
  idiom: '#DC2626',
  adverb: '#0891B2',
  conjunction: '#6B7280',
  vonzat: '#BE185D',
};

export const ALL_TAGS: Tag[] = ['verb', 'noun', 'adjective', 'phrase', 'idiom', 'adverb', 'conjunction', 'vonzat'];
