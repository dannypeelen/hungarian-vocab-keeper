export type Language = 'hungarian' | 'french' | 'italian';
export type Tag = 'verb' | 'noun' | 'adjective' | 'phrase' | 'idiom' | 'adverb' | 'conjunction' | 'vonzat';
export type AnkiRating = 1 | 2 | 3 | 4;

export interface VocabCard {
  id: string;
  language: Language;
  targetWord: string;   // the word to learn (HU/FR/IT)
  nativeWord: string;   // English prompt
  example?: string;
  exampleTranslation?: string;
  tags: Tag[];
  notes?: string;
  createdAt: string;
  reviewCount: number;
  correctCount: number;
  lastReviewed?: string;
  streak: number;
  mastery: number; // 0-100
  interval: number; // SRS: days between reviews
  dueDate?: string; // SRS: ISO date string
}

export interface ReviewSession {
  date: string;
  total: number;
  correct: number;
  cards: string[];
}

export interface AppStats {
  totalCards: number;
  totalReviews: number;
  totalCorrect: number;
  sessionsCompleted: number;
  currentStreak: number;
  lastSessionDate?: string;
  masteredCards: number;
  reviewHistory: ReviewSession[];
}

export const LANGUAGE_META: Record<Language, { flag: string; label: string; color: string }> = {
  hungarian: { flag: '🇭🇺', label: 'Magyar', color: '#C96442' },
  french:    { flag: '🇫🇷', label: 'Français', color: '#2563EB' },
  italian:   { flag: '🇮🇹', label: 'Italiano', color: '#059669' },
};

export const LANGUAGES: Language[] = ['hungarian', 'french', 'italian'];

export const TAG_COLORS: Record<Tag, string> = {
  verb: '#D97706', noun: '#2563EB', adjective: '#7C3AED',
  phrase: '#059669', idiom: '#DC2626', adverb: '#0891B2',
  conjunction: '#6B7280', vonzat: '#BE185D',
};

export const ALL_TAGS: Tag[] = ['verb', 'noun', 'adjective', 'phrase', 'idiom', 'adverb', 'conjunction', 'vonzat'];
