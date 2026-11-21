import React from 'react';
import { ShoppingBag, Check, Heart, Eye } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onAddToCart, 
  isInCart, 
  onOpenQuickView, 
  isFavorite, 
  onToggleFavorite 
}) {
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  // Adaptive font size & line clamp based on title length (يصغر الخط كلما طال الاسم لمنع الاقتطاع)
  const getTitleStyle = (name = '') => {
    const len = (name || '').trim().length;
    if (len > 55) {
      return 'text-[9.5px] xs:text-[10px] sm:text-[11px] leading-tight line-clamp-3';
    }
    if (len > 35) {
      return 'text-[11px] xs:text-[11.5px] sm:text-xs leading-snug line-clamp-2';
    }
    if (len > 22) {
      return 'text-[11.5px] xs:text-xs sm:text-[13px] leading-snug line-clamp-2';
    }
    return 'text-xs sm:text-sm leading-normal line-clamp-2';
  };

  // Check if product requires options selection (custom name embroidery, sizes, or colors)
  const hasOptions = Boolean(
    product.hasCustomName === true ||
    (Array.isArray(product.availableSizes) && product.availableSizes.length > 0) ||
    (Array.isArray(product.availableColors) && product.availableColors.length > 0)
  );

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);

  // Determine primary media: only primary video or primary image on outside card
  const isVideoPrimary = product.primaryMediaType === 'video' && Boolean(product.video);
  const primaryImg = imagesList[product.primaryImageIndex || 0] || imagesList[0] || product.image;

  return (
    <div 
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-pink-200 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(223,126,147,0.12)] transition-all duration-300 flex flex-col justify-between h-full"
    >
      
      {/* 1. Media Container: Only Heart Icon on top of pure, clean media (aspect-[3/4] portrait matching Tefly Frhaty) */}
      <div 
        className="relative aspect-[3/4] overflow-hidden bg-slate-50/50 cursor-pointer select-none"
        onClick={() => onOpenQuickView(product)}
      >
        {/* Primary Media (Clean without outside flipping) */}
        {isVideoPrimary && product.video ? (
          <div className="w-full h-full relative bg-slate-900 flex items-center justify-center">
            <video
              src={product.video}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <img
            src={primaryImg}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* ONLY Heart Icon (as explicitly requested) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className="absolute top-2.5 left-2.5 w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 shadow-xs border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10"
          title="إضافة للمفضلة"
          aria-label="إضافة للمفضلة"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Desktop Hover Quick-View Pill */}
        <div className="hidden sm:block absolute inset-x-3 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-sm text-slate-700 text-xs font-bold py-1.5 rounded-xl shadow-sm flex items-center justify-center gap-1 border border-slate-100">
            <Eye className="w-3.5 h-3.5 text-[#0B7D52]" />
            <span>معاينة وتكبير التفاصيل</span>
          </div>
        </div>
      </div>

      {/* 2. Content & Pricing (Clean Centered Layout matching Tefly Frhaty) */}
      <div className="p-2.5 sm:p-3 text-center flex-1 flex flex-col justify-between space-y-2">
        
        {/* Title: Adaptive font size & flexible height to prevent top/bottom clipping */}
        <div className="min-h-[2.85rem] sm:min-h-[3.25rem] flex items-center justify-center w-full px-0.5">
          <h3 
            onClick={() => onOpenQuickView(product)}
            className={`font-bold text-slate-800 hover:text-[#0B7D52] transition-colors text-center cursor-pointer break-words w-full ${getTitleStyle(product.name)}`}
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Pricing Block */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-sm sm:text-base font-black text-slate-900">
              {product.price} <span className="text-xs font-semibold text-slate-500">ر.س</span>
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through font-medium">
                {product.originalPrice} ر.س
              </span>
            )}
          </div>

          {discountPercent > 0 ? (
            <p className="text-[11px] font-black text-[#DF7E93]">
              خصم {discountPercent}%
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 font-medium">
              {product.hasCustomName ? 'تطريز الاسم مجاناً حسب الطلب' : hasOptions ? 'متوفر بعدة خيارات' : 'شحن وتوصيل فوري'}
            </p>
          )}
        </div>

        {/* 3. Action Button: Iconic Emerald Green matching Tefly Frhaty (#0B7D52) */}
        {hasOptions ? (
          <button
            type="button"
            onClick={() => onOpenQuickView(product)}
            className="w-full py-2 sm:py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-xs bg-[#0B7D52] hover:bg-[#096B45] text-white shadow-emerald-900/10 hover:shadow-md cursor-pointer"
            title="تحديد الخيارات والمقاسات"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>أضف إلى السلة</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className={`w-full py-2 sm:py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
              isInCart
                ? 'bg-emerald-50 text-[#0B7D52] border border-[#0B7D52]/40 font-black'
                : 'bg-[#0B7D52] hover:bg-[#096B45] text-white shadow-emerald-900/10 hover:shadow-md'
            }`}
            title="إضافة مباشرة إلى السلة"
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4 text-[#0B7D52] stroke-[2.5]" />
                <span>تمت الإضافة للسلة</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>أضف إلى السلة</span>
              </>
            )}
          </button>
        )}

      </div>

    </div>
  );
}
