export interface AnkiNote {
  id: string;
  guid: string;
  modelId: string;
  tags: string[];
  fields: string[];
  fieldNames: string[];
}

export interface AnkiCard {
  id: string;
  noteId: string;
  deckId: string;
  deckName: string;
  templateOrd: number;
  modelName: string;
  ankiReps: number;
  ankiLapses: number;
  ankiType: AnkiCardType;
  ankiQueue: AnkiCardQueue;
  note: AnkiNote;
}

export enum AnkiCardType {
  New = 0,
  Learning = 1,
  Due = 2,
  Cram = 3,
}

export enum AnkiCardQueue {
  Suspended = -1,
  Buried = -2,
  NewBuried = -3,
  New = 0,
  DueLearning = 1,
  DueReview = 2,
  DueDay = 3,
}

export interface AnkiDeck {
  id: string;
  name: string;
  cardCount: number;
}

export type AnkiCardStatus = 'studied' | 'unknown' | 'new';

export interface StoredAnkiCard {
  id: string;
  noteId: string;
  deckId: string;
  deckName: string;
  templateOrd: number;
  modelName: string;
  tags: string[];
  fields: string[];
  fieldNames: string[];
  ankiReps: number;
  ankiLapses: number;
  ankiType: number;
  ankiQueue: number;
  status: AnkiCardStatus;
  importedAt: number;
}

export interface ReviewEvent {
  id: string;
  cardId: string;
  timestamp: number;
  result: 'remembered' | 'forgot' | 'skipped';
}

export interface ImportResult {
  newCards: number;
  updatedCards: number;
  skippedCards: number;
  totalCards: number;
  decks: AnkiDeck[];
  errors: string[];
  warnings: string[];
}

export interface AnkiBackup {
  version: number;
  exportedAt: number;
  cards: StoredAnkiCard[];
  reviews: ReviewEvent[];
  lastImport: number | null;
}

export type StudyMode = 'all' | 'today';
