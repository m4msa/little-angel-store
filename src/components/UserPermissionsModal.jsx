import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, X, Check, CheckSquare, Square, Layers, 
  Package, DollarSign, Archive, Sparkles, Tag, ShoppingBag, 
  Settings, Users, Info, AlertCircle 
} from 'lucide-react';
import { ROLE_PRESETS, EMPTY_PERMISSIONS } from '../utils/permissionRules';

export default function UserPermissionsModal({
  isOpen = false,
  user = null,
  categories = [],
  onClose = () => {},
  onSave = () => {}
}) {
  const [selectedRole, setSelectedRole] = useState('supervisor');
  const [permissions, setPermissions] = useState(EMPTY_PERMISSIONS);

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role || 'customer');
      const basePreset = ROLE_PRESETS[user.role]?.permissions || EMPTY_PERMISSIONS;
      setPermissions({
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
      ...preset,
      allowedCategories: prev.allowedCategories.length > 0 ? prev.allowedCategories : []
    }));
  };

  const togglePermission = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#DF7E93]/20 border border-[#DF7E93]/30 text-[#DF7E93] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  تعديل وتحديد صلاحيات المستخدم
                </h3>
                <span className="text-[11px] bg-slate-800 text-pink-300 font-mono px-2 py-0.5 rounded-md border border-slate-700">
                  {user.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {user.email || user.phone} • مسجل كـ ({ROLE_PRESETS[selectedRole]?.label || selectedRole})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">

          {/* 1. Quick Role Selection Template */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-900 block">
              1. اختيار القالب / الدور الأساسي للحساب:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.entries(ROLE_PRESETS).map(([roleKey, roleData]) => {
                const isActive = selectedRole === roleKey;
                return (
                  <button
                    key={roleKey}
                    type="button"
                    onClick={() => handleRoleChange(roleKey)}
                    className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between ${
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
                  2. صلاحيات الأقسام المسموح له بإدارتها والعمل عليها:
                </h4>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setPermissions(prev => ({ ...prev, categoriesMode: 'all' }))}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
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
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
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
                  <span>حدد الأقسام المسموح لهذا المستخدم بتعديل منتجاتها:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllCategories}
                      className="text-brand-600 hover:underline font-bold"
                    >
                      تحديد الكل
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleClearCategories}
                      className="text-rose-500 hover:underline font-bold"
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
                        className={`p-2.5 rounded-2xl border text-right flex items-center justify-between transition-all ${
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

          {/* 3. Granular Product Actions (صلاحيات المنتجات في الأقسام) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#DF7E93]" />
              <label className="text-xs font-black text-slate-900 block">
                3. صلاحيات إدارة المنتجات في الأقسام المسموحة:
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* canAddProduct */}
              <div 
                onClick={() => togglePermission('canAddProduct')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
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
                  <h5 className="text-xs font-black text-slate-900">إضافة منتجات جديدة (Add Products)</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    إمكانية رفع أصناف جديدة، صور، مقاسات، وألوان في الأقسام المصرح له بها.
                  </p>
                </div>
              </div>

              {/* canEditProduct */}
              <div 
                onClick={() => togglePermission('canEditProduct')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
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
                  <h5 className="text-xs font-black text-slate-900">تعديل بيانات المنتجات (Edit Details)</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    تعديل اسم الصنف، الصور، الوصف، الوسوم، المقاسات والألوان المتوفرة.
                  </p>
                </div>
              </div>

              {/* canDeleteProduct */}
              <div 
                onClick={() => togglePermission('canDeleteProduct')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
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
                  <h5 className="text-xs font-black text-rose-900">حذف المنتجات (Delete Products)</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    السماح بحذف الأصناف نهائياً من المتجر مع ظهور تأكيد الحذف.
                  </p>
                </div>
              </div>

              {/* canEditPrice */}
              <div 
                onClick={() => togglePermission('canEditPrice')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
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
                  <h5 className="text-xs font-black text-slate-900">تعديل الأسعار والخصومات (Edit Prices)</h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    تعديل سعر البيع، السعر الأصلي، وتفعيل أو إلغاء العروض المخفضة.
                  </p>
                </div>
              </div>

              {/* canToggleStock: هل يوجد هذا الصنف أم لا يوجد */}
              <div 
                onClick={() => togglePermission('canToggleStock')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                  permissions.canToggleStock
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                  permissions.canToggleStock ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canToggleStock && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-black text-slate-900">
                    هل يوجد هذا الصنف أم لا يوجد؟ (إدارة المخزون والتوفر)
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    تغيير حالة الصنف فوراً بين (متوفر وجاهز للشحن) أو (نفدت الكمية / غير متوفر).
                  </p>
                </div>
              </div>

              {/* canToggleCustomName: هل يوجد مع هذا الصنف تعديل أو اسم المولود أم لا يوجد */}
              <div 
                onClick={() => togglePermission('canToggleCustomName')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
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
                  <h5 className="text-xs font-black text-slate-900">
                    هل يوجد مع هذا الصنف تعديل أو اسم المولود؟ (تطريز وتفصيل)
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    التحكم في إتاحة حقل كتابة وتطريز اسم المولود أو شعار العائلة على هذا الصنف.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* 4. General Admin Permissions (صلاحيات إدارية عامة) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#DF7E93]" />
              <label className="text-xs font-black text-slate-900 block">
                4. صلاحيات عامة وإضافية بالمتجر:
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* canManageOrders */}
              <div 
                onClick={() => togglePermission('canManageOrders')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                  permissions.canManageOrders
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                  permissions.canManageOrders ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canManageOrders && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">إدارة ومتابعة طلبات العملاء والشحن</h5>
                  <p className="text-[10px] text-slate-500">معاينة فواتير الشراء، تغيير الحالات، ومراسلة العميل بالواتساب.</p>
                </div>
              </div>

              {/* canManageCategories */}
              <div 
                onClick={() => togglePermission('canManageCategories')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                  permissions.canManageCategories
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                  permissions.canManageCategories ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canManageCategories && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">إضافة وتعديل الأقسام والبنرات</h5>
                  <p className="text-[10px] text-slate-500">إنشاء تبويبات جديدة للمتجر وتحديث صور وقصص الأقسام.</p>
                </div>
              </div>

              {/* canManageSettings */}
              <div 
                onClick={() => togglePermission('canManageSettings')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                  permissions.canManageSettings
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                  permissions.canManageSettings ? 'bg-emerald-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canManageSettings && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">إعدادات الهوية والشحن والكوبونات</h5>
                  <p className="text-[10px] text-slate-500">تغيير اسم المتجر، الشعار، الألوان، كود الخصم، والتوصيل.</p>
                </div>
              </div>

              {/* canManageUsers */}
              <div 
                onClick={() => togglePermission('canManageUsers')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 select-none ${
                  permissions.canManageUsers
                    ? 'border-purple-300 bg-purple-50/40'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                  permissions.canManageUsers ? 'bg-purple-600 text-white' : 'border border-slate-300'
                }`}>
                  {permissions.canManageUsers && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">التحكم بالمستخدمين والصلاحيات</h5>
                  <p className="text-[10px] text-slate-500">منح الصلاحيات للمستخدمين الآخرين وإدارة موظفي المتجر.</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 hidden sm:block">
            سيتم حفظ وتفعيل الصلاحيات فوراً في جلسات المستخدم القادمة.
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-white transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-7 py-2.5 rounded-2xl bg-[#DF7E93] hover:bg-[#d46b82] text-white font-bold text-xs shadow-md shadow-pink-200/50 flex items-center justify-center gap-2 transition-all active:scale-95"
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
