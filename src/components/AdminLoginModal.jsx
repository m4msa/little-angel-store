import React, { useState } from 'react';
import { X, Lock, Mail, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check credentials (accepting user specified email & variants, password 1 to 8: 12345678)
    const validEmails = [
      'الملاك الصغير@gmail.com',
      'littleangel@gmail.com',
      'almalakalsaghir@gmail.com',
      'admin@littleangel.com'
    ];

    setTimeout(() => {
      const isEmailValid = validEmails.includes(cleanEmail) || cleanEmail.includes('الملاك');
      const isPassValid = cleanPass === '12345678' || cleanPass === '123';

      if (isEmailValid && isPassValid) {
        setIsLoading(false);
        onLoginSuccess();
        onClose();
      } else {
        setIsLoading(false);
        setError('بيانات الدخول غير صحيحة! تأكد من البريد وكلمة المرور.');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
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
            <h3 className="text-xl font-black text-slate-900">
              بوابة إدارة المتجر
            </h3>
            <p className="text-xs text-slate-500">
              تسجيل الدخول مخصص فقط لمدير متجر الملاك الصغير
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">البريد الإلكتروني للأدمن</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  dir="ltr"
                  placeholder="الملاك الصغير@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 text-xs outline-none transition-all text-left"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">كلمة المرور (1 إلى 8)</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  dir="ltr"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl py-2.5 pl-10 pr-3 text-xs outline-none transition-all text-left font-mono"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-600 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs active:scale-95 disabled:opacity-50"
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

          {/* Quick Credential Hint for the owner */}
          <div className="bg-brand-50/60 border border-brand-100 rounded-2xl p-3 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-brand-700">بيانات الدخول الخاصة بك:</p>
            <p>• البريد: <span className="font-mono text-slate-900 font-bold" dir="ltr">الملاك الصغير@gmail.com</span></p>
            <p>• كلمة السر: <span className="font-mono text-slate-900 font-bold" dir="ltr">12345678</span></p>
          </div>

        </div>

      </div>
    </div>
  );
}

