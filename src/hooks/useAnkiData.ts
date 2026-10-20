import { useState, useEffect, useCallback } from 'react';
import type { StoredAnkiCard, ReviewEvent, ImportResult } from '@/lib/anki-types';
import {
  getAllCards, putCards, getAllReviews, addReview,
  getLastImportDate, setLastImportDate, exportBackup, importBackup,
  getTodayReviews,
} from '@/lib/anki-db';
import type { AnkiBackup } from '@/lib/anki-types';

export function useAnkiData() {
  const [cards, setCards] = useState<StoredAnkiCard[]>([]);
  const [reviews, setReviews] = useState<ReviewEvent[]>([]);
  const [todayReviews, setTodayReviews] = useState<ReviewEvent[]>([]);
  const [lastImport, setLastImport] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [allCards, allReviews, todayRevs, lastImp] = await Promise.all([
      getAllCards(),
      getAllReviews(),
      getTodayReviews(),
      getLastImportDate(),
    ]);
    setCards(allCards);
    setReviews(allReviews);
    setTodayReviews(todayRevs);
    setLastImport(lastImp);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const saveImportedCards = useCallback(async (newCards: StoredAnkiCard[]) => {
    await putCards(newCards);
    const now = Date.now();
    await setLastImportDate(now);
    setLastImport(now);
    await refresh();
  }, [refresh]);

  const recordReview = useCallback(async (cardId: string, result: 'remembered' | 'forgot' | 'skipped') => {
    const event: ReviewEvent = {
      id: `${cardId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      cardId,
      timestamp: Date.now(),
      result,
    };
    await addReview(event);
    setReviews(prev => [...prev, event]);
    const todayStr = new Date().toLocaleDateString();
    if (new Date(event.timestamp).toLocaleDateString() === todayStr) {
      setTodayReviews(prev => [...prev, event]);
    }
  }, []);

  const handleExportBackup = useCallback(async () => {
    return await exportBackup();
  }, []);

  const handleImportBackup = useCallback(async (backup: AnkiBackup, merge: boolean) => {
    const result = await importBackup(backup, merge);
    await refresh();
    return result;
  }, [refresh]);

  return {
    cards,
    reviews,
    todayReviews,
    lastImport,
    loading,
    refresh,
    saveImportedCards,
    recordReview,
    handleExportBackup,
    handleImportBackup,
  };
}
