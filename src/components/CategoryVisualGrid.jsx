import React from 'react';

export default function CategoryVisualGrid({ categories = [], activeCategory, onSelectCategory }) {
  // Dynamic mapping: takes the 8 core sections defined in the store / home page
  const coreSections = [
    {
      id: 'hospital-sets',
      defaultName: 'أطقم الاستقبال الملكية',
      defaultImage: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'custom-embroidery',
      defaultName: 'تفصيل حسب الطلب',
      defaultImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'swaddles',
      defaultName: 'مهادات المواليد',
      defaultImage: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'moses-baskets',
      defaultName: 'سلال موسى',
      defaultImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'heritage-clothes',
      defaultName: 'الملابس التراثية (سديري وثوب)',
      defaultImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'strollers-cribs',
      defaultName: 'سرائر وعربات الأطفال',
      defaultImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'play-mats',
      defaultName: 'مفارش اللعب والمهادات',
      defaultImage: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'baby-clothes',
      defaultName: 'ملابس المواليد والأزياء',
      defaultImage: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=1200&q=80',
    }
  ];

  // Dynamically resolve name and image from categories state (reflects changes made in store/admin)
  const visualCards = coreSections.map((item) => {
    const foundCat = categories.find((c) => c.id === item.id);
    return {
      id: item.id,
      name: foundCat?.name || item.defaultName,
      image: foundCat?.image || item.defaultImage,
    };
  });

  return (
    <section className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Title Centered with Tefly Underline Bar */}
      <div className="text-center space-y-1">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          الأقسام الرئيسية
        </h3>
        {/* Tefly Signature Centered Solid Bar */}
        <div className="w-16 h-1 bg-[#DF7E93] rounded-full mx-auto mt-2" />
      </div>

      {/* Grid of Visual Category Photo Cards (Matching Tefly Screenshot Exactly) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6 pt-4">
        {visualCards.map((card) => {
          const isSelected = activeCategory === card.id;
          return (
            <div
              key={card.id}
              onClick={() => onSelectCategory(card.id)}
              className="group cursor-pointer flex flex-col items-center gap-2.5 transition-transform"
            >
              {/* Rounded 2XL Image Container */}
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
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Clean Typography Title Underneath the Image */}
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
