import React, { useState, useEffect, useMemo, memo } from 'react';
import { 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Heart, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  ZoomIn, 
  ArrowRight,
  Share2,
  Sparkles,
  MessageCircle,
  CreditCard,
  X
} from 'lucide-react';
import ProductCard from './ProductCard';
import CustomEmbroideryForm from './CustomEmbroideryForm';
import { 
  buildProductMediaItems, 
  normalizeProductColors, 
  DEFAULT_SIZES, 
  THREAD_COLORS, 
  calculateDiscountPercent, 
  handleImageError, 
  FALLBACK_IMAGE 
} from '../utils/catalogUtils';
import { useProductMediaGallery } from '../hooks/useProductMediaGallery';

/**
 * ProductDetailView provides a full luxury product page experience
 * featuring interactive media gallery with video controls and zoom lens,
 * dynamic embroidery configuration, related products grid, and checkout actions.
 */
function ProductDetailView({
  product,
  onAddToCart,
  onDirectCheckout,
  isFavorite = false,
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

  // 1. Build unified media items
  const mediaItems = useMemo(() => buildProductMediaItems(product), [product]);

  // 2. Custom Media Gallery hook
  const {
    activeMediaIndex,
    currentMedia,
    isPlaying,
    isMuted,
    isZoomed,
    zoomPos,
    isFullscreenImage,
    setIsFullscreenImage,
    videoRef,
    toggleVideoPlayback,
    toggleMute,
    handleSelectMedia,
    handleTouchStart,
    handleTouchEnd,
    handleMouseMove,
    handleMouseLeave
  } = useProductMediaGallery(mediaItems);

  // 3. Options normalization
  const sizes = useMemo(() => {
    return Array.isArray(product.availableSizes) && product.availableSizes.length > 0
      ? product.availableSizes
      : [];
  }, [product.availableSizes]);

  const colors = useMemo(() => {
    return normalizeProductColors(product.availableColors);
  }, [product.availableColors]);

  // 4. Form states
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || '');
  const [customBabyName, setCustomBabyName] = useState('');
  const [nameLanguage, setNameLanguage] = useState('ar');
  const [threadColor, setThreadColor] = useState(THREAD_COLORS[0]);
  const [customDesignFile, setCustomDesignFile] = useState(null);
  const [customDesignFileName, setCustomDesignFileName] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset form states on product ID change
  useEffect(() => {
    setSelectedSize(sizes[0] || '');
    setSelectedColor(colors[0]?.name || '');
    setCustomBabyName('');
    setNameLanguage('ar');
    setThreadColor(THREAD_COLORS[0]);
    setCustomDesignFile(null);
    setCustomDesignFileName('');
    setCustomNotes('');
    setQuantity(1);
    setAdded(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [product.id, sizes, colors]);

  const categoryObj = useMemo(() => {
    return categories.find((c) => c.id === product.category);
  }, [categories, product.category]);

  const categoryName = categoryObj?.name || 'مستلزمات الأطفال';
  const discountPercent = calculateDiscountPercent(product.originalPrice, product.price);

  // Related products from the same category
  const relatedProducts = useMemo(() => {
    return allProducts
      .filter((p) => p.id !== product.id && (p.category === product.category || product.category === 'all'))
      .slice(0, 4);
  }, [allProducts, product.id, product.category]);

  // Build complete payload for cart/checkout
  const getCustomizedPayload = () => {
    const primaryImg = currentMedia.type === 'image' 
      ? currentMedia.url 
      : (product.images?.[0] || product.image || FALLBACK_IMAGE);

    return {
      ...product,
      image: primaryImg,
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
      customBabyName: customBabyName.trim() || undefined,
      nameLanguage: customBabyName.trim() ? nameLanguage : undefined,
      threadColor: customBabyName.trim() ? threadColor : undefined,
      customDesignFile: customDesignFile || undefined,
      customDesignFileName: customDesignFileName || undefined,
      customNotes: customNotes.trim() || undefined,
      quantity
    };
  };

  const handleAdd = () => {
    const payload = getCustomizedPayload();
    if (onAddToCart) {
      onAddToCart(payload, quantity, payload);
      setAdded(true);
      setTimeout(() => setAdded(false), 2400);
    }
  };

  const handleDirectBuy = () => {
    const payload = getCustomizedPayload();
    if (onDirectCheckout) {
      onDirectCheckout(payload, quantity, payload);
    } else if (onAddToCart) {
      onAddToCart(payload, quantity, payload);
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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 animate-fadeIn select-none">
      
      {/* Fullscreen Lightbox when image zoom is clicked */}
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
            className="absolute top-5 left-5 z-20 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all cursor-pointer"
            title="إغلاق التكبير"
            aria-label="إغلاق التكبير"
          >
            <X className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div 
            className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentMedia.url}
              alt={product.name}
              onError={handleImageError}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl select-none"
            />
          </div>
          <p className="text-white/80 text-xs mt-3 font-medium">اضغط في أي مكان أو زر الإغلاق للعودة</p>
        </div>
      )}

      {/* 1. Top Action Header: Navigation Back & Share Buttons */}
      <div className="flex items-center justify-between gap-3 select-none">
        <button
          type="button"
          onClick={onGoBack || onReturnHome}
          className="inline-flex items-center gap-2 bg-white hover:bg-pink-50 text-slate-800 hover:text-[#DF7E93] border border-pink-200/90 px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
          title="رجوع"
        >
          <ArrowRight className="w-4 h-4 text-[#DF7E93]" />
          <span>رجوع</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 bg-white hover:bg-pink-50 text-slate-700 hover:text-[#DF7E93] border border-pink-200/90 px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
          title="مشاركة المنتج"
        >
          <Share2 className="w-4 h-4 text-[#DF7E93]" />
          <span>{copiedLink ? 'تم نسخ الرابط' : 'مشاركة'}</span>
        </button>
      </div>

      {/* 2. Interactive Breadcrumb Navigation Card */}
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

      {/* 3. Main Product Hero Section (Two-Column Layout) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:divide-x lg:divide-x-reverse divide-slate-100">
          
          {/* Column A: Media Gallery */}
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
              {/* Video Media */}
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
                      className="bg-slate-900/85 backdrop-blur-md text-white p-2 rounded-xl hover:bg-slate-900 transition-all shadow-md flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current text-pink-400" />}
                      <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      className="bg-slate-900/85 backdrop-blur-md text-white p-2 rounded-xl hover:bg-slate-900 transition-all shadow-md flex items-center gap-1.5 text-xs font-bold cursor-pointer"
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
                    onError={handleImageError}
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
                  if (onToggleFavorite) onToggleFavorite(product.id);
                }}
                className="absolute bottom-3 right-3 p-2.5 rounded-full bg-white/95 backdrop-blur-md shadow-md text-slate-400 hover:text-rose-500 transition-all hover:scale-110 active:scale-90 z-10 border border-slate-100 cursor-pointer"
                title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
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
                    className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 shrink-0 transition-all bg-white p-1 flex items-center justify-center cursor-pointer ${
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
                      <img 
                        src={item.url} 
                        alt={`مصغر ${idx + 1}`} 
                        onError={handleImageError}
                        className="w-full h-full object-cover rounded-xl" 
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Column B: Product Details & Purchase Actions */}
          <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Category Badge */}
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

            {/* Custom Embroidery & Personalization Form */}
            {Boolean(product.hasCustomName) && (
              <CustomEmbroideryForm
                customBabyName={customBabyName}
                setCustomBabyName={setCustomBabyName}
                nameLanguage={nameLanguage}
                setNameLanguage={setNameLanguage}
                threadColor={threadColor}
                setThreadColor={setThreadColor}
                threadColors={THREAD_COLORS}
                customDesignFile={customDesignFile}
                setCustomDesignFile={setCustomDesignFile}
                customDesignFileName={customDesignFileName}
                setCustomDesignFileName={setCustomDesignFileName}
                customNotes={customNotes}
                setCustomNotes={setCustomNotes}
                compact={false}
              />
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
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${c.bg} ${
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
                    className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base shadow-2xs transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-black text-slate-900 text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base shadow-2xs transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`flex-1 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-black transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md cursor-pointer ${
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

              {/* Direct Checkout & WhatsApp Inquiry */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDirectBuy}
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#0B7D52] hover:bg-[#096B45] text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>شراء فوري الآن</span>
                </button>

                <a
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`مرحباً متجر ${storeName}، أود الاستفسار عن منتج: ${product.name} (السعر: ${product.price} ر.س)`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
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

      {/* 4. Specifications & Care Details Accordion / Cards */}
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

      {/* 5. Related Products Section */}
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
                type="button"
                onClick={() => onNavigateCategory && onNavigateCategory(categoryObj.id)}
                className="text-xs font-bold text-[#DF7E93] hover:underline cursor-pointer"
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

export default memo(ProductDetailView);
