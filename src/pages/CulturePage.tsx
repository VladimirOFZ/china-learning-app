import { useState } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { cultureData } from '@/data/culture';
import { Modal } from '@/components/Modal';

export function CulturePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const article = cultureData.find(a => a.id === selectedId);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-ink-900 mb-2">Культура, традиции и история</h1>
        <p className="text-ink-500">Иллюстрированные статьи о праздниках, чайной церемонии, каллиграфии и многом другом</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {cultureData.map(article => (
          <button
            key={article.id}
            onClick={() => setSelectedId(article.id)}
            className="card card-hover overflow-hidden text-left group"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h2 className="font-serif text-xl font-bold text-white mb-1">{article.title}</h2>
                <p className="text-white/80 text-sm">{article.subtitle}</p>
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-crimson-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={20} className="text-white" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <Modal
        isOpen={!!article}
        onClose={() => setSelectedId(null)}
        title={article?.title}
      >
        {article && (
          <div className="space-y-6">
            <img src={article.imageUrl} alt={article.title} className="w-full h-64 object-cover rounded-xl" />
            <p className="text-ink-500 italic">{article.subtitle}</p>

            {article.content.map((section, i) => (
              <div key={i}>
                <h3 className="font-serif text-lg font-bold text-crimson-600 mb-2">{section.heading}</h3>
                <p className="text-ink-700 leading-relaxed">{section.text}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
