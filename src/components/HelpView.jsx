import React, { useState } from 'react';
import { ArrowRight, MessageCircle, Phone, Mail, Clock, ShieldCheck, Truck, Sparkles, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

export default function HelpView({ onReturnHome }) {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'كيف يمكنني تخصيص وتطريز اسم المولود على الأطقم؟',
      a: 'عند اختيارك لأي منتج من منتجات تفصيل حسب الطلب أو أطقم الاستقبال، ستجدين حقلاً مخصصاً لكتابة اسم المولود واختيار لون خيوط التطريز مجاناً قبل الإضافة للسلة.'
    },
    {
      q: 'كم يستغرق تجهيز وتوصيل الطلب؟',
      a: 'يستغرق تجهيز وتطريز الطلبات الخاصة من 24 إلى 48 ساعة بعناية فائقة، ويتم التوصيل لكافة مدن المملكة خلال 2 إلى 4 أيام عمل.'
    },
    {
      q: 'ما هي طرق الدفع المتاحة في المتجر؟',
      a: 'نوفر جميع وسائل الدفع الآمنة تشمل: مدى (Mada)، أبل باي (Apple Pay)، فيزا وماستركارد، بالإضافة إلى خيار الدفع عند الاستلام.'
    },
    {
      q: 'هل يتوفر شحن مجاني؟',
      a: 'نعم! نوفر شحناً مجانياً وسريعاً لكافة الطلبات التي تتجاوز قيمتها 299 ر.س داخل المملكة.'
    },
    {
      q: 'ما هي سياسة الاستبدال والاسترجاع؟',
      a: 'نضمن لك استرجاع أو استبدال فوري خلال 7 أيام من استلام الطلب في حال وجود أي عيب مصنعي أو اختلاف عن المواصفات المطلوبة.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Quick Contact Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* WhatsApp Card */}
        <a
          href="https://wa.me/967775302137?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D9%84%D8%AF%D9%8A%20%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%AD%D9%88%D9%84%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%20%D8%A7%D9%84%D9%85%D9%84%D8%A7%D9%83%20%D8%A7%D9%84%D8%B5%D8%BA%D9%8A%D8%B1"
          target="_blank"
          rel="noreferrer"
          className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs hover:shadow-md transition-all group flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-black text-slate-800 text-sm">محادثة واتساب مباشرة</h4>
            <p className="text-[11px] text-slate-400">رد فوري خلال دقائق معدودة</p>
            <span className="text-xs font-bold text-emerald-600 inline-block pt-1">ابدأي المحادثة الآن</span>
          </div>
        </a>

        {/* Phone Support */}
        <a
          href="tel:+967775302137"
          className="bg-white p-5 rounded-3xl border border-pink-100 shadow-xs hover:shadow-md transition-all group flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#DF7E93] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Phone className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-black text-slate-800 text-sm">الاتصال المباشر</h4>
            <p className="text-[11px] text-slate-400 font-mono" dir="ltr">+967 775 302 137</p>
            <span className="text-xs font-bold text-[#DF7E93] inline-block pt-1">اتصلي بنا</span>
          </div>
        </a>

        {/* Working Hours */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-[#DF7E93]" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-black text-slate-800 text-sm">ساعات العمل</h4>
            <p className="text-[11px] text-slate-400">طوال أيام الأسبوع</p>
            <span className="text-xs font-bold text-slate-700 inline-block pt-1">24 ساعة متواصلة</span>
          </div>
        </div>

      </div>

      {/* Trust Pillars */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-black text-slate-900 text-base border-b border-pink-100 pb-3">
          مميزات التسوق مع الملاك الصغير
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#DF7E93] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">تفصيل ملكي مجاني</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                تطريز اسم طفلك بأرقى الخيوط الملكية لتبقى ذكرى استقبال لا تُنسى
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#DF7E93] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">توصيل آمن وسريع</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                تغليف فاخر وشحن مبرد ومعتمد يحافظ على جودة ونظافة القطع
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#DF7E93] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">ضمان الجودة الذهبي</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                قطن عضوي نقي 100% لطيف على بشرة الأطفال وحديثي الولادة
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-black text-slate-900 text-base border-b border-pink-100 pb-3">
          الأسئلة الأكثر شيوعاً
        </h3>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="border border-slate-100 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-right flex items-center justify-between gap-3 hover:bg-pink-50/50 transition-colors font-bold text-xs sm:text-sm text-slate-800"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#DF7E93] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-1 text-xs text-slate-500 leading-relaxed border-t border-slate-100/60 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

