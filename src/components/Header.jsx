import React, { useState } from 'react';
import { ShoppingBag, Search, Heart, Sparkles, X, User, Menu, SlidersHorizontal } from 'lucide-react';

export default function Header({ 
  cartCount, 
  wishlistCount,
  onOpenCart, 
  onOpenWishlist,
  onOpenStories,
  onOpenMenu,
  searchTerm, 
  setSearchTerm,
  isSearchOpen,
  setIsSearchOpen,
  isAdminLoggedIn,
  isAdminView,
  setIsAdminView,
  onAdminLogout,
  onLogoClick,
  storeSettings,
  currentUser,
  onOpenAccount
}) {
  const [internalSearchOpen, setInternalSearchOpen] = useState(false);
  const searchOpen = isSearchOpen !== undefined ? isSearchOpen : internalSearchOpen;

  const handleToggleSearch = () => {
    const nextState = !searchOpen;
    if (setIsSearchOpen) setIsSearchOpen(nextState);
    else setInternalSearchOpen(nextState);
    if (!nextState && setSearchTerm) {
      setSearchTerm('');
    }
  };

  return (
    <header 
      className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-[#DF7E93] via-[#E88E9F] to-[#DF7E93] text-white backdrop-blur-md border-b border-pink-300/50 shadow-md transition-all w-full"
      style={{
        background: storeSettings?.primaryColor && storeSettings?.secondaryColor
          ? `linear-gradient(to right, ${storeSettings.primaryColor}, ${storeSettings.secondaryColor}, ${storeSettings.primaryColor})`
          : undefined
      }}
    >
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Navbar Row (3-Column balanced layout) */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* 1. جهة اليمين (RTL Start): زر القائمة (3 خطوط) بيمين اسم الموقع + اسم الموقع */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0 flex-1 justify-start">
            <button
              type="button"
              onClick={onOpenMenu}
              className="p-2 sm:p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-xs transition-all active:scale-95 flex items-center justify-center shadow-xs cursor-pointer group"
              title="القائمة وجميع الأقسام"
              aria-label="القائمة وجميع الأقسام"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
            </button>

            <div 
              onClick={onLogoClick || (() => setIsAdminView(false))}
              className="flex items-center cursor-pointer select-none py-1"
              title={`الرئيسية - ${storeSettings?.storeName || 'الملاك الصغير'}`}
            >
              <span className="font-black text-white text-base sm:text-2xl tracking-tight drop-shadow-sm hover:opacity-95 transition-opacity">
                {storeSettings?.storeName || 'الملاك الصغير'}
              </span>
            </div>
          </div>

          {/* 2. المنتصف: الشعار الرسمي المعتمد للمتجر في المنتصف تماماً */}
          <div 
            onClick={onLogoClick || (() => setIsAdminView(false))}
            className="flex items-center justify-center cursor-pointer select-none py-1 group shrink-0"
            title={storeSettings?.storeName || 'الملاك الصغير'}
          >
            <img 
              src={storeSettings?.logoUrl || '/logo.png'} 
              alt={storeSettings?.storeName || 'الملاك الصغير'} 
              width="170"
              height="80"
              className="h-14 sm:h-18 md:h-20 w-auto max-w-[130px] sm:max-w-[170px] object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105" 
            />
          </div>

          {/* 3. جهة اليسار (RTL End): أزرار التحكم والقائمة */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-1 justify-end">

            {/* زر المفضلة (يظهر على شاشات الكمبيوتر والتابلت مع العداد) */}
            <button
              type="button"
              onClick={onOpenWishlist}
              className="hidden md:flex relative p-2 sm:p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-xs transition-all active:scale-95 items-center justify-center shadow-xs"
              title="قائمة المفضلة"
              aria-label="المفضلة"
            >
              <Heart className="w-5 h-5 text-white" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#DF7E93] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* زر السلة (يظهر على شاشات الكمبيوتر والتابلت مع العداد) */}
            <button
              type="button"
              onClick={onOpenCart}
              className="hidden md:flex relative p-2 sm:p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-xs transition-all active:scale-95 items-center justify-center shadow-xs"
              title="سلة المشتريات"
              aria-label="سلة المشتريات"
            >
              <ShoppingBag className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-[#DF7E93] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* زر الملف الشخصي وحساب العميل */}
            <button
              type="button"
              onClick={onOpenAccount || (() => setIsAdminView(true))}
              className="p-2 sm:p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-xs transition-all active:scale-95 flex items-center gap-1.5 shadow-xs"
              title={currentUser ? `حسابي (${currentUser.name})` : (isAdminLoggedIn ? "لوحة الإدارة" : "تسجيل الدخول / حسابي")}
              aria-label="الملف الشخصي"
            >
              <User className="w-5 h-5 text-white" />
              {currentUser && (
                <span className="hidden sm:inline text-xs font-bold max-w-[80px] truncate text-white">
                  {currentUser.name.split(' ')[0]}
                </span>
              )}
            </button>

            {/* زر البحث */}
            <button
              type="button"
              onClick={handleToggleSearch}
              className={`p-2 sm:p-2.5 rounded-2xl border transition-all active:scale-95 flex items-center justify-center shadow-xs backdrop-blur-xs ${
                searchOpen || searchTerm
                  ? 'bg-white text-[#DF7E93] border-white shadow-sm'
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
              }`}
              title="البحث عن منتج"
              aria-label="البحث"
            >
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="pb-3 pt-1 w-full animate-fadeIn">
            <div className="relative w-full max-w-xl mx-auto">
              <input
                type="text"
                placeholder="ابحثي عن أطقم استقبال، تطريز اسم، مهادات، سرائر، أو أي هاشتاج..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full bg-white text-slate-800 border border-pink-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-pink-300 transition-all shadow-md text-right placeholder-pink-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-400" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Pink Welcome / Announcement Bar */}
      <div className="bg-black/10 text-white text-[11px] sm:text-xs py-1.5 px-3 text-center font-medium flex items-center justify-center gap-2 border-t border-white/15">
        <Sparkles className="w-3.5 h-3.5 text-yellow-200 shrink-0" />
        <span className="truncate">
          {storeSettings?.announcementText || 'شحن مجاني للطلبات الأكثر من 299 ر.س | استخدمي كود FIRST10 لخصم 10%'}
        </span>
      </div>
    </header>
  );
}
