import React, { memo, useMemo } from 'react';
import { CORE_VISUAL_SECTIONS, handleImageError } from '../utils/catalogUtils';

/**
 * CategoryVisualGrid renders an attractive visual grid of the store's primary baby categories
 * with dynamic resolution of custom names/images managed in store settings,
 * plus robust image error fallback handling.
 */
function CategoryVisualGrid({ 
  categories = [], 
  activeCategory = '', 
  onSelectCategory 
}) {
  // Dynamically resolve section title and imagery from categories state
  const visualCards = useMemo(() => {
    return CORE_VISUAL_SECTIONS.map((section) => {
      const foundCat = categories.find((c) => c.id === section.id);
      return {
        id: section.id,
        name: foundCat?.name || section.defaultName,
        image: foundCat?.image || section.defaultImage,
      };
    });
  }, [categories]);

  const handleCardClick = (categoryId) => {
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
  };

  return (
    <section className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 space-y-4 select-none">
      
      {/* Centered Heading with signature rose underline */}
      <div className="text-center space-y-1">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          الأقسام الرئيسية
        </h3>
        <div className="w-16 h-1 bg-[#DF7E93] rounded-full mx-auto mt-2" />
      </div>

      {/* Grid of Visual Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 pt-4">
        {visualCards.map((card) => {
          const isSelected = activeCategory === card.id;
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="group cursor-pointer flex flex-col items-center gap-2.5 transition-transform"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card.id);
                }
              }}
              title={`تصفحي كافة منتجات ${card.name}`}
            >
              {/* Rounded Image Container with hover zoom and error fallback */}
              <div 
                className={`relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-50 border transition-all duration-300 shadow-xs group-hover:shadow-md ${
                  isSelected 
                    ? 'border-[#DF7E93] ring-2 ring-pink-200 scale-[1.02]' 
                    : 'border-slate-200/70 hover:border-pink-200'
                }`}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Title Underneath the Image */}
              <span className={`text-xs sm:text-sm font-bold transition-colors text-center line-clamp-1 ${
                isSelected ? 'text-[#DF7E93]' : 'text-slate-800 group-hover:text-[#DF7E93]'
              }`}>
                {card.name}
              </span>
            </div>
          );
        })}
      </div>

    </section>
  );
}

export default memo(CategoryVisualGrid);
