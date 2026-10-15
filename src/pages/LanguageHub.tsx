import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Info, Music, Zap, Folder, ArrowLeft } from 'lucide-react';
import { hanziData, tonesData } from '@/data/hanzi';
import { Flashcard } from '@/components/Flashcard';
import { AudioButton } from '@/components/AudioButton';
import type { UserProgress } from '@/hooks/useProgress';

interface LanguageHubProps {
  progress: UserProgress;
  onToggleMastered: (id: string) => void;
}

type Tab = 'flashcards' | 'tones';
type Mode = 'normal' | 'storm';

export function LanguageHub({ progress, onToggleMastered }: LanguageHubProps) {
  const [tab, setTab] = useState<Tab>('flashcards');
  const [mode, setMode] = useState<Mode>('normal');
  const [stormGroupId, setStormGroupId] = useState<string | null>(null);
  const [hskFilter, setHskFilter] = useState<1 | 2 | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffled, setShuffled] = useState(false);

  const stormGroup = progress.wordGroups.find(g => g.id === stormGroupId) ?? null;
  const stormHanzi = useMemo(() => {
    if (!stormGroup) return [];
    return hanziData.filter(h => stormGroup.hanziIds.includes(h.id));
  }, [stormGroup]);

  const filteredHanzi = useMemo(() => {
    let base: typeof hanziData;
    if (mode === 'storm' && stormGroup) {
      base = hanziData.filter(h => stormGroup.hanziIds.includes(h.id));
    } else {
      base = hanziData.filter(h => hskFilter === 'all' || h.hskLevel === hskFilter);
    }
    if (!shuffled) return base;
    const copy = [...base];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, [hskFilter, shuffled, mode, stormGroup]);

  const safeIndex = Math.min(currentIndex, filteredHanzi.length - 1);
  const currentCard = filteredHanzi[safeIndex];

  const next = () => setCurrentIndex(i => (i + 1) % filteredHanzi.length);
  const prev = () => setCurrentIndex(i => (i - 1 + filteredHanzi.length) % filteredHanzi.length);
  const toggleShuffle = () => {
    setShuffled(s => !s);
    setCurrentIndex(0);
  };

  const startStorm = (groupId: string) => {
    setMode('storm');
    setStormGroupId(groupId);
    setShuffled(true);
    setCurrentIndex(0);
    setTab('flashcards');
  };

  const exitStorm = () => {
    setMode('normal');
    setStormGroupId(null);
    setShuffled(false);
    setCurrentIndex(0);
  };

  const masteredInFilter = filteredHanzi.filter(h => progress.masteredHanzi.includes(h.id)).length;

  const groupsWithWords = progress.wordGroups.filter(g => g.hanziIds.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-ink-900 mb-2">Изучение китайского языка</h1>
        <p className="text-ink-500">Карточки для запоминания иероглифов, аудио-озвучка и гид по тонам</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('flashcards')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            tab === 'flashcards' ? 'bg-crimson-600 text-white' : 'bg-white text-ink-600 border border-parchment-200 hover:bg-parchment-100'
          }`}
        >
          <Info size={18} /> Карточки
        </button>
        <button
          onClick={() => setTab('tones')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            tab === 'tones' ? 'bg-crimson-600 text-white' : 'bg-white text-ink-600 border border-parchment-200 hover:bg-parchment-100'
          }`}
        >
          <Music size={18} /> Гид по тонам
        </button>
      </div>

      {tab === 'flashcards' && mode === 'storm' && stormGroup && (
        <div>
          {/* Storm mode banner */}
          <div className="card p-4 mb-4 flex items-center justify-between bg-gradient-to-r from-gold-400 to-gold-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center">
                <Zap size={22} className="text-gold-400" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-ink-900">Штурм: {stormGroup.name}</h2>
                <p className="text-sm text-ink-700">
                  {filteredHanzi.length} слов · выучено {masteredInFilter} / {filteredHanzi.length}
                </p>
              </div>
            </div>
            <button
              onClick={exitStorm}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-900 text-white text-sm font-medium hover:bg-ink-800 transition-all"
            >
              <ArrowLeft size={16} /> Выйти из штурма
            </button>
          </div>

          {filteredHanzi.length === 0 ? (
            <div className="card p-12 text-center">
              <Folder size={48} className="text-ink-300 mx-auto mb-4" />
              <p className="text-ink-500 text-lg">В этой группе нет слов</p>
              <p className="text-ink-400 text-sm mt-1">Добавьте слова в словаре, затем вернитесь к штурму</p>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              <Flashcard
                key={currentCard.id}
                card={currentCard}
                isMastered={progress.masteredHanzi.includes(currentCard.id)}
                onToggleMastered={onToggleMastered}
              />

              {/* Controls */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={prev}
                  className="w-12 h-12 rounded-full bg-white border border-parchment-300 flex items-center justify-center text-ink-600 hover:bg-parchment-100 transition-all hover:scale-105"
                >
                  <ChevronLeft size={24} />
                </button>
                <span className="text-sm text-ink-500 font-medium px-4">
                  {safeIndex + 1} / {filteredHanzi.length}
                </span>
                <button
                  onClick={next}
                  className="w-12 h-12 rounded-full bg-white border border-parchment-300 flex items-center justify-center text-ink-600 hover:bg-parchment-100 transition-all hover:scale-105"
                >
                  <ChevronRight size={24} />
                </button>
                <button
                  onClick={toggleShuffle}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 ml-2 ${
                    shuffled
                      ? 'bg-crimson-600 text-white'
                      : 'bg-gold-500 text-ink-900 hover:bg-gold-600'
                  }`}
                  title={shuffled ? 'Выключить случайный порядок' : 'Случайный порядок'}
                >
                  <Shuffle size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'flashcards' && mode === 'normal' && currentCard && (
        <div>
          {/* HSK filter */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-ink-500 font-medium">Уровень HSK:</span>
            {([1, 2, 'all'] as const).map(level => (
              <button
                key={level}
                onClick={() => { setHskFilter(level); setCurrentIndex(0); }}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  hskFilter === level
                    ? 'bg-crimson-600 text-white'
                    : 'bg-white border border-parchment-300 text-ink-600 hover:bg-parchment-100'
                }`}
              >
                {level === 'all' ? 'Все' : `HSK ${level}`}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-ink-500">
                Выучено: <span className="font-bold text-crimson-600">{masteredInFilter}</span> / {filteredHanzi.length}
              </span>
            </div>
          </div>

          {/* Storm groups selector */}
          {groupsWithWords.length > 0 && (
            <div className="card p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={18} className="text-gold-500" />
                <h3 className="font-serif text-sm font-bold text-ink-900">Запустить шттурм по группе</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {groupsWithWords.map(group => (
                  <button
                    key={group.id}
                    onClick={() => startStorm(group.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-ink-900 font-bold text-sm hover:from-gold-500 hover:to-gold-600 transition-all hover:scale-105 shadow-sm"
                  >
                    <Zap size={14} />
                    {group.name}
                    <span className="text-xs px-2 py-0.5 rounded-full bg-ink-900/10">{group.hanziIds.length}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Flashcard */}
          <div className="max-w-xl mx-auto">
            <Flashcard
              key={currentCard.id}
              card={currentCard}
              isMastered={progress.masteredHanzi.includes(currentCard.id)}
              onToggleMastered={onToggleMastered}
            />

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full bg-white border border-parchment-300 flex items-center justify-center text-ink-600 hover:bg-parchment-100 transition-all hover:scale-105"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="text-sm text-ink-500 font-medium px-4">
                {safeIndex + 1} / {filteredHanzi.length}
              </span>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full bg-white border border-parchment-300 flex items-center justify-center text-ink-600 hover:bg-parchment-100 transition-all hover:scale-105"
              >
                <ChevronRight size={24} />
              </button>
              <button
                onClick={toggleShuffle}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 ml-2 ${
                  shuffled
                    ? 'bg-crimson-600 text-white'
                    : 'bg-gold-500 text-ink-900 hover:bg-gold-600'
                }`}
                title={shuffled ? 'Выключить случайный порядок' : 'Случайный порядок'}
              >
                <Shuffle size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'flashcards' && mode === 'normal' && !currentCard && (
        <div className="card p-12 text-center">
          <Info size={48} className="text-ink-300 mx-auto mb-4" />
          <p className="text-ink-500 text-lg">Нет карточек для выбранного фильтра</p>
        </div>
      )}

      {tab === 'tones' && (
        <div className="space-y-6">
          <div className="card p-6 bg-gradient-to-br from-crimson-50 to-parchment-50">
            <h2 className="font-serif text-xl font-bold text-ink-900 mb-2">Четыре тона китайского языка</h2>
            <p className="text-ink-600">
              В путунхуа — официальном языке Китая — используется 4 тона. Тон полностью меняет значение слова.
              Один и тот же слог «ma» означает «мама», «коноплю», «лошадь» или «ругать» в зависимости от тона.
              Нажмите кнопку озвучки, чтобы услышать каждый тон.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {tonesData.map(tone => (
              <div key={tone.tone} className="card p-6 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${tone.color} flex items-center justify-center text-white font-bold text-2xl`}>
                      {tone.tone}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-ink-900">{tone.name}</h3>
                      <p className="text-2xl font-mono text-ink-300 tracking-wider">{tone.pitch}</p>
                    </div>
                  </div>
                  <AudioButton text={tone.example} size="md" />
                </div>
                <p className="text-ink-600 text-sm mb-4">{tone.description}</p>
                <div className="bg-parchment-50 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <span className="font-hanzi text-3xl text-ink-900 mr-3">{tone.example}</span>
                    <span className="font-serif text-lg text-crimson-600 mr-3">{tone.examplePinyin}</span>
                    <span className="text-ink-500">— {tone.exampleTranslation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tone comparison audio */}
          <div className="card p-6">
            <h3 className="font-serif text-lg font-bold text-ink-900 mb-4">Сравнение всех тонов</h3>
            <div className="bg-parchment-50 rounded-xl p-6 text-center">
              <p className="text-ink-500 mb-4">Послушайте слог «ma» во всех четырёх тонах подряд:</p>
              <AudioButton text="mā má mǎ mà" size="lg" label="Озвучить все тоны" />
              <div className="flex justify-center gap-6 mt-6 flex-wrap">
                {tonesData.map(t => (
                  <div key={t.tone} className="text-center">
                    <span className="font-hanzi text-2xl text-ink-900 block">{t.example}</span>
                    <span className="text-sm text-crimson-600">{t.examplePinyin}</span>
                    <span className="text-xs text-ink-400 block">{t.exampleTranslation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
