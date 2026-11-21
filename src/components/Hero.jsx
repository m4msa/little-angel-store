import React from 'react';
import { Truck, ShieldCheck, RefreshCw, CreditCard, Sparkles } from 'lucide-react';

export default function Hero({ onExploreClick }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-pink-50/40 to-slate-50 pt-6 pb-10 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-right">
            <div className="inline-flex items-center gap-1.5 bg-pink-100 text-brand-700 px-3.5 py-1 rounded-full text-xs font-bold border border-pink-200">
              <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
              <span>أفضل تشكيلة أطفال لعام 2026</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              اعتني بأناقة وراحة <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-brand-600 via-pink-500 to-rose-400">
                ملاكك الصغير
              </span> بأجود الخامات
            </h2>

            <p className="text-slate-600 text-xs sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              نوفر في متجر <strong>الملاك الصغير</strong> أرقى تشكيلات ملابس المواليد، مستلزمات العناية اليومية، والألعاب التعليمية المصنوعة من مواد آمنة وصديقة للطفل مع توصيل سريع حتى باب منزلك.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={onExploreClick}
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-2xl shadow-md shadow-pink-200 transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm"
              >
                تصفح المنتجات الآن
              </button>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>الأسعار شاملة ضريبة القيمة المضافة</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative overflow-hidden">
            <div className="relative mx-auto max-w-sm sm:max-w-md">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80"
                  alt="مستلزمات الملاك الصغير"
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                />
                <div className="absolute bottom-3 right-3 left-3 bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-md border border-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-black text-xs">
                      %
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">عروض مميزة</p>
                      <p className="text-[10px] text-slate-500">خصومات تصل إلى 30%</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-brand-600 bg-pink-50 px-2 py-0.5 rounded-lg">
                    لفترة محدودة
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-pink-100/80">
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-brand-600 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-900 leading-tight">شحن سريع</h4>
              <p className="text-[10px] text-slate-400">2-4 أيام عمل</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-sky-600 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-900 leading-tight">دفع آمن</h4>
              <p className="text-[10px] text-slate-400">مدى وApple Pay</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-900 leading-tight">خامات آمنة</h4>
              <p className="text-[10px] text-slate-400">قطن عضوي 100%</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-900 leading-tight">استرجاع سهل</h4>
              <p className="text-[10px] text-slate-400">خلال 14 يوماً</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
