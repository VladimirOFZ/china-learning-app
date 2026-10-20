import initSqlJs from 'sql.js';
import { unzipSync, strFromU8 } from 'fflate';
import type { AnkiNote, AnkiCard, AnkiDeck, StoredAnkiCard, ImportResult, AnkiCardStatus } from './anki-types';
import { AnkiCardType, AnkiCardQueue } from './anki-types';

const FIELD_SEP = '\x1f';

async function getSqlJs() {
  const SQL = await initSqlJs({
    locateFile: (file: string) => {
      if (file.endsWith('.wasm')) {
        return './wasm/sql-wasm.wasm';
      }
      return `./${file}`;
    },
  });
  return SQL;
}

function tableExists(db: ReturnType<typeof getSqlJs extends Promise<infer T> ? T : never> extends { Database: infer D } ? D : never, name: string): boolean {
  try {
    const r = db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${name}'`);
    return r.length > 0;
  } catch {
    return false;
  }
}

interface ParsedDeck {
  id: string;
  name: string;
}

interface ParsedModel {
  id: string;
  name: string;
  fieldNames: string[];
}

export async function parseApkg(file: File): Promise<{ notes: AnkiNote[]; cards: AnkiCard[]; decks: AnkiDeck[]; warnings: string[] }> {
  const warnings: string[] = [];
  const buffer = new Uint8Array(await file.arrayBuffer());

  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(buffer);
  } catch {
    throw new Error('Не удалось распаковать .apkg файл. Убедитесь, что это корректный экспорт из Anki.');
  }

  const dbFile = files['collection.anki21'] || files['collection.anki2'];
  if (!dbFile) {
    throw new Error('В архиве не найдена база данных Anki (collection.anki2 или collection.anki21).');
  }

  const SQL = await getSqlJs();
  const db = new SQL.Database(dbFile);

  try {
    // Detect schema version
    let ver = 11;
    try {
      const verResult = db.exec('SELECT ver FROM col LIMIT 1');
      if (verResult.length > 0) {
        ver = verResult[0].values[0][0] as number;
      }
    } catch {
      // col table might not exist in some exports
    }
    const isNewFormat = ver >= 18;

    // Parse decks
    const decks: Map<string, ParsedDeck> = new Map();
    if (isNewFormat && tableExists(db, 'decks')) {
      const deckRows = db.exec('SELECT id, name FROM decks');
      if (deckRows.length > 0) {
        for (const row of deckRows[0].values) {
          const id = String(row[0]);
          const name = String(row[1]).replace(/\x1f/g, '::');
          decks.set(id, { id, name });
        }
      }
    } else {
      try {
        const decksResult = db.exec('SELECT decks FROM col LIMIT 1');
        if (decksResult.length > 0) {
          const decksJson = JSON.parse(decksResult[0].values[0][0] as string);
          for (const key of Object.keys(decksJson)) {
            const d = decksJson[key];
            decks.set(String(d.id), { id: String(d.id), name: d.name || `Deck ${d.id}` });
          }
        }
      } catch {
        // fallback
      }
    }

    if (decks.size === 0) {
      decks.set('1', { id: '1', name: 'Default' });
    }

    // Parse models (note types)
    const models: Map<string, ParsedModel> = new Map();
    if (isNewFormat && tableExists(db, 'notetypes')) {
      const ntRows = db.exec('SELECT id, name FROM notetypes');
      if (ntRows.length > 0) {
        for (const row of ntRows[0].values) {
          models.set(String(row[0]), { id: String(row[0]), name: String(row[1]), fieldNames: [] });
        }
      }
      if (tableExists(db, 'fields')) {
        const fieldRows = db.exec('SELECT ntoid, ord, name FROM fields ORDER BY ntoid, ord');
        if (fieldRows.length > 0) {
          for (const row of fieldRows[0].values) {
            const modelId = String(row[0]);
            const fieldName = String(row[2]);
            const model = models.get(modelId);
            if (model) {
              model.fieldNames.push(fieldName);
            }
          }
        }
      }
    } else {
      try {
        const modelsResult = db.exec('SELECT models FROM col LIMIT 1');
        if (modelsResult.length > 0) {
          const modelsJson = JSON.parse(modelsResult[0].values[0][0] as string);
          for (const key of Object.keys(modelsJson)) {
            const m = modelsJson[key];
            const fieldNames: string[] = (m.flds || []).map((f: { name: string }) => f.name);
            models.set(String(m.id), { id: String(m.id), name: m.name || `Model ${m.id}`, fieldNames });
          }
        }
      } catch {
        // fallback
      }
    }

    // Parse notes
    const notesMap: Map<string, AnkiNote> = new Map();
    try {
      const noteRows = db.exec('SELECT id, guid, mid, tags, flds FROM notes');
      if (noteRows.length > 0) {
        for (const row of noteRows[0].values) {
          const id = String(row[0]);
          const guid = String(row[1]);
          const mid = String(row[2]);
          const tagsStr = String(row[3] || '');
          const fldsStr = String(row[4] || '');
          const tags = tagsStr.trim() ? tagsStr.trim().split(/\s+/) : [];
          const fields = fldsStr.split(FIELD_SEP);
          const model = models.get(mid);
          const fieldNames = model?.fieldNames.length
            ? model.fieldNames
            : fields.map((_, i) => `Поле ${i + 1}`);

          notesMap.set(id, { id, guid, modelId: mid, tags, fields, fieldNames });
        }
      }
    } catch {
      // notes table might not exist
    }

    // Parse cards
    const cards: AnkiCard[] = [];
    const deckCardCount: Map<string, number> = new Map();
    try {
      const cardRows = db.exec('SELECT id, nid, did, ord, type, queue, reps, lapses FROM cards');
      if (cardRows.length > 0) {
        for (const row of cardRows[0].values) {
          const cardId = String(row[0]);
          const noteId = String(row[1]);
          const deckId = String(row[2]);
          const ord = row[3] as number;
          const type = row[4] as number;
          const queue = row[5] as number;
          const reps = row[6] as number;
          const lapses = row[7] as number;

          const note = notesMap.get(noteId);
          if (!note) continue;

          const deck = decks.get(deckId);
          const deckName = deck?.name || 'Unknown';
          const model = models.get(note.modelId);
          const modelName = model?.name || 'Unknown';

          deckCardCount.set(deckName, (deckCardCount.get(deckName) || 0) + 1);

          cards.push({
            id: cardId,
            noteId,
            deckId,
            deckName,
            templateOrd: ord,
            modelName,
            ankiReps: reps,
            ankiLapses: lapses,
            ankiType: type as AnkiCardType,
            ankiQueue: queue as AnkiCardQueue,
            note,
          });
        }
      }
    } catch {
      // cards table might not exist
    }

    if (cards.length === 0) {
      throw new Error('В файле не найдено ни одной карточки. Возможно, файл повреждён или экспортирован без карточек.');
    }

    // Check for media
    if (files['media']) {
      try {
        const mediaMap = JSON.parse(strFromU8(files['media']));
        const mediaCount = Object.keys(mediaMap).length;
        if (mediaCount > 0) {
          warnings.push(`Файл содержит ${mediaCount} медиафайлов (изображений, аудио). Они не импортированы — поддерживаются только текстовые поля.`);
        }
      } catch {
        // ignore
      }
    }

    const decksList: AnkiDeck[] = Array.from(decks.values())
      .map(d => ({ ...d, cardCount: deckCardCount.get(d.name) || 0 }))
      .filter(d => d.cardCount > 0);

    return { notes: Array.from(notesMap.values()), cards, decks: decksList, warnings };
  } finally {
    db.close();
  }
}

