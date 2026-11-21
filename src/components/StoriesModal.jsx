import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ArrowLeft, ShoppingBag } from 'lucide-react';

const defaultStoriesList = [
  {
    id: 'custom-embroidery',
    title: 'تفصيل حسب الطلب',
    subtitle: 'أطقم استقبال ومهادات ملكية مع تطريز اسم المولود بأرقى الخيوط الحريرية والذهبية مجاناً',
    tag: 'تفصيل حسب الطلب',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    actionText: 'تسوقي تفصيل حسب الطلب',
    categoryId: 'custom-embroidery'
  },
  {
    id: 'strollers-cribs',
    title: 'سرائر وعربات الأطفال',
    subtitle: 'سرائر أطفال هزازة، عربات مدمجة وسلال موسى مريحة لنوم هادئ وعميق لصغيرك',
    tag: 'سرائر وعربات الأطفال',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    actionText: 'تسوقي قسم سرائر الأطفال',
    categoryId: 'strollers-cribs'
  },
  {
    id: 'play-mats',
    title: 'مفارش اللعب والمهادات',
    subtitle: 'مهادات قطن موسلين مسامية نقية ومفارش ألعاب تفاعلية تحفز حواس الرضيع',
    tag: 'مفارش اللعب والمهادات',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=80',
    video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    actionText: 'تسوقي مفارش اللعب والمهادات',
    categoryId: 'play-mats'
  },
  {
    id: 'baby-clothes',
    title: 'ملابس المواليد والأزياء التراثية',
    subtitle: 'أفارولات قطنية عضوية فائقة النعومة وسديريات نجدية ملكية مطرزة بالاسم',
    tag: 'ملابس المواليد والأزياء التراثية',
    image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=1200&q=80',
    video: 'https://vjs.zencdn.net/v/oceans.mp4',
    actionText: 'تسوقي ملابس المواليد والتراث',
    categoryId: 'baby-clothes'
  }
];

