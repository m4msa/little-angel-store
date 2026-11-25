import React, { useState, useEffect, useMemo, memo } from 'react';
import { 
  X, 
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
  ZoomIn 
} from 'lucide-react';
import { 
  buildProductMediaItems, 
  normalizeProductColors, 
  DEFAULT_SIZES, 
  THREAD_COLORS, 
  handleImageError, 
  FALLBACK_IMAGE 
} from '../utils/catalogUtils';
import { useProductMediaGallery } from '../hooks/useProductMediaGallery';
import CustomEmbroideryForm from './CustomEmbroideryForm';

/**
 * ProductQuickView Modal provides a comprehensive product preview modal
 * featuring interactive media gallery (video/zoom lens), customization controls
 * for embroidery/sizing/colors, and fast cart addition.
 */
function ProductQuickView({ 
  product, 
  isOpen = false, 
  onClose, 
  onAddToCart, 
  isFavorite = false, 
  onToggleFavorite 
}) {
  if (!isOpen || !product) return null;

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

  // 3. Normalized options (sizes, colors)
  const sizes = useMemo(() => {
    return Array.isArray(product.availableSizes) && product.availableSizes.length > 0
      ? product.availableSizes
      : DEFAULT_SIZES;
  }, [product.availableSizes]);

  const colors = useMemo(() => {
    const normalized = normalizeProductColors(product.availableColors);
    return normalized.length > 0 
      ? normalized 
      : normalizeProductColors(['وردي هادئ', 'أزرق سماوي', 'أبيض قطني', 'بيج كريمي']);
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

  // Reset form when product changes
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
  }, [product.id, sizes, colors]);

  // Escape key handler & background body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreenImage) {
          setIsFullscreenImage(false);
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isFullscreenImage, onClose]);

  const handleAdd = () => {
    const primaryImg = currentMedia.type === 'image' 
      ? currentMedia.url 
      : (product.images?.[0] || product.image || FALLBACK_IMAGE);

    const customizedData = {
      ...product,
      image: primaryImg,
      selectedSize,
      selectedColor,
      customBabyName: customBabyName.trim() || undefined,
      nameLanguage: customBabyName.trim() ? nameLanguage : undefined,
      threadColor: customBabyName.trim() ? threadColor : undefined,
      customDesignFile: customDesignFile || undefined,
      customDesignFileName: customDesignFileName || undefined,
      customNotes: customNotes.trim() || undefined,
      quantity
    };

    if (onAddToCart) {
      onAddToCart(customizedData, quantity, customizedData);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      {/* Full-screen Lightbox with Image Zoom */}
      {isFullscreenImage && currentMedia && currentMedia.type === 'image' && (
        <div 
          className="fixed inset-0 z-[70] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
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

          <p className="text-white/80 text-xs mt-3 font-medium">اضغط في أي مكان أو مفتاح Esc للعودة</p>
        </div>
      )}

      {/* Main Quick View Modal */}
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
        }}
      >
        <div className="min-h-full flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 py-4 sm:py-8">
          
          <div 
            className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 left-3 sm:top-4 sm:left-4 p-2 sm:p-2.5 text-slate-700 hover:text-slate-950 bg-white/95 hover:bg-white rounded-full shadow-md border border-slate-200 z-30 transition-all active:scale-90 flex items-center justify-center cursor-pointer"
              aria-label="إغلاق النافذة"
              title="إغلاق (Esc)"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* Media Gallery Section with Interactive Magnifier Zoom */}
              <div className="p-4 sm:p-6 bg-slate-50/60 flex flex-col justify-between space-y-3 border-b md:border-b-0 md:border-l border-slate-100">
                
                {/* Main Media Box with Zoom & Touch Swipe */}
                <div 
                  className="relative w-full aspect-[4/5] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-white shadow-xs border border-slate-200/80 flex items-center justify-center select-none cursor-crosshair group/zoom"
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
                    /* Image with smooth magnifier zoom */
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

                  {/* Zoom hint badge */}
                  {currentMedia.type === 'image' && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 z-10 pointer-events-none">
                      <span className="bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-slate-200">
                        <ZoomIn className="w-3.5 h-3.5 text-[#DF7E93]" />
                        <span>تكبير التفاصيل</span>
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
                        className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all bg-white p-1 flex items-center justify-center cursor-pointer ${
                          activeMediaIndex === idx 
                            ? 'border-[#DF7E93] scale-105 shadow-md ring-2 ring-pink-100' 
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {item.type === 'video' ? (
                          <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white">
                            <Play className="w-5 h-5 fill-white text-white drop-shadow-xs" />
                          </div>
                        ) : (
                          <img 
                            src={item.url} 
                            alt={`مصغر ${idx + 1}`} 
                            onError={handleImageError}
                            className="w-full h-full object-cover rounded-lg" 
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}

              </div>

              {/* Product Specifications & Purchase Options */}
              <div className="p-5 sm:p-7 flex flex-col justify-between space-y-4">
                
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                    {product.name}
                  </h3>

                  <div className="flex items-baseline gap-2.5 pt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-[#DF7E93]">
                      {product.price} <span className="text-sm font-bold text-slate-700">ر.س</span>
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {product.originalPrice} ر.س
                      </span>
                    )}
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      شامل ضريبة القيمة المضافة
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {product.description}
                  </p>
                </div>

                {/* Custom Embroidery Form */}
                {product.hasCustomName !== false && (
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
                    compact={true}
                  />
                )}

                {/* Sizes and Colors */}
                <div className="space-y-3">
                  {/* Sizes */}
                  {sizes.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700">المقاس:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {sizes.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSize(sz)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700">
                        اللون: <strong className="text-slate-900">{selectedColor}</strong>
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setSelectedColor(c.name)}
                            className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${c.bg} ${
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

                {/* Quantity & Add to Cart Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                  
                  {/* Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-9 text-center font-bold text-slate-900 text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={handleAdd}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                      added
                        ? 'bg-emerald-600 text-white shadow-emerald-200'
                        : 'bg-[#DF7E93] hover:bg-[#d46b82] text-white shadow-pink-200'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>تمت الإضافة بنجاح</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 stroke-[2]" />
                        <span>إضافة للسلة ({product.price * quantity} ر.س)</span>
                      </>
                    )}
                  </button>

                </div>

                {/* Trust Badges Bar */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-4 h-4 text-[#DF7E93]" />
                    <span>توصيل سريع 48 ساعة</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>قطن تركي أصلي 100%</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RefreshCw className="w-4 h-4 text-sky-600" />
                    <span>استرجاع ميسر 7 أيام</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default memo(ProductQuickView);
