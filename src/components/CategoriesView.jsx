import React, { memo, useMemo } from 'react';
import { ChevronLeft, ArrowRight, Package } from 'lucide-react';
import CategoryVisualGrid from './CategoryVisualGrid';
import ProductCard from './ProductCard';
import { filterProductsByCategory } from '../utils/catalogUtils';

/**
 * CategoriesView component allows browsing all categories or deep-diving into
 * a specific selected category's products with optimized memoized lookups.
 */
function CategoriesView({
  categories = [],
  products = [],
  selectedCategoryId,
  onSelectCategory,
  onBackToCategories,
  onAddToCart,
  cart = [],
  onOpenQuickView,
  wishlist = [],
  onToggleFavorite
}) {
  // Fast Set lookups for cart and wishlist status
  const cartIdsSet = useMemo(() => new Set(cart.map((item) => item.id)), [cart]);
  const wishlistIdsSet = useMemo(() => new Set(wishlist), [wishlist]);

  // Filtered products for currently selected category view
  const categoryProducts = useMemo(() => {
    if (!selectedCategoryId) return [];
    return filterProductsByCategory(products, selectedCategoryId);
  }, [products, selectedCategoryId]);

  // Precalculated product count per category for all categories view
  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach((cat) => {
      counts[cat.id] = filterProductsByCategory(products, cat.id).length;
    });
    return counts;
  }, [categories, products]);

  // 1. Detailed Category Products View
  if (selectedCategoryId) {
    const currentCat = categories.find((c) => c.id === selectedCategoryId);
    const categoryName = currentCat?.name || 'منتجات القسم';
    const categorySubtitle = currentCat?.subtitle || '';

    return (
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 animate-fadeIn select-none">
        
        {/* Top Back Action */}
        <div className="flex items-center justify-start gap-3 select-none">
          <button
            type="button"
            onClick={onBackToCategories}
            className="inline-flex items-center gap-2 bg-white hover:bg-pink-50 text-slate-800 hover:text-[#DF7E93] border border-pink-200/90 px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
            title="الرجوع لكافة الأقسام"
          >
            <ArrowRight className="w-4 h-4 text-[#DF7E93]" />
            <span>الرجوع لكافة الأقسام</span>
          </button>
        </div>

        {/* Category Header Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs space-y-2 text-center sm:text-right">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {categoryName}
          </h2>
          {categorySubtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
              {categorySubtitle}
            </p>
          )}
        </div>

        {/* Category Products Grid */}
        {categoryProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200/80">
            <p className="text-base font-bold text-slate-700">
              لا توجد منتجات متوفرة حالياً في هذا القسم
            </p>
            <button
              type="button"
              onClick={onBackToCategories}
              className="text-xs text-[#DF7E93] font-bold hover:underline cursor-pointer"
            >
              تصفح الأقسام الأخرى
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {categoryProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                isInCart={cartIdsSet.has(product.id)}
                onOpenQuickView={() => onOpenQuickView && onOpenQuickView(product, selectedCategoryId)}
                isFavorite={wishlistIdsSet.has(product.id)}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. All Categories Overview
  const visibleCategories = categories.filter((c) => c.id !== 'all');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 select-none animate-fadeIn">
      
      {/* Visual Category Photo Grid */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
        <CategoryVisualGrid
          categories={categories}
          activeCategory=""
          onSelectCategory={(catId) => onSelectCategory && onSelectCategory(catId)}
        />
      </div>

      {/* Detailed Category List with Items Counter */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="border-b border-pink-100 pb-3">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
            جميع التصنيفات ({visibleCategories.length} قسماً)
          </h3>
          <p className="text-xs text-slate-400">
            اضغطي على أي قسم للانتقال المباشر وتصفح كافة منتجاته
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {visibleCategories.map((cat) => {
            const count = categoryCounts[cat.id] || 0;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                className="group p-3.5 rounded-2xl border border-slate-100 hover:border-pink-200 hover:bg-pink-50/40 transition-all cursor-pointer flex items-center justify-between"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectCategory && onSelectCategory(cat.id);
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#DF7E93] group-hover:bg-[#DF7E93] group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#DF7E93] transition-colors">
                      {cat.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {count} منتجات متوفرة
                    </span>
                  </div>
                </div>

                <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-[#DF7E93] group-hover:-translate-x-1 transition-all" />
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default memo(CategoriesView);