export default function StoriesModal({
  isOpen,
  onClose,
  initialStoryIndex = 0,
  stories: propStories,
  onSelectCategory,
  onAddToCart,
  onOpenCart
}) {
  const stories = (propStories && propStories.length > 0) ? propStories : defaultStoriesList;

  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const videoRef = useRef(null);
  const activeBarRef = useRef(null);

  // Sync with initialStoryIndex when opened
  useEffect(() => {
    if (isOpen) {
      const validIndex = Math.min(Math.max(0, initialStoryIndex), Math.max(0, stories.length - 1));
      setCurrentIndex(validIndex);
      setActiveVideoIndex(0);
      if (activeBarRef.current) activeBarRef.current.style.width = '0%';
    }
  }, [isOpen, initialStoryIndex, stories.length]);

  // Reset active video index when changing stories
  useEffect(() => {
    setActiveVideoIndex(0);
    if (activeBarRef.current) activeBarRef.current.style.width = '0%';
  }, [currentIndex]);

  // Reset active bar when changing video within same story
  useEffect(() => {
    if (activeBarRef.current) activeBarRef.current.style.width = '0%';
  }, [activeVideoIndex]);

  // Lock body scroll only when modal is active, and ensure it always restores
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow || '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const currentStory = stories[currentIndex] || stories[0] || {};
  const videoProducts = (currentStory?.videoProducts && currentStory.videoProducts.length > 0)
    ? currentStory.videoProducts
    : (currentStory?.video ? [{
        id: currentStory.id,
        name: currentStory.title,
        video: currentStory.video,
        image: currentStory.image,
        description: currentStory.subtitle
      }] : [{
        id: currentStory.id || 'single',
        name: currentStory.title,
        image: currentStory.image,
        description: currentStory.subtitle
      }]);

  const currentProduct = videoProducts[activeVideoIndex] || videoProducts[0] || {};
  const currentVideoSrc = currentProduct?.video || currentStory?.video;

  const handleNext = () => {
    if (activeBarRef.current) activeBarRef.current.style.width = '0%';
    if (activeVideoIndex < videoProducts.length - 1) {
      setActiveVideoIndex((v) => v + 1);
    } else if (currentIndex < stories.length - 1) {
      setCurrentIndex((c) => c + 1);
      setActiveVideoIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (activeBarRef.current) activeBarRef.current.style.width = '0%';
    if (activeVideoIndex > 0) {
      setActiveVideoIndex((v) => v - 1);
    } else if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
      setActiveVideoIndex(0);
    }
  };

  // Silky smooth 60fps / 120fps direct DOM progress tracking without stutter or jumps
  useEffect(() => {
    if (!isOpen || !stories.length) return;

    if (activeBarRef.current) {
      activeBarRef.current.style.width = '0%';
    }

    let animId;

    if (currentVideoSrc) {
      // 60fps direct hardware-synchronized video tracking
      const syncWithVideo = () => {
        const vid = videoRef.current;
        const bar = activeBarRef.current;
        if (vid && vid.duration && bar) {
          const pct = Math.min(100, Math.max(0, (vid.currentTime / vid.duration) * 100));
          bar.style.width = `${pct}%`;
        }
        animId = requestAnimationFrame(syncWithVideo);
      };
      animId = requestAnimationFrame(syncWithVideo);
    } else {
      // 60fps smooth 5-second progress for image slides
      const startTime = performance.now();
      const duration = 5000;
      const syncWithImage = (now) => {
        const elapsed = now - startTime;
        const pct = Math.min(100, (elapsed / duration) * 100);
        if (activeBarRef.current) {
          activeBarRef.current.style.width = `${pct}%`;
        }
        if (elapsed >= duration) {
          handleNext();
        } else {
          animId = requestAnimationFrame(syncWithImage);
        }
      };
      animId = requestAnimationFrame(syncWithImage);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isOpen, currentIndex, activeVideoIndex, currentVideoSrc, videoProducts.length, stories.length]);

  const [dragOffsetY, setDragOffsetY] = useState(0);

  const onTouchStartHandler = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const onTouchMoveHandler = (e) => {
    if (touchStartY !== null) {
      const currentY = e.touches[0].clientY;
      const diffY = currentY - touchStartY;
      const currentX = e.touches[0].clientX;
      const diffX = touchStartX !== null ? Math.abs(currentX - touchStartX) : 0;

      // Allow smooth pull-down gesture to dismiss
      if (diffY > 0 && diffY > diffX) {
        setDragOffsetY(diffY);
        if (e.cancelable) e.preventDefault();
      }
    }
  };

  const onTouchEndHandler = (e) => {
    if (touchStartX === null || touchStartY === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;

    // Swipe down to dismiss story
    if (diffY > 70 && diffY > Math.abs(diffX)) {
      setDragOffsetY(0);
      setTouchStartX(null);
      setTouchStartY(null);
      onClose();
      return;
    }

    setDragOffsetY(0);

    // Horizontal swipe for next / prev story
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 45) {
        handlePrev();
      } else if (diffX < -45) {
        handleNext();
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  if (!isOpen || !stories.length) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden select-none"
      style={{ touchAction: 'none' }}
      onClick={onClose}
      onTouchStart={onTouchStartHandler}
      onTouchMove={onTouchMoveHandler}
      onTouchEnd={onTouchEndHandler}
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-5 left-5 z-20 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all"
        title="إغلاق الستوري"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Story Card Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm max-h-[92vh] h-[640px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between bg-black transition-transform duration-75"
        style={{ 
          transform: dragOffsetY > 0 ? `translateY(${dragOffsetY}px)` : 'none',
          opacity: dragOffsetY > 0 ? Math.max(0.4, 1 - dragOffsetY / 300) : 1
        }}
      >
        
        {/* Top Segment Progress Bars (Gray Track with animated White Fill) */}
        <div className="absolute top-2.5 inset-x-4 z-30 flex items-center gap-1.5 pointer-events-none">
          {videoProducts.map((_, idx) => {
            const isPast = idx < activeVideoIndex;
            const isCurrent = idx === activeVideoIndex;

            return (
              <div 
                key={idx}
                className="h-1 flex-1 rounded-full bg-white/30 backdrop-blur-xs overflow-hidden"
              >
                <div 
                  ref={isCurrent ? activeBarRef : null}
                  className="h-full bg-white rounded-full"
                  style={{ 
                    width: isPast ? '100%' : '0%',
                    willChange: isCurrent ? 'width' : 'auto'
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Story Background Media (Video if present, otherwise Image) */}
        {currentVideoSrc ? (
          <video
            ref={videoRef}
            key={currentVideoSrc}
            src={currentVideoSrc}
            autoPlay
            muted
            playsInline
            onEnded={() => {
              if (activeBarRef.current) activeBarRef.current.style.width = '100%';
              handleNext();
            }}
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
        ) : (
          <img
            key={currentProduct.image || currentStory.image}
            src={currentProduct.image || currentStory.image}
            alt={currentProduct.name || currentStory.title}
            className="absolute inset-0 w-full h-full object-cover opacity-85 transition-opacity duration-300"
          />
        )}

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none" />

        {/* Story Header */}
        <div className="relative z-10 p-4 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#DF7E93] to-pink-400 p-0.5 border border-white flex items-center justify-center text-white shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-black flex items-center gap-1.5">
                <span>الملاك الصغير</span>
                <span className="text-[10px] bg-[#DF7E93] text-white px-2 py-0.5 rounded-full font-bold">Story</span>
              </p>
              <span className="text-[11px] text-pink-200 font-bold block">{currentStory.tag}</span>
            </div>
          </div>
          {videoProducts.length > 1 && (
            <span className="text-[10px] font-bold text-white/90 bg-black/45 px-2.5 py-1 rounded-full border border-white/20">
              {activeVideoIndex + 1} من {videoProducts.length}
            </span>
          )}
        </div>

        {/* Navigation Touch / Click zones (No Arrows) */}
        <div className="absolute inset-y-24 inset-x-0 z-10 flex">
          <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev} title="السابق" />
          <div className="w-1/2 h-full cursor-pointer" onClick={handleNext} title="التالي" />
        </div>

        {/* Story Bottom Content & CTA */}
        <div className="relative z-10 p-4 sm:p-5 space-y-3 text-center">
          
          {/* Multiple Video Selection Pills for this Section */}
          {videoProducts.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {videoProducts.map((vp, vIdx) => (
                <button
                  key={vp.id || vIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveVideoIndex(vIdx);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all truncate max-w-[130px] ${
                    vIdx === activeVideoIndex
                      ? 'bg-white text-slate-900 shadow-md scale-105'
                      : 'bg-black/50 text-white/80 hover:bg-black/70 border border-white/20'
                  }`}
                >
                  {vp.name || `فيديو ${vIdx + 1}`}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-1">
            <h3 className="text-white text-base sm:text-lg font-black leading-tight drop-shadow-md line-clamp-1">
              {currentProduct.name || currentStory.title}
            </h3>
            {currentProduct.price && (
              <p className="text-amber-300 font-extrabold text-sm drop-shadow">
                {currentProduct.price} ر.س
              </p>
            )}
            <p className="text-pink-100 text-[11px] sm:text-xs leading-relaxed max-w-xs mx-auto drop-shadow line-clamp-2">
              {currentProduct.description || currentStory.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {currentProduct.id && onAddToCart && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(currentProduct);
                }}
                className="flex-1 bg-white hover:bg-pink-50 text-slate-900 text-xs font-black py-2.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#DF7E93]" />
                <span>أضيفي للسلة</span>
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
                if (onSelectCategory && currentStory.categoryId) {
                  onSelectCategory(currentStory.categoryId);
                }
              }}
              className="flex-1 bg-gradient-to-r from-[#DF7E93] to-pink-500 hover:from-[#d56b82] hover:to-pink-600 text-white text-xs font-black py-2.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>تسوقي القسم</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}


