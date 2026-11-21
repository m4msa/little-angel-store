import React from 'react';
import { X, ChevronLeft, Heart, ShoppingBag, Phone, Mail, User } from 'lucide-react';

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
  onOpenAccount
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header matching Tefly: "القائمة الرئيسية" with close button on left */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
            <h3 className="font-bold text-slate-900 text-base">القائمة الرئيسية</h3>
            
            <button
              onClick={onClose}
              className="p-1.5 text-rose-500 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Drawer Menu Items (100% Matching Tefly Frhaty Layout) */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-sm">
            
            {/* 0. حسابي وتسجيل الدخول */}
            <button
              onClick={() => {
                if (onOpenAccount) onOpenAccount();
                onClose();
              }}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-pink-50/60 hover:bg-pink-100/60 text-slate-900 font-bold transition-colors text-right"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#DF7E93] text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="block text-xs font-black text-slate-900">
                    {currentUser ? currentUser.name : 'حسابي / تسجيل الدخول'}
                  </span>
                  <span className="block text-[10px] text-slate-500 font-normal">
                    {currentUser ? 'موقع التوصيل وسجل مشترياتي' : 'حفظ بياناتك وعنوانك وسجل طلباتك'}
                  </span>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
            </button>

            {/* 1. تخفيضات (Highlighted in Rose/Coral text just like Tefly) */}
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

            {/* 2. المدونة */}
            <button
              onClick={() => {
                onClose();
              }}
              className="w-full flex items-center justify-between px-5 py-3.5 text-slate-800 font-medium hover:bg-slate-50 transition-colors text-right"
            >
              <span>المدونة</span>
            </button>

            {/* 3. جميع المنتجات */}
            <button
              onClick={() => {
                onSelectCategory('all');
                onClose();
              }}
              className="w-full flex items-center justify-between px-5 py-3.5 text-slate-800 font-medium hover:bg-slate-50 transition-colors text-right"
            >
              <span>جميع المنتجات</span>
            </button>

            {/* Category Rows with Subtle Left Chevron (‹) like Tefly */}
            {categories.filter(c => c.id !== 'all' && c.id !== 'offers').map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors text-right ${
                  activeCategory === cat.id
                    ? 'text-brand-600 font-bold bg-pink-50/50'
                    : 'text-slate-800 font-medium hover:bg-slate-50'
                }`}
              >
                <span>{cat.name}</span>
                <ChevronLeft className="w-4 h-4 text-slate-300 stroke-[1.5]" />
              </button>
            ))}

            {/* Quick Links inside Drawer */}
            <div className="pt-2 pb-4 bg-slate-50/60 space-y-1">
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
                className="w-full flex items-center justify-between px-5 py-3 text-slate-700 hover:text-brand-600 transition-colors text-right font-medium"
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-brand-600" />
                  <span>سلة المشتريات</span>
                </span>
                <span className="text-xs bg-brand-100 text-brand-700 font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              </button>
            </div>

            {/* Important Policy Links (روابط مهمة) */}
            <div className="p-4 bg-white space-y-2 text-xs">
              <p className="font-bold text-slate-400 text-[11px] mb-1">روابط تهمك:</p>
              <div className="space-y-1.5 text-slate-600 font-medium">
                <p className="hover:text-brand-600 cursor-pointer">من نحن ورؤيتنا</p>
                <p className="hover:text-brand-600 cursor-pointer">سياسة الاستبدال والاسترجاع الميسر</p>
                <p className="hover:text-brand-600 cursor-pointer">الشحن والتوصيل السريع (48 ساعة)</p>
              </div>
            </div>

          </div>

          {/* Footer Contact Info */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-brand-600" />
              <a href="https://wa.me/967775302137" dir="ltr" className="hover:text-slate-800">
                +967 775 302 137
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-brand-600" />
              <a href="mailto:msaawadi2016@gmail.com" className="hover:text-slate-800 truncate">
                msaawadi2016@gmail.com
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
