/**
 * Utility functions for cart, coupon, checkout validation, and order calculations.
 * Designed with defensive engineering and Clean Code principles.
 */

export const FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23fce7f3'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23ec4899' font-size='12' font-family='sans-serif'%3Eصورة المنتج%3C/text%3E%3C/svg%3E";

/**
 * Converts Eastern Arabic numerals (٠-٩) to standard Western digits (0-9).
 * Ensures smooth typing for users on Arabic mobile keyboards.
 */
export function toEnglishDigits(str) {
  if (str === null || str === undefined) return '';
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/[٠-٩]/g, (d) => arabicDigits.indexOf(d).toString());
}

/**
 * Normalizes a Saudi mobile phone number to the standard 05XXXXXXXX format.
 * Accepts formats: +9665XXXXXXXX, 009665XXXXXXXX, 9665XXXXXXXX, 5XXXXXXXX, 05XXXXXXXX.
 */
export function normalizeSaudiPhone(rawPhone) {
  if (!rawPhone) return '';
  const cleaned = toEnglishDigits(rawPhone).replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+966')) {
    return '0' + cleaned.slice(4);
  }
  if (cleaned.startsWith('00966')) {
    return '0' + cleaned.slice(5);
  }
  if (cleaned.startsWith('966')) {
    return '0' + cleaned.slice(3);
  }
  if (cleaned.startsWith('5') && cleaned.length === 9) {
    return '0' + cleaned;
  }
  return cleaned;
}

/**
 * Validates whether a given phone number is a valid Saudi mobile number (10 digits starting with 05).
 */
export function isValidSaudiPhone(phone) {
  const normalized = normalizeSaudiPhone(phone);
  return /^05\d{8}$/.test(normalized);
}

/**
 * Validates a customer's name: at least 3 characters, contains letters, not just punctuation/numbers.
 */
export function isValidName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 3) return false;
  return /[\p{L}]/u.test(trimmed);
}

/**
 * Validates physical delivery address: at least 5 characters to ensure clear street/district info.
 */
export function isValidAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return address.trim().length >= 5;
}

/**
 * Hardened order & cart calculations.
 * Defensively handles undefined, null, string prices, negative discounts, and floating-point errors.
 */
export function calculateOrderSummary({
  cartItems = [],
  discount = 0,
  appliedCoupon = null,
  storeSettings = {}
}) {
  const safeItems = Array.isArray(cartItems) ? cartItems : [];

  const subtotal = safeItems.reduce((acc, item) => {
    const price = Math.max(0, Number(item?.price) || 0);
    const quantity = Math.max(1, parseInt(item?.quantity, 10) || 1);
    return acc + price * quantity;
  }, 0);

  const freeShippingThreshold =
    Number(storeSettings?.freeShippingThreshold) >= 0
      ? Number(storeSettings?.freeShippingThreshold)
      : 299;

  const standardShippingFee =
    Number(storeSettings?.standardShippingFee) >= 0
      ? Number(storeSettings?.standardShippingFee)
      : 25;

  const validDiscountPercent = Math.min(100, Math.max(0, Number(discount) || 0));

  const discountAmount =
    appliedCoupon && validDiscountPercent > 0
      ? Math.min(subtotal, Math.round((subtotal * validDiscountPercent) / 100))
      : 0;

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress =
    freeShippingThreshold > 0
      ? Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))
      : 100;

  const shippingCost =
    subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardShippingFee;

  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  return {
    subtotal,
    discountAmount,
    discountPercent: validDiscountPercent,
    shippingCost,
    total,
    freeShippingThreshold,
    standardShippingFee,
    remainingForFreeShipping,
    freeShippingProgress,
    isFreeShipping: shippingCost === 0 && subtotal > 0
  };
}

/**
 * Validates a coupon code against storeSettings or built-in promotional codes.
 */
