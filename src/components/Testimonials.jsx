import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Star, User, Plus, X, Send, CheckCircle2, AlertCircle, MessageSquare, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    productId: 1,
    name: 'نورة الشمري',
    city: 'الرياض',
    rating: 5,
    date: 'منذ يومين',
    comment: 'وصلني طقم الاستقبال الملكي والخامة قطن تركي بارد وفائق النعومة، والتطريز بالاسم فخم جداً ومرتب. التوصيل كان سريعاً وتغليف يواجه كهدية فاخرة.',
    product: 'بكج استقبال روز بيبي - تفصيل ملكي فاخر (7 قطع)'
  },
  {
    id: 2,
    productId: null,
    name: 'أم فيصل',
    city: 'جدة',
    rating: 5,
    date: 'منذ أسبوع',
    comment: 'متجر رائع جداً، التعامل راقي وسرعة في تجهيز الطلب والتوصيل في وقت قياسي والتغليف أنيق يواجه، بارك الله لكم في متجركم.',
    product: 'متجر الملاك الصغير'
  },
  {
    id: 3,
    productId: 3,
    name: 'سارة القحطاني',
    city: 'الخبر',
    rating: 5,
    date: 'منذ 4 أيام',
    comment: 'المهادات القطنية الموسلين خفيفة ومسامية، وخيوط التطريز الذهبية ثابتة حتى مع الغسيل المتكرر. متجر معتمد لكل مستلزمات طفلي.',
    product: 'مهاد بيبي شتوي ثقيل بطانة صوف تيدي دافئ'
  }
];

