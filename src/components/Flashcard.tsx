import { useState } from 'react';
import { RotateCw, Check, BookOpen } from 'lucide-react';
import type { Hanzi } from '@/data/hanzi';
import { AudioButton } from './AudioButton';

interface FlashcardProps {
  card: Hanzi;
  isMastered: boolean;
  onToggleMastered: (id: string) => void;
}

export function Flashcard({ card, isMastered, onToggleMastered }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flashcard w-full h-[440px]">
      <div
        className={`flashcard-inner relative w-full h-full ${flipped ? 'flipped' : ''}`}
        onClick={() => setFlipped(!flipped)}
      >
        {/* Front face */}
        <div className="flashcard-face absolute inset-0 card flex flex-col items-center justify-center p-8 bg-white">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${card.hskLevel === 1 ? 'bg-crimson-100 text-crimson-700' : 'bg-gold-100 text-gold-700'}`}>
              HSK {card.hskLevel}
            </span>
            <AudioButton text={card.hanzi} size="sm" />
          </div>
          <div className="absolute top-4 left-4">
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-parchment-200 text-ink-600">
              {card.category}
            </span>
          </div>
          <div className="font-hanzi text-8xl text-ink-900 mb-4 select-none">
            {card.hanzi}
          </div>
          <p className="text-2xl font-serif text-crimson-600 mb-2">{card.pinyin}</p>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4].map(t => (
              <span
                key={t}
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${
                  t === card.tone ? 'bg-crimson-600 text-white' : 'bg-parchment-200 text-ink-300'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
          <p className="text-ink-400 text-sm flex items-center gap-1 mt-auto">
            <RotateCw size={14} /> Нажмите, чтобы перевернуть
          </p>
        </div>

        {/* Back face */}
        <div className="flashcard-face flashcard-back absolute inset-0 card flex flex-col p-6 bg-parchment-50 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-crimson-600" />
              <h3 className="font-serif text-lg text-ink-800">Примеры</h3>
            </div>
            <AudioButton text={card.examples.map(e => e.chinese).join('. ')} size="sm" label="Озвучить все примеры" />
          </div>

          <div className="space-y-4 flex-1">
            <div>
              <p className="text-ink-400 text-sm mb-1">Перевод</p>
              <p className="text-lg font-serif text-ink-800">{card.translation}</p>
            </div>

            {card.examples.map((ex, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-parchment-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-hanzi text-xl text-ink-900">{ex.chinese}</p>
                  <AudioButton text={ex.chinese} size="sm" />
                </div>
                <p className="text-sm text-crimson-600 font-serif">{ex.pinyin}</p>
                <p className="text-sm text-ink-500">{ex.translation}</p>
              </div>
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMastered(card.id);
            }}
            className={`mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
              isMastered
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-crimson-600 text-white hover:bg-crimson-700'
            }`}
          >
            <Check size={18} />
            {isMastered ? 'Выучено' : 'Отметить как выученное'}
          </button>
        </div>
      </div>
    </div>
  );
}
