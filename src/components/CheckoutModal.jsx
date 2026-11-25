import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Truck,
  MessageCircle,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import {
  calculateOrderSummary,
  validateCheckoutForm,
  normalizeSaudiPhone,
  toEnglishDigits,
  generateWhatsAppOrderUrl,
  FALLBACK_IMAGE
} from '../utils/orderCalculations';

const SAUDI_CITIES = [
  'الرياض',
  'جدة',
  'الدمام',
  'مكة المكرمة',
  'المدينة المنورة',
  'الخبر',
  'أبها',
  'القصيم',
  'تبوك',
  'الطائف',
  'حائل',
  'جازان',
  'نجران',
  'الجبيل',
  'الأحساء'
];

export default function CheckoutModal({
  isOpen = false,
  onClose,
  cartItems = [],
  discount = 0,
  appliedCoupon = null,
  onCompleteOrder,
  storeSettings = {},
  currentUser = null
}) {
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: 'الرياض',
    address: '',
    paymentMethod: 'mada'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const addressInputRef = useRef(null);

  // Sync user profile data and reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setFormErrors({});
      setIsSubmitting(false);
      setCopiedId(false);

      setFormData({
        name: currentUser?.name || '',
        phone: currentUser?.phone ? normalizeSaudiPhone(currentUser.phone) : '',
        city: currentUser?.city || 'الرياض',
        address: currentUser?.address || '',
        paymentMethod: 'mada'
      });
    }
  }, [isOpen, currentUser]);

  // Handle escape key and lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && typeof onClose === 'function') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const safeCart = Array.isArray(cartItems) ? cartItems : [];

  const {
    subtotal,
    discountAmount,
    shippingCost,
    total,
    isFreeShipping
  } = calculateOrderSummary({
    cartItems: safeCart,
    discount,
    appliedCoupon,
    storeSettings
  });

  const storeName = storeSettings?.storeName || 'الملاك الصغير';

  const handleFieldChange = (field, value) => {
    let sanitized = value;
    if (field === 'phone') {
      sanitized = toEnglishDigits(value).replace(/[^\d+]/g, '');
    }

    setFormData((prev) => ({ ...prev, [field]: sanitized }));

    // Clear specific field error when user edits
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validation = validateCheckoutForm(formData, safeCart);
    if (!validation.isValid) {
      setFormErrors(validation.errors);

      // Auto-focus the first invalid field
      if (validation.errors.name && nameInputRef.current) {
        nameInputRef.current.focus();
      } else if (validation.errors.phone && phoneInputRef.current) {
        phoneInputRef.current.focus();
      } else if (validation.errors.address && addressInputRef.current) {
        addressInputRef.current.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      // Create an immutable snapshot of cart items
      const itemsSnapshot = safeCart.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
        image: item.image || FALLBACK_IMAGE,
        selectedSize: item.selectedSize || 'قياسي',
        selectedColor: item.selectedColor || 'وردي',
        customBabyName: item.customBabyName || '',
        nameLanguage: item.nameLanguage || 'ar',
        threadColor: item.threadColor || '',
        customNotes: item.customNotes || '',
        customDesignFile: !!item.customDesignFile
      }));

      const newOrder = {
        id: orderNumber,
        date: new Date().toLocaleDateString('ar-SA'),
        customerId: currentUser?.id || 'guest',
        customer: {
          name: formData.name.trim(),
          phone: normalizeSaudiPhone(formData.phone),
          city: formData.city.trim(),
          address: formData.address.trim(),
          paymentMethod: formData.paymentMethod,
          email: currentUser?.email || ''
        },
        items: itemsSnapshot,
        subtotal,
        discountAmount,
        shippingCost,
        total,
        appliedCoupon: appliedCoupon || null,
        status: 'قيد التجهيز',
        createdAt: new Date().toISOString()
      };

      setCompletedOrder(newOrder);

      if (typeof onCompleteOrder === 'function') {
        onCompleteOrder(newOrder);
      }

      setStep('success');
    } catch (err) {
      console.error('Error completing order:', err);
      setFormErrors({ general: 'حدث خطأ أثناء معالجة الطلب، يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyOrderId = () => {
    if (!completedOrder?.id) return;
    navigator.clipboard?.writeText(completedOrder.id).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    });
  };

  const whatsAppUrl = completedOrder
    ? generateWhatsAppOrderUrl({ order: completedOrder, storeSettings })
    : '';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && typeof onClose === 'function') {
          onClose();
        }
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
            className="absolute top-4 left-4 p-2.5 text-slate-500 hover:text-slate-800 bg-white/90 hover:bg-slate-100 rounded-full shadow-xs transition-colors z-20"
            title="إغلاق النافذة"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>

          {step === 'form' ? (
            /* Checkout Form */
            <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-8 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span>إتمام الطلب والدفع</span>
                  <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
                    {storeName}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  أدخل بيانات التوصيل واختر طريقة الدفع المناسبة لإتمام تجهيز طلبك
                </p>
              </div>

              {/* General Form Error */}
              {formErrors.general && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formErrors.general}</span>
                </div>
              )}

              {/* Empty Cart Warning */}
              {safeCart.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-pink-50 flex items-center justify-center text-[#DF7E93]">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">سلة التسوق فارغة حالياً</p>
                  <p className="text-[11px] text-slate-400">يرجى إضافة منتجات إلى السلة للمتابعة</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-brand-600 text-white text-xs font-bold px-6 py-2 rounded-xl hover:bg-brand-700 transition-colors"
                  >
                    العودة للمتجر
                  </button>
                </div>
              ) : (
                <>
                  {/* Selected Items Mini-Summary */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2 max-h-36 overflow-y-auto">
                    <p className="text-[11px] font-bold text-slate-500">
                      المنتجات في طلبك ({safeCart.length}):
                    </p>
                    {safeCart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <img
                            src={item.image || FALLBACK_IMAGE}
                            alt={item.name || 'منتج'}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_IMAGE;
                            }}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{item.name}</p>
                            <span className="text-[10px] text-slate-500 block truncate">
                              مقاس: {item.selectedSize || 'قياسي'} | لون: {item.selectedColor || 'وردي'}
                              {item.customBabyName && ` | تطريز: ${item.customBabyName}`}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-brand-600 shrink-0 mr-2">
                          {(Number(item.price) || 0) * (Math.max(1, parseInt(item.quantity, 10) || 1))} ر.س
                        </span>
                      </div>
                    ))}
                  </div>

                  {currentUser && (
                    <div className="bg-pink-50/80 border border-pink-200 rounded-2xl p-2.5 px-3 flex items-center gap-2 text-xs text-slate-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>أهلاً {currentUser.name}! تم تعبئة بيانات التوصيل تلقائياً من حسابك.</span>
                    </div>
                  )}

                  {/* Customer Information Fields */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-brand-500" />
                      <span>بيانات الشحن والتوصيل</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Name Field */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          الاسم الكامل <span className="text-rose-500">*</span>
                        </label>
                        <input
                          ref={nameInputRef}
                          type="text"
                          required
                          placeholder="مثال: سارة العتيبي"
                          value={formData.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none transition-colors ${
                            formErrors.name
                              ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                              : 'border-slate-200 focus:border-brand-500 focus:bg-white'
                          }`}
                        />
                        {formErrors.name && (
                          <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{formErrors.name}</span>
                          </p>
                        )}
                      </div>

                      {/* Phone Field */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          رقم الجوال السعودي <span className="text-rose-500">*</span>
                        </label>
                        <input
                          ref={phoneInputRef}
                          type="tel"
                          required
                          dir="ltr"
                          placeholder="05XXXXXXXX"
                          value={formData.phone}
                          onChange={(e) => handleFieldChange('phone', e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none transition-colors text-right ${
                            formErrors.phone
                              ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                              : 'border-slate-200 focus:border-brand-500 focus:bg-white'
                          }`}
                        />
                        {formErrors.phone && (
                          <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{formErrors.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* City Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          المدينة <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.city}
                          onChange={(e) => handleFieldChange('city', e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none transition-colors ${
                            formErrors.city
                              ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                              : 'border-slate-200 focus:border-brand-500 focus:bg-white'
                          }`}
                        >
                          {SAUDI_CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        {formErrors.city && (
                          <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{formErrors.city}</span>
                          </p>
                        )}
                      </div>

                      {/* Detailed Address */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          العنوان والحي <span className="text-rose-500">*</span>
                        </label>
                        <input
                          ref={addressInputRef}
                          type="text"
                          required
                          placeholder="الحي، اسم الشارع، رقم المنزل"
                          value={formData.address}
                          onChange={(e) => handleFieldChange('address', e.target.value)}
                          className={`w-full bg-slate-50 border rounded-xl p-2.5 text-xs outline-none transition-colors ${
                            formErrors.address
                              ? 'border-rose-400 focus:border-rose-500 bg-rose-50/30'
                              : 'border-slate-200 focus:border-brand-500 focus:bg-white'
                          }`}
                        />
                        {formErrors.address && (
                          <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{formErrors.address}</span>
                          </p>
                        )}
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
                      {/* Mada */}
                      <label
                        className={`cursor-pointer p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                          formData.paymentMethod === 'mada'
                            ? 'border-brand-500 bg-brand-50/50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={formData.paymentMethod === 'mada'}
                            onChange={() => handleFieldChange('paymentMethod', 'mada')}
                            className="accent-brand-600"
                          />
                          <span className="text-xs font-bold text-slate-800">مدى (Mada)</span>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                          مدى
                        </span>
                      </label>

                      {/* Apple Pay */}
                      <label
                        className={`cursor-pointer p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                          formData.paymentMethod === 'apple-pay'
                            ? 'border-brand-500 bg-brand-50/50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={formData.paymentMethod === 'apple-pay'}
                            onChange={() => handleFieldChange('paymentMethod', 'apple-pay')}
                            className="accent-brand-600"
                          />
                          <span className="text-xs font-bold text-slate-800">Apple Pay</span>
                        </div>
                        <span className="text-xs font-black text-slate-800">Pay</span>
                      </label>

                      {/* Tabby */}
                      <label
                        className={`cursor-pointer p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                          formData.paymentMethod === 'tabby'
                            ? 'border-pink-500 bg-pink-50/50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={formData.paymentMethod === 'tabby'}
                            onChange={() => handleFieldChange('paymentMethod', 'tabby')}
                            className="accent-brand-600"
                          />
                          <span className="text-xs font-bold text-slate-800">تابي</span>
                        </div>
                        <span className="text-[10px] font-black text-pink-600 bg-pink-100 px-1 py-0.5 rounded">
                          4 دفعات
                        </span>
                      </label>

                      {/* Tamara */}
                      <label
                        className={`cursor-pointer p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                          formData.paymentMethod === 'tamara'
                            ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={formData.paymentMethod === 'tamara'}
                            onChange={() => handleFieldChange('paymentMethod', 'tamara')}
                            className="accent-brand-600"
                          />
                          <span className="text-xs font-bold text-slate-800">تمارا</span>
                        </div>
                        <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-1 py-0.5 rounded">
                          4 دفعات
                        </span>
                      </label>

                      {/* STC Pay */}
                      <label
                        className={`cursor-pointer p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                          formData.paymentMethod === 'stc-pay'
                            ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={formData.paymentMethod === 'stc-pay'}
                            onChange={() => handleFieldChange('paymentMethod', 'stc-pay')}
                            className="accent-brand-600"
                          />
                          <span className="text-xs font-bold text-slate-800">STC Pay</span>
                        </div>
                        <span className="text-[10px] font-black text-purple-600">stc pay</span>
                      </label>

                      {/* Visa / Master */}
                      <label
                        className={`cursor-pointer p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                          formData.paymentMethod === 'visa'
                            ? 'border-brand-500 bg-brand-50/50 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={formData.paymentMethod === 'visa'}
                            onChange={() => handleFieldChange('paymentMethod', 'visa')}
                            className="accent-brand-600"
                          />
                          <span className="text-xs font-bold text-slate-800">بطاقة بنكية</span>
                        </div>
                        <CreditCard className="w-4 h-4 text-slate-400" />
                      </label>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1.5 text-xs border border-slate-100">
                    <div className="flex justify-between text-slate-600">
                      <span>قيمة المنتجات ({safeCart.length} أصناف):</span>
                      <span className="font-bold">{subtotal} ر.س</span>
                    </div>

                    {appliedCoupon && discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>خصم الكوبون ({appliedCoupon}):</span>
                        <span>-{discountAmount} ر.س</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>رسوم التوصيل:</span>
                      <span className="font-bold">
                        {shippingCost === 0 ? (
                          <span className="text-emerald-600 font-black">مجاني</span>
                        ) : (
                          `${shippingCost} ر.س`
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-black text-slate-900 pt-1.5 border-t border-slate-200">
                      <span>المبلغ الإجمالي للدفع:</span>
                      <span className="text-brand-600 text-base">{total} ر.س</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white font-black py-3.5 rounded-2xl shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-2 active:scale-95 text-xs sm:text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري تأكيد الطلب...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>تأكيد الطلب الآن ({total} ر.س)</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </form>
          ) : (
            /* Order Confirmation Success View */
            <div className="p-6 sm:p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce-short">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  تم استلام طلبك بنجاح
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  شكراً لتسوقكِ من {storeName}
                </h3>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-xs text-slate-500">رقم الطلب:</span>
                  <span className="text-slate-800 font-mono font-bold text-sm bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                    {completedOrder?.id}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyOrderId}
                    className="text-slate-400 hover:text-brand-600 transition-colors p-1"
                    title="نسخ رقم الطلب"
                    aria-label="نسخ رقم الطلب"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
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
                  <span className="font-bold text-slate-800 uppercase">
                    {completedOrder?.customer.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">العنوان:</span>
                  <span className="font-bold text-slate-800">
                    {completedOrder?.customer.city} - {completedOrder?.customer.address}
                  </span>
                </div>

                {/* Items in receipt */}
                <div className="py-1 space-y-1">
                  <span className="text-slate-500 font-bold block">الأصناف المطلوبة:</span>
                  {completedOrder?.items?.map((it, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-[11px] bg-white p-2 rounded-xl border border-slate-100"
                    >
                      <div className="min-w-0 pr-1">
                        <span className="font-bold text-slate-800 block truncate">{it.name}</span>
                        <span className="text-[10px] text-slate-400">
                          مقاس: {it.selectedSize || 'قياسي'} | لون: {it.selectedColor || 'وردي'}
                          {it.customBabyName && ` | تطريز: ${it.customBabyName}`}
                        </span>
                      </div>
                      <span className="font-bold text-brand-600 shrink-0 mr-2">
                        {it.price * it.quantity} ر.س
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-1 border-t border-slate-200 font-black">
                  <span className="text-slate-900">المبلغ الإجمالي المدفوع:</span>
                  <span className="text-brand-600 text-sm">{completedOrder?.total} ر.س</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {whatsAppUrl && (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>إرسال الفاتورة عبر واتساب</span>
                  </a>
                )}
                <button
                  type="button"
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
