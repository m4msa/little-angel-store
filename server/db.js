import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialProducts, initialCategories } from '../src/data/mockProducts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'store_db.json');

const DEFAULT_USERS = [
  {
    id: 'USR-ADMIN',
    name: 'مدير المتجر العام',
    email: 'msaawadi2016@gmail.com',
    phone: '0550000000',
    city: 'الرياض',
    address: 'حي النرجس، شارع عثمان بن عفان',
    password: '12345678',
    role: 'admin',
    createdAt: '2026-01-01',
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
  {
    id: 'USR-AMJAD',
    name: 'امجد البركاني (مسؤول توفر ومخزون)',
    email: 'ama2026@gmail.com',
    phone: '555545555',
    city: 'الرياض',
    address: 'العزيزه',
    password: '12345678',
    role: 'editor',
    createdAt: '2026-02-25',
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
      canToggleStock: true,
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
  },
  {
    id: 'USR-SUP-1',
    name: 'ريم القحطاني (مشرفة أطقم وتطريز)',
    email: 'reem@littleangel.com',
    phone: '0551122334',
    city: 'الرياض',
    address: 'حي الملقا - شارع التحلية',
    password: '123',
    role: 'supervisor',
    createdAt: '2026-02-01',
    permissions: {
      categoriesMode: 'custom',
      allowedCategories: ['hospital-sets', 'custom-embroidery', 'baby-clothes', 'swaddles'],
      canAddProduct: true,
      canEditProduct: true,
      canDeleteProduct: false,
      canEditPrice: true,
      canToggleStock: true,
      canToggleCustomName: true,
      canAddCategory: false,
      canEditCategory: false,
      canDeleteCategory: false,
      canManageOrders: true,
      canManageSettings: false,
      canManageUsers: false
    }
  },
  {
    id: 'USR-101',
    name: 'سارة عبدالله',
    email: 'sarah@gmail.com',
    phone: '0551234567',
    city: 'الرياض',
    address: 'حي الياسمين، شارع أنس بن مالك، فيلا 14',
    password: '123',
    role: 'customer',
    createdAt: '2026-02-15',
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
      canManageOrders: false,
      canManageSettings: false,
      canManageUsers: false
    }
  }
];

const DEFAULT_SETTINGS = {
  storeName: 'الملاك الصغير',
  storeSlogan: 'عالم الأناقة والفخامة لمولودك الصغير',
  storeDescription: 'متجر سعودي رائد متخصص في أرقى مستلزمات واستقبال المواليد والتطريز الفاخر بالاسم حسب الطلب.',
  whatsappNumber: '967775302137',
  brandColor: '#DF7E93',
  brandColorHover: '#d06a80',
  logoUrl: '',
  announcementText: '✨ شحن مجاني للطلبات الأكثر من 299 ر.س | استخدمي كود FIRST10 لخصم 10%',
  shippingFee: 25,
  freeShippingThreshold: 299,
  enableCustomNameEmbroidery: true,
  taxRatePercent: 15,
  coupons: [
    { code: 'FIRST10', discountPercent: 10, minOrder: 100, isActive: true },
    { code: 'ANGEL20', discountPercent: 20, minOrder: 250, isActive: true }
  ]
};

export const DEFAULT_REVIEWS = [
  {
    id: 'REV-101',
    productId: 1,
    productName: 'بكج استقبال روز بيبي - تفصيل ملكي فاخر (7 قطع)',
    customerName: 'أم ريان السبيعي',
    customerEmail: 'am.rayan@gmail.com',
    customerPhone: '0559988776',
    rating: 5,
    comment: 'ما شاء الله تبارك الله، جودة القماش والتطريز تفوق الخيال! التغليف ملكي فاخر والتوصيل سريع جداً.',
    createdAt: '2026-11-26T14:20:00Z',
    isVisible: true,
    status: 'approved'
  },
  {
    id: 'REV-102',
    productId: 2,
    productName: 'طقم استقبال لؤلؤي دانتيل ناعم مع تطريز الاسم بالخيط الذهبي',
    customerName: 'نورة الشمري',
    customerEmail: 'noura.alshammari@gmail.com',
    customerPhone: '0561234890',
    rating: 5,
    comment: 'الخامة جداً ناعمة ومناسبة للمستشفى، وتطريز الاسم بالخيط الذهبي أعطى فخامة لا توصف. شكراً لكم!',
    createdAt: '2026-11-26T18:45:00Z',
    isVisible: true,
    status: 'approved'
  },
  {
    id: 'REV-103',
    productId: 1,
    productName: 'بكج استقبال روز بيبي - تفصيل ملكي فاخر (7 قطع)',
    customerName: 'فيصل الحربي',
    customerEmail: 'faisal.harbi99@gmail.com',
    customerPhone: '0505544332',
    rating: 5,
    comment: 'وصلني في وقت قياسي والهدية نالت إعجاب الأهل كثيراً، التغليف يبيض الوجه وتفاصيل الاسم متقنة للغاية.',
    createdAt: '2026-11-27T10:15:00Z',
    isVisible: false,
    status: 'pending'
  },
  {
    id: 'REV-104',
    productId: 3,
    productName: 'مهاد بيبي شتوي ثقيل بطانة صوف تيدي دافئ',
    customerName: 'هند القحطاني',
    customerEmail: 'hend.qahtani@gmail.com',
    customerPhone: '0558877112',
    rating: 4,
    comment: 'المهاد دافئ جداً ومريح للطفل في الشتاء.',
    createdAt: '2026-11-27T11:30:00Z',
    isVisible: false,
    status: 'hidden'
  }
];

