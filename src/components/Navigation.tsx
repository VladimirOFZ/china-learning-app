import { Home, Languages, HelpCircle, Flame } from 'lucide-react';

export type PageId = 'dashboard' | 'language' | 'quiz';

interface NavigationProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  streak: number;
}

const navItems: { id: PageId; label: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Главная', icon: Home },
  { id: 'language', label: 'Язык', icon: Languages },
  { id: 'quiz', label: 'Тесты', icon: HelpCircle },
];

export function Navigation({ currentPage, onNavigate, streak }: NavigationProps) {
  return (
    <>
      {/* Desktop navigation */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-parchment-200">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-6 py-3">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-crimson-600 rounded-lg flex items-center justify-center">
              <span className="font-hanzi text-white text-xl font-bold">中</span>
            </div>
            <div className="text-left">
              <p className="font-serif font-bold text-ink-900 leading-tight">Открывая Китай</p>
              <p className="text-xs text-ink-400 leading-tight">Discover China</p>
            </div>
          </button>

          <div className="flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    active
                      ? 'bg-crimson-600 text-white'
                      : 'text-ink-600 hover:bg-parchment-100'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 bg-gold-100 px-3 py-2 rounded-lg">
            <Flame size={18} className="text-crimson-600" />
            <span className="font-bold text-ink-800">{streak}</span>
            <span className="text-sm text-ink-500">дн.</span>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-parchment-200 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                  active ? 'text-crimson-600' : 'text-ink-400'
                }`}
              >
                <Icon size={22} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-parchment-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-crimson-600 rounded-lg flex items-center justify-center">
            <span className="font-hanzi text-white text-base font-bold">中</span>
          </div>
          <p className="font-serif font-bold text-ink-900 text-sm">Открывая Китай</p>
        </div>
        <div className="flex items-center gap-1.5 bg-gold-100 px-2.5 py-1.5 rounded-lg">
          <Flame size={16} className="text-crimson-600" />
          <span className="font-bold text-ink-800 text-sm">{streak}</span>
        </div>
      </div>
    </>
  );
}