export function validateCoupon(code, storeSettings = {}) {
  if (!code || typeof code !== 'string') {
    return { isValid: false, error: 'يرجى إدخال كود الخصم أولاً' };
  }
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) {
    return { isValid: false, error: 'يرجى إدخال كود الخصم أولاً' };
  }

  const configuredCoupon = (storeSettings?.couponCode || 'FIRST10').trim().toUpperCase();
  const configuredDiscount = Math.max(
    1,
    Math.min(100, Number(storeSettings?.couponDiscountPercent) || 10)
  );

  if (cleanCode === configuredCoupon) {
    return { isValid: true, code: cleanCode, discount: configuredDiscount };
  }

  if (cleanCode === 'ANGEL10') {
    return { isValid: true, code: 'ANGEL10', discount: 10 };
  }

  return { isValid: false, error: 'كود الخصم غير صالح أو منتهي الصلاحية' };
}

/**
 * Validates all fields of the checkout form.
 */
export function validateCheckoutForm(formData, cartItems = []) {
  const errors = {};

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    errors.cart = 'سلة المشتريات فارغة، يرجى إضافة منتجات أولاً';
  }

  if (!formData?.name || !isValidName(formData.name)) {
    errors.name = 'يرجى إدخال الاسم الكامل (3 أحرف على الأقل)';
  }

  if (!formData?.phone || !isValidSaudiPhone(formData.phone)) {
    errors.phone = 'يرجى إدخال رقم جوال سعودي صحيح يبدأ بـ 05 (10 أرقام)';
  }

  if (!formData?.city || !String(formData.city).trim()) {
    errors.city = 'يرجى اختيار مدينة التوصيل';
  }

  if (!formData?.address || !isValidAddress(formData.address)) {
    errors.address = 'يرجى إدخال العنوان واسم الحي بوضوح (5 أحرف على الأقل)';
  }

  const validPaymentMethods = ['mada', 'apple-pay', 'tabby', 'tamara', 'stc-pay', 'visa'];
  if (!formData?.paymentMethod || !validPaymentMethods.includes(formData.paymentMethod)) {
    errors.paymentMethod = 'يرجى اختيار طريقة دفع معتمدة';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Constructs a safe, URL-encoded WhatsApp message link for order tracking and confirmation.
 */
export function generateWhatsAppOrderUrl({ order, storeSettings = {} }) {
  if (!order) return '';
  const storeName = storeSettings?.storeName || 'الملاك الصغير';
  const rawWhatsapp = storeSettings?.whatsappNumber || '967775302137';
  const whatsappNumber = rawWhatsapp.replace(/[^\d]/g, '');

  const items = Array.isArray(order.items) ? order.items : [];
  const itemsSummary = items
    .map((it) => {
      const size = it.selectedSize || 'قياسي';
      const color = it.selectedColor || 'وردي';
      const embroidery = it.customBabyName ? `، تطريز اسم: ${it.customBabyName}` : '';
      const notes = it.customNotes ? ` (ملاحظة: ${it.customNotes})` : '';
      return `- ${it.name} (مقاس: ${size}، لون: ${color}${embroidery}${notes}) × ${it.quantity}`;
    })
    .join('\n');

  const customer = order.customer || {};
  const message = [
    `مرحباً متجر ${storeName}`,
    `أرغب بتأكيد طلبي رقم: *${order.id}*`,
    '',
    '*المنتجات المشتراة:*',
    itemsSummary,
    '',
    '*بيانات العميل والتوصيل:*',
    `الاسم: ${customer.name || ''}`,
    `الجوال: ${customer.phone || ''}`,
    `العنوان: ${customer.city || ''} - ${customer.address || ''}`,
    `طريقة الدفع: ${customer.paymentMethod || ''}`,
    `المبلغ الإجمالي: *${order.total} ر.س*`,
    '',
    'شكراً لكم!'
  ].join('\n');

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Helper to get a color circle background class for a given color name.
 */
export function getColorBadgeBg(colorName) {
  if (!colorName) return 'bg-pink-300';
  if (colorName.includes('سماوي') || colorName.includes('أزرق')) return 'bg-sky-400';
  if (colorName.includes('أبيض')) return 'bg-slate-200';
  if (colorName.includes('بيج') || colorName.includes('كريمي')) return 'bg-amber-200';
  if (colorName.includes('ذهبي')) return 'bg-amber-400';
  return 'bg-pink-400';
}