const DEFAULT_ORDERS = [
  {
    id: 'ORD-17955701',
    customer: {
      name: 'سارة عبدالله',
      phone: '0551234567',
      email: 'sarah@gmail.com',
      city: 'الرياض',
      address: 'حي الياسمين، شارع أنس بن مالك، فيلا 14'
    },
    items: [
      {
        id: 1,
        name: 'بكج استقبال روز بيبي - تفصيل ملكي فاخر (7 قطع)',
        price: 249,
        quantity: 1,
        color: 'بيج كريمي',
        size: '0-3 أشهر',
        hasCustomName: true,
        embroideryName: 'محمد',
        threadColor: 'ذهبي ملكي'
      }
    ],
    subtotal: 249,
    discountAmount: 24.9,
    shippingFee: 0,
    total: 224.1,
    paymentMethod: 'apple_pay',
    status: 'processing',
    createdAt: '2026-11-24T18:30:00Z',
    notes: 'تغليف هدية فاخر مع كرت مباركة'
  }
];

function getInitialDb() {
  return {
    products: initialProducts,
    categories: initialCategories,
    users: DEFAULT_USERS,
    orders: DEFAULT_ORDERS,
    reviews: DEFAULT_REVIEWS,
    settings: DEFAULT_SETTINGS,
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    }
  };
}

let cachedDb = null;
let saveDebounceTimer = null;

export function loadDb() {
  if (cachedDb) return cachedDb;

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      cachedDb = JSON.parse(raw);
      // Validate structure
      if (!cachedDb.products || !cachedDb.categories || !cachedDb.users) {
        throw new Error('Corrupted db structure, restoring defaults');
      }
      if (!cachedDb.reviews || !Array.isArray(cachedDb.reviews)) {
        cachedDb.reviews = DEFAULT_REVIEWS;
        saveDbImmediate(cachedDb);
      }
      return cachedDb;
    }
  } catch (err) {
    console.warn('[DB] Error loading database file, initializing defaults:', err.message);
  }

  cachedDb = getInitialDb();
  saveDbImmediate(cachedDb);
  return cachedDb;
}

export function saveDbImmediate(data) {
  try {
    data.meta = {
      ...(data.meta || {}),
      updatedAt: new Date().toISOString()
    };
    cachedDb = data;
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('[DB] Failed to save database file:', err.message);
    return false;
  }
}

export function saveDb(data) {
  cachedDb = data;
  if (saveDebounceTimer) clearTimeout(saveDebounceTimer);
  saveDebounceTimer = setTimeout(() => {
    saveDbImmediate(data);
  }, 300);
}

// ---------------- PRODUCTS ----------------
export function getProducts(filters = {}) {
  const db = loadDb();
  let list = db.products || [];

  if (filters.category && filters.category !== 'all') {
    list = list.filter(p => p.category === filters.category);
  }
  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.description && p.description.toLowerCase().includes(q)) ||
      (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q)))
    );
  }
  if (filters.inStock !== undefined) {
    const isStock = filters.inStock === 'true' || filters.inStock === true;
    list = list.filter(p => Boolean(p.inStock) === isStock);
  }
  return list;
}

