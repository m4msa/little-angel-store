import React, { useRef, useState, useEffect } from 'react';
import ProductCard from './ProductCard';

export default function ProductSectionCarousel({
  title,
  subtitle,
  storyName,
  image,
  categoryId,
  onExploreCategory,
  products,
  onAddToCart,
  cart,
  onOpenQuickView,
  wishlist,
  onToggleFavorite
}) {
  const containerRef = useRef(null);
  const isInteractingRef = useRef(false);
  const isTouchActiveRef = useRef(false);
  const resumeTimeoutRef = useRef(null);
  const animationFrameRef = useRef(null);
  const accumulatorRef = useRef(0);
  const stepDirectionRef = useRef(1); // 1: forward to end, -1: reverse to start
  const isInViewRef = useRef(false);
  const isDelayPassedRef = useRef(false);
  const delayTimerRef = useRef(null);
  const rtlSignRef = useRef(-1); // RTL scrollLeft direction

  // Mouse drag state for desktop / laptop
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);

  // 1. Intersection Observer: detect when user scrolls to the product cards in viewport
  // Waits exactly 2.0 seconds after entering view before initiating smooth motion
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isInViewRef.current = true;
            // Wait exactly 2 full seconds upon entering view before movement starts
            if (!isDelayPassedRef.current) {
              if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
              delayTimerRef.current = setTimeout(() => {
                isDelayPassedRef.current = true;
              }, 2000);
            }
          } else {
            // When leaving view, stop and reset delay so re-entering waits 2s again
            isInViewRef.current = false;
            isDelayPassedRef.current = false;
            if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    };
  }, [products]);

  // 2. Continuous Smooth Linear Auto-Scrolling with Immediate Ping-Pong Reversal (نصف السرعة + انعكاس فوري دون توقف عند الأطراف)
  useEffect(() => {
    if (!products || products.length <= 1) return;

    let lastTime = performance.now();
    // Double speed: 22px per second for balanced, elegant and smooth motion
    const SPEED = 22;

    const scrollLoop = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const el = containerRef.current;
      // Only glide if visible in viewport, 2-second delay has passed, and user is not manually interacting
      if (
        el &&
        isInViewRef.current &&
        isDelayPassedRef.current &&
        !isInteractingRef.current
      ) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (maxScroll > 15) {
          const currentScroll = Math.abs(el.scrollLeft);

          if (stepDirectionRef.current === 1) {
            // Gliding forward towards the end
            if (currentScroll >= maxScroll - 4) {
              // Reached the last card: immediately reverse direction with NO waiting!
              stepDirectionRef.current = -1;
              accumulatorRef.current = 0;
            } else {
              accumulatorRef.current += SPEED * delta;
              if (accumulatorRef.current >= 1) {
                const pixels = Math.floor(accumulatorRef.current);
                accumulatorRef.current -= pixels;

                const prev = el.scrollLeft;
                el.scrollLeft = prev + (rtlSignRef.current * pixels * 1);

                // Auto-detect sign if browser behaves differently in RTL
                if (el.scrollLeft === prev && pixels > 0) {
                  rtlSignRef.current = -rtlSignRef.current;
                  el.scrollLeft = prev + (rtlSignRef.current * pixels * 1);
                }
              }
            }
          } else {
            // Gliding backward towards the start (من النهاية للبداية)
            if (currentScroll <= 4) {
              // Reached the first card: immediately reverse direction with NO waiting!
              stepDirectionRef.current = 1;
              accumulatorRef.current = 0;
            } else {
              accumulatorRef.current += SPEED * delta;
              if (accumulatorRef.current >= 1) {
                const pixels = Math.floor(accumulatorRef.current);
                accumulatorRef.current -= pixels;

                const prev = el.scrollLeft;
                el.scrollLeft = prev + (rtlSignRef.current * pixels * -1);

                // Auto-detect sign if browser behaves differently in RTL
                if (el.scrollLeft === prev && pixels > 0) {
                  rtlSignRef.current = -rtlSignRef.current;
                  el.scrollLeft = prev + (rtlSignRef.current * pixels * -1);
                }
              }
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scrollLoop);
    };

    animationFrameRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [products]);

  // 3. Window vertical scroll detection: resume smooth gliding when user scrolls up/down the page
  useEffect(() => {
    const handleWindowScroll = () => {
      if (isInteractingRef.current && !isTouchActiveRef.current) {
        if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
        isInteractingRef.current = false;
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  const handleTouchStart = () => {
    isTouchActiveRef.current = true;
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleTouchEnd = () => {
    isTouchActiveRef.current = false;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 2500);
  };

  const handleMouseEnter = () => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 1500);
  };

  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    setIsMouseDown(true);
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollStartLeft(containerRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    containerRef.current.scrollLeft = scrollStartLeft - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 2500);
  };

  if (!products || products.length === 0) return null;

  return (
    <section 
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 select-none"
    >
      {/* 1. مربع صورة القسم بالكامل (قابلة للنقر للانتقال المباشر لمنتجات القسم) */}
      {image && (
        <div 
          onClick={() => onExploreCategory && categoryId && onExploreCategory(categoryId)}
          className="relative w-full h-28 sm:h-40 md:h-52 lg:h-60 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 bg-slate-50 cursor-pointer group"
          title={`تصفحي كافة منتجات ${title}`}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}

      {/* 2. اسم القسم ووصفه بالأسفل باللون الأسود الأنيق (قابلان للنقر للانتقال للمنتجات) */}
      <div 
        onClick={() => onExploreCategory && categoryId && onExploreCategory(categoryId)}
        className="relative text-center space-y-1.5 flex flex-col items-center pt-1 cursor-pointer group"
        title={`تصفحي كافة منتجات ${title}`}
      >
        <h3 
          className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-[#DF7E93] transition-colors"
        >
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-800 transition-colors font-medium max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* 3. شريط المنتجات الأفقي بالتحرك السلس المستمر */}
      <div className="relative">
        <div
          ref={containerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-2.5 px-1 select-none cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {products.map((prod) => (
            <div
              key={prod.id}
              className="carousel-item w-[150px] xs:w-[160px] sm:w-[172px] md:w-[180px] lg:w-[188px] xl:w-[192px] shrink-0 flex flex-col"
            >
              <ProductCard
                product={prod}
                onAddToCart={onAddToCart}
                isInCart={cart.some((item) => item.id === prod.id)}
                onOpenQuickView={() => onOpenQuickView && onOpenQuickView(prod, categoryId)}
                isFavorite={wishlist.includes(prod.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
