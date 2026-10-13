import { useCallback, useEffect, useState } from 'react';

export interface UserProgress {
  streak: number;
  lastVisit: string;
  masteredHanzi: string[];
  quizHighScore: number;
  quizCompleted: number;
  totalQuizAnswered: number;
  totalCorrect: number;
}

const STORAGE_KEY = 'china_portal_progress';

const defaultProgress: UserProgress = {
  streak: 1,
  lastVisit: new Date().toDateString(),
  masteredHanzi: [],
  quizHighScore: 0,
  quizCompleted: 0,
  totalQuizAnswered: 0,
  totalCorrect: 0,
};

function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as UserProgress;
    return { ...defaultProgress, ...parsed };
  } catch {
    return defaultProgress;
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    setProgress(prev => {
      if (prev.lastVisit === today) return prev;
      const newStreak = prev.lastVisit === yesterday ? prev.streak + 1 : 1;
      return { ...prev, streak: newStreak, lastVisit: today };
    });
  }, []);

  const save = useCallback((updater: (prev: UserProgress) => UserProgress) => {
    setProgress(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleMastered = useCallback((hanziId: string) => {
    save(prev => ({
      ...prev,
      masteredHanzi: prev.masteredHanzi.includes(hanziId)
        ? prev.masteredHanzi.filter(id => id !== hanziId)
        : [...prev.masteredHanzi, hanziId],
    }));
  }, [save]);

  const recordQuiz = useCallback((score: number, total: number, correct: number) => {
    save(prev => ({
      ...prev,
      quizHighScore: Math.max(prev.quizHighScore, score),
      quizCompleted: prev.quizCompleted + 1,
      totalQuizAnswered: prev.totalQuizAnswered + total,
      totalCorrect: prev.totalCorrect + correct,
    }));
  }, [save]);

  return { progress, toggleMastered, recordQuiz };
}
