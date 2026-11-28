import React, { memo } from 'react';
import { ShoppingBag, Check, Heart, Eye, Star } from 'lucide-react';
import { 
  calculateDiscountPercent, 
  hasProductOptions, 
  getTitleClampingStyle, 
  handleImageError, 
  FALLBACK_IMAGE 
} from '../utils/catalogUtils';

/**
 * ProductCard component displays a luxury portrait baby product card
 * with image/video preview, wishlist toggling, quick view opening,
 * and smart cart addition based on whether options (embroidery/sizes) exist.
 *
 * Memoized with React.memo to ensure high rendering performance in large lists.
 */
function ProductCard({ 
  product, 
  onAddToCart, 
  isInCart = false, 
  onOpenQuickView, 
  isFavorite = false, 
  onToggleFavorite 
}) {
  if (!product) return null;

  const discountPercent = calculateDiscountPercent(product.originalPrice, product.price);
  const requiresOptions = hasProductOptions(product);

  // Fractional Rating: defaults to 5 for new products or unrated items
  const rawRating = typeof product.rating === 'number' && !isNaN(product.rating) && product.rating > 0
    ? product.rating
    : 5;
  const ratingValue = Math.min(5, Math.max(1, Number(rawRating.toFixed(2))));

  const imagesList = Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : [product.image].filter(Boolean);

  const isVideoPrimary = product.primaryMediaType === 'video' && Boolean(product.video);
  const primaryImg = imagesList[product.primaryImageIndex || 0] || imagesList[0] || product.image || FALLBACK_IMAGE;

  const handleCardClick = () => {
    if (onOpenQuickView) {
      onOpenQuickView(product);
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(product.id);
    }
  };

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (requiresOptions) {
      if (onOpenQuickView) onOpenQuickView(product);
    } else if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-pink-200 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_28px_rgba(223,126,147,0.12)] transition-all duration-300 flex flex-col justify-between h-full select-none">
      
      {/* 1. Media Container: Aspect 3:4 portrait matching luxury store theme */}
      <div 
        className="relative aspect-[3/4] overflow-hidden bg-slate-50/50 cursor-pointer select-none"
        onClick={handleCardClick}
      >
        {/* Primary Media (Video or Lazy-loaded Image with error fallback) */}
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
            alt={product.name || 'منتج الملاك الصغير'}
            onError={handleImageError}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-2.5 left-2.5 w-8 h-8 rounded-xl bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500 shadow-xs border border-slate-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10 cursor-pointer"
          title={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
          aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* 2. Content & Pricing Details */}
      <div className="p-2.5 sm:p-3 sm:pb-3.5 text-center flex-1 flex flex-col justify-between space-y-2.5">
        
        {/* Title with adaptive font-size to prevent text clipping */}
        <div className="min-h-[2.85rem] sm:min-h-[3.25rem] flex items-center justify-center w-full px-0.5">
          <h3 
            onClick={handleCardClick}
            className={`font-bold text-slate-800 hover:text-[#DF7E93] transition-colors text-center cursor-pointer break-words w-full ${getTitleClampingStyle(product.name)}`}
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Offer Badges */}
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
              {product.hasCustomName ? 'تطريز الاسم مجاناً حسب الطلب' : requiresOptions ? 'متوفر بعدة خيارات' : 'شحن وتوصيل فوري'}
            </p>
          )}
        </div>

        {/* 2.5. Star Rating: Fractional Stars ("نجمة مكسرة"), Visual Only, No Numbers, Default 5 */}
        <div 
          className="flex items-center justify-center py-0.5" 
          title={`تقييم المنتج: ${ratingValue} من 5 نجوم`}
        >
          <div className="flex items-center gap-0.5" dir="rtl">
            {[1, 2, 3, 4, 5].map((starIndex) => {
              const fillPercent = ratingValue >= starIndex
                ? 100
                : ratingValue > starIndex - 1
                  ? Math.round((ratingValue - (starIndex - 1)) * 100)
                  : 0;

              if (fillPercent >= 100) {
                return (
                  <Star 
                    key={starIndex} 
                    className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" 
                  />
                );
              }
              if (fillPercent <= 0) {
                return (
                  <Star 
                    key={starIndex} 
                    className="w-3.5 h-3.5 fill-slate-200 text-slate-200 shrink-0" 
                  />
                );
              }

              // Fractional Star ("نجمة مكسرة"): 100% identical Lucide Star size with RTL width clipping
              return (
                <div key={starIndex} className="relative w-3.5 h-3.5 shrink-0 inline-block overflow-hidden">
                  {/* Empty background Lucide star */}
                  <Star className="w-3.5 h-3.5 fill-slate-200 text-slate-200 absolute inset-0" />
                  {/* Filled golden Lucide star clipped from right in RTL */}
                  <div 
                    className="absolute inset-y-0 right-0 overflow-hidden pointer-events-none"
                    style={{ width: `${fillPercent}%` }}
                  >
                    <div className="w-3.5 h-3.5 relative">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 absolute top-0 right-0" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Action Button: Luxury Rose (#DF7E93) */}
        {requiresOptions ? (
          <button
            type="button"
            onClick={handleAddToCartClick}
            className="w-full py-2 sm:py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-xs bg-[#DF7E93] hover:bg-[#D46B82] text-white shadow-pink-200/50 hover:shadow-md cursor-pointer"
            title="تحديد الخيارات والمقاسات"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>أضف إلى السلة</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAddToCartClick}
            className={`w-full py-2 sm:py-2.5 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
              isInCart
                ? 'bg-pink-50 text-[#DF7E93] border border-[#DF7E93]/40 font-black'
                : 'bg-[#DF7E93] hover:bg-[#D46B82] text-white shadow-pink-200/50 hover:shadow-md'
            }`}
            title="إضافة مباشرة إلى السلة"
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4 text-[#DF7E93] stroke-[2.5]" />
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

export default memo(ProductCard);
