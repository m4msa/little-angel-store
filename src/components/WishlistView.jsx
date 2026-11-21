import React from 'react';
import { ArrowRight, Heart, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function WishlistView({
  wishlist,
  products,
  onAddToCart,
  onToggleFavorite,
  onOpenProductDetails,
  onReturnHome
}) {
  const favoriteProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {favoriteProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-[#DF7E93]">
            <Heart className="w-10 h-10 fill-pink-100" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-800">
              قائمة المفضلة فارغة
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              احفظي أطقم ومستلزمات طفلك المفضلة بالنقر على رمز القلب في أي منتج للرجوع إليها وشرائها بسهولة
            </p>
          </div>
          <div className="pt-2">
            <button
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
          {favoriteProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-white rounded-3xl border border-slate-200/70 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="relative">
                {/* Product Image */}
                <div 
                  onClick={() => onOpenProductDetails && onOpenProductDetails(product)}
                  className="aspect-square overflow-hidden bg-slate-50 cursor-pointer"
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Remove from Wishlist Button */}
                <button
                  onClick={() => onToggleFavorite(product.id)}
                  className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-rose-500 shadow-sm hover:scale-110 transition-transform"
                  title="إزالة من المفضلة"
                >
                  <Heart className="w-4 h-4 fill-rose-500" />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 
                    onClick={() => onOpenProductDetails && onOpenProductDetails(product)}
                    className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 cursor-pointer hover:text-[#DF7E93]"
                  >
                    {product.name}
                  </h4>
                </div>

                <div className="pt-2 space-y-2 border-t border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm sm:text-base font-black text-[#DF7E93]">
                      {product.price} ر.س
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[11px] text-slate-400 line-through">
                        {product.originalPrice} ر.س
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => onAddToCart(product)}
                    className="w-full bg-pink-50 hover:bg-[#DF7E93] text-[#DF7E93] hover:text-white font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>أضيفي للسلة</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