export function determineCardStatus(card: AnkiCard): AnkiCardStatus {
  if (card.ankiReps > 0 || card.ankiType !== AnkiCardType.New) {
    return 'studied';
  }
  if (card.ankiQueue === AnkiCardQueue.New || card.ankiQueue === 0) {
    return 'new';
  }
  return 'unknown';
}

export async function importCards(cards: AnkiCard[], existingCards: StoredAnkiCard[]): Promise<ImportResult> {
  const existingMap = new Map(existingCards.map(c => [c.id, c]));
  const newCards: StoredAnkiCard[] = [];
  const updatedCards: StoredAnkiCard[] = [];
  let skipped = 0;
  const errors: string[] = [];

  for (const card of cards) {
    const status = determineCardStatus(card);
    const stored: StoredAnkiCard = {
      id: card.id,
      noteId: card.noteId,
      deckId: card.deckId,
      deckName: card.deckName,
      templateOrd: card.templateOrd,
      modelName: card.modelName,
      tags: card.note.tags,
      fields: card.note.fields,
      fieldNames: card.note.fieldNames,
      ankiReps: card.ankiReps,
      ankiLapses: card.ankiLapses,
      ankiType: card.ankiType,
      ankiQueue: card.ankiQueue,
      status,
      importedAt: Date.now(),
    };

    const existing = existingMap.get(card.id);
    if (existing) {
      const changed =
        existing.fields.join(FIELD_SEP) !== stored.fields.join(FIELD_SEP) ||
        existing.deckName !== stored.deckName ||
        existing.ankiReps !== stored.ankiReps ||
        existing.ankiLapses !== stored.ankiLapses;
      if (changed) {
        updatedCards.push({ ...stored, importedAt: existing.importedAt });
      } else {
        skipped++;
      }
    } else {
      newCards.push(stored);
    }
  }

  return {
    newCards: newCards.length,
    updatedCards: updatedCards.length,
    skippedCards: skipped,
    totalCards: cards.length,
    decks: [],
    errors,
    warnings: [],
  };
}

