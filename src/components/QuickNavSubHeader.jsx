import React from 'react';
import { Tag, Sparkles } from 'lucide-react';

export default function QuickNavSubHeader({ categories, activeCategory, onSelectCategory }) {
  return (
    <div className="sticky top-[64px] sm:top-[80px] z-30 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] w-full overflow-hidden transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-2.5 scrollbar-none">
          
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            const isOffers = cat.id === 'offers';

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-xs scale-[1.03]'
                    : isOffers
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                    : 'bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-brand-600 border border-slate-200/80 hover:border-pink-200'
                }`}
              >
                {isOffers && <Tag className="w-3 h-3 text-rose-500 shrink-0" />}
                <span>{cat.name}</span>
              </button>
            );
          })}

        </div>
      </div>
    </div>
  );
}

