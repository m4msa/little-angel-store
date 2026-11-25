import React, { useRef } from 'react';
import { PenTool, Upload, Trash2 } from 'lucide-react';
import { THREAD_COLORS } from '../utils/catalogUtils';

/**
 * Reusable embroidery customization section.
 * Provides baby name input with Arabic/English toggle, thread color picker,
 * optional artwork pattern upload with thumbnail preview, and custom notes.
 */
export default function CustomEmbroideryForm({
  customBabyName = '',
  setCustomBabyName,
  nameLanguage = 'ar',
  setNameLanguage,
  threadColor = 'ذهبي ملكي',
  setThreadColor,
  threadColors = THREAD_COLORS,
  customDesignFile = null,
  setCustomDesignFile,
  customDesignFileName = '',
  setCustomDesignFileName,
  customNotes = '',
  setCustomNotes,
  compact = false
}) {
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomDesignFile(event.target.result);
      setCustomDesignFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setCustomDesignFile(null);
    setCustomDesignFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={`bg-pink-50/70 border border-pink-200/80 rounded-2xl ${compact ? 'p-3.5 sm:p-4 space-y-3' : 'p-4 sm:p-5 space-y-3.5'}`}>
      
      {/* 1. Header: Section title and Language switch */}
      <div className="flex items-center justify-between">
        <label className={`font-bold text-slate-900 flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-xs sm:text-sm'}`}>
          <PenTool className="w-4 h-4 text-[#DF7E93]" />
          <span>تطريز اسم المولود مجاناً حسب رغبتك:</span>
        </label>

        <div className="flex items-center bg-white rounded-xl p-0.5 border border-pink-200 shadow-2xs text-[11px]">
          <button
            type="button"
            onClick={() => setNameLanguage('ar')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              nameLanguage === 'ar'
                ? 'bg-[#DF7E93] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#DF7E93]'
            }`}
          >
            عربي
          </button>
          <button
            type="button"
            onClick={() => setNameLanguage('en')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              nameLanguage === 'en'
                ? 'bg-[#DF7E93] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#DF7E93]'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* 2. Baby Name Input */}
      <input
        type="text"
        dir={nameLanguage === 'en' ? 'ltr' : 'rtl'}
        placeholder={
          nameLanguage === 'en'
            ? 'Type baby name in English (e.g. Faisal / Sarah)'
            : 'اكتب اسم المولود بالعربية (مثال: فيصل / سارة)'
        }
        value={customBabyName}
        onChange={(e) => setCustomBabyName(e.target.value)}
        className="w-full bg-white border border-pink-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#DF7E93] focus:ring-2 focus:ring-pink-100 shadow-2xs transition-all"
        aria-label="اسم المولود للتطريز"
      />

      {/* 3. Thread Color Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5 text-xs">
        <span className="text-slate-700 font-bold">لون خيط التطريز المفضل:</span>
        <div className="flex flex-wrap gap-1.5">
          {threadColors.map((tc) => (
            <button
              key={tc}
              type="button"
              onClick={() => setThreadColor(tc)}
              className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                threadColor === tc
                  ? 'bg-[#DF7E93] text-white border-[#DF7E93] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {tc}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Optional Custom Design Pattern File Upload */}
      <div className="pt-1 border-t border-pink-200/60">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="رفع ملف صورة الباترون أو التصميم"
        />

        {!customDesignFile ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 bg-white hover:bg-pink-100/50 border border-dashed border-pink-300 rounded-xl text-xs font-bold text-[#DF7E93] flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#DF7E93]" />
            <span>إرفاق صورة أو باترون لتطريز خاص (اختياري)</span>
          </button>
        ) : (
          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs text-xs">
            <div className="flex items-center gap-2 truncate">
              <img
                src={customDesignFile}
                alt="باترون التصميم المرفق"
                className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <span className="font-bold text-slate-700 truncate">
                {customDesignFileName || 'تم إرفاق صورة التصميم'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors shrink-0 mr-2 cursor-pointer"
              title="حذف الملف"
              aria-label="حذف صورة الباترون"
            >
              <Trash2 className="w-4 h-4 text-rose-500" />
            </button>
          </div>
        )}
      </div>

      {/* 5. Custom Notes Textarea */}
      <div className="pt-1">
        <textarea
          rows={2}
          placeholder="ملاحظات إضافية للتفصيل أو مكان التطريز (مثال: كتابة الاسم على البطانية والقبعة بخط الرقعة)..."
          value={customNotes}
          onChange={(e) => setCustomNotes(e.target.value)}
          className="w-full bg-white border border-pink-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#DF7E93] text-right shadow-2xs resize-none"
          aria-label="ملاحظات إضافية للتفصيل"
        />
      </div>

    </div>
  );
}
