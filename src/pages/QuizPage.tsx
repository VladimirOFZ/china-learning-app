import { useState, useMemo } from 'react';
import { Check, X, RotateCw, Trophy, Award, ChevronRight } from 'lucide-react';
import { quizData } from '@/data/quiz';
import type { UserProgress } from '@/hooks/useProgress';

interface QuizPageProps {
  progress: UserProgress;
  onRecordQuiz: (score: number, total: number, correct: number) => void;
}

type Phase = 'intro' | 'playing' | 'result';

export function QuizPage({ progress, onRecordQuiz }: QuizPageProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState(quizData);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const shuffledQuestions = useMemo(() => {
    return [...quizData].sort(() => Math.random() - 0.5).slice(0, 10);
  }, [phase === 'intro']);

  const startQuiz = () => {
    setQuestions(shuffledQuestions);
    setPhase('playing');
    setCurrentIdx(0);
    setSelectedIdx(null);
    setShowExplanation(false);
    setScore(0);
    setCorrectCount(0);
  };

  const handleSelect = (idx: number) => {
    if (showExplanation) return;
    setSelectedIdx(idx);
    setShowExplanation(true);
    const correct = idx === questions[currentIdx].correctIndex;
    if (correct) {
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) {
      onRecordQuiz(score, questions.length, correctCount);
      setPhase('result');
    } else {
      setCurrentIdx(i => i + 1);
      setSelectedIdx(null);
      setShowExplanation(false);
    }
  };

  const currentQ = questions[currentIdx];

  // Intro screen
  if (phase === 'intro') {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-crimson-600 to-crimson-800 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Trophy size={40} className="text-gold-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink-900 mb-2">Интерактивные тесты</h1>
          <p className="text-ink-500 text-lg">Проверьте свои знания китайского языка, культуры, истории и географии</p>
        </div>

        <div className="card p-8 mb-6">
          <h2 className="font-serif text-xl font-bold text-ink-900 mb-4">Правила теста</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-ink-700">
              <span className="w-6 h-6 rounded-full bg-crimson-100 text-crimson-600 flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
              Тест состоит из 10 случайных вопросов
            </li>
            <li className="flex items-start gap-3 text-ink-700">
              <span className="w-6 h-6 rounded-full bg-crimson-100 text-crimson-600 flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
              За каждый правильный ответ вы получаете 10 очков
            </li>
            <li className="flex items-start gap-3 text-ink-700">
              <span className="w-6 h-6 rounded-full bg-crimson-100 text-crimson-600 flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
              После выбора ответа показывается объяснение
            </li>
            <li className="flex items-start gap-3 text-ink-700">
              <span className="w-6 h-6 rounded-full bg-crimson-100 text-crimson-600 flex items-center justify-center font-bold text-sm flex-shrink-0">4</span>
              Ваш рекорд сохраняется автоматически
            </li>
          </ul>
        </div>

        {/* Previous stats */}
        {progress.quizCompleted > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card p-4 text-center">
              <Award size={24} className="text-gold-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-ink-900">{progress.quizHighScore}</p>
              <p className="text-xs text-ink-400">Рекорд</p>
            </div>
            <div className="card p-4 text-center">
              <Trophy size={24} className="text-crimson-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-ink-900">{progress.quizCompleted}</p>
              <p className="text-xs text-ink-400">Пройдено</p>
            </div>
            <div className="card p-4 text-center">
              <Check size={24} className="text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-ink-900">
                {progress.totalQuizAnswered > 0
                  ? Math.round((progress.totalCorrect / progress.totalQuizAnswered) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-ink-400">Точность</p>
            </div>
          </div>
        )}

        <button onClick={startQuiz} className="btn-primary w-full flex items-center justify-center gap-2 text-lg">
          Начать тест <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  // Result screen
  if (phase === 'result') {
    const maxScore = questions.length * 10;
    const percent = Math.round((score / maxScore) * 100);
    const isRecord = score >= progress.quizHighScore && score > 0;

    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
        <div className="card p-8 text-center animate-slide-up">
          <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${percent >= 70 ? 'bg-green-100' : percent >= 40 ? 'bg-gold-100' : 'bg-crimson-100'}`}>
            <Trophy size={48} className={percent >= 70 ? 'text-green-600' : percent >= 40 ? 'text-gold-600' : 'text-crimson-600'} />
          </div>

          <h1 className="font-serif text-3xl font-bold text-ink-900 mb-2">Тест завершён!</h1>
          <p className="text-ink-500 mb-6">Вы ответили правильно на {correctCount} из {questions.length} вопросов</p>

          {isRecord && (
            <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-700 px-4 py-2 rounded-full font-bold mb-6 animate-glow">
              <Award size={18} /> Новый рекорд!
            </div>
          )}

          <div className="bg-parchment-50 rounded-xl p-6 mb-6">
            <p className="text-5xl font-bold text-crimson-600 mb-2">{score}<span className="text-2xl text-ink-400">/{maxScore}</span></p>
            <p className="text-lg text-ink-600 font-medium">{percent}% правильных</p>
          </div>

          <div className="flex gap-3 justify-center">
            <button onClick={startQuiz} className="btn-primary flex items-center gap-2">
              <RotateCw size={18} /> Пройти заново
            </button>
            <button onClick={() => setPhase('intro')} className="btn-ghost">
              К началу
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-ink-600">Вопрос {currentIdx + 1} из {questions.length}</span>
          <span className="text-sm font-bold text-crimson-600">{score} очков</span>
        </div>
        <div className="h-2 bg-parchment-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-crimson-600 to-gold-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIdx + (showExplanation ? 1 : 0)) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="card p-6 md:p-8 animate-fade-in" key={currentIdx}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-crimson-100 text-crimson-700">
            {currentQ.category}
          </span>
        </div>

        <h2 className="font-serif text-xl md:text-2xl font-bold text-ink-900 mb-6">{currentQ.question}</h2>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedIdx === idx;
            const isCorrect = idx === currentQ.correctIndex;
            const showResult = showExplanation;

            let styles = 'border-parchment-300 bg-white hover:border-crimson-400 hover:bg-parchment-50';
            if (showResult && isCorrect) {
              styles = 'border-green-500 bg-green-50';
            } else if (showResult && isSelected && !isCorrect) {
              styles = 'border-crimson-600 bg-crimson-50';
            } else if (showResult) {
              styles = 'border-parchment-200 bg-white opacity-60';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all duration-200 flex items-center justify-between ${styles}`}
              >
                <span className="text-ink-800">{option}</span>
                {showResult && isCorrect && <Check size={22} className="text-green-600 flex-shrink-0" />}
                {showResult && isSelected && !isCorrect && <X size={22} className="text-crimson-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-6 bg-parchment-50 rounded-xl p-4 animate-slide-up">
            <h3 className="font-bold text-ink-900 mb-1">Объяснение</h3>
            <p className="text-ink-600 text-sm leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {showExplanation && (
          <button
            onClick={handleNext}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
          >
            {currentIdx + 1 >= questions.length ? 'Завершить тест' : 'Следующий вопрос'}
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
