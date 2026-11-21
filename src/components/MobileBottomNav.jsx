import React from 'react';
import { Home, Grid, Heart, ShoppingBag, MessageCircle } from 'lucide-react';

export default function MobileBottomNav({
  activeTab,
  onNavigateHome,
  onOpenCategories,
  onOpenWishlist,
  onOpenCart,
  onOpenHelp,
  cartCount,
  wishlistCount
}) {
  return (
    <nav 
      aria-label="قائمة التنقل الرئيسية"
      className="
        fixed z-50 text-white backdrop-blur-md transition-all duration-300
        /* Mobile: Bottom Navigation Bar */
        bottom-0 inset-x-0 w-full py-2 px-3
        bg-gradient-to-r from-[#DF7E93] via-[#E88E9F] to-[#DF7E93]
        border-t border-pink-300/50 shadow-[0_-4px_25px_rgba(223,126,147,0.35)]

        /* Desktop, Laptops & iPads: Sleek Vertical Floating Sidebar on the Left */
        md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:inset-x-auto md:right-auto md:left-4 lg:left-6
        md:w-auto md:py-4 md:px-2 md:rounded-3xl
        md:bg-gradient-to-b md:from-[#DF7E93]/95 md:via-[#E88E9F]/95 md:to-[#DF7E93]/95
        md:border md:border-white/40 md:shadow-[0_12px_45px_rgba(223,126,147,0.45)]
      "
    >
      <div className="
        max-w-4xl mx-auto flex items-center justify-around
        /* Desktop: Vertical Stack */
        md:flex-col md:justify-center md:gap-3 md:w-auto
      ">
        
        {/* 1. الرئيسية */}
        <button
          type="button"
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 md:w-16 md:py-2.5 rounded-2xl transition-all duration-200 group ${
            activeTab === 'home' 
              ? 'bg-white text-[#DF7E93] font-black scale-105 shadow-sm' 
              : 'text-white hover:text-white hover:bg-white/20'
          }`}
          title="الرئيسية"
          aria-label="الرئيسية"
        >
          <Home className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === 'home' ? 'text-[#DF7E93]' : 'text-white'}`} />
          <span className="text-[11px] font-bold">الرئيسية</span>
        </button>

        {/* 2. الأقسام */}
        <button
          type="button"
          onClick={onOpenCategories}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 md:w-16 md:py-2.5 rounded-2xl transition-all duration-200 group ${
            activeTab === 'categories' 
              ? 'bg-white text-[#DF7E93] font-black scale-105 shadow-sm' 
              : 'text-white hover:text-white hover:bg-white/20'
          }`}
          title="الأقسام"
          aria-label="الأقسام"
        >
          <Grid className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === 'categories' ? 'text-[#DF7E93]' : 'text-white'}`} />
          <span className="text-[11px] font-bold">الأقسام</span>
        </button>

        {/* 3. السلة */}
        <button
          type="button"
          onClick={onOpenCart}
          className={`relative flex flex-col items-center justify-center gap-1 px-3 py-1.5 md:w-16 md:py-2.5 rounded-2xl transition-all duration-200 group ${
            activeTab === 'cart' 
              ? 'bg-white text-[#DF7E93] font-black scale-105 shadow-sm' 
              : 'text-white hover:text-white hover:bg-white/20'
          }`}
          title="السلة"
          aria-label="السلة"
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === 'cart' ? 'text-[#DF7E93]' : 'text-white'}`} />
            {cartCount > 0 && (
              <span className={`absolute -top-1.5 -right-2 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-xs ${
                activeTab === 'cart' ? 'bg-[#DF7E93] text-white' : 'bg-white text-[#DF7E93]'
              }`}>
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold">السلة</span>
        </button>

        {/* 4. المفضلة */}
        <button
          type="button"
          onClick={onOpenWishlist}
          className={`relative flex flex-col items-center justify-center gap-1 px-3 py-1.5 md:w-16 md:py-2.5 rounded-2xl transition-all duration-200 group ${
            activeTab === 'wishlist' 
              ? 'bg-white text-[#DF7E93] font-black scale-105 shadow-sm' 
              : 'text-white hover:text-white hover:bg-white/20'
          }`}
          title="المفضلة"
          aria-label="المفضلة"
        >
          <div className="relative">
            <Heart className={`w-5 h-5 transition-transform group-hover:scale-110 ${
              activeTab === 'wishlist' 
                ? 'fill-[#DF7E93] text-[#DF7E93]' 
                : wishlistCount > 0 
                  ? 'fill-white text-white' 
                  : 'text-white'
            }`} />
            {wishlistCount > 0 && (
              <span className={`absolute -top-1.5 -right-2 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-xs ${
                activeTab === 'wishlist' ? 'bg-[#DF7E93] text-white' : 'bg-white text-[#DF7E93]'
              }`}>
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold">المفضلة</span>
        </button>

        {/* 5. مساعدة */}
        <button
          type="button"
          onClick={onOpenHelp}
          className={`flex flex-col items-center justify-center gap-1 px-3 py-1.5 md:w-16 md:py-2.5 rounded-2xl transition-all duration-200 group ${
            activeTab === 'help' 
              ? 'bg-white text-[#DF7E93] font-black scale-105 shadow-sm' 
              : 'text-white hover:text-white hover:bg-white/20'
          }`}
          title="مركز المساعدة"
          aria-label="مركز المساعدة"
        >
          <MessageCircle className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === 'help' ? 'text-[#DF7E93]' : 'text-white'}`} />
          <span className="text-[11px] font-bold">مساعدة</span>
        </button>

      </div>
    </nav>
  );
}