export interface TsvParseOptions {
  fieldMapping: number[];
  hasHeader: boolean;
  deckName: string;
}

export function parseTsv(text: string, options: TsvParseOptions): { cards: AnkiCard[]; warnings: string[] } {
  const warnings: string[] = [];
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) {
    return { cards: [], warnings: ['Файл пуст.'] };
  }

  const startIndex = options.hasHeader ? 1 : 0;
  const cards: AnkiCard[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    const mapping = options.fieldMapping;
    const hanzi = mapping[0] >= 0 ? (parts[mapping[0]] || '').trim() : '';
    const pinyin = mapping[1] >= 0 ? (parts[mapping[1]] || '').trim() : '';
    const translation = mapping[2] >= 0 ? (parts[mapping[2]] || '').trim() : '';

    if (!hanzi && !translation) {
      warnings.push(`Строка ${i + 1}: пропущена (пустые поля).`);
      continue;
    }

    const fields = [hanzi, pinyin, translation].filter(f => f);
    const fieldNames = ['Китайский', 'Пиньинь', 'Перевод'].slice(0, fields.length);

    const noteId = `tsv-${i}`;
    const cardId = `tsv-card-${i}`;

    cards.push({
      id: cardId,
      noteId,
      deckId: 'tsv',
      deckName: options.deckName,
      templateOrd: 0,
      modelName: 'TSV Import',
      ankiReps: 0,
      ankiLapses: 0,
      ankiType: AnkiCardType.New,
      ankiQueue: AnkiCardQueue.New,
      note: {
        id: noteId,
        guid: '',
        modelId: 'tsv',
        tags: [],
        fields,
        fieldNames,
      },
    });
  }

  return { cards, warnings };
}

export function detectTsvColumns(text: string): { columns: string[][]; suggested: TsvParseOptions } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) {
    return {
      columns: [],
      suggested: { fieldMapping: [0, 1, 2], hasHeader: false, deckName: 'Импорт TSV' },
    };
  }

  const firstParts = lines[0].split('\t');
  const secondParts = lines.length > 1 ? lines[1].split('\t') : [];

  const hasChinese = (s: string) => /[\u4e00-\u9fff]/.test(s);
  const hasPinyin = (s: string) => /[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/i.test(s) && !hasChinese(s);

  const hasHeader = !hasChinese(firstParts[0] || '') && firstParts.length > 1;
  const dataRow = hasHeader ? secondParts : firstParts;

  const columns: string[][] = firstParts.map((_, idx) => [
    firstParts[idx] || '',
    dataRow[idx] || '',
  ]);

  let hanziIdx = -1;
  let pinyinIdx = -1;
  let translationIdx = -1;

  for (let i = 0; i < dataRow.length; i++) {
    if (hasChinese(dataRow[i]) && hanziIdx === -1) hanziIdx = i;
    else if (hasPinyin(dataRow[i]) && pinyinIdx === -1) pinyinIdx = i;
    else if (translationIdx === -1 && !hasChinese(dataRow[i])) translationIdx = i;
  }

  if (hanziIdx === -1) hanziIdx = 0;
  if (pinyinIdx === -1) pinyinIdx = 1 < dataRow.length ? 1 : -1;
  if (translationIdx === -1) translationIdx = 2 < dataRow.length ? 2 : -1;

  return {
    columns,
    suggested: {
      fieldMapping: [hanziIdx, pinyinIdx, translationIdx],
      hasHeader,
      deckName: 'Импорт TSV',
    },
  };
}
