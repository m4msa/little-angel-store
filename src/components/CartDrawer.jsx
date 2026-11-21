import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Sparkles, Tag, Check, Eye } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  onOpenProductDetails,
  discount,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  storeSettings
}) {
  if (!isOpen) return null;

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const freeShippingThreshold = storeSettings?.freeShippingThreshold ?? 299;
  const standardShippingFee = storeSettings?.standardShippingFee ?? 25;
  const validCoupon = storeSettings?.couponCode || 'FIRST10';
  const validDiscount = storeSettings?.couponDiscountPercent ?? 10;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardShippingFee;
  
  const discountAmount = appliedCoupon ? Math.round((subtotal * discount) / 100) : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const inputUpper = couponCode.trim().toUpperCase();
    if (inputUpper === validCoupon.toUpperCase() || inputUpper === 'ANGEL10') {
      onApplyCoupon(inputUpper, validDiscount);
      setCouponError('');
      setCouponCode('');
    } else {
      setCouponError('كود الخصم غير صالح أو منتهي');
    }
  };

  // Color dot helper
  const getColorBg = (colorName) => {
    if (!colorName) return 'bg-pink-300';
    if (colorName.includes('سماوي') || colorName.includes('أزرق')) return 'bg-sky-400';
    if (colorName.includes('أبيض')) return 'bg-slate-200';
    if (colorName.includes('بيج') || colorName.includes('كريمي')) return 'bg-amber-200';
    return 'bg-pink-400';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">سلة المشتريات</h3>
              <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-bold">
                {cartItems.length} منتجات
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Bar */}
          {cartItems.length > 0 && (
            <div className="bg-brand-50/70 p-3.5 sm:p-4 border-b border-brand-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-emerald-600 font-black text-[11px] sm:text-xs">تهانينا! حصلت على شحن مجاني</span>
                  ) : (
                    <span className="text-[11px] sm:text-xs">أضف بقيمة <strong className="text-brand-600 font-black">{remainingForFreeShipping} ر.س</strong> للشحن المجاني</span>
                  )}
                </span>
                <span className="text-brand-600 font-black text-xs">{Math.round(freeShippingProgress)}%</span>
              </div>
              <div className="w-full bg-pink-200/60 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-brand-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 text-base">سلتك فارغة حالياً</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  تصفح المنتجات المميزة لملاكك الصغير واختر ما يناسبه بأفضل جودة.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 bg-brand-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-brand-700 transition-colors"
                >
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} 
                  className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-pink-200 transition-all shadow-sm"
                >
                  {/* Clickable Image to view product */}
                  <div 
                    onClick={() => {
                      if (onOpenProductDetails) {
                        onClose();
                        onOpenProductDetails(item);
                      }
                    }}
                    className="relative cursor-pointer group shrink-0"
                    title="اضغط لمعاينة المنتج بالكامل"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Details Area */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Clickable Product Name */}
                      <h4 
                        onClick={() => {
                          if (onOpenProductDetails) {
                            onClose();
                            onOpenProductDetails(item);
                          }
                        }}
                        className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 hover:text-brand-600 cursor-pointer transition-colors"
                        title="معاينة تفاصيل المنتج"
                      >
                        {item.name}
                      </h4>

                      {/* Chosen Specifications: Size & Color Pill */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {/* Custom Embroidery Name if exists */}
                        {item.customBabyName && (
                          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                            تطريز: <strong className="text-brand-700">"{item.customBabyName}"</strong> ({item.nameLanguage === 'en' ? 'EN' : 'عربي'} • {item.threadColor || 'ذهبي'})
                          </span>
                        )}

                        {/* Uploaded Design File Indicator */}
                        {item.customDesignFile && (
                          <span className="text-[10px] bg-pink-50 text-brand-700 border border-pink-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                            <span>مرفق تصميم مخصص</span>
                          </span>
                        )}

                        {/* Size Pill */}
                        <span className="text-[10px] bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-bold">
                          المقاس: <span className="text-brand-700">{item.selectedSize || '0-3 أشهر'}</span>
                        </span>

                        {/* Color Pill with Circle */}
                        <span className="text-[10px] bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${getColorBg(item.selectedColor)} inline-block`}></span>
                          <span>{item.selectedColor || 'وردي هادئ'}</span>
                        </span>
                      </div>

                      {/* Custom Notes if exists */}
                      {item.customNotes && (
                        <p className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 mt-1 line-clamp-1">
                          ملاحظة: "{item.customNotes}"
                        </p>
                      )}

                      {/* Price Calculation */}
                      <div className="flex items-baseline gap-1 mt-1.5">
                        <span className="text-xs font-black text-brand-600">{item.price} ر.س</span>
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-slate-400">
                            (الإجمالي: {item.price * item.quantity} ر.س)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls and Delete */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 mt-1">
                      <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2 py-0.5 shadow-xs">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="text-slate-500 hover:text-slate-800 p-0.5 active:scale-90"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800 min-w-[1.2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-slate-500 hover:text-slate-800 p-0.5 active:scale-90"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quick View Link */}
                        <button
                          onClick={() => {
                            if (onOpenProductDetails) {
                              onClose();
                              onOpenProductDetails(item);
                            }
                          }}
                          className="text-[10px] font-bold text-slate-400 hover:text-brand-600 flex items-center gap-0.5"
                          title="عرض في صفحة المنتج"
                        >
                          <Eye className="w-3 h-3" />
                          <span>تفاصيل</span>
                        </button>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                          title="حذف المنتج من السلة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          {/* Coupon and Summary */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-3.5">
              
              {/* Coupon Code Section */}
              <div className="space-y-1.5">
                {appliedCoupon ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>تم تطبيق كود {appliedCoupon} (خصم {discount}%)</span>
                    </span>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-slate-400 hover:text-rose-500 text-[11px] font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCouponSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="كود الخصم (جرب FIRST10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pr-8 pl-3 text-xs outline-none focus:border-brand-500 uppercase font-bold"
                      />
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                    </div>
                    <button
                      type="submit"
                      className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      تطبيق
                    </button>
                  </form>
                )}
                {couponError && <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>}
              </div>

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>المجموع الفرعي ({cartItems.length} أصناف):</span>
                  <span className="font-bold text-slate-800">{subtotal} ر.س</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>خصم الكوبون ({discount}%):</span>
                    <span>-{discountAmount} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>الشحن والتوصيل:</span>
                  <span className="font-bold text-slate-800">
                    {shippingCost === 0 ? <span className="text-emerald-600 font-bold">مجاني</span> : `${shippingCost} ر.س`}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                  <span>الإجمالي النهائي شامل الضريبة:</span>
                  <span className="text-brand-600">{total} ر.س</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedCheckout();
                }}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs sm:text-sm"
              >
                <span>متابعة إتمام الطلب</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