export default function Testimonials({
  customReviews = [],
  onAddReview = () => {},
  currentUser = null,
  onOpenProduct = () => {},
  allProducts = []
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewerName, setReviewerName] = useState(currentUser?.name || '');
  const [reviewerEmail, setReviewerEmail] = useState(currentUser?.email || '');
  const [productName, setProductName] = useState('');
  const [reviewerComment, setReviewerComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedReviews, setExpandedReviews] = useState({});

  const toggleExpandReview = (id) => {
    setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Carousel & Auto-Gliding References
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

  const approvedCustom = useMemo(() => {
    if (!Array.isArray(customReviews)) return [];
    return customReviews
      .filter(r => r && (r.isVisible || r.status === 'approved'))
      .map(r => ({
        id: r.id,
        productId: r.productId,
        name: r.customerName || 'عميل المتجر',
        city: r.city || '',
        rating: Number(r.rating) || 5,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-SA') : 'مؤخراً',
        comment: r.comment,
        product: r.productName || ''
      }));
  }, [customReviews]);

  // Display ALL approved reviews in the slider (or default if empty)
  const reviews = approvedCustom.length > 0 ? approvedCustom : DEFAULT_TESTIMONIALS;

  // 1. Detect RTL scroll direction once on mount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const initial = el.scrollLeft;
    el.scrollLeft = -2;
    if (el.scrollLeft < 0) {
      rtlSignRef.current = -1;
    } else {
      el.scrollLeft = 2;
      if (el.scrollLeft > 0) {
        rtlSignRef.current = 1;
      }
    }
    el.scrollLeft = initial;
  }, []);

  // 2. Viewport Intersection Observer: initiates auto-glide when section is visible
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
              }, 1200);
            }
          } else {
            isInViewRef.current = false;
            isDelayPassedRef.current = false;
            if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
    };
  }, []);

  // 3. Smooth, Vibration-free Auto-Scrolling with gentle turnaround
  useEffect(() => {
    if (!reviews || reviews.length <= 1) return;

    let lastTime = performance.now();
    const SPEED = 26; // Pixels per second - steady, smooth glide

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
            if (currentScroll >= maxScroll - 6) {
              stepDirectionRef.current = -1;
              accumulatorRef.current = 0;
              // Brief pause at the end for readability before smoothly reversing
              isInteractingRef.current = true;
              if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
              resumeTimeoutRef.current = setTimeout(() => {
                isInteractingRef.current = false;
              }, 1800);
            } else {
              accumulatorRef.current += SPEED * delta;
              if (accumulatorRef.current >= 1) {
                const pixels = Math.floor(accumulatorRef.current);
                accumulatorRef.current -= pixels;
                el.scrollLeft += rtlSignRef.current * pixels;
              }
            }
          } else {
            // Backward glide towards the start
            if (currentScroll <= 6) {
              stepDirectionRef.current = 1;
              accumulatorRef.current = 0;
              // Brief pause at the start before reversing
              isInteractingRef.current = true;
              if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
              resumeTimeoutRef.current = setTimeout(() => {
                isInteractingRef.current = false;
              }, 1800);
            } else {
              accumulatorRef.current += SPEED * delta;
              if (accumulatorRef.current >= 1) {
                const pixels = Math.floor(accumulatorRef.current);
                accumulatorRef.current -= pixels;
                el.scrollLeft -= rtlSignRef.current * pixels;
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
  }, [reviews]);

  // Pause helper
  const pauseAutoScroll = (duration = 3500) => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, duration);
  };

  // Interaction handlers
  const handleTouchStart = () => {
    isTouchActiveRef.current = true;
    pauseAutoScroll(4000);
  };

  const handleTouchEnd = () => {
    isTouchActiveRef.current = false;
    pauseAutoScroll(2500);
  };

  const handleMouseEnter = () => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    pauseAutoScroll(1500);
  };

  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    setIsMouseDown(true);
    pauseAutoScroll(4000);
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
    pauseAutoScroll(2500);
  };

  // Manual arrow navigation (Step by 1 card or full view)
  const handleScrollByStep = (direction) => {
    if (!containerRef.current) return;
    pauseAutoScroll(4500);
    const el = containerRef.current;
    const scrollAmount = el.clientWidth >= 768 ? Math.round(el.clientWidth / 3) + 16 : Math.round(el.clientWidth * 0.85);
    const sign = direction === 'next' ? rtlSignRef.current : -rtlSignRef.current;
    el.scrollBy({ left: sign * scrollAmount, behavior: 'smooth' });
  };

  // Determine if a review is for the store generally or a specific product
  const isStoreGeneralReview = (rev) => {
    if (!rev) return true;
    const prodName = (rev.product || '').trim();
    if (!prodName) return true;
    const lower = prodName.toLowerCase();
    if (
      lower === 'متجر الملاك الصغير' ||
      lower === 'متجر الملاك' ||
      lower === 'الملاك الصغير' ||
      lower === 'خدمة العملاء' ||
      lower === 'خدمة العملاء والشحن' ||
      lower === 'المتجر'
    ) {
      return true;
    }
    if (!rev.productId && (lower.includes('متجر') || lower.includes('الملاك'))) {
      return true;
    }
    return false;
  };

  const handleProductClick = (rev) => {
    if (!rev || isStoreGeneralReview(rev)) return;

    let matched = null;
    if (rev.productId) {
      matched = allProducts.find(p => String(p.id) === String(rev.productId));
    }
    if (!matched && rev.product) {
      const q = rev.product.trim().toLowerCase();
      matched = allProducts.find(p => p.name && (p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase())));
    }
    if (!matched && rev.productId) {
      matched = allProducts.find(p => Number(p.id) === Number(rev.productId));
    }

    if (matched && typeof onOpenProduct === 'function') {
      onOpenProduct(matched);
    } else if (allProducts.length > 0 && typeof onOpenProduct === 'function') {
      onOpenProduct(allProducts[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!reviewerName.trim()) {
      setErrorMessage('يرجى كتابة اسمك الكريم');
      return;
    }
    if (!reviewerComment.trim()) {
      setErrorMessage('يرجى كتابة رأيك أو تقييمك للمتجر');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        productId: null,
        productName: productName.trim() || 'متجر الملاك الصغير',
        customerName: reviewerName.trim(),
        customerEmail: reviewerEmail.trim(),
        rating: Number(newRating) || 5,
        comment: reviewerComment.trim(),
        status: 'pending',
        isVisible: false
      };

      if (typeof onAddReview === 'function') {
        await onAddReview(payload);
      }

      setIsSubmitted(true);
      setReviewerComment('');
      setProductName('');
    } catch (err) {
      setErrorMessage('حدث خطأ أثناء إرسال التقييم، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 border-t border-pink-100/60 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            تجارب عملائنا
          </h3>
          <div className="w-16 h-1 bg-brand-600 rounded-full mx-auto" />
          <p className="text-xs sm:text-sm text-slate-600 font-semibold pt-1">
            أكثر من 1500+ أم وعائلة يثقون بجودة وفخامة منتجات الملاك الصغير
          </p>

          {/* Add Review Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setErrorMessage('');
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#DF7E93] hover:bg-[#d06b82] text-white text-xs font-black shadow-md shadow-pink-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>أضف تقييمك وتجربتك للمتجر ⭐</span>
            </button>
          </div>
        </div>

        {/* Carousel Container (Auto-gliding + Manual Swipe/Scroll + 3 Cards in View on Desktop) */}
        <div className="relative group">
          {/* Navigation Arrows (Visible for easy manual browsing) */}
          <button
            type="button"
            onClick={() => handleScrollByStep('prev')}
            aria-label="التعليق السابق"
            className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-[#8F2338] shadow-md hover:shadow-lg border border-pink-100 flex items-center justify-center transition-all cursor-pointer active:scale-90"
            title="التعليق السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => handleScrollByStep('next')}
            aria-label="التعليق التالي"
            className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-700 hover:text-[#8F2338] shadow-md hover:shadow-lg border border-pink-100 flex items-center justify-center transition-all cursor-pointer active:scale-90"
            title="التعليق التالي"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Scrollable Track: 3 cards per view on md+, swipeable on mobile */}
          <div
            ref={containerRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none py-3 px-1 select-none cursor-grab active:cursor-grabbing"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {reviews.map((rev) => {
              const isGeneral = isStoreGeneralReview(rev);

              return (
                <div
                  key={rev.id}
                  className="w-[85vw] sm:w-[340px] md:w-[calc((100%-2.5rem)/3)] shrink-0 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/70 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    
                    {/* Header: User Avatar + Name + Rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-pink-50 text-brand-600 flex items-center justify-center border border-pink-100 shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{rev.name}</h4>
                          <span className="text-[11px] text-slate-600 font-medium">
                            {rev.city ? `${rev.city} • ` : ''}{rev.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-0.5 text-amber-500">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <p className={`text-xs sm:text-sm text-slate-700 leading-relaxed font-medium break-words transition-all duration-200 ${expandedReviews[rev.id] ? '' : 'line-clamp-4'}`}>
                        "{rev.comment}"
                      </p>
                      {rev.comment && rev.comment.length > 140 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandReview(rev.id);
                          }}
                          className="text-[11px] font-bold text-[#DF7E93] hover:text-[#8F2338] transition-colors inline-flex items-center gap-1 cursor-pointer hover:underline"
                        >
                          {expandedReviews[rev.id] ? 'عرض أقل ↑' : 'قراءة المزيد... ↓'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Bar: ONLY displayed when review is for a specific product */}
                  {!isGeneral && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleProductClick(rev)}
                        className="group inline-flex items-center gap-1.5 text-[#8F2338] hover:text-[#b4324d] font-bold transition-all cursor-pointer text-right max-w-full"
                        title={`عرض تفاصيل ${rev.product}`}
                      >
                        <span className="truncate group-hover:underline">{rev.product}</span>
                        <ArrowLeft className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 group-hover:-translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp relative max-h-[90vh] overflow-y-auto">
            
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute left-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 text-[#DF7E93] flex items-center justify-center border border-pink-100">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 pt-2">
                شاركنا رأيك وتجربتك في متجر الملاك الصغير
              </h3>
              <p className="text-xs text-slate-500">
                رأيك يهمنا ويسهم في تطوير منتجاتنا وخدمتنا لجميع الأمهات والعائلات
              </p>
            </div>

            {isSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3 animate-fadeIn">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-black text-emerald-900">
                  شكراً لمشاركتك رأيك وتقييمك! 🎉
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  تم استلام تعليقك بنجاح، شكراً جزيلاً لمشاركتنا تجربتك ورأيك!
                </p>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-700 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    اختر تقييمك (من 1 إلى 5 نجوم):
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 text-slate-300 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || newRating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200 fill-slate-100'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-amber-600 mr-2">
                      {hoverRating || newRating} من 5 نجوم
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم الكريم:
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="مثال: أم نورة"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>

                {/* Optional Product Name / Experience */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المنتج أو الخدمة التي جربتها (اختياري):
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="مثال: طقم استقبال روز بيبي أو تجربة التسوق عامة"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-medium"
                  />
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تفاصيل تجربتك ورأيك:
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={reviewerComment}
                    onChange={(e) => setReviewerComment(e.target.value)}
                    placeholder="اكتبي رأيك بكل صراحة في جودة القماش، سرعة التوصيل، التعامل..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-medium leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-[#DF7E93] hover:bg-[#d06b82] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-200 transition-all hover:scale-[1.01] active:scale-98 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>جاري الإرسال...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>إرسال التقييم</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
