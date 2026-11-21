import React from 'react';
import { X, ChevronLeft, Heart, ShoppingBag, Phone, Mail, User, Home, Grid, MessageCircle, Sparkles, HelpCircle } from 'lucide-react';

export default function SideDrawer({
  isOpen,
  onClose,
  categories,
  activeCategory,
  onSelectCategory,
  onOpenWishlist,
  onOpenCart,
  wishlistCount,
  cartCount,
  currentUser,
  onOpenAccount,
  onNavigateHome,
  onOpenHelp
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header matching Tefly: "القائمة الرئيسية" with close button on left */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <h3 className="font-black text-slate-900 text-base">القائمة الرئيسية</h3>
            
            <button
              onClick={onClose}
              className="p-1.5 text-rose-500 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Drawer Menu Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-sm">
            
            {/* 1. أول شيء فوقها الرئيسية (Home at the top) */}
            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                onClose();
              }}
              className="w-full flex items-center justify-between px-5 py-3.5 text-slate-900 font-extrabold hover:bg-pink-50/70 transition-colors text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#DF7E93] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Home className="w-4 h-4" />
                </div>
                <span className="text-sm font-black">الرئيسية</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-300 stroke-[1.5]" />
            </button>

            {/* 2. حسابي وسجل مشترياتي */}
            <button
              onClick={() => {
                if (onOpenAccount) onOpenAccount();
                onClose();
              }}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-pink-50/40 hover:bg-pink-100/60 text-slate-900 font-bold transition-colors text-right"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-[#DF7E93] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-black text-slate-900">
                    {currentUser ? currentUser.name : 'حسابي / تسجيل الدخول'}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-normal">
                    {currentUser ? 'العنوان وسجل طلباتي' : 'حفظ بياناتك وعنوانك وسجل مشترياتك'}
                  </span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>

            {/* 3. تخفيضات وعروض كبرى */}
            <button
              onClick={() => {
                onSelectCategory('offers');
                onClose();
              }}
              className="w-full flex items-center justify-between px-5 py-3.5 text-rose-500 font-bold hover:bg-rose-50/50 transition-colors text-right"
            >
              <span>تخفيضات وعروض كبرى</span>
              <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black">
                خصم حتى 30%
              </span>
            </button>

            {/* 4. جميع المنتجات */}
            <button
              onClick={() => {
                onSelectCategory('all');
                onClose();
              }}
              className="w-full flex items-center justify-between px-5 py-3.5 text-slate-800 font-bold hover:bg-slate-50 transition-colors text-right"
            >
              <div className="flex items-center gap-2.5">
                <Grid className="w-4 h-4 text-slate-400" />
                <span>جميع الأقسام والمنتجات</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-300 stroke-[1.5]" />
            </button>

            {/* Category Rows with Subtle Left Chevron (‹) */}
            <div className="pt-1">
              <div className="px-5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                أقسام المتجر
              </div>
              {categories.filter(c => c.id !== 'all' && c.id !== 'offers').map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-5 py-3 transition-colors text-right ${
                    activeCategory === cat.id
                      ? 'text-[#DF7E93] font-bold bg-pink-50/50'
                      : 'text-slate-800 font-medium hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs">{cat.name}</span>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-300 stroke-[1.5]" />
                </button>
              ))}
            </div>

            {/* Quick Links inside Drawer */}
            <div className="pt-2 pb-2 bg-slate-50/60 space-y-1">
              <button
                onClick={() => {
                  onOpenWishlist();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-5 py-3 text-slate-700 hover:text-rose-600 transition-colors text-right font-medium"
              >
                <span className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>المنتجات المفضلة</span>
                </span>
                <span className="text-xs bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              </button>

              <button
                onClick={() => {
                  onOpenCart();
                  onClose();
                }}
                className="w-full flex items-center justify-between px-5 py-3 text-slate-700 hover:text-[#DF7E93] transition-colors text-right font-medium"
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-[#DF7E93]" />
                  <span>سلة المشتريات</span>
                </span>
                <span className="text-xs bg-pink-100 text-pink-700 font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              </button>
            </div>

            {/* أسفل شيء: المساعدة والدعم الفني */}
            <button
              onClick={() => {
                if (onOpenHelp) onOpenHelp();
                onClose();
              }}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-emerald-50/60 hover:bg-emerald-100/60 text-slate-900 font-bold transition-colors text-right border-t border-emerald-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-black text-slate-900">المساعدة وخدمة العملاء</span>
                  <span className="block text-[10px] text-slate-500 font-normal">استفسارات الطلبات، الشحن، والاستبدال</span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>

          </div>

          {/* Footer Contact Info */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <a href="https://wa.me/967775302137" dir="ltr" className="hover:text-slate-800 font-bold">
                +967 775 302 137
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <a href="mailto:msaawadi2016@gmail.com" className="hover:text-slate-800 truncate font-semibold">
                msaawadi2016@gmail.com
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
