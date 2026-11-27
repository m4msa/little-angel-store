import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, X, Check, CheckSquare, Square, Layers, 
  Package, DollarSign, Archive, Sparkles, Tag, ShoppingBag, 
  Settings, Users, Info, AlertCircle, Star, Image as ImageIcon,
  Video, FolderPlus, Edit3, Trash2, Plus, Upload, Eye
} from 'lucide-react';
import { ROLE_PRESETS, EMPTY_PERMISSIONS } from '../utils/permissionRules';

export default function UserPermissionsModal({
  isOpen = false,
  user = null,
  categories = [],
  onClose = () => {},
  onSave = () => {}
}) {
  const [selectedRole, setSelectedRole] = useState('custom');
  const [permissions, setPermissions] = useState(EMPTY_PERMISSIONS);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || 'custom');
      const basePreset = ROLE_PRESETS[user.role]?.permissions || EMPTY_PERMISSIONS;
      setPermissions({
        ...EMPTY_PERMISSIONS,
        ...basePreset,
        ...(user.permissions || {}),
        allowedCategories: Array.isArray(user.permissions?.allowedCategories)
          ? user.permissions.allowedCategories
          : (basePreset.allowedCategories || [])
      });
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleRoleChange = (newRole) => {
    setSelectedRole(newRole);
    const preset = ROLE_PRESETS[newRole]?.permissions || EMPTY_PERMISSIONS;
    setPermissions(prev => ({
      ...EMPTY_PERMISSIONS,
      ...preset,
      allowedCategories: prev.allowedCategories.length > 0 ? prev.allowedCategories : []
    }));
  };

  const togglePermission = (key) => {
    setPermissions(prev => {
      const nextVal = !prev[key];
      const updated = { ...prev, [key]: nextVal };
      
      // Auto-sync sub-permissions for convenience while allowing independent toggling
      if (key === 'canManageCategories') {
        updated.canAddCategory = nextVal;
        updated.canEditCategory = nextVal;
        updated.canDeleteCategory = nextVal;
      }
      if (key === 'canAddProduct' && nextVal) {
        if (updated.canUploadProductImages === undefined) updated.canUploadProductImages = true;
        if (updated.canUploadProductVideos === undefined) updated.canUploadProductVideos = true;
      }
      if (key === 'canEditProduct' && nextVal) {
        if (updated.canEditProductBasic === undefined) updated.canEditProductBasic = true;
        if (updated.canEditPrice === undefined) updated.canEditPrice = true;
        if (updated.canEditProductImages === undefined) updated.canEditProductImages = true;
        if (updated.canEditProductVideos === undefined) updated.canEditProductVideos = true;
        if (updated.canToggleStock === undefined) updated.canToggleStock = true;
        if (updated.canToggleCustomName === undefined) updated.canToggleCustomName = true;
      }
      return updated;
    });
  };

  const handleToggleCategory = (catId) => {
    setPermissions(prev => {
      const current = Array.isArray(prev.allowedCategories) ? prev.allowedCategories : [];
      const updated = current.includes(catId)
        ? current.filter(id => id !== catId)
        : [...current, catId];
      return {
        ...prev,
        allowedCategories: updated
      };
    });
  };

  const handleSelectAllCategories = () => {
    const allCatIds = categories.filter(c => c && c.id !== 'all').map(c => c.id);
    setPermissions(prev => ({
      ...prev,
      allowedCategories: allCatIds
    }));
  };

  const handleClearCategories = () => {
    setPermissions(prev => ({
      ...prev,
      allowedCategories: []
    }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    onSave(user.id, permissions, selectedRole);
    onClose();
  };

  const safeCategories = categories.filter(c => c && c.id !== 'all');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 max-h-[94vh] flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DF7E93]/20 border border-[#DF7E93]/30 text-[#DF7E93] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  لوحة تحديد أزرار وصلاحيات الموظف
                </h3>
                <span className="text-[11px] bg-slate-800 text-pink-300 font-mono px-2.5 py-0.5 rounded-lg border border-slate-700 font-bold">
                  {user.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user.email || user.phone} • حدد للمدير كافة الصلاحيات بضغطات أزرار دقيقة ومباشرة
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">

          {/* 1. Quick Role Selection Template */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-900 block flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>1. اختيار قالب الدور الأساسي (أو تخصيص حر):</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.entries(ROLE_PRESETS).map(([roleKey, roleData]) => {
                const isActive = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleRoleChange(roleKey)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                      isActive
                        ? 'border-[#DF7E93] bg-pink-50/60 text-slate-900 ring-2 ring-[#DF7E93]/30 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="text-xs font-extrabold block">{roleData.label.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{roleData.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#DF7E93] shrink-0" />
              <span>{ROLE_PRESETS[selectedRole]?.description || 'تخصيص يدوي حر للصلاحيات'}</span>
            </p>
          </div>

          {/* 2. Category Access Control (صلاحيات الأقسام) */}
          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/80 bg-slate-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#DF7E93]" />
                <h4 className="text-xs font-black text-slate-900">
                  2. نطاق الأقسام والتصنيفات المسموح للموظف العمل عليها:
                </h4>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setPermissions(prev => ({ ...prev, categoriesMode: 'all' }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    permissions.categoriesMode === 'all'
                      ? 'bg-[#DF7E93] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  جميع الأقسام
                </button>
                <button
                  type="button"
                  onClick={() => setPermissions(prev => ({ ...prev, categoriesMode: 'custom' }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    permissions.categoriesMode === 'custom'
                      ? 'bg-[#DF7E93] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  أقسام محددة فقط
                </button>
              </div>
            </div>

            {permissions.categoriesMode === 'custom' ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>حدد الأقسام المسموح لهذا المستخدم برؤيتها وإدارتها:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllCategories}
                      className="text-brand-600 hover:underline font-bold cursor-pointer"
                    >
                      تحديد الكل
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleClearCategories}
                      className="text-rose-500 hover:underline font-bold cursor-pointer"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {safeCategories.map(cat => {
                    const isSelected = Array.isArray(permissions.allowedCategories) && permissions.allowedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`p-2.5 rounded-2xl border text-right flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-pink-50 border-[#DF7E93] text-slate-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs truncate">{cat.name}</span>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#DF7E93] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-emerald-700 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>المستخدم مصرح له بالوصول لكافة أقسام المتجر الحالية والمستقبلية.</span>
              </p>
            )}
          </div>

          {/* 3. Categories Management Buttons (أزرار إدارة الأقسام والبنرات) */}
          <div className="space-y-3 p-4 sm:p-5 rounded-3xl border border-slate-200/80 bg-white">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#DF7E93]" />
              <label className="text-xs font-black text-slate-900 block">
                3. أزرار إدارة الأقسام والتصنيفات والبنرات:
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* canAddCategory */}
              <div 
                onClick={() => togglePermission('canAddCategory')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canAddCategory
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canAddCategory ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canAddCategory && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900">زر إضافة قسم جديد</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يقدر يضيف أقسام وتصنيفات جديدة للمتجر.</p>
                </div>
              </div>

              {/* canEditCategory */}
              <div 
                onClick={() => togglePermission('canEditCategory')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canEditCategory
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canEditCategory ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canEditCategory && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900">زر تعديل الأقسام والبنرات</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يقدر يعدل اسم القسم، صورة البنر، ونص الستوري.</p>
                </div>
              </div>

              {/* canDeleteCategory */}
              <div 
                onClick={() => togglePermission('canDeleteCategory')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canDeleteCategory
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canDeleteCategory ? 'bg-rose-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canDeleteCategory && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-rose-900">زر حذف القسم</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يقدر يحذف قسماً نهائياً من المتجر.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Adding Products & Media Buttons (إضافة المنتجات، الصور، والفيديوهات) */}
          <div className="space-y-3 p-4 sm:p-5 rounded-3xl border border-slate-200/80 bg-white">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-600" />
              <label className="text-xs font-black text-slate-900 block">
                4. أزرار إضافة المنتجات ورفع الوسائط:
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* canAddProduct */}
              <div 
                onClick={() => togglePermission('canAddProduct')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canAddProduct
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canAddProduct ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canAddProduct && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900">زر إضافة منتج جديد</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يقدر يفتح نافذة إضافة منتج جديد للكتالوج.</p>
                </div>
              </div>

              {/* canUploadProductImages */}
              <div 
                onClick={() => togglePermission('canUploadProductImages')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canUploadProductImages
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canUploadProductImages ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canUploadProductImages && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>رفع وإضافة الصور</span>
                    <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يقدر يرفع صور من المعرض أو يضع روابط صور.</p>
                </div>
              </div>

              {/* canUploadProductVideos */}
              <div 
                onClick={() => togglePermission('canUploadProductVideos')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canUploadProductVideos
                    ? 'border-purple-300 bg-purple-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canUploadProductVideos ? 'bg-purple-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canUploadProductVideos && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-purple-900 flex items-center gap-1">
                    <span>رفع وإضافة الفيديوهات</span>
                    <Video className="w-3.5 h-3.5 text-purple-600" />
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يقدر يرفع فيديوهات من الهاتف أو يدرج روابط فيديو.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Detailed Product Editing Buttons (خصائص التعديل بالتفصيل) */}
          <div className="space-y-3 p-4 sm:p-5 rounded-3xl border border-slate-200/80 bg-white">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-brand-600" />
              <label className="text-xs font-black text-slate-900 block">
                5. أزرار وخصائص التعديل بالتفصيل (ما هي الأشياء التي يقدر يعدلها الموظف؟):
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* canEditProduct */}
              <div 
                onClick={() => togglePermission('canEditProduct')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canEditProduct
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canEditProduct ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canEditProduct && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900">زر تعديل المنتج العام</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">ظهور أيقونة التعديل في جدول المنتجات وفتح نافذة التعديل.</p>
                </div>
              </div>

              {/* canEditProductBasic */}
              <div 
                onClick={() => togglePermission('canEditProductBasic')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canEditProductBasic
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canEditProductBasic ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canEditProductBasic && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900">تعديل الاسم والوصف والقسم</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يقدر يغير اسم الصنف أو تصنيفه أو الهاشتاغات.</p>
                </div>
              </div>

              {/* canEditPrice */}
              <div 
                onClick={() => togglePermission('canEditPrice')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canEditPrice
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canEditPrice ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canEditPrice && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>تعديل الأسعار والخصم</span>
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يقدر يعدل سعر البيع، السعر الأصلي، وتفعيل الخصم.</p>
                </div>
              </div>

              {/* canEditProductImages */}
              <div 
                onClick={() => togglePermission('canEditProductImages')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canEditProductImages
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canEditProductImages ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canEditProductImages && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>تعديل وحذف صور المنتج</span>
                    <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يقدر يضيف صور جديدة للمنتج القائم أو يحذف صوراً منه.</p>
                </div>
              </div>

              {/* canEditProductVideos */}
              <div 
                onClick={() => togglePermission('canEditProductVideos')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canEditProductVideos
                    ? 'border-purple-300 bg-purple-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canEditProductVideos ? 'bg-purple-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canEditProductVideos && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-purple-900 flex items-center gap-1">
                    <span>تعديل وحذف فيديو المنتج</span>
                    <Video className="w-3.5 h-3.5 text-purple-600" />
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يقدر يرفع فيديو جديد أو يحذف الفيديو الموجود للمنتج.</p>
                </div>
              </div>

              {/* canToggleStock: متوفر ولا مش متوفر */}
              <div 
                onClick={() => togglePermission('canToggleStock')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ring-1 ${
                  permissions.canToggleStock
                    ? 'border-emerald-400 bg-emerald-50/70 ring-emerald-300'
                    : 'border-slate-200 bg-white hover:bg-slate-50 ring-transparent'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canToggleStock ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canToggleStock && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>متوفر ولا مش متوفر؟ (المخزون)</span>
                    <Archive className="w-3.5 h-3.5 text-emerald-600" />
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يقدر يغير حالة الصنف بين (متوفر ✓) أو (غير متوفر ✕).</p>
                </div>
              </div>

              {/* canToggleCustomName: التطريز حسب الاسم */}
              <div 
                onClick={() => togglePermission('canToggleCustomName')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canToggleCustomName
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canToggleCustomName ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canToggleCustomName && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>التطريز حسب الاسم (اسم المولود)</span>
                    <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يقدر يفعل أو يعطل خيار كتابة وتطريز اسم المولود.</p>
                </div>
              </div>

              {/* canDeleteProduct */}
              <div 
                onClick={() => togglePermission('canDeleteProduct')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canDeleteProduct
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canDeleteProduct ? 'bg-rose-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canDeleteProduct && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-rose-900 flex items-center gap-1">
                    <span>زر حذف المنتج نهائياً</span>
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">هل يظهر له زر حذف المنتج من المتجر.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Orders, Reviews, and Management Controls (المبيعات، التقييمات، والإدارة) */}
          <div className="space-y-3 p-4 sm:p-5 rounded-3xl border border-slate-200/80 bg-white">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#DF7E93]" />
              <label className="text-xs font-black text-slate-900 block">
                6. أزرار المبيعات والطلبات، التقييمات، والإدارة العامة:
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* canManageOrders */}
              <div 
                onClick={() => togglePermission('canManageOrders')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canManageOrders
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canManageOrders ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canManageOrders && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>الطلبات والمبيعات</span>
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">ظهور تبويب الطلبات وتحديث الشحن وتواصل واتساب.</p>
                </div>
              </div>

              {/* canManageReviews */}
              <div 
                onClick={() => togglePermission('canManageReviews')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canManageReviews
                    ? 'border-amber-300 bg-amber-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canManageReviews ? 'bg-amber-500 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canManageReviews && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>التقييمات والتعليقات</span>
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">اعتماد وإظهار أو إخفاء تعليقات الزبائن وعدد النجوم.</p>
                </div>
              </div>

              {/* canManageUsers */}
              <div 
                onClick={() => togglePermission('canManageUsers')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canManageUsers
                    ? 'border-purple-300 bg-purple-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canManageUsers ? 'bg-purple-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canManageUsers && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>المستخدمين والصلاحيات</span>
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">إدارة حسابات الموظفين والتحكم بهذه الصلاحيات.</p>
                </div>
              </div>

              {/* canManageSettings */}
              <div 
                onClick={() => togglePermission('canManageSettings')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canManageSettings
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canManageSettings ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canManageSettings && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900 flex items-center gap-1">
                    <span>هوية المتجر والشحن</span>
                    <Settings className="w-3.5 h-3.5 text-slate-600" />
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">تعديل الشعار، الألوان، الكوبونات وبيانات التواصل.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 hidden sm:block">
            سيتم حفظ وتفعيل الصلاحيات فوراً في جلسات الموظف القادمة واللحظية.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-white transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-7 py-2.5 rounded-2xl bg-[#DF7E93] hover:bg-[#d46b82] text-white font-bold text-xs shadow-md shadow-pink-200/50 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>حفظ وتطبيق الصلاحيات</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
