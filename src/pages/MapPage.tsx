import { useState } from 'react';
import { MapPin, ChevronRight, Landmark } from 'lucide-react';
import { regionsData } from '@/data/regions';
import { Modal } from '@/components/Modal';

export function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const region = regionsData.find(r => r.id === selectedRegion);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-ink-900 mb-2">Интерактивная карта Китая</h1>
        <p className="text-ink-500">Нажмите на город, чтобы узнать о его достопримечательностях и фактах</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Map area */}
        <div className="lg:col-span-3">
          <div className="card p-6 relative">
            <div className="relative w-full" style={{ paddingBottom: '75%' }}>
              {/* Stylized China map background */}
              <div className="absolute inset-0 bg-gradient-to-br from-parchment-100 to-parchment-200 rounded-xl overflow-hidden">
                {/* Simplified China outline using SVG */}
                <svg
                  viewBox="0 0 100 75"
                  className="absolute inset-0 w-full h-full"
                  style={{ opacity: 0.15 }}
                >
                  <path
                    d="M 15,20 Q 20,10 35,8 Q 50,5 65,10 Q 80,12 85,20 Q 90,30 88,40 Q 85,50 80,58 Q 75,65 65,70 Q 50,73 35,70 Q 20,65 15,55 Q 10,40 15,20 Z"
                    fill="#C8102E"
                    stroke="#A50D24"
                    strokeWidth="0.5"
                  />
                </svg>

                {/* Region markers */}
                {regionsData.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRegion(r.id)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{ top: r.position.top, left: r.position.left }}
                  >
                    <div className={`relative flex flex-col items-center transition-all duration-300 ${
                      selectedRegion === r.id ? 'scale-125' : 'group-hover:scale-110'
                    }`}>
                      {/* Pulse ring */}
                      <div className={`absolute w-8 h-8 rounded-full ${selectedRegion === r.id ? 'bg-crimson-400' : 'bg-gold-400'} opacity-30 animate-ping`} />
                      {/* Marker */}
                      <div className={`relative w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                        selectedRegion === r.id ? 'bg-crimson-600' : 'bg-gold-500'
                      }`}>
                        <MapPin size={12} className="text-white" />
                      </div>
                      {/* Label */}
                      <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-0.5 rounded shadow-sm border border-parchment-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-xs font-bold text-ink-800">{r.name}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <p className="text-center text-xs text-ink-400 mt-4">
              Схематическая карта. Нажмите на маркер для просмотра информации о регионе.
            </p>
          </div>
        </div>

        {/* Region list */}
        <div className="lg:col-span-2">
          <h2 className="font-serif text-lg font-bold text-ink-900 mb-4">Регионы и города</h2>
          <div className="space-y-3">
            {regionsData.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`card w-full p-4 text-left transition-all ${
                  selectedRegion === r.id ? 'border-crimson-600 shadow-md' : 'card-hover'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-crimson-100 flex items-center justify-center font-hanzi text-xl text-crimson-600">
                      {r.chineseName}
                    </div>
                    <div>
                      <p className="font-bold text-ink-900">{r.name}</p>
                      <p className="text-sm text-crimson-600">{r.pinyin}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-ink-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Region modal */}
      <Modal
        isOpen={!!region}
        onClose={() => setSelectedRegion(null)}
        title={region ? `${region.name} (${region.chineseName})` : ''}
      >
        {region && (
          <div className="space-y-6">
            <div>
              <p className="text-crimson-600 font-serif text-lg mb-2">{region.pinyin}</p>
              <p className="text-ink-700 leading-relaxed">{region.description}</p>
            </div>

            {/* Landmarks */}
            <div>
              <h3 className="font-serif font-bold text-ink-900 mb-3 flex items-center gap-2">
                <Landmark size={20} className="text-crimson-600" /> Достопримечательности
              </h3>
              <div className="space-y-4">
                {region.landmarks.map((lm, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden border border-parchment-200">
                    <img src={lm.imageUrl} alt={lm.name} className="w-full h-48 object-cover" loading="lazy" />
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-ink-900">{lm.name}</h4>
                        <span className="font-hanzi text-lg text-crimson-600">{lm.chineseName}</span>
                      </div>
                      <p className="text-sm text-ink-600">{lm.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Facts */}
            <div>
              <h3 className="font-serif font-bold text-ink-900 mb-3">Интересные факты</h3>
              <ul className="space-y-2">
                {region.facts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-2 text-ink-700">
                    <span className="text-gold-600 font-bold mt-0.5">•</span>
                    {fact}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
