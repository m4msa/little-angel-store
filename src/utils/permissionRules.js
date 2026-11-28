/**
 * Role-Based Access Control (RBAC) & Fine-Grained Permissions
 * Little Angel Store (الملاك الصغير)
 * Clean Code Architecture
 */

/**
 * Base default permissions template - Granular Feature Flags
 */
export const EMPTY_PERMISSIONS = {
  categoriesMode: 'all', // 'all' | 'custom'
  allowedCategories: [], // array of category IDs (e.g. ['hospital-sets', 'custom-embroidery'])
  
  // 1. إضافة المنتجات
  canAddProduct: false,             // صلاحية إضافة منتج جديد
  canUploadProductImages: false,    // رفع صور للمنتج الجديد
  canUploadProductVideos: false,    // رفع فيديوهات للمنتج الجديد
  
  // 2. تعديل المنتجات بالتفصيل
  canEditProduct: false,            // تفعيل إمكانية فتح شاشة التعديل
  canEditProductBasic: false,       // تعديل الاسم والوصف والقسم الأساسي
  canEditPrice: false,              // تعديل السعر وسعر الخصم والعملة
  canEditProductImages: false,      // تعديل وإضافة أو حذف صور المنتج
  canEditProductVideos: false,      // تعديل وإضافة أو حذف فيديو المنتج
  canToggleStock: false,            // هل يوجد هذا الصنف أم لا يوجد (المخزون والتوفر)
  canToggleCustomName: false,       // التطريز حسب الاسم (هل يقبل تطريز اسم المولود أم لا)
  canEditProductColors: false,      // تعديل وإضافة أو حذف ألوان المنتج
  canEditProductSizes: false,       // تعديل وإضافة أو حذف مقاسات المنتج
  
  // 3. حذف المنتجات
  canDeleteProduct: false,          // حذف المنتجات نهائياً
  
  // 4. الأقسام والبنرات
  canAddCategory: false,            // إضافة صنف أو قسم جديد
  canEditCategory: false,           // تعديل مسميات وبنرات الأقسام
  canDeleteCategory: false,         // حذف الأقسام
  canManageCategories: false,       // إدارة كاملة للأقسام
  
  // 5. الطلبات والمبيعات
  canManageOrders: false,           // متابعة الطلبات وتحديث حالات الشحن وتواصل واتساب
  
  // 6. التقييمات والتعليقات
  canManageReviews: false,          // اعتماد وتفعيل أو إخفاء تعليقات العملاء
  
  // 7. الهوية وإعدادات المتجر
  canManageSettings: false,         // إعدادات المتجر والشعار والألوان والكوبونات والشحن
  
  // 8. المستخدمين وفريق العمل
  canManageUsers: false             // التحكم بالمستخدمين والصلاحيات
};

/**
 * Pre-defined Role Templates
 */
