import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import type { PageId } from '@/components/Navigation';
import { Dashboard } from '@/pages/Dashboard';
import { LanguageHub } from '@/pages/LanguageHub';
import { MapPage } from '@/pages/MapPage';
import { CulturePage } from '@/pages/CulturePage';
import { QuizPage } from '@/pages/QuizPage';
import { useProgress } from '@/hooks/useProgress';

function App() {
  const [page, setPage] = useState<PageId>('dashboard');
  const { progress, toggleMastered, recordQuiz } = useProgress();

  return (
    <div className="min-h-screen bg-parchment-50">
      <Navigation currentPage={page} onNavigate={setPage} streak={progress.streak} />

      <main>
        {page === 'dashboard' && <Dashboard progress={progress} onNavigate={setPage} />}
        {page === 'language' && (
          <LanguageHub progress={progress} onToggleMastered={toggleMastered} />
        )}
        {page === 'map' && <MapPage />}
        {page === 'culture' && <CulturePage />}
        {page === 'quiz' && <QuizPage progress={progress} onRecordQuiz={recordQuiz} />}
      </main>

      {/* Footer */}
      <footer className="bg-ink-900 text-ink-200 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-crimson-600 rounded-lg flex items-center justify-center">
              <span className="font-hanzi text-white text-sm font-bold">中</span>
            </div>
            <p className="font-serif text-sm">Открывая Китай — интерактивный портал</p>
          </div>
          <p className="text-xs text-ink-400">
            Учите китайский язык, изучайте культуру и историю
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
