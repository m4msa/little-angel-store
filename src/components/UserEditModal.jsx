import React, { useState, useEffect } from 'react';
import { X, Check, User, Mail, Phone, MapPin, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { ROLE_PRESETS } from '../utils/permissionRules';
import { sanitizeString, validateEmail, validatePhone } from '../utils/security';

const SAUDI_CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 
  'الدمام', 'الخبر', 'الظهران', 'الأحساء', 
  'الطائف', 'القصيم (بريدة/عنيزة)', 'تبوك', 'أبها', 
  'خميس مشيط', 'جازان', 'نجران', 'حائل', 'الجبيل', 'ينبع', 'مدينة أخرى'
];

export default function UserEditModal({
  isOpen = false,
  user = null, // null for Add, object for Edit
  onClose = () => {},
  onSave = () => {}
}) {
  const isEditing = Boolean(user && user.id);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'الرياض',
    address: '',
    password: '',
    role: 'supervisor'
  });

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user && isEditing) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        city: user.city || 'الرياض',
        address: user.address || '',
        password: user.password || '',
        role: user.role || 'customer'
      });
      setErrorMsg('');
    } else {
      setForm({
        name: '',
        email: '',
        phone: '',
        city: 'الرياض',
        address: '',
        password: '',
        role: 'supervisor'
      });
      setErrorMsg('');
    }
  }, [user, isOpen, isEditing]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const cleanName = sanitizeString(form.name, 100);
    const cleanEmail = sanitizeString(form.email, 120).toLowerCase();
    const cleanPhone = sanitizeString(form.phone, 30);
    const cleanAddress = sanitizeString(form.address, 200);
    const cleanPassword = sanitizeString(form.password, 50);

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('يرجى إدخال اسم المستخدم أو الموظف بشكل صحيح');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMsg('يرجى إدخال رقم هاتف صالح للتواصل');
      return;
    }

    if (cleanEmail && !validateEmail(cleanEmail)) {
      setErrorMsg('البريد الإلكتروني المدخل غير صالح');
      return;
    }

    if (!isEditing && (!cleanPassword || cleanPassword.length < 4)) {
      setErrorMsg('يرجى تعيين كلمة مرور لا تقل عن 4 خانات');
      return;
    }

    const payload = {
      ...(user || {}),
      id: isEditing ? user.id : 'USR-' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      city: form.city || 'الرياض',
      address: cleanAddress,
      password: cleanPassword || user?.password || '12345678',
      role: form.role,
      createdAt: user?.createdAt || new Date().toLocaleDateString('ar-SA')
    };

    onSave(payload);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex justify-center items-start p-0 sm:p-4 md:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-lg min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl border border-slate-100 my-0 sm:my-3 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DF7E93]/20 border border-[#DF7E93]/30 text-[#DF7E93] flex items-center justify-center shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {isEditing ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم / موظف جديد'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing ? `تعديل الحساب (${user?.name})` : 'إنشاء حساب موظف أو عميل جديد ومنحه الصلاحيات'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">الاسم الكامل *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="مثال: منى السعيد (مشرفة أطقم الاستقبال)"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs font-bold outline-none focus:border-brand-500"
              />
              <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">رقم الجوال *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="05XXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs font-bold outline-none focus:border-brand-500 text-left font-mono"
                  dir="ltr"
                />
                <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs font-bold outline-none focus:border-brand-500 text-left font-mono"
                  dir="ltr"
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* City & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">المدينة</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-500 text-slate-700"
              >
                {SAUDI_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">العنوان / الحي</label>
              <div className="relative">
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="حي الياسمين - الرياض"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs font-bold outline-none focus:border-brand-500"
                />
                <MapPin className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Role & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">الدور الوظيفي *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-500 text-slate-800"
              >
                {Object.entries(ROLE_PRESETS).map(([key, data]) => (
                  <option key={key} value={key}>{data.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                {isEditing ? 'تغيير كلمة المرور (اختياري)' : 'كلمة المرور *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={isEditing ? 'اتركها كما هي دون تغيير' : 'كلمة مرور الدخول'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs font-bold outline-none focus:border-brand-500 font-mono"
                />
                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-[#DF7E93] hover:bg-[#d46b82] text-white font-bold text-xs shadow-md shadow-pink-200/50 flex items-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة المستخدم'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

