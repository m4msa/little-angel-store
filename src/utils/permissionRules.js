/**
 * Role-Based Access Control (RBAC) & Fine-Grained Permissions
 * Little Angel Store (الملاك الصغير)
 * Clean Code Architecture
 */

/**
 * Base default permissions template
 */
export const EMPTY_PERMISSIONS = {
  categoriesMode: 'all', // 'all' | 'custom'
  allowedCategories: [], // array of category IDs (e.g. ['hospital-sets', 'custom-embroidery'])
  canAddProduct: false,
  canEditProduct: false,
  canDeleteProduct: false,
  canEditPrice: false,
  canToggleStock: false,         // هل يوجد هذا الصنف أم لا يوجد (المخزون والتوفر)
  canToggleCustomName: false,    // هل يوجد مع هذا الصنف خيار تعديل أو اسم المولود أم لا يوجد
  canAddCategory: false,
  canEditCategory: false,
  canDeleteCategory: false,
  canManageOrders: false,
  canManageSettings: false,
  canManageUsers: false
};

/**
 * Pre-defined Role Templates
 */
export const ROLE_PRESETS = {
  admin: {
    label: 'مدير عام كامل (Admin)',
    description: 'تحكم كامل وشامل بكافة أقسام المتجر، المنتجات، الأسعار، المخزون، الطلبات، والمستخدمين.',
    permissions: {
      categoriesMode: 'all',
      allowedCategories: [],
      canAddProduct: true,
      canEditProduct: true,
      canDeleteProduct: true,
      canEditPrice: true,
      canToggleStock: true,
      canToggleCustomName: true,
      canAddCategory: true,
      canEditCategory: true,
      canDeleteCategory: true,
      canManageOrders: true,
      canManageSettings: true,
      canManageUsers: true
    }
  },
  supervisor: {
    label: 'مشرف أقسام ومنتجات (Supervisor)',
    description: 'إدارة المنتجات في الأقسام، تعديل الأسعار، التحكم في توفر الصنف، وتفعيل تطريز اسم المولود وإدارة الطلبات.',
    permissions: {
      categoriesMode: 'all',
      allowedCategories: [],
      canAddProduct: true,
      canEditProduct: true,
      canDeleteProduct: false,
      canEditPrice: true,
      canToggleStock: true,
      canToggleCustomName: true,
      canAddCategory: false,
      canEditCategory: true,
      canDeleteCategory: false,
      canManageOrders: true,
      canManageSettings: false,
      canManageUsers: false
    }
  },
  editor: {
    label: 'مدير محتوى ومخزون (Catalog & Stock)',
    description: 'تعديل المنتجات الحالية، ضبط حالة التوفر (هل الصنف موجود أم لا)، وتعديل الأسعار وإمكانية التطريز.',
    permissions: {
      categoriesMode: 'all',
      allowedCategories: [],
      canAddProduct: true,
      canEditProduct: true,
      canDeleteProduct: false,
      canEditPrice: true,
      canToggleStock: true,
      canToggleCustomName: true,
      canAddCategory: false,
      canEditCategory: false,
      canDeleteCategory: false,
      canManageOrders: false,
      canManageSettings: false,
      canManageUsers: false
    }
  },
  order_specialist: {
    label: 'مسؤول مبيعات وشحن (Orders & Sales)',
    description: 'معاينة الطلبات وتحديث حالات التجهيز والشحن والتواصل مع العملاء عبر الواتساب.',
    permissions: {
      categoriesMode: 'all',
      allowedCategories: [],
      canAddProduct: false,
      canEditProduct: false,
      canDeleteProduct: false,
      canEditPrice: false,
      canToggleStock: false,
      canToggleCustomName: false,
      canAddCategory: false,
      canEditCategory: false,
      canDeleteCategory: false,
      canManageOrders: true,
      canManageSettings: false,
      canManageUsers: false
    }
  },
  customer: {
    label: 'عميل مسجل (Customer)',
    description: 'حساب تسوق قياسي للتصفح والشراء ومتابعة الطلبات السابقة.',
    permissions: {
      categoriesMode: 'none',
      allowedCategories: [],
      canAddProduct: false,
      canEditProduct: false,
      canDeleteProduct: false,
      canEditPrice: false,
      canToggleStock: false,
      canToggleCustomName: false,
      canAddCategory: false,
      canEditCategory: false,
      canDeleteCategory: false,
      canManageOrders: false,
      canManageSettings: false,
      canManageUsers: false
    }
  }
};

/**
 * Returns merged and safe effective permissions for any user object
 * @param {object|null} user 
 * @returns {typeof EMPTY_PERMISSIONS}
 */
export function getEffectivePermissions(user) {
  if (!user) return { ...EMPTY_PERMISSIONS };
  if (user.role === 'admin') {
    return { ...ROLE_PRESETS.admin.permissions };
  }

  const rolePreset = ROLE_PRESETS[user.role]?.permissions || EMPTY_PERMISSIONS;
  const customPerms = user.permissions || {};

  return {
    ...rolePreset,
    ...customPerms,
    allowedCategories: Array.isArray(customPerms.allowedCategories)
      ? customPerms.allowedCategories
      : (rolePreset.allowedCategories || [])
  };
}

/**
 * Checks if a user is allowed to access or manage a specific category
 * @param {object|null} user 
 * @param {string} categoryId 
 * @returns {boolean}
 */
export function hasCategoryPermission(user, categoryId) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const perms = getEffectivePermissions(user);
  if (perms.categoriesMode === 'all') return true;
  if (perms.categoriesMode === 'none') return false;
  return Array.isArray(perms.allowedCategories) && perms.allowedCategories.includes(categoryId);
}

/**
 * Checks if a user can perform a specific product action in a given category
 * @param {object|null} user 
 * @param {'add'|'edit'|'delete'|'price'|'stock'|'customName'} action 
 * @param {string} [categoryId] 
 * @returns {boolean}
 */
export function canPerformProductAction(user, action, categoryId) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  
  if (categoryId && !hasCategoryPermission(user, categoryId)) {
    return false;
  }

  const perms = getEffectivePermissions(user);
  switch (action) {
    case 'add':
      return Boolean(perms.canAddProduct);
    case 'edit':
      return Boolean(perms.canEditProduct);
    case 'delete':
      return Boolean(perms.canDeleteProduct);
    case 'price':
      return Boolean(perms.canEditPrice);
    case 'stock':
      return Boolean(perms.canToggleStock);
    case 'customName':
      return Boolean(perms.canToggleCustomName);
    default:
      return false;
  }
}

