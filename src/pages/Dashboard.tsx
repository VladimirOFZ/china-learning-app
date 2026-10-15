import { Flame, TrendingUp, BookOpen, BookMarked, Trophy, Sparkles, ChevronRight, Calendar } from 'lucide-react';
import { hanziData, dailyFacts } from '@/data/hanzi';
import { AudioButton } from '@/components/AudioButton';
import type { UserProgress } from '@/hooks/useProgress';
import type { PageId } from '@/components/Navigation';

interface DashboardProps {
  progress: UserProgress;
  onNavigate: (page: PageId) => void;
}

export function Dashboard({ progress, onNavigate }: DashboardProps) {
  const dayIndex = new Date().getDate() % dailyFacts.length;
  const todayFact = dailyFacts[dayIndex];

  const hanziIndex = new Date().getDate() % hanziData.length;
  const todayHanzi = hanziData[hanziIndex];

  const masteredCount = progress.masteredHanzi.length;
  const totalHanzi = hanziData.length;
  const masteryPercent = Math.round((masteredCount / totalHanzi) * 100);

  const accuracy = progress.totalQuizAnswered > 0
    ? Math.round((progress.totalCorrect / progress.totalQuizAnswered) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-crimson-700 via-crimson-600 to-crimson-800 p-8 md:p-12 mb-8 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/20 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/10 rounded-full blur-2xl -ml-16 -mb-16" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} className="text-gold-400" />
            <span className="text-gold-300 font-medium text-sm">Добро пожаловать</span>
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-white mb-3">
            Открывая Китай
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Ваш интерактивный путеводитель по китайскому языку, культуре, истории и географии. Учите иероглифы, изучайте регионы и проходите тесты.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button onClick={() => onNavigate('language')} className="btn-gold flex items-center gap-2">
              <BookOpen size={18} /> Начать изучение
            </button>
            <button onClick={() => onNavigate('dictionary')} className="bg-white/15 hover:bg-white/25 text-white border border-white/30 px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2">
              <BookMarked size={18} /> Словарь
            </button>
            <button onClick={() => onNavigate('quiz')} className="bg-white/15 hover:bg-white/25 text-white border border-white/30 px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2">
              <Trophy size={18} /> Пройти тест
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-crimson-100 flex items-center justify-center">
            <Flame size={24} className="text-crimson-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-ink-900">{progress.streak}</p>
            <p className="text-sm text-ink-400">Дней подряд</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-100 flex items-center justify-center">
            <BookOpen size={24} className="text-gold-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-ink-900">{masteredCount}<span className="text-lg text-ink-400">/{totalHanzi}</span></p>
            <p className="text-sm text-ink-400">Выучено иероглифов</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <Trophy size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-ink-900">{progress.quizHighScore}</p>
            <p className="text-sm text-ink-400">Рекорд в тесте</p>
          </div>
        </div>

        <div className="card p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <TrendingUp size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-ink-900">{accuracy}%</p>
            <p className="text-sm text-ink-400">Точность ответов</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Hanzi of the day */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-crimson-600 flex items-center justify-center">
                <span className="font-hanzi text-white text-sm font-bold">字</span>
              </div>
              <h2 className="font-serif text-xl font-bold text-ink-900">Иероглиф дня</h2>
            </div>
            <AudioButton text={todayHanzi.hanzi} size="md" />
          </div>

          <div className="bg-parchment-50 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-3">
              <span className="font-hanzi text-7xl text-ink-900 select-none">{todayHanzi.hanzi}</span>
            </div>
            <p className="text-xl font-serif text-crimson-600 mb-2">{todayHanzi.pinyin}</p>
            <div className="flex justify-center gap-1.5 mb-3">
              {[1, 2, 3, 4].map(t => (
                <span key={t} className={`w-7 h-7 rounded-full text-xs flex items-center justify-center font-bold ${
                  t === todayHanzi.tone ? 'bg-crimson-600 text-white' : 'bg-parchment-200 text-ink-300'
                }`}>
                  {t}
                </span>
              ))}
            </div>
            <p className="text-ink-700">{todayHanzi.translation}</p>
            <span className="inline-block mt-3 text-xs font-bold px-3 py-1 rounded-full bg-crimson-100 text-crimson-700">
              HSK {todayHanzi.hskLevel}
            </span>
          </div>

          <button
            onClick={() => onNavigate('language')}
            className="mt-4 flex items-center justify-center w-full text-crimson-600 font-medium hover:text-crimson-700 transition-colors"
          >
            Перейти к изучению <ChevronRight size={18} />
          </button>
        </div>

        {/* Fact of the day */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gold-500 flex items-center justify-center">
              <Calendar size={18} className="text-ink-900" />
            </div>
            <h2 className="font-serif text-xl font-bold text-ink-900">Факт дня</h2>
          </div>

          <div className="bg-gradient-to-br from-gold-50 to-parchment-100 rounded-xl p-6">
            <div className="text-4xl mb-3 font-hanzi text-gold-600">知</div>
            <p className="text-ink-700 leading-relaxed text-lg">
              {todayFact.fact}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg font-bold text-ink-900">Ваш прогресс изучения</h2>
          <span className="text-sm font-bold text-crimson-600">{masteryPercent}%</span>
        </div>
        <div className="h-4 bg-parchment-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-crimson-600 to-gold-500 rounded-full transition-all duration-500"
            style={{ width: `${masteryPercent}%` }}
          />
        </div>
        <p className="text-sm text-ink-400 mt-2">
          Выучено {masteredCount} из {totalHanzi} иероглифов. Продолжайте в том же духе!
        </p>
      </div>
    </div>
  );
}
