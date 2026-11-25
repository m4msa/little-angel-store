import React, { useRef, useState, useEffect, useMemo, memo } from 'react';
import ProductCard from './ProductCard';
import { handleImageError } from '../utils/catalogUtils';

/**
 * ProductSectionCarousel displays a featured category banner with an auto-gliding,
 * touch-swipable and mouse-draggable horizontal carousel of product cards.
 */
function ProductSectionCarousel({
  title,
  subtitle,
  storyName,
  image,
  categoryId,
  onExploreCategory,
  products = [],
  onAddToCart,
  cart = [],
  onOpenQuickView,
  wishlist = [],
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
  const rtlSignRef = useRef(-1); // RTL scroll direction adjustment

  // Mouse drag state for desktop interactions
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStartLeft, setScrollStartLeft] = useState(0);

  // Fast Set lookups for cart & wishlist status
  const cartIdsSet = useMemo(() => new Set(cart.map((item) => item.id)), [cart]);
  const wishlistIdsSet = useMemo(() => new Set(wishlist), [wishlist]);

  // 1. Viewport Intersection Observer: initiates auto-glide after 2s of visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isInViewRef.current = true;
            if (!isDelayPassedRef.current) {
              if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
              delayTimerRef.current = setTimeout(() => {
                isDelayPassedRef.current = true;
              }, 2000);
            }
          } else {
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
  }, []);

  // 2. Smooth Linear Auto-Scrolling with ping-pong reversal
  useEffect(() => {
    if (!products || products.length <= 1) return;

    let lastTime = performance.now();
    const SPEED = 22; // Pixels per second

    const scrollLoop = (time) => {
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const el = containerRef.current;
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
            // Forward glide towards the end
            if (currentScroll >= maxScroll - 4) {
              stepDirectionRef.current = -1;
              accumulatorRef.current = 0;
            } else {
              accumulatorRef.current += SPEED * delta;
              if (accumulatorRef.current >= 1) {
                const pixels = Math.floor(accumulatorRef.current);
                accumulatorRef.current -= pixels;

                const prev = el.scrollLeft;
                el.scrollLeft = prev + (rtlSignRef.current * pixels);

                // Auto-detect browser RTL scroll behavior
                if (el.scrollLeft === prev && pixels > 0) {
                  rtlSignRef.current = -rtlSignRef.current;
                  el.scrollLeft = prev + (rtlSignRef.current * pixels);
                }
              }
            }
          } else {
            // Backward glide towards the start
            if (currentScroll <= 4) {
              stepDirectionRef.current = 1;
              accumulatorRef.current = 0;
            } else {
              accumulatorRef.current += SPEED * delta;
              if (accumulatorRef.current >= 1) {
                const pixels = Math.floor(accumulatorRef.current);
                accumulatorRef.current -= pixels;

                const prev = el.scrollLeft;
                el.scrollLeft = prev + (rtlSignRef.current * pixels * -1);

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

  // 3. Resume auto-glide when user scrolls page vertically
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

  // Interaction handlers
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

  const handleExplore = () => {
    if (onExploreCategory && categoryId) {
      onExploreCategory(categoryId);
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 space-y-5 select-none">
      
      {/* 1. Category Banner Image (with robust fallback and direct navigation click) */}
      {image && (
        <div 
          onClick={handleExplore}
          className="relative w-full h-28 sm:h-40 md:h-52 lg:h-60 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 bg-slate-50 cursor-pointer group"
          title={`تصفحي كافة منتجات ${title}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleExplore();
            }
          }}
        >
          <img
            src={image}
            alt={title}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      )}

      {/* 2. Category Heading and Subtitle */}
      <div 
        onClick={handleExplore}
        className="relative text-center space-y-1.5 flex flex-col items-center pt-1 cursor-pointer group"
        title={`تصفحي كافة منتجات ${title}`}
      >
        <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-[#DF7E93] transition-colors">
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-800 transition-colors font-medium max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* 3. Horizontal Product Cards Carousel */}
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
                isInCart={cartIdsSet.has(prod.id)}
                onOpenQuickView={() => onOpenQuickView && onOpenQuickView(prod, categoryId)}
                isFavorite={wishlistIdsSet.has(prod.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}

export default memo(ProductSectionCarousel);