export const ROLE_PRESETS = {
  admin: {
    label: 'مدير عام كامل (Admin)',
    description: 'تحكم كامل وشامل بكافة أقسام المتجر، المنتجات، الأسعار، المخزون، الطلبات، والمستخدمين والتعليقات.',
    permissions: {
      categoriesMode: 'all',
      allowedCategories: [],
      canAddProduct: true,
      canUploadProductImages: true,
      canUploadProductVideos: true,
      canEditProduct: true,
      canEditProductBasic: true,
      canEditPrice: true,
      canEditProductImages: true,
      canEditProductVideos: true,
      canDeleteProduct: true,
      canToggleStock: true,
      canToggleCustomName: true,
      canEditProductColors: true,
      canEditProductSizes: true,
      canAddCategory: true,
      canEditCategory: true,
      canDeleteCategory: true,
      canManageCategories: true,
      canManageOrders: true,
      canManageReviews: true,
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
      canUploadProductImages: true,
      canUploadProductVideos: true,
      canEditProduct: true,
      canEditProductBasic: true,
      canEditPrice: true,
      canEditProductImages: true,
      canEditProductVideos: true,
      canDeleteProduct: false,
      canToggleStock: true,
      canToggleCustomName: true,
      canEditProductColors: true,
      canEditProductSizes: true,
      canAddCategory: false,
      canEditCategory: true,
      canDeleteCategory: false,
      canManageCategories: false,
      canManageOrders: true,
      canManageReviews: false,
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
      canUploadProductImages: true,
      canUploadProductVideos: false,
      canEditProduct: true,
      canEditProductBasic: true,
      canEditPrice: true,
      canEditProductImages: true,
      canEditProductVideos: false,
      canDeleteProduct: false,
      canToggleStock: true,
      canToggleCustomName: true,
      canEditProductColors: true,
      canEditProductSizes: true,
      canAddCategory: false,
      canEditCategory: false,
      canDeleteCategory: false,
      canManageCategories: false,
      canManageOrders: false,
      canManageReviews: false,
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
      canUploadProductImages: false,
      canUploadProductVideos: false,
      canEditProduct: false,
      canEditProductBasic: false,
      canEditPrice: false,
      canEditProductImages: false,
      canEditProductVideos: false,
      canDeleteProduct: false,
      canToggleStock: false,
      canToggleCustomName: false,
      canAddCategory: false,
      canEditCategory: false,
      canDeleteCategory: false,
      canManageCategories: false,
      canManageOrders: true,
      canManageReviews: false,
      canManageSettings: false,
      canManageUsers: false
    }
  },
  custom: {
    label: 'تخصيص يدوي للموظف (Custom)',
    description: 'صلاحيات مخصصة يدوياً حسب الأزرار والمهام المحددة من المدير العام.',
    permissions: {
      ...EMPTY_PERMISSIONS
    }
  },
  customer: {
    label: 'عميل مسجل (Customer)',
    description: 'حساب تسوق قياسي للتصفح والشراء ومتابعة الطلبات السابقة.',
    permissions: {
      categoriesMode: 'none',
      allowedCategories: [],
      canAddProduct: false,
      canUploadProductImages: false,
      canUploadProductVideos: false,
      canEditProduct: false,
      canEditProductBasic: false,
      canEditPrice: false,
      canEditProductImages: false,
      canEditProductVideos: false,
      canDeleteProduct: false,
      canToggleStock: false,
      canToggleCustomName: false,
      canAddCategory: false,
      canEditCategory: false,
      canDeleteCategory: false,
      canManageCategories: false,
      canManageOrders: false,
      canManageReviews: false,
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
    ...EMPTY_PERMISSIONS,
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

/**
 * Tab-level visibility helpers (Strict zero-visibility policy for unauthorized users)
 */
export function canAccessProductsTab(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const p = getEffectivePermissions(user);
  return Boolean(
    p.canAddProduct ||
    p.canUploadProductImages ||
    p.canUploadProductVideos ||
    p.canEditProduct ||
    p.canEditProductBasic ||
    p.canEditProductImages ||
    p.canEditProductVideos ||
    p.canDeleteProduct ||
    p.canEditPrice ||
    p.canToggleStock ||
    p.canToggleCustomName
  );
}

export function canAccessCategoriesTab(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const p = getEffectivePermissions(user);
  return Boolean(
    p.canManageCategories ||
    p.canAddCategory ||
    p.canEditCategory ||
    p.canDeleteCategory
  );
}

export function canAccessOrdersTab(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const p = getEffectivePermissions(user);
  return Boolean(p.canManageOrders);
}

export function canAccessReviewsTab(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const p = getEffectivePermissions(user);
  return Boolean(p.canManageReviews);
}

export function canAccessUsersTab(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const p = getEffectivePermissions(user);
  return Boolean(p.canManageUsers);
}

export function canAccessSettingsTab(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const p = getEffectivePermissions(user);
  return Boolean(p.canManageSettings);
}