export function getProductById(id) {
  const db = loadDb();
  const numId = Number(id);
  return db.products.find(p => p.id === id || p.id === numId) || null;
}

export function addProduct(prodData) {
  const db = loadDb();
  const maxId = db.products.reduce((max, p) => Math.max(max, typeof p.id === 'number' ? p.id : 0), 0);
  const newProduct = {
    ...prodData,
    id: prodData.id || (maxId + 1),
    rating: prodData.rating || 5.0,
    reviewsCount: prodData.reviewsCount || 0,
    inStock: prodData.inStock !== undefined ? Boolean(prodData.inStock) : true,
    createdAt: new Date().toISOString()
  };
  db.products = [newProduct, ...db.products];
  saveDb(db);
  return newProduct;
}

export function updateProduct(id, updates) {
  const db = loadDb();
  const numId = Number(id);
  const index = db.products.findIndex(p => p.id === id || p.id === numId);
  if (index === -1) return null;

  db.products[index] = {
    ...db.products[index],
    ...updates,
    id: db.products[index].id, // preserve id
    updatedAt: new Date().toISOString()
  };
  saveDb(db);
  return db.products[index];
}

export function deleteProduct(id) {
  const db = loadDb();
  const numId = Number(id);
  const initialLen = db.products.length;
  db.products = db.products.filter(p => p.id !== id && p.id !== numId);
  if (db.products.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}

// ---------------- CATEGORIES ----------------
export function getCategories() {
  const db = loadDb();
  return db.categories || [];
}

export function addCategory(catData) {
  const db = loadDb();
  const newCat = {
    ...catData,
    id: catData.id || `cat-${Date.now()}`
  };
  db.categories = [...db.categories, newCat];
  saveDb(db);
  return newCat;
}

export function updateCategory(id, updates) {
  const db = loadDb();
  const index = db.categories.findIndex(c => c.id === id);
  if (index === -1) return null;

  db.categories[index] = {
    ...db.categories[index],
    ...updates,
    id: db.categories[index].id
  };
  saveDb(db);
  return db.categories[index];
}

export function deleteCategory(id) {
  const db = loadDb();
  if (id === 'all') return false;
  const initialLen = db.categories.length;
  db.categories = db.categories.filter(c => c.id !== id);
  if (db.categories.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}

// ---------------- ORDERS ----------------
export function getOrders() {
  const db = loadDb();
  return db.orders || [];
}

export function getOrderById(id) {
  const db = loadDb();
  return db.orders.find(o => o.id === id) || null;
}

export function addOrder(orderData) {
  const db = loadDb();
  const orderId = orderData.id || `ORD-${Date.now().toString().slice(-6)}`;
  const newOrder = {
    ...orderData,
    id: orderId,
    status: orderData.status || 'pending',
    createdAt: orderData.createdAt || new Date().toISOString()
  };
  db.orders = [newOrder, ...db.orders];
  saveDb(db);
  return newOrder;
}

export function updateOrderStatus(id, status) {
  const db = loadDb();
  const index = db.orders.findIndex(o => o.id === id);
  if (index === -1) return null;

  db.orders[index] = {
    ...db.orders[index],
    status,
    updatedAt: new Date().toISOString()
  };
  saveDb(db);
  return db.orders[index];
}

export function deleteOrder(id) {
  const db = loadDb();
  const initialLen = db.orders.length;
  db.orders = db.orders.filter(o => o.id !== id);
  if (db.orders.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}

// ---------------- USERS & RBAC ----------------
export function getUsers() {
  const db = loadDb();
  return db.users || [];
}

export function getUserById(id) {
  const db = loadDb();
  return db.users.find(u => u.id === id) || null;
}

export function findUserByIdentifier(identifier) {
  const db = loadDb();
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPhone = cleanId.replace(/[^0-9]/g, '');

  return db.users.find(u => {
    const uEmail = (u.email || '').toLowerCase();
    const uPhone = (u.phone ? String(u.phone) : '').replace(/[^0-9]/g, '');
    return (uEmail && uEmail === cleanId) || (cleanPhone && uPhone && uPhone.includes(cleanPhone));
  }) || null;
}

export function addUser(userData) {
  const db = loadDb();
  const newUser = {
    ...userData,
    id: userData.id || `USR-${Date.now()}`,
    createdAt: userData.createdAt || new Date().toLocaleDateString('ar-SA')
  };
  db.users = [newUser, ...db.users];
  saveDb(db);
  return newUser;
}

export function updateUser(id, updates) {
  const db = loadDb();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return null;

  db.users[index] = {
    ...db.users[index],
    ...updates,
    id: db.users[index].id // preserve id
  };
  saveDb(db);
  return db.users[index];
}

export function deleteUser(id) {
  const db = loadDb();
  const user = db.users.find(u => u.id === id);
  if (user && user.role === 'admin' && db.users.filter(u => u.role === 'admin').length <= 1) {
    throw new Error('لا يمكن حذف حساب المدير العام الأساسي!');
  }
  const initialLen = db.users.length;
  db.users = db.users.filter(u => u.id !== id);
  if (db.users.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}

// ---------------- SETTINGS ----------------
export function getSettings() {
  const db = loadDb();
  return db.settings || DEFAULT_SETTINGS;
}

export function updateSettings(updates) {
  const db = loadDb();
  db.settings = {
    ...(db.settings || DEFAULT_SETTINGS),
    ...updates
  };
  saveDb(db);
  return db.settings;
}

// ---------------- REVIEWS & RATINGS ----------------
export function getReviews(filters = {}) {
  const db = loadDb();
  let list = db.reviews || [];

  if (filters.productId) {
    list = list.filter(r => String(r.productId) === String(filters.productId));
  }
  if (filters.status && filters.status !== 'all') {
    list = list.filter(r => r.status === filters.status);
  }
  if (filters.isVisible !== undefined && filters.isVisible !== null && filters.isVisible !== '') {
    const visibleBool = String(filters.isVisible) === 'true';
    list = list.filter(r => Boolean(r.isVisible) === visibleBool);
  }
  if (filters.search) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(r =>
      (r.customerName && r.customerName.toLowerCase().includes(q)) ||
      (r.customerEmail && r.customerEmail.toLowerCase().includes(q)) ||
      (r.customerPhone && String(r.customerPhone).includes(q)) ||
      (r.productName && r.productName.toLowerCase().includes(q)) ||
      (r.comment && r.comment.toLowerCase().includes(q))
    );
  }

  return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getReviewById(id) {
  const db = loadDb();
  return (db.reviews || []).find(r => r.id === id) || null;
}

export function addReview(reviewData) {
  const db = loadDb();
  if (!db.reviews) db.reviews = [];

  const newReview = {
    id: reviewData.id || `REV-${Date.now()}`,
    productId: reviewData.productId || null,
    productName: reviewData.productName || 'منتج عام',
    productImage: reviewData.productImage || '',
    customerName: reviewData.customerName || 'عميل المتجر',
    customerEmail: reviewData.customerEmail || '',
    customerPhone: reviewData.customerPhone || '',
    rating: Math.min(5, Math.max(1, Number(reviewData.rating) || 5)),
    comment: reviewData.comment || '',
    createdAt: reviewData.createdAt || new Date().toISOString(),
    // New reviews are hidden & pending by default for admin approval!
    isVisible: reviewData.isVisible !== undefined ? Boolean(reviewData.isVisible) : false,
    status: reviewData.status || (reviewData.isVisible ? 'approved' : 'pending')
  };

  db.reviews = [newReview, ...db.reviews];
  saveDb(db);
  return newReview;
}

export function updateReviewVisibility(id, isVisible) {
  const db = loadDb();
  if (!db.reviews) db.reviews = [];
  const index = db.reviews.findIndex(r => r.id === id);
  if (index === -1) return null;

  const visibleBool = Boolean(isVisible);
  db.reviews[index] = {
    ...db.reviews[index],
    isVisible: visibleBool,
    status: visibleBool ? 'approved' : 'hidden',
    updatedAt: new Date().toISOString()
  };
  saveDb(db);
  return db.reviews[index];
}

export function updateReviewStatus(id, status) {
  const db = loadDb();
  if (!db.reviews) db.reviews = [];
  const index = db.reviews.findIndex(r => r.id === id);
  if (index === -1) return null;

  db.reviews[index] = {
    ...db.reviews[index],
    status,
    isVisible: status === 'approved',
    updatedAt: new Date().toISOString()
  };
  saveDb(db);
  return db.reviews[index];
}

export function deleteReview(id) {
  const db = loadDb();
  if (!db.reviews) return false;
  const initialLen = db.reviews.length;
  db.reviews = db.reviews.filter(r => r.id !== id);
  if (db.reviews.length !== initialLen) {
    saveDb(db);
    return true;
  }
  return false;
}


