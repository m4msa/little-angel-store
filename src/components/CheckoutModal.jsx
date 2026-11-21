import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, Truck, Banknote, MessageCircle, ArrowRight } from 'lucide-react';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  discount, 
  appliedCoupon, 
  onCompleteOrder,
  storeSettings,
  currentUser
}) {
  if (!isOpen) return null;

  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    city: currentUser?.city || 'الرياض',
    address: currentUser?.address || '',
    paymentMethod: 'mada', // 'mada' | 'apple-pay' | 'visa' | 'cod'
  });
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        phone: currentUser.phone || prev.phone,
        city: currentUser.city || prev.city,
        address: currentUser.address || prev.address
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const freeShippingThreshold = storeSettings?.freeShippingThreshold ?? 299;
  const standardShippingFee = storeSettings?.standardShippingFee ?? 25;
  const storeName = storeSettings?.storeName || 'الملاك الصغير';
  const whatsappNumber = storeSettings?.whatsappNumber || '967775302137';

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? Math.round((subtotal * discount) / 100) : 0;
  const shippingCost = (subtotal - discountAmount) >= freeShippingThreshold ? 0 : standardShippingFee;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const order = {
      id: orderNumber,
      date: new Date().toLocaleDateString('ar-SA'),
      customerId: currentUser?.id || 'guest',
      customer: {
        ...formData,
        email: currentUser?.email || ''
      },
      items: cartItems,
      subtotal,
      discountAmount,
      shippingCost,
      total,
      status: 'قيد التجهيز'
    };

    setCompletedOrder(order);
    onCompleteOrder(order);
    setStep('success');
  };

  const getWhatsAppMessage = () => {
    if (!completedOrder) return '';
    const itemsSummary = completedOrder.items.map(it => 
      `- ${it.name} (مقاس: ${it.selectedSize || 'قياسي'}، لون: ${it.selectedColor || 'وردي'}${it.customBabyName ? `، تطريز اسم: ${it.customBabyName}` : ''}) × ${it.quantity}`
    ).join('%0A');

    const text = `مرحباً متجر ${storeName}%0Aأرغب بتأكيد طلبي رقم: *${completedOrder.id}*%0A%0A*المنتجات المشتراة:*%0A${itemsSummary}%0A%0A*بيانات العميل:*%0Aالاسم: ${completedOrder.customer.name}%0Aالجوال: ${completedOrder.customer.phone}%0Aالعنوان: ${completedOrder.customer.city} - ${completedOrder.customer.address}%0Aطريقة الدفع: ${completedOrder.customer.paymentMethod}%0Aالمبلغ الإجمالي: *${completedOrder.total} ر.س*%0A%0Aشكراً لكم!`;
    return `https://wa.me/${whatsappNumber}?text=${text}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="min-h-full flex items-start sm:items-center justify-center p-3 sm:p-6 py-6 sm:py-8">
        <div 
          className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 p-2.5 text-slate-500 hover:text-slate-800 bg-white/90 hover:bg-slate-100 rounded-full shadow-sm transition-colors z-20"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <span>إتمام الطلب والدفع</span>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                  {storeName}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                أدخل عنوان التوصيل واختر طريقة الدفع المناسبة
              </p>
            </div>

            {/* Selected Items Summary Pill */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 max-h-36 overflow-y-auto">
              <p className="text-[11px] font-bold text-slate-500">المنتجات في طلبك ({cartItems.length}):</p>
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                      <span className="text-[10px] text-slate-500">
                        مقاس: {item.selectedSize || '0-3 أشهر'} | لون: {item.selectedColor || 'وردي'}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-brand-600">{item.price} ر.س × {item.quantity}</span>
                </div>
              ))}
            </div>

            {currentUser && (
              <div className="bg-pink-50/80 border border-pink-200 rounded-2xl p-2.5 px-3 flex items-center gap-2 text-xs text-slate-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>أهلاً {currentUser.name}! تم تعبئة بيانات التوصيل تلقائياً من حسابك.</span>
              </div>
            )}

            {/* Customer Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-500" />
                <span>بيانات الشحن والتوصيل</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: سارة العتيبي"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الجوال *</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="05XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المدينة *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white"
                  >
                    <option value="الرياض">الرياض</option>
                    <option value="جدة">جدة</option>
                    <option value="الدمام">الدمام</option>
                    <option value="مكة المكرمة">مكة المكرمة</option>
                    <option value="المدينة المنورة">المدينة المنورة</option>
                    <option value="الخبر">الخبر</option>
                    <option value="أبها">أبها</option>
                    <option value="القصيم">القصيم</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">العنوان والحي *</label>
                  <input
                    type="text"
                    required
                    placeholder="الحي، اسم الشارع، رقم المنزل"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment Options */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-brand-500" />
                <span>طريقة الدفع</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <label className={`cursor-pointer p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                  formData.paymentMethod === 'mada' ? 'border-brand-500 bg-brand-50/50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'mada'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'mada' })}
                      className="accent-brand-600"
                    />
                    <span className="text-xs font-bold text-slate-800">مدى (Mada)</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">مدى</span>
                </label>

                <label className={`cursor-pointer p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                  formData.paymentMethod === 'apple-pay' ? 'border-brand-500 bg-brand-50/50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'apple-pay'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'apple-pay' })}
                      className="accent-brand-600"
                    />
                    <span className="text-xs font-bold text-slate-800">Apple Pay</span>
                  </div>
                  <span className="text-xs font-black text-slate-800">Pay</span>
                </label>

                <label className={`cursor-pointer p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                  formData.paymentMethod === 'tabby' ? 'border-pink-500 bg-pink-50/50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'tabby'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'tabby' })}
                      className="accent-brand-600"
                    />
                    <span className="text-xs font-bold text-slate-800">تابي (Tabby)</span>
                  </div>
                  <span className="text-[10px] font-black text-pink-600 bg-pink-100 px-1 py-0.5 rounded">4 دفعات</span>
                </label>

                <label className={`cursor-pointer p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                  formData.paymentMethod === 'tamara' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'tamara'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'tamara' })}
                      className="accent-brand-600"
                    />
                    <span className="text-xs font-bold text-slate-800">تمارا (Tamara)</span>
                  </div>
                  <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-1 py-0.5 rounded">4 دفعات</span>
                </label>

                <label className={`cursor-pointer p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                  formData.paymentMethod === 'stc-pay' ? 'border-purple-500 bg-purple-50/50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'stc-pay'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'stc-pay' })}
                      className="accent-brand-600"
                    />
                    <span className="text-xs font-bold text-slate-800">STC Bank</span>
                  </div>
                  <span className="text-[10px] font-black text-purple-600">stc pay</span>
                </label>

                <label className={`cursor-pointer p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                  formData.paymentMethod === 'visa' ? 'border-brand-500 bg-brand-50/50 shadow-sm' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === 'visa'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'visa' })}
                      className="accent-brand-600"
                    />
                    <span className="text-xs font-bold text-slate-800">فيزا / ماستر</span>
                  </div>
                  <CreditCard className="w-4 h-4 text-slate-400" />
                </label>
              </div>
            </div>

            {/* Total and Submit */}
            <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1.5 text-xs border border-slate-100">
              <div className="flex justify-between text-slate-600">
                <span>قيمة المنتجات:</span>
                <span className="font-bold">{subtotal} ر.س</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>خصم الكوبون ({appliedCoupon}):</span>
                  <span>-{discountAmount} ر.س</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>رسوم التوصيل:</span>
                <span className="font-bold">{shippingCost === 0 ? 'مجاني' : `${shippingCost} ر.س`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                <span>المبلغ الإجمالي للدفع:</span>
                <span className="text-brand-600 text-base">{total} ر.س</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs sm:text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>تأكيد الطلب الآن ({total} ر.س)</span>
            </button>
          </form>
        ) : (
          /* Order Confirmation Success View */
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                تم استلام طلبك بنجاح
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                شكراً لتسوقك من الملاك الصغير
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                رقم طلبك هو: <strong className="text-slate-800 font-mono text-sm">{completedOrder?.id}</strong>
              </p>
            </div>

            {/* Order Receipt Box with Full Specs */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-right text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">اسم العميل:</span>
                <span className="font-bold text-slate-800">{completedOrder?.customer.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">رقم الهاتف:</span>
                <span className="font-mono text-slate-800">{completedOrder?.customer.phone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">طريقة الدفع:</span>
                <span className="font-bold text-slate-800 uppercase">{completedOrder?.customer.paymentMethod}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">العنوان:</span>
                <span className="font-bold text-slate-800">{completedOrder?.customer.city} - {completedOrder?.customer.address}</span>
              </div>
              
              {/* Items in receipt */}
              <div className="py-1 space-y-1">
                <span className="text-slate-500 font-bold block">الأصناف المشتراة:</span>
                {completedOrder?.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-[11px] bg-white p-1.5 rounded-lg border border-slate-100">
                    <span>{it.name} (مقاس: {it.selectedSize || '0-3 أشهر'} | لون: {it.selectedColor || 'وردي'})</span>
                    <span className="font-bold">{it.price * it.quantity} ر.س</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-1 border-t border-slate-200 font-black">
                <span className="text-slate-900">المبلغ المدفوع:</span>
                <span className="text-brand-600 text-sm">{completedOrder?.total} ر.س</span>
              </div>
            </div>

            {/* WhatsApp Confirmation Action */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <a
                href={getWhatsAppMessage()}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال الفاتورة عبر واتساب</span>
              </a>
              <button
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-2xl text-xs transition-colors"
              >
                العودة إلى المتجر
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  </div>
  );
}
