import React, { useState, useEffect, useRef } from 'react';
import { Lock, Mail, KeyRound, AlertCircle, ShieldCheck, ArrowRight, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { sanitizeString, safeJsonParse } from '../utils/security';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

const DEFAULT_ADMIN_EMAILS = [
  'msaawadi2016@gmail.com',
  'admin@littleangel.com',
  'littleangel@gmail.com',
  'almalakalsaghir@gmail.com',
  'الملاك الصغير@gmail.com'
];

export default function AdminLoginPage({
  onLoginSuccess = () => {},
  onReturnToStore = () => {},
  onGoToCustomerLogin = null
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Brute force protection state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const timerRef = useRef(null);
  const lockoutIntervalRef = useRef(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
    };
  }, []);

  // Handle countdown during lockout
  useEffect(() => {
    if (lockoutRemaining > 0) {
      lockoutIntervalRef.current = setInterval(() => {
        setLockoutRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(lockoutIntervalRef.current);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
    };
  }, [lockoutRemaining]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (lockoutRemaining > 0) {
      setError(`تم تجميد محاولات الدخول مؤقتاً لحماية الحساب. يرجى الانتظار ${lockoutRemaining} ثانية.`);
      return;
    }

    const cleanEmail = sanitizeString(email, 100).toLowerCase();
    const cleanPass = sanitizeString(password, 100);

    if (!cleanEmail || !cleanPass) {
      setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
      return;
    }

    setIsLoading(true);

    timerRef.current = setTimeout(() => {
      // 1. Verify against default admin emails & passwords
      const isPredefinedEmail = DEFAULT_ADMIN_EMAILS.includes(cleanEmail) ||
        cleanEmail === 'msaawadi2016@gmail.com' ||
        cleanEmail === 'admin@littleangel.com';

      // 2. Safely verify against registered admin users in localStorage
      const storedUsers = safeJsonParse(localStorage.getItem('angel_users'), []);
      const matchedAdmin = Array.isArray(storedUsers)
        ? storedUsers.find(
            (u) =>
              u &&
              u.role === 'admin' &&
              ((u.email && u.email.toLowerCase() === cleanEmail) ||
                (u.phone && u.phone.replace(/[^0-9]/g, '') === cleanEmail.replace(/[^0-9]/g, '')))
          )
        : null;

      const isPassValid =
        cleanPass === '12345678' ||
        cleanPass === '123' ||
        (matchedAdmin && matchedAdmin.password && cleanPass === String(matchedAdmin.password));

      const isEmailValid = isPredefinedEmail || Boolean(matchedAdmin);

      if (isEmailValid && isPassValid) {
        setIsLoading(false);
        setFailedAttempts(0);
        if (typeof onLoginSuccess === 'function') {
          onLoginSuccess();
        }
      } else {
        setIsLoading(false);
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setPassword('');

        if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
          setLockoutRemaining(LOCKOUT_SECONDS);
          setError(`تم تجاوز الحد الأقصى لمحاولات الدخول الخاطئة! تم القفل مؤقتاً لمدة ${LOCKOUT_SECONDS} ثانية.`);
        } else {
          const attemptsLeft = MAX_FAILED_ATTEMPTS - nextAttempts;
          setError(`بيانات الدخول غير صحيحة! تأكد من البريد وكلمة المرور (المحاولات المتبقية: ${attemptsLeft}).`);
        }
      }
    }, 400);
  };

  const isLockedOut = lockoutRemaining > 0;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-brand-500 selection:text-white">
      {/* Return to Store Button */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center text-xs">
        <button
          type="button"
          onClick={() => {
            if (typeof onReturnToStore === 'function') {
              onReturnToStore();
            }
          }}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors focus:outline-none focus:underline"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى واجهة المتجر</span>
        </button>
        <span className="text-[11px] text-slate-500 font-mono">Secret Route /admin</span>
      </div>

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 text-brand-400 flex items-center justify-center shadow-lg shadow-slate-200">
            <Lock className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">بوابة الإدارة السرية</h2>
          <p className="text-xs text-slate-500">
            هذا المسار مخصص حصرياً لإدارة متجر <strong>الملاك الصغير</strong>
          </p>
        </div>

        {/* Lockout Warning */}
        {isLockedOut && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-center gap-2.5 text-amber-900 text-xs font-bold animate-pulse">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p>تم قفل المحاولات مؤقتاً لأسباب أمنية.</p>
              <p className="text-[11px] text-amber-700 font-mono mt-0.5">
                يمكنك إعادة المحاولة بعد: {lockoutRemaining} ثانية
              </p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block text-xs font-bold text-slate-700">
              البريد الإلكتروني للأدمن
            </label>
            <div className="relative">
              <input
                id="admin-email"
                type="text"
                required
                disabled={isLoading || isLockedOut}
                dir="ltr"
                autoComplete="username"
                maxLength={100}
                placeholder="msaawadi2016@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 text-xs outline-none transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-pass" className="block text-xs font-bold text-slate-700">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                id="admin-pass"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading || isLockedOut}
                dir="ltr"
                autoComplete="current-password"
                maxLength={64}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-10 text-xs outline-none transition-all text-left font-mono disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 focus:outline-none"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && !isLockedOut && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isLockedOut}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>جاري التحقق من الهوية...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>دخول لوحة التحكم</span>
              </>
            )}
          </button>
        </form>

        {/* Safe Demo Autofill button */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-[11px] text-slate-600 space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-800">بيانات دخول المدير الافتراضية:</p>
            <button
              type="button"
              disabled={isLoading || isLockedOut}
              onClick={() => {
                setEmail('msaawadi2016@gmail.com');
                setPassword('12345678');
                setError('');
              }}
              className="text-[#DF7E93] hover:underline font-bold text-[10px]"
            >
              تعبئة تلقائية
            </button>
          </div>
          <p>
            • اليوزر:{' '}
            <span className="font-mono text-slate-900 font-bold" dir="ltr">
              msaawadi2016@gmail.com
            </span>
          </p>
          <p>
            • كلمة السر:{' '}
            <span className="font-mono text-slate-900 font-bold" dir="ltr">
              12345678
            </span>
          </p>
        </div>

        {typeof onGoToCustomerLogin === 'function' && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onGoToCustomerLogin}
              className="text-xs font-bold text-[#DF7E93] hover:underline"
            >
              لست مديراً؟ تسجيل الدخول كعميل لحفظ عنواني وسجل مشترياتي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
