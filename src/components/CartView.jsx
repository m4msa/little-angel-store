import React, { useState } from 'react';
import { ArrowRight, ShoppingBag, Trash2, Plus, Minus, Tag, Check, ArrowLeft, Sparkles, ShieldCheck } from 'lucide-react';

export default function CartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  onOpenProductDetails,
  discount = 0,
  appliedCoupon = null,
  onApplyCoupon,
  onRemoveCoupon,
  onReturnHome,
  storeSettings
}) {
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
      if (onApplyCoupon) onApplyCoupon(inputUpper, validDiscount);
      setCouponError('');
      setCouponCode('');
    } else {
      setCouponError('كود الخصم غير صالح أو منتهي');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {cartItems.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-200/80 shadow-xs text-center space-y-4 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto text-[#DF7E93]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-800">
              سلتك فارغة حالياً
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              تصفحي تشكيلة الملاك الصغير الملكية وأضيفي ما يعجبك لتجهيز استقبال فاخر لصغيرك
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onReturnHome}
              className="bg-gradient-to-r from-[#DF7E93] to-pink-500 hover:from-[#d56b82] hover:to-pink-600 text-white font-bold px-8 py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
            >
              <span>ابدأي التسوق الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Full Cart Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Products Column */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Free Shipping Progress */}
            <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#DF7E93]" />
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-emerald-600 font-black">تهانينا! حصلتِ على شحن مجاني لكافة طلبك</span>
                  ) : (
                    <span>أضيفي بقيمة {remainingForFreeShipping} ر.س للحصول على شحن مجاني</span>
                  )}
                </span>
                <span className="text-[#DF7E93]">{Math.round(freeShippingProgress)}%</span>
              </div>
              <div className="w-full bg-pink-100/70 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#DF7E93] to-pink-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs divide-y divide-pink-100/80">
              {cartItems.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="py-4 first:pt-0 last:pb-0 flex items-center gap-3 sm:gap-4">
                  <div 
                    onClick={() => onOpenProductDetails && onOpenProductDetails(item)}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0 cursor-pointer"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h4 
                      onClick={() => onOpenProductDetails && onOpenProductDetails(item)}
                      className="font-black text-slate-800 text-xs sm:text-sm truncate cursor-pointer hover:text-[#DF7E93]"
                    >
                      {item.name}
                    </h4>

                    {/* Options Details */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      {item.selectedSize && (
                        <span className="bg-pink-50 text-[#DF7E93] px-2 py-0.5 rounded-md font-bold">
                          {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                          {item.selectedColor}
                        </span>
                      )}
                      {item.customBabyName && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md font-bold">
                          التطريز: {item.customBabyName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-black text-[#DF7E93]">
                        {item.price * item.quantity} ر.س
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="text-slate-500 hover:text-slate-900 p-0.5 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black text-slate-800 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-slate-500 hover:text-slate-900 p-0.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                    title="حذف من السلة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>

          {/* Summary Column */}
          <div className="space-y-4">
            
            {/* Coupon Box */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Tag className="w-4 h-4 text-[#DF7E93]" />
                <span>كوبون الخصم</span>
              </div>
              <form onSubmit={handleCouponSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ادخلي كود الخصم"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-[#DF7E93] focus:bg-white"
                />
                <button
                  type="submit"
                  className="bg-[#DF7E93] hover:bg-[#d56b82] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
                >
                  تطبيق
                </button>
              </form>
              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs text-emerald-600 bg-emerald-50 p-2 rounded-xl border border-emerald-100 font-bold">
                  <span>تم تفعيل الكوبون ({appliedCoupon}) خصم {discount}%</span>
                  <button 
                    type="button"
                    onClick={onRemoveCoupon}
                    className="text-rose-500 hover:underline text-[11px]"
                  >
                    إلغاء
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-[11px] text-rose-500 font-medium">{couponError}</p>
              )}
            </div>

            {/* Total Summary Card */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-black text-slate-900 text-sm border-b border-pink-100 pb-3">
                ملخص الطلب
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>مجموع المنتجات</span>
                  <span className="font-bold text-slate-900">{subtotal} ر.س</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>الخصم المطبق ({discount}%)</span>
                    <span>-{discountAmount} ر.س</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>الشحن والتوصيل</span>
                  <span className="font-bold text-slate-900">
                    {shippingCost === 0 ? <span className="text-emerald-600">مجاني</span> : `${shippingCost} ر.س`}
                  </span>
                </div>
                <div className="border-t border-pink-100 pt-3 flex justify-between items-center text-sm font-black text-slate-900">
                  <span>المجموع النهائي</span>
                  <span className="text-lg text-[#DF7E93]">{total} ر.س</span>
                </div>
              </div>

              <button
                onClick={onProceedCheckout}
                className="w-full bg-gradient-to-r from-[#DF7E93] via-[#E88E9F] to-[#DF7E93] hover:opacity-95 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>إتمام الطلب والدفع</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>دفع آمن 100% وشحن معتمد</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

