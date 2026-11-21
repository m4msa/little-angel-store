import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Heart, 
  PenTool, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Video, 
  ZoomIn, 
  Upload, 
  Trash2, 
  ArrowRight,
  Share2,
  Clock,
  Sparkles,
  MessageCircle,
  CreditCard,
  X
} from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductDetailView({
  product,
  onAddToCart,
  onDirectCheckout,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
  allProducts = [],
  categories = [],
  onNavigateCategory,
  onReturnHome,
  onGoBack,
  storeSettings
}) {
  if (!product) return null;

  const storeName = storeSettings?.storeName || 'الملاك الصغير';
  const whatsappNumber = storeSettings?.whatsappNumber || '967775302137';

  const rawImages = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);

  // Build unified media items: video + images
  const mediaItems = [];
  if (product.video) {
    if (product.primaryMediaType === 'video') {
      mediaItems.push({ type: 'video', url: product.video, isPrimary: true });
      rawImages.forEach((img, idx) => {
        mediaItems.push({ type: 'image', url: img, isPrimary: false, originalIndex: idx });
      });
    } else {
      rawImages.forEach((img, idx) => {
        const isPrimary = (product.primaryImageIndex ?? 0) === idx;
        mediaItems.push({ type: 'image', url: img, isPrimary, originalIndex: idx });
      });
      mediaItems.push({ type: 'video', url: product.video, isPrimary: false });
    }
  } else {
    rawImages.forEach((img, idx) => {
      const isPrimary = (product.primaryImageIndex ?? 0) === idx;
      mediaItems.push({ type: 'image', url: img, isPrimary, originalIndex: idx });
    });
  }

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [customBabyName, setCustomBabyName] = useState('');
  const [nameLanguage, setNameLanguage] = useState('ar');
  const [threadColor, setThreadColor] = useState('ذهبي ملكي');
  const [customDesignFile, setCustomDesignFile] = useState(null);
  const [customDesignFileName, setCustomDesignFileName] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [added, setAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Video and Zoom states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [dragStartX, setDragStartX] = useState(null);
  const [isManualInteracted, setIsManualInteracted] = useState(false);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentMedia = mediaItems[activeMediaIndex] || mediaItems[0] || { type: 'image', url: product.image };

  const sizes = product.availableSizes && product.availableSizes.length > 0
    ? product.availableSizes
    : [];

  const colorClassMap = {
    'وردي هادئ': 'bg-pink-300',
    'أزرق سماوي': 'bg-sky-300',
    'أبيض قطني': 'bg-slate-100',
    'بيج كريمي': 'bg-amber-100',
    'رمادي فاتح': 'bg-slate-300',
    'أصفر ليموني': 'bg-amber-200',
    'مشمشي هادئ': 'bg-orange-200'
  };

  const colors = product.availableColors && product.availableColors.length > 0
    ? product.availableColors.map(c => typeof c === 'string' ? { name: c, bg: colorClassMap[c] || 'bg-brand-200' } : c)
    : [];

  const threadColors = ['ذهبي ملكي', 'فضي ناعم', 'بني كراميل', 'كحلي فاخر', 'وردي'];

  // Reset states on product change
  useEffect(() => {
    const primaryIdx = Math.max(0, mediaItems.findIndex(m => m.isPrimary));
    setActiveMediaIndex(primaryIdx);
    setQuantity(1);
    setCustomBabyName('');
    setNameLanguage('ar');
    setCustomDesignFile(null);
    setCustomDesignFileName('');
    setCustomNotes('');
    setIsFullscreenImage(false);
    setIsPlaying(true);
    setIsMuted(true);
    setIsZoomed(false);
    setAdded(false);
    setIsManualInteracted(false);

    if (sizes.length > 0) setSelectedSize(sizes[0]);
    else setSelectedSize('');
    if (colors.length > 0) setSelectedColor(colors[0].name);
    else setSelectedColor('');

    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [product.id]);

  // Auto-flip media every 3.5 seconds until user interacts manually
  useEffect(() => {
    if (isManualInteracted || mediaItems.length <= 1) return;
    if (currentMedia.type === 'video' && isPlaying) return;

    const timer = setInterval(() => {
      setActiveMediaIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
    }, 3500);

    return () => clearInterval(timer);
  }, [isManualInteracted, mediaItems.length, currentMedia.type, isPlaying]);

  const handleNextMedia = (isManual = true) => {
    if (isManual) setIsManualInteracted(true);
    setActiveMediaIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
  };

  const handlePrevMedia = (isManual = true) => {
    if (isManual) setIsManualInteracted(true);
    setActiveMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
  };

  const handleSelectMedia = (idx) => {
    setIsManualInteracted(true);
    setActiveMediaIndex(idx);
  };

  // Touch Swipe Handlers (Stops auto-flip on manual swipe)
  const handleTouchStart = (e) => {
    setDragStartX(e.touches ? e.touches[0].clientX : e.clientX);
  };

  const handleTouchEnd = (e) => {
    if (dragStartX === null) return;
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragStartX - clientX;
    if (Math.abs(diff) > 35) {
      if (diff > 0) {
        handleNextMedia(true);
      } else {
        handlePrevMedia(true);
      }
    }
    setDragStartX(null);
  };

  // Magnifier Zoom Handler
  const handleMouseMove = (e) => {
    if (currentMedia.type !== 'image') return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const toggleVideoPlayback = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomDesignFile(event.target.result);
      setCustomDesignFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setCustomDesignFile(null);
    setCustomDesignFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getCustomizedItemData = () => ({
    selectedSize,
    selectedColor,
    customBabyName: customBabyName.trim() || undefined,
    nameLanguage: customBabyName.trim() ? nameLanguage : undefined,
    threadColor: customBabyName.trim() ? threadColor : undefined,
    customDesignFile: customDesignFile || undefined,
    customNotes: customNotes.trim() || undefined
  });

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity, getCustomizedItemData());
      setAdded(true);
      setTimeout(() => setAdded(false), 2400);
    }
  };

  const handleDirectBuy = () => {
    if (onDirectCheckout) {
      onDirectCheckout(product, quantity, getCustomizedItemData());
    } else if (onAddToCart) {
      onAddToCart(product, quantity, getCustomizedItemData());
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const categoryObj = categories.find(c => c.id === product.category);
  const categoryName = categoryObj?.name || 'مستلزمات الأطفال';

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  // Related products from same category
  const relatedProducts = allProducts
    .filter(p => p.id !== product.id && (p.category === product.category || product.category === 'all'))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 animate-fadeIn">
      
      {/* Fullscreen Media Modal when Zoom is Clicked */}
      {isFullscreenImage && currentMedia.type === 'image' && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsFullscreenImage(false)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreenImage(false);
            }}
            className="absolute top-5 left-5 z-20 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
            title="إغلاق التكبير"
            aria-label="إغلاق التكبير"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentMedia.url}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl select-none"
            />
          </div>
          <p className="text-white/80 text-xs mt-3 font-medium">اضغط في أي مكان أو زر الإغلاق للعودة</p>
        </div>
      )}

      {/* 1. Top Action Header: زر الرجوع وزر المشاركة بالكامل خارج مربع مسار الصفحة والامتداد */}
      <div className="flex items-center justify-between gap-3 select-none">
        {/* زر الرجوع المستقل */}
        <button
          type="button"
          onClick={onGoBack || onReturnHome}
          className="inline-flex items-center gap-2 bg-white hover:bg-pink-50 text-slate-800 hover:text-[#DF7E93] border border-pink-200/90 px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0"
          title="رجوع"
        >
          <ArrowRight className="w-4 h-4 text-[#DF7E93]" />
          <span>رجوع</span>
        </button>

        {/* زر المشاركة المستقل */}
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 bg-white hover:bg-pink-50 text-slate-700 hover:text-[#DF7E93] border border-pink-200/90 px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0"
          title="مشاركة المنتج"
        >
          <Share2 className="w-4 h-4 text-[#DF7E93]" />
          <span>{copiedLink ? 'تم نسخ الرابط' : 'مشاركة'}</span>
        </button>
      </div>

      {/* 2. بطاقة مسار الصفحة التفاعلية الكاملة (تلتف على أسطر متعددة وتتيح النقر على كل جزء) */}
      <nav 
        aria-label="مسار التنقل" 
        className="w-full bg-white px-4 py-3 sm:py-3.5 rounded-2xl border border-pink-100 shadow-2xs leading-relaxed"
      >
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold text-slate-600">
          <button
            type="button"
            onClick={onReturnHome}
            className="hover:text-[#DF7E93] transition-colors hover:underline cursor-pointer py-0.5 shrink-0"
            title="الانتقال إلى الرئيسية"
          >
            الرئيسية
          </button>
          
          <span className="text-slate-300 select-none shrink-0">/</span>
          
          <button
            type="button"
            onClick={() => onNavigateCategory && onNavigateCategory('all')}
            className="hover:text-[#DF7E93] transition-colors hover:underline cursor-pointer py-0.5 shrink-0"
            title="الانتقال إلى كافة الأقسام"
          >
            الأقسام
          </button>
          
          <span className="text-slate-300 select-none shrink-0">/</span>
          
          <button
            type="button"
            onClick={() => onNavigateCategory && onNavigateCategory(categoryObj ? categoryObj.id : (product.category || 'all'))}
            className="hover:text-[#DF7E93] transition-colors hover:underline text-[#DF7E93] font-bold cursor-pointer py-0.5 shrink-0"
            title={`الانتقال إلى قسم ${categoryName}`}
          >
            {categoryName}
          </button>

          <span className="text-slate-300 select-none shrink-0">/</span>

          <span 
            className="text-slate-900 font-extrabold break-words py-0.5"
            title={product.name}
          >
            {product.name}
          </span>
        </div>
      </nav>

      {/* 2. Main Product Hero Section (Two-Column Layout) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x lg:divide-x-reverse divide-slate-100">
          
          {/* Column A: Media Gallery (5 of 12 cols on desktop) */}
          <div className="lg:col-span-5 p-4 sm:p-6 md:p-8 bg-slate-50/40 flex flex-col justify-between space-y-4">
            
            {/* Main Media Box with Zoom & Touch Swipe */}
            <div 
              className="relative w-full aspect-square sm:aspect-[4/5] rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-200/80 flex items-center justify-center select-none cursor-crosshair group/zoom"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => {
                if (currentMedia.type === 'image') setIsFullscreenImage(true);
              }}
            >
              {/* If active media is Video */}
              {currentMedia.type === 'video' ? (
                <div className="relative w-full h-full bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={currentMedia.url}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-contain"
                    onClick={toggleVideoPlayback}
                  />

                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-auto z-20">
                    <button
                      type="button"
                      onClick={toggleVideoPlayback}
                      className="bg-slate-900/85 backdrop-blur-md text-white p-2 rounded-xl hover:bg-slate-900 transition-all shadow-md flex items-center gap-1.5 text-xs font-bold"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current text-pink-400" />}
                      <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="bg-slate-900/85 backdrop-blur-md text-white p-2 rounded-xl hover:bg-slate-900 transition-all shadow-md flex items-center gap-1.5 text-xs font-bold"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                      <span>{isMuted ? 'مكتوم' : 'الصوت يعمل'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* High-Res Image with Smooth Magnifier Zoom */
                <div className="w-full h-full overflow-hidden flex items-center justify-center">
                  <img
                    src={currentMedia.url}
                    alt={product.name}
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                      transition: isZoomed ? 'transform 0.05s ease-out' : 'transform 0.3s ease-out'
                    }}
                    className="w-full h-full object-contain pointer-events-none will-change-transform"
                  />
                </div>
              )}

              {/* Magnifier / Fullscreen Hint */}
              {currentMedia.type === 'image' && (
                <div className="absolute top-3 right-3 flex items-center gap-1 z-10 pointer-events-none">
                  <span className="bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-slate-200">
                    <ZoomIn className="w-3.5 h-3.5 text-[#DF7E93]" />
                    <span>تكبير الصورة</span>
                  </span>
                </div>
              )}

              {/* Favorite Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(product.id);
                }}
                className="absolute bottom-3 right-3 p-2.5 rounded-full bg-white/95 backdrop-blur-md shadow-md text-slate-400 hover:text-rose-500 transition-all hover:scale-110 active:scale-90 z-10 border border-slate-100"
                title="إضافة للمفضلة"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              {/* Dots Indicator */}
              {mediaItems.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                  {mediaItems.map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all ${
                        activeMediaIndex === idx 
                          ? 'w-6 bg-[#DF7E93] shadow-xs' 
                          : 'w-1.5 bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              )}

            </div>

            {/* Thumbnails Row */}
            {mediaItems.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none justify-start pt-1">
                {mediaItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectMedia(idx)}
                    className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all bg-white p-1 flex items-center justify-center ${
                      activeMediaIndex === idx 
                        ? 'border-[#DF7E93] scale-105 shadow-md ring-2 ring-pink-100' 
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white">
                        <Play className="w-5 h-5 fill-white text-white drop-shadow-xs" />
                      </div>
                    ) : (
                      <img src={item.url} alt={`مصغر ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                    )}
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Column B: Product Details & Purchase Actions (7 of 12 cols on desktop) */}
          <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Category Row */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-pink-50 text-[#DF7E93] px-3.5 py-1.5 rounded-full border border-pink-200/60 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#DF7E93]" />
                  <span>{categoryName}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-snug">
                {product.name}
              </h1>

              {/* Pricing Box */}
              <div className="bg-gradient-to-r from-pink-50/60 via-amber-50/30 to-pink-50/60 p-4 rounded-2xl border border-pink-100 flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-[#DF7E93]">
                    {product.price} <span className="text-base font-bold text-slate-700">ر.س</span>
                  </span>
                  {product.originalPrice && (
                    <span className="text-base text-slate-400 line-through">
                      {product.originalPrice} ر.س
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-black bg-rose-500 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                      وفر {discountPercent}%
                    </span>
                  )}
                </div>

                <span className="text-xs text-emerald-700 font-bold bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                  شامل ضريبة القيمة المضافة
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

            {/* Custom Embroidery & Personalization Box */}
            {Boolean(product.hasCustomName) && (
              <div className="bg-pink-50/70 p-4 sm:p-5 rounded-2xl border border-pink-200/80 space-y-3.5">
                
                {/* Header: Title + Language Switch */}
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <PenTool className="w-4 h-4 text-[#DF7E93]" />
                    <span>تطريز اسم المولود مجاناً حسب رغبتك:</span>
                  </label>

                  <div className="flex items-center bg-white rounded-xl p-0.5 border border-pink-200 shadow-2xs text-[11px]">
                    <button
                      type="button"
                      onClick={() => setNameLanguage('ar')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        nameLanguage === 'ar' ? 'bg-[#DF7E93] text-white shadow-xs' : 'text-slate-600 hover:text-[#DF7E93]'
                      }`}
                    >
                      عربي
                    </button>
                    <button
                      type="button"
                      onClick={() => setNameLanguage('en')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        nameLanguage === 'en' ? 'bg-[#DF7E93] text-white shadow-xs' : 'text-slate-600 hover:text-[#DF7E93]'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Name Input */}
                <input
                  type="text"
                  dir={nameLanguage === 'en' ? 'ltr' : 'rtl'}
                  placeholder={nameLanguage === 'en' ? 'Type baby name in English (e.g. Faisal / Sarah)' : 'اكتب اسم المولود بالعربية (مثال: فيصل / سارة)'}
                  value={customBabyName}
                  onChange={(e) => setCustomBabyName(e.target.value)}
                  className="w-full bg-white border border-pink-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#DF7E93] focus:ring-2 focus:ring-pink-100 shadow-2xs transition-all"
                />

                {/* Thread Color */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5 text-xs">
                  <span className="text-slate-700 font-bold">لون خيط التطريز المفضل:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {threadColors.map((tc) => (
                      <button
                        key={tc}
                        type="button"
                        onClick={() => setThreadColor(tc)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          threadColor === tc
                            ? 'bg-[#DF7E93] text-white border-[#DF7E93] shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {tc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Design File Upload */}
                <div className="pt-1 border-t border-pink-200/60">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {!customDesignFile ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 bg-white hover:bg-pink-100/50 border border-dashed border-pink-300 rounded-xl text-xs font-bold text-[#DF7E93] flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Upload className="w-4 h-4 text-[#DF7E93]" />
                      <span>إرفاق صورة أو باترون لتطريز خاص (اختياري)</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <img src={customDesignFile} alt="باترون التصميم" className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                        <span className="font-bold text-slate-700 truncate">{customDesignFileName || 'تم إرفاق صورة التصميم'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors shrink-0 mr-2"
                        title="حذف الملف"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="pt-1">
                  <textarea
                    rows={2}
                    placeholder="ملاحظات إضافية للتفصيل أو مكان التطريز (مثال: كتابة الاسم على البطانية والقبعة بخط الرقعة)..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className="w-full bg-white border border-pink-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#DF7E93] text-right shadow-2xs resize-none"
                  />
                </div>

              </div>
            )}

            {/* Sizes & Colors Selection */}
            <div className="space-y-4 pt-1">
              
              {/* Sizes */}
              {sizes.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">المقاس المطلوب:</span>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selectedSize === sz
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {colors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700">
                    اللون: <strong className="text-slate-900">{selectedColor}</strong>
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${c.bg} ${
                          selectedColor === c.name
                            ? 'border-[#DF7E93] ring-2 ring-pink-200 scale-110 shadow-xs'
                            : 'border-slate-200 hover:scale-105'
                        }`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Quantity & Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              
              <div className="flex items-center gap-3">
                
                {/* Quantity Stepper */}
                <div className="flex items-center border border-slate-200 rounded-2xl bg-slate-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base shadow-2xs transition-colors"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-black text-slate-900 text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base shadow-2xs transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`flex-1 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md ${
                    added
                      ? 'bg-emerald-600 text-white shadow-emerald-200'
                      : 'bg-[#DF7E93] hover:bg-[#d46b82] text-white shadow-pink-200'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5 stroke-[2.5]" />
                      <span>تمت الإضافة للسلة بنجاح</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 stroke-[2]" />
                      <span>إضافة للسلة ({product.price * quantity} ر.س)</span>
                    </>
                  )}
                </button>

              </div>

              {/* Direct Checkout & WhatsApp Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDirectBuy}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0B7D52] hover:bg-[#096B45] text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>شراء فوري الآن</span>
                </button>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`مرحباً متجر ${storeName}، أود الاستفسار عن منتج: ${product.name} (السعر: ${product.price} ر.س)`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>استفسار واتساب سريع</span>
                </a>
              </div>

            </div>

            {/* Quality & Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50/50">
                <Truck className="w-5 h-5 text-[#DF7E93]" />
                <span className="font-bold text-slate-700">شحن سريع</span>
                <span className="text-[10px] text-slate-400">توصيل 2-4 أيام</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50/50">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-slate-700">قطن أصلي 100%</span>
                <span className="text-[10px] text-slate-400">آمن على بشرة الرضيع</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50/50">
                <RefreshCw className="w-5 h-5 text-sky-600" />
                <span className="font-bold text-slate-700">استرجاع ميسر</span>
                <span className="text-[10px] text-slate-400">خلال 7 أيام</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 3. Detailed Information & Specifications Accordion / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: مواصفات وخامات القماش */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-[#DF7E93]" />
            <h3>المواصفات والخامات</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            صُنعت جميع قطع هذا الطقم من خيوط القطن العضوي الطبيعي بنسبة 100%، خالية من أية أصباغ كيميائية، فائقة النعومة على بشرة الأطفال الحساسة ومضادة للحساسية.
          </p>
        </div>

        {/* Card 2: التوصيل والشحن المجاني */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Truck className="w-4 h-4 text-[#DF7E93]" />
            <h3>الشحن والتوصيل</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            شحن مجاني وسريع لكافة مناطق ومدن المملكة عند الشراء بقيمة 299 ر.س وأكثر. التجهيز والتطريز يتم خلال 24-48 ساعة، والتوصيل خلال 2-4 أيام عمل.
          </p>
        </div>

        {/* Card 3: تعليمات الغسيل والعناية */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <RefreshCw className="w-4 h-4 text-[#DF7E93]" />
            <h3>تعليمات العناية والغسيل</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            يُفضل الغسيل اليدوي أو في الغسالة ببرنامج خفيف على درجة حرارة 30 مئوية. يُمنع استخدام المبيضات للحفاظ على ألوان خيوط التطريز الملكية.
          </p>
        </div>

      </div>

      {/* 4. Related Products Section (منتجات مشابهة) */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-pink-100 pb-3">
            <div>
              <span className="text-xs font-bold text-[#DF7E93]">تشكيلة مختارة</span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                منتجات مشابهة قد تنال إعجابك
              </h2>
            </div>
            {categoryObj && (
              <button
                onClick={() => onNavigateCategory && onNavigateCategory(categoryObj.id)}
                className="text-xs font-bold text-[#DF7E93] hover:underline"
              >
                عرض المزيد من {categoryName}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5">
            {relatedProducts.map((relProduct) => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
                onAddToCart={onAddToCart}
                isInCart={false}
                onOpenQuickView={(p) => {
                  if (onSelectProduct) onSelectProduct(p, product.category);
                }}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}

