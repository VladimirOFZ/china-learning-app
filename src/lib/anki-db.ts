import type { StoredAnkiCard, ReviewEvent, ImportResult, AnkiBackup } from './anki-types';

const DB_NAME = 'china_trip_anki';
const DB_VERSION = 1;
const CARDS_STORE = 'cards';
const REVIEWS_STORE = 'reviews';
const META_STORE = 'meta';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(CARDS_STORE)) {
        const store = db.createObjectStore(CARDS_STORE, { keyPath: 'id' });
        store.createIndex('deckId', 'deckId', { unique: false });
        store.createIndex('noteId', 'noteId', { unique: false });
      }
      if (!db.objectStoreNames.contains(REVIEWS_STORE)) {
        const store = db.createObjectStore(REVIEWS_STORE, { keyPath: 'id' });
        store.createIndex('cardId', 'cardId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(storeName: string, mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(db => new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = fn(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
}

export async function getAllCards(): Promise<StoredAnkiCard[]> {
  return tx<StoredAnkiCard[]>(CARDS_STORE, 'readonly', s => s.getAll() as IDBRequest<StoredAnkiCard[]>);
}

export async function getCard(id: string): Promise<StoredAnkiCard | undefined> {
  return tx<StoredAnkiCard | undefined>(CARDS_STORE, 'readonly', s => s.get(id) as IDBRequest<StoredAnkiCard | undefined>);
}

export async function putCard(card: StoredAnkiCard): Promise<void> {
  await tx(CARDS_STORE, 'readwrite', s => s.put(card));
}

export async function putCards(cards: StoredAnkiCard[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(CARDS_STORE, 'readwrite');
    const store = transaction.objectStore(CARDS_STORE);
    for (const card of cards) {
      store.put(card);
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function getAllReviews(): Promise<ReviewEvent[]> {
  return tx<ReviewEvent[]>(REVIEWS_STORE, 'readonly', s => s.getAll() as IDBRequest<ReviewEvent[]>);
}

export async function addReview(event: ReviewEvent): Promise<void> {
  await tx(REVIEWS_STORE, 'readwrite', s => s.add(event));
}

export async function getMeta(key: string): Promise<unknown> {
  const result = await tx<{ key: string; value: unknown } | undefined>(META_STORE, 'readonly', s => s.get(key) as IDBRequest<{ key: string; value: unknown } | undefined>);
  return result?.value;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await tx(META_STORE, 'readwrite', s => s.put({ key, value }));
}

export async function getLastImportDate(): Promise<number | null> {
  const v = await getMeta('lastImport');
  return (v as number) ?? null;
}

export async function setLastImportDate(timestamp: number): Promise<void> {
  await setMeta('lastImport', timestamp);
}

export async function clearAllCards(): Promise<void> {
  await tx(CARDS_STORE, 'readwrite', s => s.clear());
}

export async function clearAllReviews(): Promise<void> {
  await tx(REVIEWS_STORE, 'readwrite', s => s.clear());
}

export async function getTodayReviews(): Promise<ReviewEvent[]> {
  const all = await getAllReviews();
  const todayStr = new Date().toLocaleDateString();
  return all.filter(r => new Date(r.timestamp).toLocaleDateString() === todayStr);
}

export async function exportBackup(): Promise<AnkiBackup> {
  const [cards, reviews, lastImport] = await Promise.all([
    getAllCards(),
    getAllReviews(),
    getLastImportDate(),
  ]);
  return {
    version: 1,
    exportedAt: Date.now(),
    cards,
    reviews,
    lastImport,
  };
}

export async function importBackup(backup: AnkiBackup, merge: boolean): Promise<{ cardsImported: number; reviewsImported: number }> {
  if (!backup.version || !Array.isArray(backup.cards) || !Array.isArray(backup.reviews)) {
    throw new Error('Некорректный формат резервной копии');
  }

  if (!merge) {
    await clearAllCards();
    await clearAllReviews();
  }

  const existingCards = await getAllCards();
  const existingCardIds = new Set(existingCards.map(c => c.id));
  const newCards = backup.cards.filter(c => !existingCardIds.has(c.id));

  await putCards(newCards);

  const existingReviews = await getAllReviews();
  const existingReviewIds = new Set(existingReviews.map(r => r.id));
  const newReviews = backup.reviews.filter(r => !existingReviewIds.has(r.id));

  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(REVIEWS_STORE, 'readwrite');
    const store = transaction.objectStore(REVIEWS_STORE);
    for (const review of newReviews) {
      store.add(review);
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  if (backup.lastImport) {
    const currentLastImport = await getLastImportDate();
    if (!currentLastImport || backup.lastImport > currentLastImport) {
      await setLastImportDate(backup.lastImport);
    }
  }

  return { cardsImported: newCards.length, reviewsImported: newReviews.length };
}

export function checkStorageEstimate(): { available: boolean; warning: string | null } {
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(estimate => {
      if (estimate.usage && estimate.quota) {
        const usedPercent = (estimate.usage / estimate.quota) * 100;
        if (usedPercent > 90) {
          return { available: false, warning: `Хранилище почти заполнено (${Math.round(usedPercent)}%). Возможно, стоит очистить старые данные.` };
        }
      }
    }).catch(() => {});
  }
  return { available: true, warning: null };
}
