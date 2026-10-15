import { useState, useMemo } from 'react';
import { Search, BookMarked, CheckCircle2, Circle, Plus, FolderPlus, Trash2, Folder, Zap, X } from 'lucide-react';
import { hanziData } from '@/data/hanzi';
import type { Hanzi } from '@/data/hanzi';
import { AudioButton } from '@/components/AudioButton';
import { Modal } from '@/components/Modal';
import type { UserProgress, WordGroup } from '@/hooks/useProgress';
import type { PageId } from '@/components/Navigation';

interface DictionaryPageProps {
  progress: UserProgress;
  onToggleMastered: (id: string) => void;
  onCreateWordGroup: (name: string) => string;
  onDeleteWordGroup: (groupId: string) => void;
  onRenameWordGroup: (groupId: string, name: string) => void;
  onToggleWordInGroup: (groupId: string, hanziId: string) => void;
  onNavigate: (page: PageId) => void;
}

export function DictionaryPage({
  progress,
  onToggleMastered,
  onCreateWordGroup,
  onDeleteWordGroup,
  onToggleWordInGroup,
  onNavigate,
}: DictionaryPageProps) {
  const [search, setSearch] = useState('');
  const [hskFilter, setHskFilter] = useState<1 | 2 | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedHanzi, setSelectedHanzi] = useState<Hanzi | null>(null);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState('');

  const categories = useMemo(() => {
    const set = new Set(hanziData.map(h => h.category));
    return ['all', ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return hanziData.filter(h => {
      if (hskFilter !== 'all' && h.hskLevel !== hskFilter) return false;
      if (categoryFilter !== 'all' && h.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        h.hanzi.includes(q) ||
        h.pinyin.toLowerCase().includes(q) ||
        h.translation.toLowerCase().includes(q) ||
        h.category.toLowerCase().includes(q)
      );
    });
  }, [search, hskFilter, categoryFilter]);

  const activeGroup = progress.wordGroups.find(g => g.id === activeGroupId) ?? null;

  const handleCreateGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    const id = onCreateWordGroup(name);
    setActiveGroupId(id);
    setNewGroupName('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center">
            <BookMarked size={22} className="text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink-900">Словарь</h1>
        </div>
        <p className="text-ink-500">
          Полный список иероглифов с переводом, пиньинем и примерами. Поиск по слову, переводу или категории.
        </p>
      </div>

      {/* My groups bar */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Folder size={20} className="text-crimson-600" />
            <h2 className="font-serif text-lg font-bold text-ink-900">Мои группы</h2>
            {progress.wordGroups.length > 0 && (
              <span className="text-sm text-ink-400">({progress.wordGroups.length})</span>
            )}
          </div>
          <button
            onClick={() => setShowGroupPanel(s => !s)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-crimson-600 text-white text-sm font-medium hover:bg-crimson-700 transition-all"
          >
            <FolderPlus size={16} /> Создать группу
          </button>
        </div>

        {showGroupPanel && (
          <div className="flex gap-2 mb-4 animate-slide-up">
            <input
              type="text"
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreateGroup(); }}
              placeholder="Название группы (например: «Сложные слова»)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-parchment-300 bg-white text-ink-800 placeholder:text-ink-300 focus:outline-none focus:border-crimson-500 focus:ring-2 focus:ring-crimson-200 transition-all"
            />
            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              className="px-5 py-2.5 rounded-xl bg-crimson-600 text-white font-medium hover:bg-crimson-700 transition-all disabled:opacity-50"
            >
              Создать
            </button>
          </div>
        )}

        {progress.wordGroups.length === 0 && !showGroupPanel ? (
          <p className="text-sm text-ink-400">
            Создайте группу, добавьте в неё слова из словаря и запустите «штурм» — интенсивное изучение выбранных слов.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {progress.wordGroups.map(group => {
              const isActive = activeGroupId === group.id;
              return (
                <div
                  key={group.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'border-crimson-500 bg-crimson-50'
                      : 'border-parchment-300 bg-white hover:bg-parchment-100'
                  }`}
                  onClick={() => setActiveGroupId(isActive ? null : group.id)}
                >
                  <Folder size={16} className={isActive ? 'text-crimson-600' : 'text-ink-400'} />
                  <span className="text-sm font-medium text-ink-700">{group.name}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-parchment-200 text-ink-500">
                    {group.hanziIds.length}
                  </span>
                  {group.hanziIds.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('language');
                      }}
                      className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-gold-400 text-ink-900 hover:bg-gold-500 transition-all"
                      title="Штурм этой группы"
                    >
                      <Zap size={12} /> Штурм
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Удалить группу «${group.name}»?`)) {
                        onDeleteWordGroup(group.id);
                        if (isActive) setActiveGroupId(null);
                      }
                    }}
                    className="text-ink-300 hover:text-crimson-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search bar */}
      <div className="card p-4 mb-6">
        <div className="relative mb-4">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск: иероглиф, пиньинь, перевод, категория…"
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-parchment-300 bg-white text-ink-800 placeholder:text-ink-300 focus:outline-none focus:border-crimson-500 focus:ring-2 focus:ring-crimson-200 transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {/* HSK filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-ink-500 font-medium">HSK:</span>
            {([1, 2, 'all'] as const).map(level => (
              <button
                key={level}
                onClick={() => setHskFilter(level)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  hskFilter === level
                    ? 'bg-crimson-600 text-white'
                    : 'bg-white border border-parchment-300 text-ink-600 hover:bg-parchment-100'
                }`}
              >
                {level === 'all' ? 'Все' : `HSK ${level}`}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-ink-500 font-medium">Категория:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  categoryFilter === cat
                    ? 'bg-crimson-600 text-white'
                    : 'bg-white border border-parchment-300 text-ink-600 hover:bg-parchment-100'
                }`}
              >
                {cat === 'all' ? 'Все' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-500">
          Найдено: <span className="font-bold text-ink-800">{filtered.length}</span> из {hanziData.length}
        </p>
        <p className="text-sm text-ink-500">
          Выучено: <span className="font-bold text-crimson-600">{progress.masteredHanzi.length}</span> / {hanziData.length}
        </p>
      </div>

      {/* Active group banner */}
      {activeGroup && (
        <div className="card p-4 mb-4 flex items-center justify-between bg-crimson-50 border-crimson-200">
          <div className="flex items-center gap-2">
            <Folder size={18} className="text-crimson-600" />
            <span className="font-medium text-ink-800">
              Добавление в группу «{activeGroup.name}» — нажмите на слово, чтобы добавить или убрать
            </span>
          </div>
          <button
            onClick={() => setActiveGroupId(null)}
            className="text-ink-400 hover:text-crimson-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Grid of cards */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Search size={48} className="text-ink-300 mx-auto mb-4" />
          <p className="text-ink-500 text-lg">Ничего не найдено</p>
          <p className="text-ink-400 text-sm mt-1">Попробуйте изменить запрос или фильтры</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(h => {
            const isMastered = progress.masteredHanzi.includes(h.id);
            const inActiveGroup = activeGroup?.hanziIds.includes(h.id) ?? false;
            return (
              <button
                key={h.id}
                onClick={() => {
                  if (activeGroup) {
                    onToggleWordInGroup(activeGroup.id, h.id);
                  } else {
                    setSelectedHanzi(h);
                  }
                }}
                className={`card p-5 text-left card-hover group transition-all ${
                  inActiveGroup ? 'ring-2 ring-crimson-400' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="font-hanzi text-5xl text-ink-900 group-hover:text-crimson-600 transition-colors">
                    {h.hanzi}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {inActiveGroup && (
                      <span className="w-6 h-6 rounded-full bg-crimson-600 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-white" />
                      </span>
                    )}
                    {isMastered ? (
                      <CheckCircle2 size={22} className="text-green-500" />
                    ) : (
                      <Circle size={22} className="text-parchment-300" />
                    )}
                  </div>
                </div>
                <p className="font-serif text-lg text-crimson-600 mb-1">{h.pinyin}</p>
                <p className="text-ink-700 text-sm mb-3 line-clamp-2">{h.translation}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-crimson-100 text-crimson-700">
                    HSK {h.hskLevel}
                  </span>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-parchment-100 text-ink-500">
                    {h.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      <Modal
        isOpen={selectedHanzi !== null}
        onClose={() => setSelectedHanzi(null)}
        title="Карточка иероглифа"
      >
        {selectedHanzi && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <span className="font-hanzi text-7xl text-ink-900">{selectedHanzi.hanzi}</span>
                <AudioButton text={selectedHanzi.hanzi} size="lg" />
              </div>
              <button
                onClick={() => onToggleMastered(selectedHanzi.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  progress.masteredHanzi.includes(selectedHanzi.id)
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-crimson-100 text-crimson-700 hover:bg-crimson-200'
                }`}
              >
                {progress.masteredHanzi.includes(selectedHanzi.id) ? (
                  <><CheckCircle2 size={18} /> Выучено</>
                ) : (
                  <><Circle size={18} /> Отметить выученным</>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-parchment-100 rounded-xl p-4">
                <p className="text-xs text-ink-400 mb-1">Пиньинь</p>
                <p className="font-serif text-xl text-crimson-600">{selectedHanzi.pinyin}</p>
              </div>
              <div className="bg-parchment-100 rounded-xl p-4">
                <p className="text-xs text-ink-400 mb-1">Тон</p>
                <p className="font-serif text-xl text-ink-800">{selectedHanzi.tone} тон</p>
              </div>
              <div className="bg-parchment-100 rounded-xl p-4">
                <p className="text-xs text-ink-400 mb-1">Уровень</p>
                <p className="font-serif text-xl text-ink-800">HSK {selectedHanzi.hskLevel}</p>
              </div>
              <div className="bg-parchment-100 rounded-xl p-4">
                <p className="text-xs text-ink-400 mb-1">Категория</p>
                <p className="font-serif text-xl text-ink-800">{selectedHanzi.category}</p>
              </div>
            </div>

            <div className="bg-parchment-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-ink-400 mb-1">Перевод</p>
              <p className="text-lg text-ink-800">{selectedHanzi.translation}</p>
            </div>

            {/* Add to group in modal */}
            {progress.wordGroups.length > 0 && (
              <div className="mb-6">
                <h3 className="font-serif text-sm font-bold text-ink-900 mb-2">Добавить в группу</h3>
                <div className="flex flex-wrap gap-2">
                  {progress.wordGroups.map(group => {
                    const inGroup = group.hanziIds.includes(selectedHanzi.id);
                    return (
                      <button
                        key={group.id}
                        onClick={() => onToggleWordInGroup(group.id, selectedHanzi.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          inGroup
                            ? 'bg-crimson-600 text-white'
                            : 'bg-white border border-parchment-300 text-ink-600 hover:bg-parchment-100'
                        }`}
                      >
                        {inGroup ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                        {group.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-serif text-lg font-bold text-ink-900 mb-3">Примеры употребления</h3>
              <div className="space-y-3">
                {selectedHanzi.examples.map((ex, i) => (
                  <div key={i} className="card p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-hanzi text-xl text-ink-900 mb-1">{ex.chinese}</p>
                      <p className="text-sm font-serif text-crimson-600 mb-1">{ex.pinyin}</p>
                      <p className="text-sm text-ink-600">{ex.translation}</p>
                    </div>
                    <AudioButton text={ex.chinese} size="md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
