import React, { useState } from 'react';
import { Lock, Mail, KeyRound, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminLoginPage({ onLoginSuccess, onReturnToStore, onGoToCustomerLogin }) {
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

    const validEmails = [
      'msaawadi2016@gmail.com',
      'الملاك الصغير@gmail.com',
      'littleangel@gmail.com',
      'almalakalsaghir@gmail.com',
      'admin@littleangel.com'
    ];

    setTimeout(() => {
      const isEmailValid = validEmails.includes(cleanEmail) || cleanEmail.includes('msaawadi') || cleanEmail.includes('الملاك');
      const isPassValid = cleanPass === '12345678' || cleanPass === '123';

      if (isEmailValid && isPassValid) {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('بيانات الدخول غير صحيحة! تأكد من إدخال البريد وكلمة المرور الصحيحة.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-brand-500 selection:text-white">
      
      {/* Return to Store Button */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center text-xs">
        <button
          onClick={onReturnToStore}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
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
          <h2 className="text-2xl font-black text-slate-900">
            بوابة الإدارة السرية
          </h2>
          <p className="text-xs text-slate-500">
            هذا المسار مخصص حصرياً لإدارة متجر <strong>الملاك الصغير</strong>
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
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

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">كلمة المرور</label>
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

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2 text-rose-600 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs active:scale-95 disabled:opacity-50"
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

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-[11px] text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">بيانات دخول المدير:</p>
          <p>• اليوزر: <span className="font-mono text-slate-900 font-bold" dir="ltr">msaawadi2016@gmail.com</span></p>
          <p>• كلمة السر: <span className="font-mono text-slate-900 font-bold" dir="ltr">12345678</span></p>
        </div>

        {onGoToCustomerLogin && (
          <div className="text-center pt-2">
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

