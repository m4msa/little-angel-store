import React from 'react';
import { Phone, Mail, MapPin, Instagram, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ storeSettings }) {
  const storeName = storeSettings?.storeName || 'الملاك الصغير';
  const logoUrl = storeSettings?.logoUrl || '/logo.png';
  const description = storeSettings?.storeDescription || 'متجر سعودي رائد يوفر أرقى مستلزمات المواليد والأمهات، متخصص في أطقم الاستقبال الملكية المطرزة حسب الطلب، والمهادات والسرائر الآمنة لنمنح صغيرك بداية حياة مفعمة بالحب والأناقة.';
  const displayPhone = storeSettings?.displayPhoneNumber || '+967 775 302 137';
  const whatsappNum = storeSettings?.whatsappNumber || '967775302137';
  const instagram = storeSettings?.instagramUrl || 'https://instagram.com';

  return (
    <footer className="bg-[#FCECEF]/90 text-slate-700 pt-14 pb-28 sm:pb-32 mt-16 border-t border-pink-200/80 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top 4-Column Grid matching Tefly & Mini Baby */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1 text-right">
            <div className="flex items-center gap-2.5">
              <img 
                src={logoUrl} 
                alt={storeName} 
                width="160"
                height="64"
                className="h-16 w-auto object-contain drop-shadow-2xs" 
              />
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {description}
            </p>

            {/* Saudi Business Center Trust Badge */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-700 bg-white/90 p-2.5 rounded-2xl border border-pink-200 shadow-2xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>موثق في المركز السعودي للأعمال ومنصة معروف</span>
            </div>
          </div>

          {/* Col 2: Important Links (روابط مهمة) */}
          <div className="space-y-3 text-right">
            <h3 className="text-sm font-bold text-slate-900 border-b border-pink-200/80 pb-2">روابط مهمة</h3>
            <ul className="space-y-2 text-xs text-slate-700 font-medium">
              <li><a href="#" className="hover:text-brand-700 transition-colors">من نحن</a></li>
              <li><a href="#" className="hover:text-brand-700 transition-colors">اتصل بنا</a></li>
              <li><a href="#" className="hover:text-brand-700 transition-colors">سياسة الخصوصية</a></li>
              <li><a href="#" className="hover:text-brand-700 transition-colors">الدفع والتوصيل السريع</a></li>
              <li><a href="#" className="hover:text-brand-700 transition-colors">سياسة الاستبدال والاسترجاع</a></li>
            </ul>
          </div>

          {/* Col 3: Customer Care (خدمة العملاء) */}
          <div className="space-y-3 text-right">
            <h3 className="text-sm font-bold text-slate-900 border-b border-pink-200/80 pb-2">خدمة العملاء</h3>
            <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-700 shrink-0" />
                <a href={`https://wa.me/${whatsappNum}`} target="_blank" rel="noreferrer" dir="ltr" className="hover:text-brand-700 transition-colors font-bold">
                  {displayPhone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-700 shrink-0" />
                <a href="mailto:msaawadi2016@gmail.com" className="hover:text-brand-700 transition-colors truncate font-semibold">
                  msaawadi2016@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-700 shrink-0" />
                <span>المملكة العربية السعودية</span>
              </li>
            </ul>

            {/* Social Icons matching Mini Baby */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-slate-700 mb-2">تابعونا على وسائل التواصل:</p>
              <div className="flex items-center gap-2">
                <a 
                  href={`https://wa.me/${whatsappNum}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white border border-pink-200 hover:border-brand-500 flex items-center justify-center text-slate-700 hover:text-brand-700 transition-colors shadow-2xs"
                  title="واتساب"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <a 
                  href="mailto:msaawadi2016@gmail.com"
                  className="w-8 h-8 rounded-full bg-white border border-pink-200 hover:border-brand-500 flex items-center justify-center text-slate-700 hover:text-brand-700 transition-colors shadow-2xs"
                  title="البريد الإلكتروني"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
                <a 
                  href={instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white border border-pink-200 hover:border-brand-500 flex items-center justify-center text-slate-700 hover:text-brand-700 transition-colors shadow-2xs cursor-pointer"
                  title="إنستغرام"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: Payments & Legal Verification */}
          <div className="space-y-3 text-right">
            <h3 className="text-sm font-bold text-slate-900 border-b border-pink-200/80 pb-2">طرق الدفع والتوثيق</h3>
            <p className="text-xs text-slate-700 font-medium">
              بوابات دفع إلكترونية آمنة ومعتمدة في البنوك السعودية
            </p>
            
            {/* Payment Logos Pill Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="bg-white border border-slate-300 text-slate-900 font-bold px-2.5 py-1 rounded-xl text-[11px] shadow-2xs">
                مدى mada
              </span>
              <span className="bg-white border border-slate-300 text-slate-900 font-bold px-2.5 py-1 rounded-xl text-[11px] shadow-2xs">
                Apple Pay
              </span>
              <span className="bg-white border border-slate-300 text-slate-900 font-bold px-2.5 py-1 rounded-xl text-[11px] shadow-2xs">
                Visa
              </span>
              <span className="bg-white border border-slate-300 text-slate-900 font-bold px-2.5 py-1 rounded-xl text-[11px] shadow-2xs">
                Mastercard
              </span>
              <span className="bg-white border border-slate-300 text-pink-700 font-bold px-2.5 py-1 rounded-xl text-[11px] shadow-2xs">
                تابي Tabby
              </span>
              <span className="bg-white border border-slate-300 text-amber-800 font-bold px-2.5 py-1 rounded-xl text-[11px] shadow-2xs">
                تمارا Tamara
              </span>
              <span className="bg-white border border-slate-300 text-purple-700 font-bold px-2.5 py-1 rounded-xl text-[11px] shadow-2xs">
                stc pay
              </span>
            </div>

            {/* Official Commercial & Tax Numbers */}
            <div className="pt-2 text-[11px] text-slate-700 space-y-1 font-mono font-bold">
              <p>الرقم الضريبي: 300891966600003</p>
              <p>السجل التجاري: 4030391872</p>
            </div>
          </div>

        </div>

        {/* Bottom Bar matching Tefly & Mini Baby */}
        <div className="border-t border-pink-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-700 gap-3 font-medium">
          <p>© 2026 جميع الحقوق محفوظة لمتجر {storeName} في المملكة العربية السعودية.</p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 font-semibold">صنع بكل إتقان وعناية لملاككِ الصغير</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
