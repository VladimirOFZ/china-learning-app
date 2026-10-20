import { useState, useMemo, useRef } from 'react';
import {
  Upload, Search, Layers, Calendar, Zap, CheckCircle2, Circle,
  RotateCw, ChevronRight, ChevronLeft, Shuffle, AlertCircle,
  Download, FileUp, Info, ArrowLeft, X,
} from 'lucide-react';
import type { StoredAnkiCard, ReviewEvent, ImportResult, AnkiBackup } from '@/lib/anki-types';
import { AnkiCardType } from '@/lib/anki-types';
import { useAnkiData } from '@/hooks/useAnkiData';
import { AnkiStudyCard } from '@/components/AnkiStudyCard';
import { parseApkg, importCards, parseTsv, detectTsvColumns } from '@/lib/anki-parser';
import type { TsvParseOptions } from '@/lib/anki-parser';
import { stripHtml } from '@/lib/html-sanitize';

type Phase = 'overview' | 'studying' | 'result' | 'tsv-mapping';
type StudyMode = 'all' | 'today';

export function AnkiPage() {
  const {
    cards, todayReviews, lastImport, loading,
    saveImportedCards, recordReview, handleExportBackup, handleImportBackup,
  } = useAnkiData();

  const [phase, setPhase] = useState<Phase>('overview');
  const [studyMode, setStudyMode] = useState<StudyMode>('all');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deckFilter, setDeckFilter] = useState<string>('all');
  const [showAllToggle, setShowAllToggle] = useState(false);
  const [studyCards, setStudyCards] = useState<StoredAnkiCard[]>([]);
  const [studyIndex, setStudyIndex] = useState(0);
  const [studyResults, setStudyResults] = useState<{ remembered: number; forgot: number; skipped: number; viewed: number }>({ remembered: 0, forgot: 0, skipped: 0, viewed: 0 });
  const [shuffled, setShuffled] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupError, setBackupError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // TSV mapping state
  const [tsvText, setTsvText] = useState('');
  const [tsvOptions, setTsvOptions] = useState<TsvParseOptions>({ fieldMapping: [0, 1, 2], hasHeader: false, deckName: 'Импорт TSV' });
  const [tsvColumns, setTsvColumns] = useState<string[][]>([]);

  // Derived data
  const decks = useMemo(() => {
    const map = new Map<string, number>();
    for (const card of cards) {
      map.set(card.deckName, (map.get(card.deckName) || 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [cards]);

  const studiedInAnki = useMemo(() => cards.filter(c => c.status === 'studied').length, [cards]);

  const todayUniqueCards = useMemo(() => {
    const ids = new Set(todayReviews.map(r => r.cardId));
    return ids.size;
  }, [todayReviews]);

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter(c => {
      if (deckFilter !== 'all' && c.deckName !== deckFilter) return false;
      if (!q) return true;
      const hanzi = stripHtml(c.fields[0] || '').toLowerCase();
      const pinyin = stripHtml(c.fields[1] || '').toLowerCase();
      const translation = stripHtml(c.fields[2] || c.fields[1] || '').toLowerCase();
      const tags = c.tags.join(' ').toLowerCase();
      return hanzi.includes(q) || pinyin.includes(q) || translation.includes(q) || tags.includes(q);
    });
  }, [cards, search, deckFilter]);

  // Import handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError(null);
    setImportResult(null);

    try {
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('Файл слишком большой (более 100 МБ).');
      }

      const isApkg = file.name.toLowerCase().endsWith('.apkg');
      const isTsv = file.name.toLowerCase().endsWith('.tsv') || file.name.toLowerCase().endsWith('.txt');

      if (isApkg) {
        const parsed = await parseApkg(file);
        const result = await importCards(parsed.cards, cards);
        const storedCards: StoredAnkiCard[] = [];
        const existingMap = new Map(cards.map(c => [c.id, c]));

        for (const card of parsed.cards) {
          const existing = existingMap.get(card.id);
          const status = existing?.status || (card.ankiReps > 0 || card.ankiType !== AnkiCardType.New ? 'studied' : 'new');
          storedCards.push({
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
            status: status as 'studied' | 'unknown' | 'new',
            importedAt: existing?.importedAt || Date.now(),
          });
        }

        await saveImportedCards(storedCards);
        setImportResult({ ...result, warnings: parsed.warnings, decks: parsed.decks });
      } else if (isTsv) {
        const text = await file.text();
        const detected = detectTsvColumns(text);
        setTsvText(text);
        setTsvOptions(detected.suggested);
        setTsvColumns(detected.columns);
        setPhase('tsv-mapping');
      } else {
        throw new Error('Поддерживаются только файлы .apkg, .tsv и .txt.');
      }
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Не удалось импортировать файл.');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleTsvImport = async () => {
    setImporting(true);
    setImportError(null);
    try {
      const { cards: parsedCards, warnings } = parseTsv(tsvText, tsvOptions);
      const result = await importCards(parsedCards, cards);
      const storedCards: StoredAnkiCard[] = parsedCards.map(card => ({
        id: card.id,
        noteId: card.noteId,
        deckId: card.deckId,
        deckName: card.deckName,
        templateOrd: card.templateOrd,
        modelName: card.modelName,
        tags: card.note.tags,
        fields: card.note.fields,
        fieldNames: card.note.fieldNames,
        ankiReps: 0,
        ankiLapses: 0,
        ankiType: 0,
        ankiQueue: 0,
        status: 'unknown',
        importedAt: Date.now(),
      }));
      await saveImportedCards(storedCards);
      setImportResult({ ...result, warnings, decks: [] });
      setPhase('overview');
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Не удалось импортировать файл.');
    } finally {
      setImporting(false);
    }
  };

  // Study mode handlers
  const startStudy = (mode: StudyMode) => {
    let pool: StoredAnkiCard[];
    if (mode === 'today') {
      const todayCardIds = new Set(todayReviews.map(r => r.cardId));
      pool = cards.filter(c => todayCardIds.has(c.id));
    } else {
      pool = showAllToggle
        ? cards
        : cards.filter(c => c.status === 'studied' || c.status === 'unknown');
    }

    if (pool.length === 0) return;

    if (mode === 'today' || shuffled) {
      const copy = [...pool];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      pool = copy;
    }

    setStudyCards(pool);
    setStudyIndex(0);
    setStudyResults({ remembered: 0, forgot: 0, skipped: 0, viewed: 0 });
    setStudyMode(mode);
    setPhase('studying');
  };

  const handleStudyResult = (result: 'remembered' | 'forgot' | 'skipped') => {
    const card = studyCards[studyIndex];
    if (card) {
      recordReview(card.id, result);
    }
    setStudyResults(prev => ({
      ...prev,
      remembered: prev.remembered + (result === 'remembered' ? 1 : 0),
      forgot: prev.forgot + (result === 'forgot' ? 1 : 0),
      skipped: prev.skipped + (result === 'skipped' ? 1 : 0),
      viewed: prev.viewed + 1,
    }));
  };

  const handleStudyNext = () => {
    if (studyIndex + 1 >= studyCards.length) {
      setPhase('result');
    } else {
      setStudyIndex(i => i + 1);
    }
  };

  // Backup handlers
  const handleExport = async () => {
    try {
      const backup = await handleExportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `china-trip-anki-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setShowBackupModal(false);
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : 'Не удалось создать резервную копию.');
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupError(null);
    try {
      const text = await file.text();
      const backup = JSON.parse(text) as AnkiBackup;
      const result = await handleImportBackup(backup, true);
      setShowBackupModal(false);
      setImportResult({
        newCards: result.cardsImported,
        updatedCards: 0,
        skippedCards: 0,
        totalCards: result.cardsImported,
        decks: [],
        errors: [],
        warnings: [`Восстановлено карточек: ${result.cardsImported}, событий повторений: ${result.reviewsImported}`],
      });
    } catch (err) {
      setBackupError(err instanceof Error ? err.message : 'Не удалось восстановить резервную копию.');
    }
    if (e.target) e.target.value = '';
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-crimson-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Layers size={32} className="text-crimson-600" />
          </div>
          <p className="text-ink-500">Загрузка данных Anki…</p>
        </div>
      </div>
    );
  }

  // TSV mapping phase
  if (phase === 'tsv-mapping') {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setPhase('overview')} className="text-ink-400 hover:text-crimson-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-serif text-2xl font-bold text-ink-900">Сопоставление полей TSV</h1>
        </div>

        <div className="card p-6 mb-6">
          <p className="text-ink-600 text-sm mb-4">
            Определите, какие столбцы соответствуют китайскому слову, пиньиню и переводу.
            Мы автоматически определили наиболее вероятное сопоставление.
          </p>

          <div className="space-y-3 mb-6">
            {tsvColumns.map((col, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-parchment-50 rounded-lg">
                <span className="text-xs font-bold text-ink-400 w-8">#{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-700">{col[0] || '(пусто)'}</p>
                  <p className="text-xs text-ink-400">{col[1] || '(пусто)'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-ink-700 block mb-2">Китайское слово</label>
              <select
                value={tsvOptions.fieldMapping[0]}
                onChange={e => setTsvOptions(o => ({ ...o, fieldMapping: [parseInt(e.target.value), o.fieldMapping[1], o.fieldMapping[2]] }))}
                className="w-full px-3 py-2 rounded-lg border border-parchment-300 bg-white text-ink-800 focus:outline-none focus:border-crimson-500"
              >
                {tsvColumns.map((_, i) => <option key={i} value={i}>Столбец {i + 1}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700 block mb-2">Пиньинь</label>
              <select
                value={tsvOptions.fieldMapping[1]}
                onChange={e => setTsvOptions(o => ({ ...o, fieldMapping: [o.fieldMapping[0], parseInt(e.target.value), o.fieldMapping[2]] }))}
                className="w-full px-3 py-2 rounded-lg border border-parchment-300 bg-white text-ink-800 focus:outline-none focus:border-crimson-500"
              >
                <option value={-1}>— нет —</option>
                {tsvColumns.map((_, i) => <option key={i} value={i}>Столбец {i + 1}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700 block mb-2">Перевод</label>
              <select
                value={tsvOptions.fieldMapping[2]}
                onChange={e => setTsvOptions(o => ({ ...o, fieldMapping: [o.fieldMapping[0], o.fieldMapping[1], parseInt(e.target.value)] }))}
                className="w-full px-3 py-2 rounded-lg border border-parchment-300 bg-white text-ink-800 focus:outline-none focus:border-crimson-500"
              >
                <option value={-1}>— нет —</option>
                {tsvColumns.map((_, i) => <option key={i} value={i}>Столбец {i + 1}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <label className="flex items-center gap-2 text-sm text-ink-600">
              <input
                type="checkbox"
                checked={tsvOptions.hasHeader}
                onChange={e => setTsvOptions(o => ({ ...o, hasHeader: e.target.checked }))}
                className="w-4 h-4 accent-crimson-600"
              />
              Первая строка — заголовок
            </label>
          </div>

          <button onClick={handleTsvImport} disabled={importing} className="btn-primary w-full flex items-center justify-center gap-2">
            <Upload size={18} />
            {importing ? 'Импорт…' : 'Импортировать'}
          </button>
        </div>
      </div>
    );
  }

  // Study phase
  if (phase === 'studying' && studyCards.length > 0) {
    const currentCard = studyCards[studyIndex];
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-600">
              {studyMode === 'today' ? 'Пройденные сегодня' : 'Все изученные'}
            </span>
            <span className="text-sm font-bold text-crimson-600">
              {studyResults.remembered} запомнил · {studyResults.forgot} повторить
            </span>
          </div>
          <div className="h-2 bg-parchment-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-crimson-600 to-gold-500 rounded-full transition-all duration-300"
              style={{ width: `${((studyIndex + 1) / studyCards.length) * 100}%` }}
            />
          </div>
        </div>

        <AnkiStudyCard
          key={currentCard.id}
          card={currentCard}
          index={studyIndex}
          total={studyCards.length}
          onResult={handleStudyResult}
          onNext={handleStudyNext}
          isLast={studyIndex + 1 >= studyCards.length}
        />

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPhase('overview')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-ink-500 hover:text-crimson-600 transition-colors"
          >
            <X size={18} /> Завершить занятие
          </button>
        </div>
      </div>
    );
  }

  // Result phase
  if (phase === 'result') {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
        <div className="card p-8 text-center animate-slide-up">
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-gold-100">
            <CheckCircle2 size={48} className="text-gold-600" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink-900 mb-2">Занятие завершено!</h1>
          <p className="text-ink-500 mb-6">Вы повторили {studyResults.viewed} карточек</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4">
              <CheckCircle2 size={24} className="text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-ink-900">{studyResults.remembered}</p>
              <p className="text-xs text-ink-400">Запомнил</p>
            </div>
            <div className="bg-crimson-50 rounded-xl p-4">
              <AlertCircle size={24} className="text-crimson-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-ink-900">{studyResults.forgot}</p>
              <p className="text-xs text-ink-400">Нужно повторить</p>
            </div>
            <div className="bg-parchment-100 rounded-xl p-4">
              <Circle size={24} className="text-ink-300 mx-auto mb-2" />
              <p className="text-2xl font-bold text-ink-900">{studyResults.skipped}</p>
              <p className="text-xs text-ink-400">Пропущено</p>
            </div>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => startStudy(studyMode)}
              className="btn-primary flex items-center gap-2"
            >
              <RotateCw size={18} /> Ещё один круг
            </button>
            <button
              onClick={() => { setShuffled(true); startStudy(studyMode); }}
              className="btn-gold flex items-center gap-2"
            >
              <Shuffle size={18} /> Перемешать и повторить
            </button>
            <button onClick={() => setPhase('overview')} className="btn-ghost">
              К списку
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Overview phase
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center">
            <Layers size={22} className="text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink-900">Anki — повторение карточек</h1>
        </div>
        <p className="text-ink-500">
          Импортируйте карточки из AnkiDroid и повторяйте их без ограничений. Данные хранятся локально в этом браузере.
        </p>
      </div>

      {/* Import section */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h2 className="font-serif text-lg font-bold text-ink-900 mb-1">Импорт карточек</h2>
            <p className="text-sm text-ink-500">
              Поддерживаются .apkg (из AnkiDroid) и .txt/.tsv. Обработка происходит в браузере — файлы не отправляются на сервер.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".apkg,.tsv,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="btn-primary flex items-center gap-2"
            >
              <Upload size={18} />
              {importing ? 'Импорт…' : 'Импортировать карточки'}
            </button>
            <button
              onClick={() => setShowBackupModal(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-parchment-300 text-ink-600 font-medium hover:bg-parchment-100 transition-all"
            >
              <Download size={18} /> Резервная копия
            </button>
          </div>
        </div>

        {/* Import result */}
        {importResult && (
          <div className="mt-4 p-4 rounded-xl bg-green-50 border border-green-200 animate-slide-up">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Импорт завершён</p>
                  <p className="text-sm text-green-700 mt-1">
                    Новых: {importResult.newCards} · Обновлено: {importResult.updatedCards} · Пропущено: {importResult.skippedCards} · Всего: {importResult.totalCards}
                  </p>
                  {importResult.warnings.length > 0 && (
                    <ul className="text-sm text-gold-700 mt-2 space-y-1">
                      {importResult.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                    </ul>
                  )}
                </div>
              </div>
              <button onClick={() => setImportResult(null)} className="text-green-600 hover:text-green-800">
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Import error */}
        {importError && (
          <div className="mt-4 p-4 rounded-xl bg-crimson-50 border border-crimson-200 animate-slide-up">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-crimson-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-crimson-800">Ошибка импорта</p>
                  <p className="text-sm text-crimson-700 mt-1">{importError}</p>
                </div>
              </div>
              <button onClick={() => setImportError(null)} className="text-crimson-600 hover:text-crimson-800">
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-crimson-100 flex items-center justify-center">
            <Layers size={24} className="text-crimson-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-ink-900">{cards.length}</p>
            <p className="text-sm text-ink-400">Импортировано</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center">
            <CheckCircle2 size={24} className="text-gold-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-ink-900">{studiedInAnki}</p>
            <p className="text-sm text-ink-400">Изучено в Anki</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <Zap size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-ink-900">{todayUniqueCards}</p>
            <p className="text-sm text-ink-400">Пройдено сегодня</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Calendar size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900">
              {lastImport ? new Date(lastImport).toLocaleDateString('ru-RU') : '—'}
            </p>
            <p className="text-sm text-ink-400">Последний импорт</p>
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="card p-4 mb-6 bg-parchment-50">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-ink-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-ink-500">
            Данные хранятся локально в этом браузере (IndexedDB) и не синхронизируются автоматически между устройствами.
            При открытии сайта в другом браузере или после очистки данных используйте резервную копию для восстановления.
          </p>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="card p-12 text-center">
          <Upload size={48} className="text-ink-300 mx-auto mb-4" />
          <p className="text-ink-500 text-lg">Карточек пока нет</p>
          <p className="text-ink-400 text-sm mt-1">
            Экспортируйте колоду из AnkiDroid и загрузите файл .apkg сюда
          </p>
        </div>
      ) : (
        <>
          {/* Study mode buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => startStudy('all')}
              disabled={cards.filter(c => c.status === 'studied' || c.status === 'unknown').length === 0 && !showAllToggle}
              className="card p-6 text-left card-hover group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center">
                  <Layers size={22} className="text-white" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink-900">Все изученные</h3>
              </div>
              <p className="text-sm text-ink-500">
                Повторение всех карточек, изученных в Anki. Без ограничений на количество повторений.
              </p>
            </button>
            <button
              onClick={() => startStudy('today')}
              disabled={todayUniqueCards === 0}
              className="card p-6 text-left card-hover group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gold-500 flex items-center justify-center">
                  <Zap size={22} className="text-ink-900" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink-900">Пройденные сегодня</h3>
              </div>
              <p className="text-sm text-ink-500">
                Карточки, которые вы уже повторили в China Trip сегодня ({todayUniqueCards}).
              </p>
            </button>
          </div>

          {/* Show all toggle */}
          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 text-sm text-ink-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllToggle}
                onChange={e => setShowAllToggle(e.target.checked)}
                className="w-4 h-4 accent-crimson-600"
              />
              Показывать все импортированные карточки (включая новые)
            </label>
          </div>

          {/* Search and filters */}
          <div className="card p-4 mb-6">
            <div className="relative mb-4">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск: китайское слово, пиньинь, перевод…"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-parchment-300 bg-white text-ink-800 placeholder:text-ink-300 focus:outline-none focus:border-crimson-500 focus:ring-2 focus:ring-crimson-200 transition-all"
              />
            </div>

            {decks.length > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-ink-500 font-medium">Колоды:</span>
                <button
                  onClick={() => setDeckFilter('all')}
                  className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                    deckFilter === 'all' ? 'bg-crimson-600 text-white' : 'bg-white border border-parchment-300 text-ink-600 hover:bg-parchment-100'
                  }`}
                >
                  Все ({cards.length})
                </button>
                {decks.map(deck => (
                  <button
                    key={deck.name}
                    onClick={() => setDeckFilter(deck.name)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                      deckFilter === deck.name ? 'bg-crimson-600 text-white' : 'bg-white border border-parchment-300 text-ink-600 hover:bg-parchment-100'
                    }`}
                  >
                    {deck.name} ({deck.count})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Card list */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-ink-500">
              Найдено: <span className="font-bold text-ink-800">{filteredCards.length}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCards.map(card => (
              <div key={card.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="font-hanzi text-4xl text-ink-900 line-clamp-2">
                    {stripHtml(card.fields[0] || '')}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                    card.status === 'studied' ? 'bg-green-100 text-green-700' :
                    card.status === 'new' ? 'bg-blue-100 text-blue-700' :
                    'bg-parchment-200 text-ink-500'
                  }`}>
                    {card.status === 'studied' ? 'Изучено' : card.status === 'new' ? 'Новое' : 'Неизвестно'}
                  </span>
                </div>
                {card.fields[1] && (
                  <p className="font-serif text-sm text-crimson-600 mb-1 line-clamp-1">
                    {stripHtml(card.fields[1])}
                  </p>
                )}
                {card.fields[2] && (
                  <p className="text-sm text-ink-600 line-clamp-2">
                    {stripHtml(card.fields[2])}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-parchment-100 text-ink-500">
                    {card.deckName}
                  </span>
                  {card.tags.length > 0 && card.tags[0] && (
                    <span className="text-xs px-2 py-1 rounded-full bg-crimson-50 text-crimson-600">
                      {card.tags[0]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Backup modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowBackupModal(false)}>
          <div className="bg-parchment-50 rounded-2xl max-w-lg w-full shadow-2xl animate-slide-up p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-ink-900">Резервное копирование</h2>
              <button onClick={() => setShowBackupModal(false)} className="w-9 h-9 rounded-full flex items-center justify-center text-ink-400 hover:bg-parchment-200">
                <X size={20} />
              </button>
            </div>

            {backupError && (
              <div className="mb-4 p-3 rounded-lg bg-crimson-50 border border-crimson-200 text-sm text-crimson-700">
                {backupError}
              </div>
            )}

            <div className="space-y-4">
              <div className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Download size={20} className="text-crimson-600" />
                  <div>
                    <p className="font-medium text-ink-800">Экспортировать копию</p>
                    <p className="text-sm text-ink-500">Сохранить все карточки и историю повторений в JSON-файл</p>
                  </div>
                </div>
                <button onClick={handleExport} className="btn-primary w-full flex items-center justify-center gap-2">
                  <Download size={18} /> Экспортировать
                </button>
              </div>

              <div className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileUp size={20} className="text-crimson-600" />
                  <div>
                    <p className="font-medium text-ink-800">Восстановить из копии</p>
                    <p className="text-sm text-ink-500">Загрузить JSON-файл резервной копии. Данные будут объединены с существующими.</p>
                  </div>
                </div>
                <label className="btn-ghost w-full flex items-center justify-center gap-2 cursor-pointer">
                  <FileUp size={18} /> Выбрать файл
                  <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
