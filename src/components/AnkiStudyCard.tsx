import { useState } from 'react';
import { Check, X, SkipForward, ChevronRight, Volume2 } from 'lucide-react';
import type { StoredAnkiCard } from '@/lib/anki-types';
import { sanitizeAnkiHtml } from '@/lib/html-sanitize';
import { useSpeech } from '@/hooks/useSpeech';

interface AnkiStudyCardProps {
  card: StoredAnkiCard;
  index: number;
  total: number;
  onResult: (result: 'remembered' | 'forgot' | 'skipped') => void;
  onNext: () => void;
  isLast: boolean;
}

export function AnkiStudyCard({ card, index, total, onResult, onNext, isLast }: AnkiStudyCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [answered, setAnswered] = useState(false);
  const { speak } = useSpeech();

  const chineseField = card.fields[0] || '';
  const pinyinField = card.fields.length > 1 ? card.fields[1] : '';
  const translationField = card.fields.length > 2 ? card.fields[2] : (card.fields.length > 1 ? card.fields[1] : '');
  const extraFields = card.fields.slice(3);

  const handleResult = (result: 'remembered' | 'forgot' | 'skipped') => {
    if (answered && result !== 'skipped') return;
    setAnswered(true);
    onResult(result);
  };

  const handleNext = () => {
    setShowAnswer(false);
    setAnswered(false);
    onNext();
  };

  const hasChinese = /[\u4e00-\u9fff]/.test(chineseField);

  return (
    <div className="card p-6 md:p-8 animate-fade-in" key={card.id}>
      {/* Progress counter */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-ink-500 font-medium">{index + 1} из {total}</span>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-parchment-200 text-ink-500">
          {card.deckName}
        </span>
      </div>

      {/* Chinese field */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span
            className={`text-ink-900 ${hasChinese ? 'font-hanzi text-7xl' : 'font-serif text-4xl'}`}
            dangerouslySetInnerHTML={{ __html: sanitizeAnkiHtml(chineseField) }}
          />
          {hasChinese && (
            <button
              onClick={() => speak(chineseField)}
              className="w-10 h-10 rounded-full bg-gold-500 hover:bg-gold-600 text-ink-900 flex items-center justify-center transition-all hover:scale-110"
              title="Озвучить"
            >
              <Volume2 size={20} />
            </button>
          )}
        </div>
        {showAnswer && pinyinField && (
          <p className="text-xl font-serif text-crimson-600 mb-2 animate-slide-up">
            <span dangerouslySetInnerHTML={{ __html: sanitizeAnkiHtml(pinyinField) }} />
          </p>
        )}
        {showAnswer && translationField && (
          <p className="text-lg text-ink-700 mb-2 animate-slide-up">
            <span dangerouslySetInnerHTML={{ __html: sanitizeAnkiHtml(translationField) }} />
          </p>
        )}
      </div>

      {/* Extra fields */}
      {showAnswer && extraFields.length > 0 && (
        <div className="space-y-2 mb-6 animate-slide-up">
          {extraFields.map((field, i) => {
            if (!field.trim()) return null;
            const fieldName = card.fieldNames[i + 3] || `Поле ${i + 4}`;
            return (
              <div key={i} className="bg-parchment-50 rounded-lg p-3">
                <p className="text-xs text-ink-400 mb-1">{fieldName}</p>
                <p className="text-sm text-ink-700">
                  <span dangerouslySetInnerHTML={{ __html: sanitizeAnkiHtml(field) }} />
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tags */}
      {card.tags.length > 0 && showAnswer && (
        <div className="flex flex-wrap gap-1.5 justify-center mb-4">
          {card.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-crimson-50 text-crimson-600">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Show answer button */}
      {!showAnswer && (
        <button
          onClick={() => setShowAnswer(true)}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
        >
          Показать ответ
        </button>
      )}

      {/* Result buttons */}
      {showAnswer && !answered && (
        <div className="grid grid-cols-3 gap-3 animate-slide-up">
          <button
            onClick={() => handleResult('remembered')}
            className="flex flex-col items-center gap-1 py-4 rounded-xl bg-green-100 text-green-700 font-bold hover:bg-green-200 transition-all hover:scale-105"
          >
            <Check size={24} />
            <span className="text-sm">Запомнил</span>
          </button>
          <button
            onClick={() => handleResult('forgot')}
            className="flex flex-col items-center gap-1 py-4 rounded-xl bg-crimson-100 text-crimson-700 font-bold hover:bg-crimson-200 transition-all hover:scale-105"
          >
            <X size={24} />
            <span className="text-sm">Нужно повторить</span>
          </button>
          <button
            onClick={() => handleResult('skipped')}
            className="flex flex-col items-center gap-1 py-4 rounded-xl bg-parchment-200 text-ink-500 font-bold hover:bg-parchment-300 transition-all hover:scale-105"
          >
            <SkipForward size={24} />
            <span className="text-sm">Пропустить</span>
          </button>
        </div>
      )}

      {/* Next button after answer */}
      {answered && (
        <button
          onClick={handleNext}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2 animate-slide-up"
        >
          {isLast ? 'Завершить занятие' : 'Следующая карточка'}
          <ChevronRight size={18} />
        </button>
      )}
    </div>
  );
}
