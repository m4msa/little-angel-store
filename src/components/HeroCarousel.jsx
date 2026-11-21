import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function HeroCarousel({ onExploreClick }) {
  const slides = [
    {
      id: 1,
      badge: 'دفء ونعومة البداية',
      title: 'ملابس ناعمة تعانق بشرة طفلك بحب',
      subtitle: 'أرقى تشكيلات أطقم المواليد القطنية العضوية، فائقة النعومة ولطيفة على بشرة صغيرك.',
      buttonText: 'تسوقي الآن',
      image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=1200&q=80',
      category: 'baby-clothes'
    },
    {
      id: 2,
      badge: 'تفصيل وتطريز حسب الطلب',
      title: 'أطقم استقبال واستقبال مستشفى مطرزة بالاسم',
      subtitle: 'ميزي قدوم ملاكك الصغير بأطقم ملكية راقية مطرزة باسمه بأجود خيوط الحرير والذهب.',
      buttonText: 'اكتشفي تصاميم التطريز',
      image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=80',
      category: 'hospital-sets'
    },
    {
      id: 3,
      badge: 'راحة وأمان في كل خطوة',
      title: 'سرائر وعربات أطفال مدمجة ومحمولة',
      subtitle: 'تصاميم خفيفة وقابلة للطي مع مراتب طبية وناموسية حماية لنوم عميق وهادئ.',
      buttonText: 'تصفحي مستلزمات التنقل',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      category: 'strollers-cribs'
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragStartX, setDragStartX] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isDragging) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length, isDragging]);

  const handleDragStart = (clientX) => {
    setDragStartX(clientX);
    setIsDragging(true);
  };

  const handleDragEnd = (clientX) => {
    if (dragStartX === null || !isDragging) return;
    const diff = clientX - dragStartX;
    if (diff > 45) {
      // Swiped right (in RTL -> previous)
      setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
    } else if (diff < -45) {
      // Swiped left (in RTL -> next)
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }
    setDragStartX(null);
    setIsDragging(false);
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-pink-50/40 via-white to-slate-50 pt-2 pb-4 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Slide Frame with Soft Curves and Pure Drag/Swipe (No Arrows) */}
        <div 
          className="relative rounded-3xl overflow-hidden shadow-sm border border-pink-100 min-h-[320px] sm:min-h-[400px] lg:min-h-[450px] flex items-center bg-white cursor-grab active:cursor-grabbing"
          onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
          onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientX)}
          onMouseDown={(e) => handleDragStart(e.clientX)}
          onMouseUp={(e) => handleDragEnd(e.clientX)}
          onMouseLeave={() => {
            if (isDragging) {
              setIsDragging(false);
              setDragStartX(null);
            }
          }}
        >
          
          {/* Background Image with Gentle Gradient Overlay */}
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 scale-100 pointer-events-none select-none"
            draggable="false"
          />
          {/* Elegant soft gradient so text is razor-sharp */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/40 to-transparent pointer-events-none select-none" />

          {/* Slide Content */}
          <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-xl text-white space-y-3 sm:space-y-4">
            
            <div className="inline-flex items-center gap-1.5 bg-[#A32E45] text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-sm">
              <span>{slide.badge}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight drop-shadow-sm tracking-tight">
              {slide.title}
            </h2>

            <p className="text-xs sm:text-sm text-pink-50 leading-relaxed max-w-md font-medium drop-shadow-xs">
              {slide.subtitle}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onExploreClick(slide.category)}
                className="bg-[#A32E45] hover:bg-[#8F2338] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md shadow-slate-950/40 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <span>{slide.buttonText}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Pagination Indicators with Accessible 28x28px Touch Target Area */}
          <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center items-center gap-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className="min-w-[28px] min-h-[28px] flex items-center justify-center p-1 rounded-full transition-transform active:scale-90"
                aria-label={`الانتقال إلى الشريحة ${idx + 1}`}
              >
                <span
                  className={`h-2 rounded-full transition-all duration-300 block ${
                    currentSlide === idx ? 'w-8 bg-[#A32E45] shadow-xs ring-1 ring-white/80' : 'w-2.5 bg-white/70 hover:bg-white'
                  }`}
                />
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
