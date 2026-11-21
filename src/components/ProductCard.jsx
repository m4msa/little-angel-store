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
      
      {/* 1. Media Container: Only Heart Icon on top of pure, clean media */}
      <div 
        className="relative aspect-square sm:aspect-[4/5] overflow-hidden bg-slate-50/50 cursor-pointer select-none"
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
            <Eye className="w-3.5 h-3.5 text-[#DF7E93]" />
            <span>معاينة وتكبير التفاصيل</span>
          </div>
        </div>
      </div>

      {/* 2. Content & Pricing (Clean Centered Layout matching Mini Baby & Tefly) */}
      <div className="p-3 sm:p-4 text-center flex-1 flex flex-col justify-between space-y-2">
        
        {/* Title */}
        <h3 
          onClick={() => onOpenQuickView(product)}
          className="font-bold text-slate-800 hover:text-[#DF7E93] transition-colors line-clamp-2 text-xs sm:text-sm leading-relaxed cursor-pointer h-10 flex items-center justify-center"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Pricing Block */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-sm sm:text-base font-black text-slate-900">
              {product.price} <span className="text-xs font-semibold text-slate-500">ر.س</span>
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-500 line-through font-medium">
                {product.originalPrice} ر.س
              </span>
            )}
          </div>

          {discountPercent > 0 ? (
            <p className="text-[11px] font-black text-rose-700">
              خصم {discountPercent}%
            </p>
          ) : (
            <p className="text-[11px] text-slate-600 font-medium">
              {product.hasCustomName ? 'تطريز الاسم مجاناً حسب الطلب' : hasOptions ? 'متوفر بعدة خيارات' : 'شحن وتوصيل فوري'}
            </p>
          )}
        </div>

        {/* 3. Action Button: Opens product page if product has customizable options, or adds directly if no options */}
        {hasOptions ? (
          <button
            type="button"
            onClick={() => onOpenQuickView(product)}
            className="w-full py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-xs bg-[#DF7E93] hover:bg-[#D46B82] text-white shadow-pink-200/50 hover:shadow-md"
            title="تحديد الخيارات والمقاسات"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>أضف إلى السلة</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onAddToCart(product)}
            className={`w-full py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-xs ${
              isInCart
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-[#DF7E93] hover:bg-[#D46B82] text-white shadow-pink-200/50 hover:shadow-md'
            }`}
            title="إضافة مباشرة إلى السلة"
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
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
