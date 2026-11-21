import React, { useEffect, useState } from 'react';

/**
 * SplashTransition:
 * شاشة البداية وشاشة الانتقال السلسة التي تعرض شعار "الملاك الصغير"
 * في منتصف الشاشة عند فتح المتجر لأول مرة أو عند الانتقالات السريعة بين الصفحات
 * والأقسام وتفاصيل المنتجات (مطابقة تماماً لحركة موقع طفلي فرحتي).
 */
export default function SplashTransition({ isVisible, logoUrl, storeName }) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsFading(false);
    } else {
      setIsFading(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsFading(false);
      }, 350); // وقت التلاشي السلس
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md select-none transition-opacity duration-300 pointer-events-none ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center justify-center space-y-4 transform transition-all duration-300 scale-100">
        
        {/* شعار المتجر في المنتصف تماماً مع نبض انسيابي فخم */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
          <img
            src={logoUrl || '/logo.png'}
            alt={storeName || 'الملاك الصغير'}
            className="w-full h-full object-contain drop-shadow-md animate-pulse"
          />
        </div>

        {/* اسم المتجر ورمز التحميل الملكي الوردي */}
        <div className="flex flex-col items-center space-y-2">
          <span className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
            {storeName || 'الملاك الصغير'}
          </span>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-[#DF7E93] animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-2 h-2 rounded-full bg-[#DF7E93] animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-2 h-2 rounded-full bg-[#DF7E93] animate-bounce"></span>
          </div>
        </div>

      </div>
    </div>
  );
}
