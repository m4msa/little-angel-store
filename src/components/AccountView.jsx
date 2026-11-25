import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Phone, MapPin, Lock, ShoppingBag, Heart, ShieldCheck, 
  LogOut, CheckCircle2, AlertCircle, ArrowRight, Check, ChevronLeft, 
  MessageCircle, Save, Sparkles, KeyRound, Eye, EyeOff 
} from 'lucide-react';
import { 
  sanitizeString, 
  sanitizeUrl, 
  buildWhatsAppUrl, 
  validateEmail, 
  validatePhone, 
  safeOpenExternal 
} from '../utils/security';

const SAUDI_CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 
  'الدمام', 'الخبر', 'الظهران', 'الأحساء', 
  'الطائف', 'القصيم (بريدة/عنيزة)', 'تبوك', 'أبها', 
  'خميس مشيط', 'جازان', 'نجران', 'حائل', 'الجبيل', 'ينبع', 'مدينة أخرى'
];

export default function AccountView({
  currentUser = null,
  onLogin = () => ({ success: false, message: 'دخول غير متاح حالياً' }),
  onRegister = () => ({ success: false, message: 'التسجيل غير متاح حالياً' }),
  onUpdateProfile = () => {},
  onLogout = () => {},
  onNavigateHome = () => {},
  orders = [],
  wishlist = [],
  products = [],
  onOpenProduct = () => {},
  onAddToCart = () => {},
  onGoToAdmin = () => {},
  isAdminLoggedIn = false,
  storeSettings = {},
  isPendingCheckout = false
}) {
  // If not logged in: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');

  // Password visibility
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'الرياض',
    address: '',
    deliveryNotes: '',
    password: '',
    confirmPassword: ''
  });
  const [registerError, setRegisterError] = useState('');

  // Dashboard active sub-tab for logged-in user: 'orders' | 'profile' | 'wishlist'
  const [activeTab, setActiveTab] = useState('orders');

  // Profile Edit State
  const [profileForm, setProfileForm] = useState(() => ({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    city: currentUser?.city || 'الرياض',
    address: currentUser?.address || '',
    deliveryNotes: currentUser?.deliveryNotes || ''
  }));
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Sync profileForm if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        city: currentUser.city || 'الرياض',
        address: currentUser.address || '',
        deliveryNotes: currentUser.deliveryNotes || ''
      });
    }
  }, [currentUser]);

  // Handle Login Submit
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanId = sanitizeString(loginIdentifier, 100);
    const cleanPass = sanitizeString(loginPassword, 100);

    if (!cleanId || !cleanPass) {
      setLoginError('يرجى إدخال رقم الهاتف أو البريد وكلمة المرور.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = onLogin(cleanId, cleanPass);
      setIsSubmitting(false);

      if (result && !result.success) {
        setLoginError(result.message || 'بيانات الدخول غير صحيحة، تأكد من رقم الهاتف/البريد وكلمة المرور');
      }
    } catch (err) {
      setIsSubmitting(false);
      setLoginError('حدث خطأ غير متوقع أثناء تسجيل الدخول. يرجى المحاولة لاحقاً.');
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegisterError('');

    const cleanName = sanitizeString(registerData.name, 80);
    const cleanPhone = sanitizeString(registerData.phone, 20);
    const cleanEmail = sanitizeString(registerData.email, 100);
    const cleanCity = sanitizeString(registerData.city, 50);
    const cleanAddress = sanitizeString(registerData.address, 250);
    const cleanNotes = sanitizeString(registerData.deliveryNotes, 200);
    const cleanPass = sanitizeString(registerData.password, 64);
    const cleanConfirm = sanitizeString(registerData.confirmPassword, 64);

    if (!cleanName || !cleanPhone || !cleanAddress) {
      setRegisterError('يرجى ملء جميع الحقول المطلوبة (الاسم، الجوال، العنوان)');
      return;
    }

    if (!validatePhone(cleanPhone)) {
      setRegisterError('يرجى إدخال رقم جوال صحيح يتكون من 9 أرقام على الأقل');
      return;
    }

    if (cleanEmail && !validateEmail(cleanEmail)) {
      setRegisterError('يرجى إدخال بريد إلكتروني صحيح أو ترك الحقل فارغاً');
      return;
    }

    if (cleanPass.length < 4) {
      setRegisterError('كلمة المرور يجب أن لا تقل عن 4 خانات');
      return;
    }

    if (cleanPass !== cleanConfirm) {
      setRegisterError('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        city: cleanCity || 'الرياض',
        address: cleanAddress,
        deliveryNotes: cleanNotes,
        password: cleanPass
      };

      const result = onRegister(payload);
      setIsSubmitting(false);

      if (result && !result.success) {
        setRegisterError(result.message || 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى');
      }
    } catch (err) {
      setIsSubmitting(false);
      setRegisterError('حدث خطأ غير متوقع أثناء التسجيل. يرجى المحاولة لاحقاً.');
    }
  };

  // Handle Profile Update
  const handleProfileSave = (e) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    const cleanName = sanitizeString(profileForm.name, 80);
    const cleanPhone = sanitizeString(profileForm.phone, 20);
    const cleanEmail = sanitizeString(profileForm.email, 100);
    const cleanCity = sanitizeString(profileForm.city, 50);
    const cleanAddress = sanitizeString(profileForm.address, 250);
    const cleanNotes = sanitizeString(profileForm.deliveryNotes, 200);

    if (!cleanName || !cleanPhone || !cleanAddress) {
      setProfileErrorMsg('يرجى ملء الاسم ورقم الهاتف والعنوان التفصيلي بشكل صحيح.');
      return;
    }

    if (!validatePhone(cleanPhone)) {
      setProfileErrorMsg('رقم الجوال المدخل غير صحيح، يرجى إدخال رقم هاتف سليم.');
      return;
    }

    if (cleanEmail && !validateEmail(cleanEmail)) {
      setProfileErrorMsg('صيغة البريد الإلكتروني غير صحيحة.');
      return;
    }

    try {
      const updatedData = {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        city: cleanCity || 'الرياض',
        address: cleanAddress,
        deliveryNotes: cleanNotes
      };

      if (typeof onUpdateProfile === 'function') {
        onUpdateProfile(updatedData);
      }

      setProfileSuccessMsg('تم حفظ وتحديث بيانات حسابك وموقع التوصيل بنجاح!');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setProfileSuccessMsg(''), 4000);
    } catch (err) {
      setProfileErrorMsg('تعذر حفظ البيانات حالياً. يرجى إعادة المحاولة.');
    }
  };

  // Filter orders safely for the logged-in customer
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const safeProducts = Array.isArray(products) ? products : [];

  const userOrders = safeOrders.filter((order) => {
    if (!currentUser || !order) return false;
    const matchId = order.customerId && order.customerId === currentUser.id;
    const matchEmail =
      currentUser.email &&
      order.customer?.email &&
      order.customer.email.toLowerCase() === currentUser.email.toLowerCase();
    const matchPhone =
      currentUser.phone &&
      order.customer?.phone &&
      order.customer.phone.replace(/[^0-9]/g, '') === currentUser.phone.replace(/[^0-9]/g, '');
    return matchId || matchEmail || matchPhone;
  });

  // Favorite products
  const favoriteProducts = safeProducts.filter((p) => p && safeWishlist.includes(p.id));

  // Quick WhatsApp tracking launcher with safe URI encoding and noopener
  const openWhatsAppTracking = (order) => {
    if (!order) return;
    const whatsappNum = storeSettings?.whatsappNumber || '967775302137';
    const storeName = storeSettings?.storeName || 'الملاك الصغير';
    const customerName = order.customer?.name || currentUser?.name || 'عميل المتجر';
    const orderId = order.id || 'N/A';
    const orderTotal = order.total || 0;

    const messageText = `مرحباً متجر ${storeName}،\nأنا العميل: *${customerName}*\nأود الاستفسار عن حالة طلبي رقم: *${orderId}*\nالإجمالي: ${orderTotal} ر.س.`;
    const waUrl = buildWhatsAppUrl(whatsappNum, messageText);
    safeOpenExternal(waUrl);
  };

  const fallbackProductImage =
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80';

  // =========================================================================
  // VIEW 1: GUEST AUTHENTICATION (Login / Register Tabs)
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fadeIn">
        {/* Back to Home Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors focus:outline-none focus:underline"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للمتجر الرئيسي</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-pink-200/80 shadow-md space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-100/70 text-[#DF7E93] flex items-center justify-center shadow-inner">
              <User className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              حسابي في {storeSettings?.storeName || 'الملاك الصغير'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              سجلي دخولك أو أنشئي حسابك الفاخر لحفظ بيانات التوصيل، متابعة حالة طلباتك، وسرعة الشراء بضغطة زر.
            </p>
          </div>

          {/* Pending Checkout Notice */}
          {isPendingCheckout && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-pink-50 border border-emerald-200/90 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs text-right animate-fadeIn">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                  سلة مشترياتك جاهزة لإتمام الطلب!
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 font-medium leading-relaxed">
                  سجّلي دخولكِ أو أنشئي حسابكِ لحفظ عنوان التوصيل، وسننقلكِ فوراً لصفحة الدفع وإتمام الطلب مع كافة اختياراتكِ.
                </p>
              </div>
            </div>
          )}

          {/* Tab Switcher (دخول / إنشاء حساب) */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setLoginError('');
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setRegisterError('');
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              إنشاء حساب جديد
            </button>
          </div>

          {/* ===================== TAB 1: LOGIN FORM ===================== */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label htmlFor="login-id" className="block text-xs font-bold text-slate-700">
                  رقم الجوال أو البريد الإلكتروني *
                </label>
                <div className="relative">
                  <input
                    id="login-id"
                    type="text"
                    required
                    maxLength={100}
                    autoComplete="username"
                    placeholder="مثال: 0551234567 أو sarah@gmail.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-3 pl-10 pr-4 text-xs font-bold outline-none transition-all text-right"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="login-pwd" className="block text-xs font-bold text-slate-700">
                  كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    id="login-pwd"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    maxLength={64}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-3 pl-10 pr-10 text-xs font-bold outline-none transition-all text-right"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    title={showLoginPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center gap-2 text-rose-700 text-xs font-bold animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#DF7E93] to-pink-500 hover:from-[#d36b82] hover:to-pink-600 text-white font-black py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.99] disabled:opacity-50"
              >
                <span>{isSubmitting ? 'جاري التحقق...' : 'تسجيل الدخول إلى حسابي'}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Fast Login Autofill Hints for Testing */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier('msaawadi2016@gmail.com');
                    setLoginPassword('12345678');
                    setLoginError('');
                  }}
                  className="text-[#DF7E93] hover:underline font-bold flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>حساب المدير (Admin)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier('ama2026@gmail.com');
                    setLoginPassword('12345678');
                    setLoginError('');
                  }}
                  className="text-sky-600 hover:underline font-bold flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-100"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>حساب أمجد (مسؤول شحن)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier('sarah@gmail.com');
                    setLoginPassword('123');
                    setLoginError('');
                  }}
                  className="text-slate-600 hover:underline font-bold flex items-center gap-1"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>عميل تجريبي</span>
                </button>
              </div>
            </form>
          )}

          {/* ===================== TAB 2: REGISTER FORM ===================== */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-name" className="block text-xs font-bold text-slate-700">
                    الاسم الثلاثي أو المستعار *
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    maxLength={80}
                    placeholder="مثال: سارة أحمد الخالدي"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-bold outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-phone" className="block text-xs font-bold text-slate-700">
                    رقم الجوال (للتوصيل والواتساب) *
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    maxLength={20}
                    placeholder="مثال: 0551234567"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-bold outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700">
                    البريد الإلكتروني (اختياري)
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    maxLength={100}
                    placeholder="sarah@example.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-bold outline-none text-left"
                    dir="ltr"
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label htmlFor="reg-city" className="block text-xs font-bold text-slate-700">
                    المدينة *
                  </label>
                  <select
                    id="reg-city"
                    value={registerData.city}
                    onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-bold outline-none"
                  >
                    {SAUDI_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed Delivery Address */}
              <div className="space-y-1.5">
                <label htmlFor="reg-address" className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>عنوان وموقع التوصيل التفصيلي (يحفظ لتسريع طلباتك دائماً) *</span>
                </label>
                <textarea
                  id="reg-address"
                  rows={2}
                  required
                  maxLength={250}
                  placeholder="مثال: حي الياسمين، شارع أنس بن مالك، بجانب حديقة الياسمين، فيلا رقم 14"
                  value={registerData.address}
                  onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl p-3 text-xs font-medium outline-none resize-none"
                />
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="reg-pwd" className="block text-xs font-bold text-slate-700">كلمة المرور *</label>
                  <div className="relative">
                    <input
                      id="reg-pwd"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      maxLength={64}
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-2.5 px-3.5 pr-10 text-xs font-bold outline-none"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reg-pwd-confirm" className="block text-xs font-bold text-slate-700">تأكيد كلمة المرور *</label>
                  <input
                    id="reg-pwd-confirm"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    maxLength={64}
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              {registerError && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center gap-2 text-rose-700 text-xs font-bold animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#DF7E93] to-pink-500 hover:from-[#d36b82] hover:to-pink-600 text-white font-black py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-[0.99] disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب وتفعيل العضوية الملكية'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: LOGGED IN CUSTOMER DASHBOARD (لوحة حساب العميل)
  // =========================================================================
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fadeIn">
      {/* 1. Header Card: Welcome, User Avatar, and Navigation */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-pink-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#DF7E93] to-pink-400 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            {currentUser.name ? currentUser.name.charAt(0) : 'م'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                أهلاً بك، {currentUser.name}
              </h2>
              {currentUser.role === 'admin' ? (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>مدير المتجر</span>
                </span>
              ) : (
                <span className="bg-pink-100 text-pink-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#DF7E93]" />
                  <span>عميل مميز</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              الجوال: <span dir="ltr" className="font-bold text-slate-700">{currentUser.phone}</span>
              {currentUser.email && ` | ${currentUser.email}`}
            </p>
            <p className="text-xs text-slate-400">
              موقع التوصيل:{' '}
              <span className="font-bold text-slate-600">{currentUser.city || 'الرياض'}</span> -{' '}
              {currentUser.address || 'العنوان غير مسجل'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {Boolean(currentUser && ['admin', 'supervisor', 'editor', 'order_specialist'].includes(currentUser.role)) && (
            <button
              type="button"
              onClick={onGoToAdmin}
              className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>
                {currentUser.role === 'admin' ? 'لوحة الإدارة الكاملة' : 'لوحة تحكم وصلاحيات الموظف'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateHome}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all"
          >
            متابعة التسوق
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="تسجيل الخروج"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* 2. Dashboard Segmented Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-pink-100 shadow-2xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-[#DF7E93] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>سجل مشترياتي ({userOrders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-[#DF7E93] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>بياناتي وموقع التوصيل</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wishlist')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'wishlist'
              ? 'bg-[#DF7E93] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>قائمة المفضلة ({favoriteProducts.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SUB-TAB 1: 📦 ORDER HISTORY (سجل المشتريات والطلبات) */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-pink-100 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-pink-50 text-[#DF7E93] flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">لا توجد طلبات مسجلة حتى الآن</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  عند إتمامك لأي طلب في المتجر، سيظهر هنا مباشرة مع كافة تفاصيل القطع وحالة الشحن.
                </p>
              </div>
              <button
                type="button"
                onClick={onNavigateHome}
                className="bg-[#DF7E93] hover:bg-[#d56b82] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition-all"
              >
                تصفح المنتجات وبدء أول طلب
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => {
                const statusColors = {
                  'قيد التجهيز': 'bg-amber-50 text-amber-800 border-amber-200',
                  'قيد المراجعة': 'bg-sky-50 text-sky-800 border-sky-200',
                  'تم الشحن': 'bg-blue-50 text-blue-800 border-blue-200',
                  'تم التوصيل': 'bg-emerald-50 text-emerald-800 border-emerald-200',
                  'ملغي': 'bg-rose-50 text-rose-800 border-rose-200'
                };

                return (
                  <div key={order.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-pink-100/90 shadow-xs space-y-4">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{order.id}</span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[order.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {order.status || 'قيد التجهيز'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">تاريخ الطلب: {order.date || 'اليوم'}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openWhatsAppTracking(order)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>تتبع عبر الواتساب</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2.5">
                      {(order.items || []).map((it, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                          <img 
                            src={sanitizeUrl(it.image, fallbackProductImage)} 
                            alt={it.name || 'منتج'} 
                            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0" 
                          />
                          <div className="flex-1 text-xs">
                            <h4 className="font-bold text-slate-900">{it.name}</h4>
                            <div className="flex flex-wrap gap-1.5 mt-1 text-[11px] text-slate-600">
                              {it.selectedSize && <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">المقاس: {it.selectedSize}</span>}
                              {it.selectedColor && <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200">اللون: {it.selectedColor}</span>}
                              {it.customBabyName && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-black">
                                  تطريز اسم: "{it.customBabyName}"
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-left shrink-0">
                            <span className="font-bold text-slate-900 text-xs">{it.price} ر.س</span>
                            <span className="block text-[10px] text-slate-400">الكمية: {it.quantity || 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Total Footer */}
                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>التوصيل إلى: {order.customer?.city || 'الرياض'} - {order.customer?.address || 'العنوان المسجل'}</span>
                      </div>
                      <div className="flex items-center gap-3 font-bold text-slate-800">
                        <span>الإجمالي المدفوع:</span>
                        <span className="text-base font-black text-[#DF7E93]">{order.total || 0} ر.س</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 2: 📍 PROFILE & ADDRESS (بياناتي وموقع التوصيل) */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xs space-y-5">
          <div>
            <h3 className="text-lg font-black text-slate-900">بياناتي الشخصية وموقع التوصيل</h3>
            <p className="text-xs text-slate-500">
              تُستخدم هذه البيانات وموقع التوصيل تلقائياً في صفحة الدفع والشحن لتسهيل طلباتك بنقرة واحدة.
            </p>
          </div>

          {profileSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 text-emerald-800 text-xs font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          {profileErrorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center gap-2 text-rose-700 text-xs font-bold animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="prof-name" className="block text-xs font-bold text-slate-700">الاسم الكامل *</label>
              <input
                id="prof-name"
                type="text"
                required
                maxLength={80}
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-bold outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prof-phone" className="block text-xs font-bold text-slate-700">رقم الجوال *</label>
              <input
                id="prof-phone"
                type="tel"
                required
                maxLength={20}
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-bold outline-none text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="prof-email" className="block text-xs font-bold text-slate-700">البريد الإلكتروني</label>
              <input
                id="prof-email"
                type="email"
                maxLength={100}
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-bold outline-none text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="prof-city" className="block text-xs font-bold text-slate-700">المدينة *</label>
              <select
                id="prof-city"
                value={profileForm.city}
                onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-bold outline-none"
              >
                {SAUDI_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prof-address" className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>العنوان الوطني وموقع التوصيل التفصيلي (الحي، الشارع، رقم المنزل) *</span>
            </label>
            <textarea
              id="prof-address"
              rows={3}
              required
              maxLength={250}
              value={profileForm.address}
              onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl p-3 text-xs font-medium outline-none resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="prof-notes" className="block text-xs font-bold text-slate-700">
              تعليمات خاصة لشركة الشحن والتوصيل (اختياري)
            </label>
            <input
              id="prof-notes"
              type="text"
              maxLength={200}
              placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة"
              value={profileForm.deliveryNotes}
              onChange={(e) => setProfileForm({ ...profileForm, deliveryNotes: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#DF7E93] focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs font-medium outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="bg-[#DF7E93] hover:bg-[#d56b82] text-white font-bold px-7 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات وتحديث موقعي</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* SUB-TAB 3: ❤️ WISHLIST (قائمة المفضلة) */}
      {/* ========================================================= */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          {favoriteProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-pink-100 space-y-3">
              <Heart className="w-12 h-12 text-rose-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">قائمة المفضلة فارغة حالياً</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                أضيفي القطع التي تعجبك أثناء التصفح للرجوع إليها في أي وقت.
              </p>
              <button
                type="button"
                onClick={onNavigateHome}
                className="bg-[#DF7E93] text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm hover:bg-[#d56b82] transition-colors"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {favoriteProducts.map((prod) => (
                <div key={prod.id} className="bg-white rounded-3xl p-3 border border-pink-100 shadow-xs flex flex-col justify-between space-y-2">
                  <div 
                    onClick={() => typeof onOpenProduct === 'function' && onOpenProduct(prod)}
                    className="cursor-pointer"
                  >
                    <img 
                      src={sanitizeUrl(prod.image, fallbackProductImage)} 
                      alt={prod.name || 'منتج'} 
                      className="w-full h-36 object-cover rounded-2xl border border-slate-100" 
                    />
                    <h4 className="font-bold text-slate-900 text-xs mt-2 line-clamp-2">{prod.name}</h4>
                    <span className="font-black text-[#DF7E93] text-xs mt-1 block">{prod.price} ر.س</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => typeof onAddToCart === 'function' && onAddToCart(prod)}
                    className="w-full bg-pink-50 hover:bg-[#DF7E93] hover:text-white text-[#DF7E93] font-bold py-2 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>إضافة للسلة</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
