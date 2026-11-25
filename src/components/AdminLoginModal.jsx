import React, { useState, useEffect, useRef } from 'react';
import { X, Lock, Mail, KeyRound, AlertCircle, ShieldCheck, Eye, EyeOff, ShieldAlert } from 'lucide-react';
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

export default function AdminLoginModal({
  isOpen = false,
  onClose = () => {},
  onLoginSuccess = () => {}
}) {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Rate limiting / Lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const timerRef = useRef(null);
  const lockoutIntervalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && typeof onClose === 'function') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (lockoutIntervalRef.current) clearInterval(lockoutIntervalRef.current);
    };
  }, [onClose]);

  // Lockout timer
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
      const isPredefinedEmail = DEFAULT_ADMIN_EMAILS.includes(cleanEmail) ||
        cleanEmail === 'msaawadi2016@gmail.com' ||
        cleanEmail === 'admin@littleangel.com';

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
        if (typeof onClose === 'function') {
          onClose();
        }
      } else {
        setIsLoading(false);
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setPassword('');

        if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
          setLockoutRemaining(LOCKOUT_SECONDS);
          setError(`تم تجاوز الحد الأقصى للمحاولات الخاطئة! تم القفل مؤقتاً لمدة ${LOCKOUT_SECONDS} ثانية.`);
        } else {
          const attemptsLeft = MAX_FAILED_ATTEMPTS - nextAttempts;
          setError(`بيانات الدخول غير صحيحة! تأكد من البريد وكلمة المرور (المحاولات المتبقية: ${attemptsLeft}).`);
        }
      }
    }, 400);
  };

  const isLockedOut = lockoutRemaining > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && typeof onClose === 'function') {
          onClose();
        }
      }}
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative animate-fadeIn">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق النافذة"
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 text-brand-400 flex items-center justify-center shadow-lg shadow-slate-200">
              <Lock className="w-7 h-7 text-brand-400" />
            </div>
            <h3 id="admin-modal-title" className="text-xl font-black text-slate-900">
              بوابة إدارة المتجر
            </h3>
            <p className="text-xs text-slate-500">
              تسجيل الدخول مخصص فقط لمدير متجر الملاك الصغير
            </p>
          </div>

          {/* Lockout alert */}
          {isLockedOut && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-center gap-2.5 text-amber-900 text-xs font-bold animate-pulse">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p>تم تجميد المحاولات مؤقتاً لأسباب أمنية.</p>
                <p className="text-[11px] text-amber-700 font-mono mt-0.5">
                  الوقت المتبقي: {lockoutRemaining} ثانية
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="modal-admin-email" className="block text-xs font-bold text-slate-700">
                البريد الإلكتروني للأدمن
              </label>
              <div className="relative">
                <input
                  id="modal-admin-email"
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

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="modal-admin-pass" className="block text-xs font-bold text-slate-700">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="modal-admin-pass"
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

            {/* Error banner */}
            {error && !isLockedOut && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-600 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || isLockedOut}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Quick Credential Hint */}
          <div className="bg-brand-50/60 border border-brand-100 rounded-2xl p-3 text-[11px] text-slate-600 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-brand-700">بيانات الدخول التجريبية للأدمن:</p>
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
                تعبئة سريعة
              </button>
            </div>
            <p>
              • البريد:{' '}
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
        </div>
      </div>
    </div>
  );
}
