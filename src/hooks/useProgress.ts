import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface WordGroup {
  id: string;
  name: string;
  hanziIds: string[];
}

export interface UserProgress {
  streak: number;
  lastVisit: string;
  masteredHanzi: string[];
  quizHighScore: number;
  quizCompleted: number;
  totalQuizAnswered: number;
  totalCorrect: number;
  wordGroups: WordGroup[];
}

const STORAGE_KEY = 'china_portal_progress';
const DEVICE_KEY = 'china_portal_device_id';

const defaultProgress: UserProgress = {
  streak: 1,
  lastVisit: new Date().toDateString(),
  masteredHanzi: [],
  quizHighScore: 0,
  quizCompleted: 0,
  totalQuizAnswered: 0,
  totalCorrect: 0,
  wordGroups: [],
};

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function loadLocalProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw) as UserProgress;
    return { ...defaultProgress, ...parsed };
  } catch {
    return defaultProgress;
  }
}

function remoteRowToProgress(row: Record<string, unknown>): UserProgress {
  return {
    streak: row.streak as number,
    lastVisit: row.last_visit as string,
    masteredHanzi: row.mastered_hanzi as string[],
    quizHighScore: row.quiz_high_score as number,
    quizCompleted: row.quiz_completed as number,
    totalQuizAnswered: row.total_quiz_answered as number,
    totalCorrect: row.total_correct as number,
    wordGroups: (row.word_groups as WordGroup[]) ?? [],
  };
}

function progressToRemoteRow(progress: UserProgress): Record<string, unknown> {
  return {
    streak: progress.streak,
    last_visit: progress.lastVisit,
    mastered_hanzi: progress.masteredHanzi,
    quiz_high_score: progress.quizHighScore,
    quiz_completed: progress.quizCompleted,
    total_quiz_answered: progress.totalQuizAnswered,
    total_correct: progress.totalCorrect,
    word_groups: progress.wordGroups,
    updated_at: new Date().toISOString(),
  };
}

function saveLocal(progress: UserProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadLocalProgress);
  const deviceId = useRef(getDeviceId());
  const synced = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function syncFromServer() {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('device_id', deviceId.current)
        .maybeSingle();

      if (cancelled || error) {
        return;
      }

      if (data) {
        const remote = remoteRowToProgress(data);
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        let next = remote;
        if (remote.lastVisit !== today) {
          const newStreak = remote.lastVisit === yesterday ? remote.streak + 1 : 1;
          next = { ...remote, streak: newStreak, lastVisit: today };
        }

        setProgress(next);
        saveLocal(next);
        synced.current = true;

        if (next.streak !== remote.streak || next.lastVisit !== remote.lastVisit) {
          supabase
            .from('user_progress')
            .update({ streak: next.streak, last_visit: next.lastVisit, updated_at: new Date().toISOString() })
            .eq('device_id', deviceId.current)
            .then(() => {});
        }
      } else {
        const today = new Date().toDateString();
        const local = loadLocalProgress();
        const next = { ...local, lastVisit: today };

        setProgress(next);
        saveLocal(next);

        supabase
          .from('user_progress')
          .insert({ device_id: deviceId.current, ...progressToRemoteRow(next) })
          .then(() => {});
        synced.current = true;
      }
    }

    syncFromServer();

    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback((updater: (prev: UserProgress) => UserProgress) => {
    setProgress(prev => {
      const next = updater(prev);
      saveLocal(next);

      if (synced.current) {
        supabase
          .from('user_progress')
          .update(progressToRemoteRow(next))
          .eq('device_id', deviceId.current)
          .then(() => {});
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

  const createWordGroup = useCallback((name: string) => {
    const group: WordGroup = { id: crypto.randomUUID(), name, hanziIds: [] };
    save(prev => ({ ...prev, wordGroups: [...prev.wordGroups, group] }));
    return group.id;
  }, [save]);

  const deleteWordGroup = useCallback((groupId: string) => {
    save(prev => ({
      ...prev,
      wordGroups: prev.wordGroups.filter(g => g.id !== groupId),
    }));
  }, [save]);

  const renameWordGroup = useCallback((groupId: string, name: string) => {
    save(prev => ({
      ...prev,
      wordGroups: prev.wordGroups.map(g => g.id === groupId ? { ...g, name } : g),
    }));
  }, [save]);

  const toggleWordInGroup = useCallback((groupId: string, hanziId: string) => {
    save(prev => ({
      ...prev,
      wordGroups: prev.wordGroups.map(g => {
        if (g.id !== groupId) return g;
        const has = g.hanziIds.includes(hanziId);
        return { ...g, hanziIds: has ? g.hanziIds.filter(id => id !== hanziId) : [...g.hanziIds, hanziId] };
      }),
    }));
  }, [save]);

  return { progress, toggleMastered, recordQuiz, createWordGroup, deleteWordGroup, renameWordGroup, toggleWordInGroup };
}
