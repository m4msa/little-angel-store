import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  PenTool,
  Maximize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Video,
  ZoomIn,
  Upload,
  FileText,
  Globe,
  Paperclip,
  Trash2
} from 'lucide-react';

export default function ProductQuickView({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart, 
  isFavorite, 
  onToggleFavorite 
}) {
  if (!isOpen || !product) return null;

  const rawImages = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);
  const tagsList = product.tags && product.tags.length > 0 ? product.tags : (product.tag ? [product.tag] : []);

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

  const initialMediaIndex = Math.max(0, mediaItems.findIndex(m => m.isPrimary));
  const [activeMediaIndex, setActiveMediaIndex] = useState(initialMediaIndex);

  const [selectedSize, setSelectedSize] = useState('0-3 أشهر');
  const [selectedColor, setSelectedColor] = useState('وردي هادئ');
  const [customBabyName, setCustomBabyName] = useState('');
  const [nameLanguage, setNameLanguage] = useState('ar'); // 'ar' | 'en'
  const [threadColor, setThreadColor] = useState('ذهبي ملكي');
  const [customDesignFile, setCustomDesignFile] = useState(null);
  const [customDesignFileName, setCustomDesignFileName] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const fileInputRef = useRef(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  
  // Interactive Magnifier Zoom on Image Hover
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Video playback states
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // Touch Swipe & Mouse Drag States
  const [dragStartX, setDragStartX] = useState(null);
  const [isManualInteracted, setIsManualInteracted] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomDesignFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setCustomDesignFile(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setCustomDesignFile(null);
    setCustomDesignFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const colorClassMap = {
    'وردي هادئ': 'bg-pink-300',
    'أزرق سماوي': 'bg-sky-300',
    'أبيض قطني': 'bg-slate-100',
    'بيج كريمي': 'bg-amber-100',
    'رمادي ناعم': 'bg-slate-300',
    'أخضر نعناعي': 'bg-emerald-200',
    'كحلي فاخر': 'bg-blue-900',
    'بني كراميل': 'bg-amber-700',
    'خشب طبيعي ناعم': 'bg-amber-200'
  };

  const sizes = product.availableSizes && product.availableSizes.length > 0
    ? product.availableSizes
    : ['0-3 أشهر', '3-6 أشهر', '6-12 شهر', '1-2 سنة'];

  const colors = product.availableColors && product.availableColors.length > 0
    ? product.availableColors.map(c => typeof c === 'string' ? { name: c, bg: colorClassMap[c] || 'bg-brand-200' } : c)
    : [
      { name: 'وردي هادئ', bg: 'bg-pink-300' },
      { name: 'أزرق سماوي', bg: 'bg-sky-300' },
      { name: 'أبيض قطني', bg: 'bg-slate-100' },
      { name: 'بيج كريمي', bg: 'bg-amber-100' }
    ];

  const threadColors = ['ذهبي ملكي', 'فضي ناعم', 'بني كراميل', 'كحلي فاخر', 'وردي'];

  useEffect(() => {
    const primaryIdx = Math.max(0, mediaItems.findIndex(m => m.isPrimary));
    setActiveMediaIndex(primaryIdx);
    setCustomBabyName('');
    setNameLanguage('ar');
    setCustomDesignFile(null);
    setCustomDesignFileName('');
    setCustomNotes('');
    setIsFullscreenImage(false);
    setIsPlaying(true);
    setIsMuted(true);
    setIsZoomed(false);
    setIsManualInteracted(false);

    if (product) {
      if (sizes.length > 0) setSelectedSize(sizes[0]);
      if (colors.length > 0) setSelectedColor(colors[0].name);
    }
  }, [product]);

  // Auto-flip media every 3.5 seconds until user interacts manually
  useEffect(() => {
    if (isManualInteracted || mediaItems.length <= 1) return;
    if (currentMedia.type === 'video' && isPlaying) return;

    const timer = setInterval(() => {
      setActiveMediaIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
    }, 3500);

    return () => clearInterval(timer);
  }, [isManualInteracted, mediaItems.length, currentMedia.type, isPlaying]);

  // Handle ESC key to close modal & prevent background body scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isFullscreenImage) {
          setIsFullscreenImage(false);
        } else {
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

  // Media navigation helpers
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

  // Touch Swipe Event Handlers
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

  // Interactive Lens Zoom Handler
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
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const currentMedia = mediaItems[activeMediaIndex] || mediaItems[0];

  const handleAdd = () => {
    const primaryImg = rawImages[0] || product.image;
    onAddToCart({
      ...product,
      image: currentMedia.type === 'image' ? currentMedia.url : primaryImg,
      selectedSize,
      selectedColor,
      customBabyName: customBabyName.trim(),
      nameLanguage,
      customDesignFile,
      customDesignFileName,
      customNotes: customNotes.trim(),
      threadColor,
      quantity
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      {/* Full-screen Lightbox with Image Zoom */}
      {isFullscreenImage && currentMedia && currentMedia.type === 'image' && (
        <div 
          className="fixed inset-0 z-[70] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md"
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

          <p className="text-white/80 text-xs mt-3 font-medium">اضغط في أي مكان أو مفتاح Esc للعودة</p>
        </div>
      )}

      {/* Main Quick View Modal */}
      <div 
        className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
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
              className="absolute top-3 left-3 sm:top-4 sm:left-4 p-2 sm:p-2.5 text-slate-700 hover:text-slate-950 bg-white/95 hover:bg-white rounded-full shadow-md border border-slate-200 z-30 transition-all active:scale-90 flex items-center justify-center"
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
                        <ZoomIn className="w-3.5 h-3.5 text-brand-600" />
                        <span>تكبير التفاصيل</span>
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
                          key={idx 
                          } 
                          className={`h-1.5 rounded-full transition-all ${
                            activeMediaIndex === idx 
                              ? 'w-6 bg-brand-600 shadow-xs' 
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
                        className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all bg-white p-1 flex items-center justify-center ${
                          activeMediaIndex === idx 
                            ? 'border-brand-600 scale-105 shadow-md ring-2 ring-brand-100' 
                            : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {item.type === 'video' ? (
                          <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white">
                            <Play className="w-5 h-5 fill-white text-white drop-shadow-xs" />
                          </div>
                        ) : (
                          <img src={item.url} alt={`مصغر ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

              </div>

              {/* Product Specifications & Purchase Options */}
              <div className="p-5 sm:p-7 flex flex-col justify-between space-y-4">
                
                <div className="space-y-3">
                  {/* Title */}
                  <h3 className="text-lg sm:text-2xl font-black text-slate-900 leading-snug">
                    {product.name}
                  </h3>

                  {/* Pricing Block */}
                  <div className="flex items-baseline gap-2.5 pt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-brand-600">
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

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {product.description}
                  </p>
                </div>

                {/* Custom Embroidery & Personalization Section */}
                {product.hasCustomName !== false && (
                  <div className="bg-pink-50/70 p-3.5 sm:p-4 rounded-2xl border border-pink-200/80 space-y-3">
                    
                    {/* Header: Title + Language Toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-brand-600" />
                        <span>تطريز اسم المولود حسب طلبك:</span>
                      </label>

                      {/* Language Choice: Arabic or English */}
                      <div className="flex items-center bg-white rounded-lg p-0.5 border border-pink-200 shadow-2xs text-[10px]">
                        <button
                          type="button"
                          onClick={() => setNameLanguage('ar')}
                          className={`px-2 py-0.5 rounded font-bold transition-all ${
                            nameLanguage === 'ar' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-brand-600'
                          }`}
                        >
                          عربي
                        </button>
                        <button
                          type="button"
                          onClick={() => setNameLanguage('en')}
                          className={`px-2 py-0.5 rounded font-bold transition-all ${
                            nameLanguage === 'en' ? 'bg-brand-600 text-white shadow-xs' : 'text-slate-600 hover:text-brand-600'
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
                      className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-500 shadow-2xs"
                    />

                    {/* Thread Color */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pt-0.5 text-[11px]">
                      <span className="text-slate-700 font-bold">لون خيط التطريز:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {threadColors.map((tc) => (
                          <button
                            key={tc}
                            type="button"
                            onClick={() => setThreadColor(tc)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                              threadColor === tc
                                ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {tc}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Design File Upload (خاصية رفع ملف التصميم أو الباترون) */}
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
                          className="w-full py-2 px-3 bg-white hover:bg-pink-100/50 border border-dashed border-brand-300 rounded-xl text-[11px] font-bold text-brand-700 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <Upload className="w-3.5 h-3.5 text-brand-600" />
                          <span>رفع صورة أو باترون التطريز المخصص (اختياري)</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-emerald-200 shadow-2xs text-[11px]">
                          <div className="flex items-center gap-2 truncate">
                            <img src={customDesignFile} alt="باترون التصميم" className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0" />
                            <span className="font-bold text-slate-700 truncate">{customDesignFileName || 'تم إرفاق صورة التصميم'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors shrink-0 mr-2"
                            title="حذف الملف"
                          >
                            <Trash2 className="w-4 h-4 text-rose-500" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Custom Customer Notes Textarea (حقل ملاحظات مخصصة) */}
                    <div className="pt-1">
                      <textarea
                        rows={2}
                        placeholder="أية ملاحظات إضافية للتفصيل أو مكان التطريز (مثال: يرجى كتابة الاسم على القبعة فقط وبخط الرقعة)..."
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        className="w-full bg-white border border-pink-200 rounded-xl p-2.5 text-xs outline-none focus:border-brand-500 text-right shadow-2xs resize-none"
                      />
                    </div>

                  </div>
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
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
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
                      <span className="text-xs font-bold text-slate-700">اللون: <strong className="text-slate-900">{selectedColor}</strong></span>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setSelectedColor(c.name)}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${c.bg} ${
                              selectedColor === c.name
                                ? 'border-brand-600 ring-2 ring-brand-200 scale-110 shadow-xs'
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
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs transition-colors"
                    >
                      -
                    </button>
                    <span className="w-9 text-center font-bold text-slate-900 text-sm">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-8 h-8 rounded-lg bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shadow-xs transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Add Button */}
                  <button
                    type="button"
                    onClick={handleAdd}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md ${
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
                    <Truck className="w-4 h-4 text-brand-600" />
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
