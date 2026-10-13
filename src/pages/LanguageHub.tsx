import { useState } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Info, Music } from 'lucide-react';
import { hanziData, tonesData } from '@/data/hanzi';
import { Flashcard } from '@/components/Flashcard';
import { AudioButton } from '@/components/AudioButton';
import type { UserProgress } from '@/hooks/useProgress';

interface LanguageHubProps {
  progress: UserProgress;
  onToggleMastered: (id: string) => void;
}

type Tab = 'flashcards' | 'tones';

export function LanguageHub({ progress, onToggleMastered }: LanguageHubProps) {
  const [tab, setTab] = useState<Tab>('flashcards');
  const [hskFilter, setHskFilter] = useState<1 | 2 | 'all'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredHanzi = hanziData.filter(h => hskFilter === 'all' || h.hskLevel === hskFilter);
  const safeIndex = Math.min(currentIndex, filteredHanzi.length - 1);
  const currentCard = filteredHanzi[safeIndex];

  const next = () => setCurrentIndex(i => (i + 1) % filteredHanzi.length);
  const prev = () => setCurrentIndex(i => (i - 1 + filteredHanzi.length) % filteredHanzi.length);
  const shuffle = () => setCurrentIndex(Math.floor(Math.random() * filteredHanzi.length));

  const masteredInFilter = filteredHanzi.filter(h => progress.masteredHanzi.includes(h.id)).length;

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

      {tab === 'flashcards' && currentCard && (
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
                onClick={shuffle}
                className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-ink-900 hover:bg-gold-600 transition-all hover:scale-105 ml-2"
                title="Случайная карточка"
              >
                <Shuffle size={20} />
              </button>
            </div>
          </div>
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
