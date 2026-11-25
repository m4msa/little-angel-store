import React, { useState } from 'react';
import { Heart, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { FALLBACK_IMAGE } from '../utils/orderCalculations';

export default function WishlistView({
  wishlist = [],
  products = [],
  onAddToCart,
  onToggleFavorite,
  onOpenProductDetails,
  onReturnHome
}) {
  const [addedItemMap, setAddedItemMap] = useState({});

  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const favoriteProducts = safeProducts.filter((product) =>
    safeWishlist.some((id) => String(id) === String(product?.id))
  );

  const handleAddToCartClick = (product) => {
    if (!product) return;

    if (typeof onAddToCart === 'function') {
      onAddToCart(product);
    }

    // Temporary "Added" feedback
    setAddedItemMap((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const handleToggle = (productId) => {
    if (typeof onToggleFavorite === 'function') {
      onToggleFavorite(productId);
    }
  };

  const handleProductClick = (product) => {
    if (typeof onOpenProductDetails === 'function') {
      onOpenProductDetails(product);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {favoriteProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-[#DF7E93]">
            <Heart className="w-10 h-10 fill-pink-100" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-800">قائمة المفضلة فارغة</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              احفظي أطقم ومستلزمات طفلك المفضلة بالنقر على رمز القلب في أي منتج للرجوع إليها وشرائها بسهولة
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={onReturnHome}
              className="bg-gradient-to-r from-[#DF7E93] to-pink-500 hover:from-[#d56b82] hover:to-pink-600 text-white font-bold px-8 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <span>استكشفي المنتجات الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Grid of Favorite Products */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {favoriteProducts.map((product) => {
            const isAdded = !!addedItemMap[product.id];
            const price = Math.max(0, Number(product?.price) || 0);
            const originalPrice = Number(product?.originalPrice) || 0;
            const hasDiscount = originalPrice > price;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200/70 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="relative">
                  {/* Product Image */}
                  <div
                    onClick={() => handleProductClick(product)}
                    className="aspect-square overflow-hidden bg-slate-50 cursor-pointer"
                  >
                    <img
                      src={product.image || FALLBACK_IMAGE}
                      alt={product.name || 'منتج'}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Remove from Wishlist Button */}
                  <button
                    type="button"
                    onClick={() => handleToggle(product.id)}
                    className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-rose-500 shadow-xs hover:scale-110 transition-transform"
                    title="إزالة من المفضلة"
                    aria-label="إزالة من المفضلة"
                  >
                    <Heart className="w-4 h-4 fill-rose-500" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4
                      onClick={() => handleProductClick(product)}
                      className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 cursor-pointer hover:text-[#DF7E93] transition-colors"
                    >
                      {product.name}
                    </h4>
                  </div>

                  <div className="pt-2 space-y-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm sm:text-base font-black text-[#DF7E93]">
                        {price} ر.س
                      </span>
                      {hasDiscount && (
                        <span className="text-[11px] text-slate-400 line-through">
                          {originalPrice} ر.س
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCartClick(product)}
                      className={`w-full font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                        isAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-pink-50 hover:bg-[#DF7E93] text-[#DF7E93] hover:text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>تمت الإضافة للسلة</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>أضيفي للسلة</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
