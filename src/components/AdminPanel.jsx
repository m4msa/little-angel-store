import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, ShoppingBag, Plus, Trash2, Edit3, Upload, Image as ImageIcon, 
  DollarSign, FolderPlus, Folder, Layers, Check, Truck, 
  X, LogOut, Store, Eye, Percent, Palette, Video, MessageCircle, Phone, 
  Tag, Search, CheckCircle2, AlertTriangle, AlertCircle,
  Users, UserCheck, Shield, ShieldCheck, Key, Lock, Unlock, Sliders, CheckSquare, Square, UserPlus
} from 'lucide-react';
import { 
  sanitizeString, 
  sanitizeUrl, 
  sanitizeNumber, 
  buildWhatsAppUrl, 
  safeOpenExternal 
} from '../utils/security';
import UserPermissionsModal from './UserPermissionsModal';
import UserEditModal from './UserEditModal';
import { 
  getEffectivePermissions, 
  canPerformProductAction, 
  hasCategoryPermission, 
  ROLE_PRESETS 
} from '../utils/permissionRules';

const PRESET_SIZES = [
  '0-3 أشهر', 
  '3-6 أشهر', 
  '6-12 شهر', 
  '1-2 سنة', 
  '2-3 سنوات', 
  'مقاس موحد / قياسي', 
  'Free Size'
];

const PRESET_COLORS = [
  'وردي هادئ', 
  'أزرق سماوي', 
  'أبيض قطني', 
  'بيج كريمي', 
  'رمادي ناعم', 
  'أخضر نعناعي', 
  'كحلي فاخر', 
  'بني كراميل'
];

const COLOR_PALETTES = [
  { name: 'وردي ملكي (الافتراضي)', primary: '#DF7E93', secondary: '#E88E9F', bgClass: 'from-[#DF7E93] to-[#E88E9F]' },
  { name: 'أرجواني لافندر فاخر', primary: '#9333EA', secondary: '#A855F7', bgClass: 'from-purple-600 to-purple-500' },
  { name: 'ذهبي ملكي أنيق', primary: '#D97706', secondary: '#F59E0B', bgClass: 'from-amber-600 to-amber-500' },
  { name: 'أزرق سماوي ناعم', primary: '#0284C7', secondary: '#38BDF8', bgClass: 'from-sky-600 to-sky-400' },
  { name: 'زمردي راقي', primary: '#059669', secondary: '#10B981', bgClass: 'from-emerald-600 to-emerald-500' },
  { name: 'كحلي كلاسيكي فخم', primary: '#1E3A8A', secondary: '#3B82F6', bgClass: 'from-blue-900 to-blue-700' },
  { name: 'وردي ياقوتي داكن', primary: '#BE185D', secondary: '#E11D48', bgClass: 'from-pink-700 to-rose-600' },
  { name: 'فحمي عصري راقي', primary: '#334155', secondary: '#64748B', bgClass: 'from-slate-700 to-slate-500' }
];

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80';
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function AdminPanel({
  products = [],
  onAddProduct = () => {},
  onUpdateProduct = () => {},
  onDeleteProduct = () => {},
  categories = [],
  onAddCategory = () => {},
  onUpdateCategory = () => {},
  onDeleteCategory = () => {},
  orders = [],
  onUpdateOrderStatus = () => {},
  onLogout = () => {},
  onReturnToStore = () => {},
  storeSettings = {},
  onUpdateSettings = () => {},
  users = [],
  onAddUser = () => {},
  onUpdateUser = () => {},
  onDeleteUser = () => {},
  onUpdateUserPermissions = () => {},
  currentUser = null
}) {
  // Navigation Tabs: 'products' | 'categories' | 'orders' | 'users' | 'branding' | 'discounts' | 'contact'
  const [activeTab, setActiveTab] = useState('products');
  
  // Feedback toast state with timer cleanup
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef(null);

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Safe defaults for settings
  const [settingsForm, setSettingsForm] = useState({
    storeName: storeSettings?.storeName || 'الملاك الصغير',
    storeSubtitle: storeSettings?.storeSubtitle || 'Little Angel Store',
    storeDescription: storeSettings?.storeDescription || 'المتجر الفاخر لأطقم استقبال المواليد الملكية، التفصيل حسب الطلب وتطريز اسم المولود مجاناً مع أسرع توصيل لجميع المدن.',
    logoUrl: storeSettings?.logoUrl || '/logo.png',
    primaryColor: storeSettings?.primaryColor || '#DF7E93',
    secondaryColor: storeSettings?.secondaryColor || '#E88E9F',
    announcementText: storeSettings?.announcementText || 'شحن مجاني للطلبات الأكثر من 299 ر.س | استخدمي كود FIRST10 لخصم 10%',
    couponCode: storeSettings?.couponCode || 'FIRST10',
    couponDiscountPercent: storeSettings?.couponDiscountPercent ?? 10,
    freeShippingThreshold: storeSettings?.freeShippingThreshold ?? 299,
    standardShippingFee: storeSettings?.standardShippingFee ?? 25,
    whatsappNumber: storeSettings?.whatsappNumber || '967775302137',
    displayPhoneNumber: storeSettings?.displayPhoneNumber || '+967 775 302 137',
    instagramUrl: storeSettings?.instagramUrl || 'https://instagram.com',
    tiktokUrl: storeSettings?.tiktokUrl || 'https://tiktok.com',
    snapchatUrl: storeSettings?.snapchatUrl || 'https://snapchat.com'
  });

  useEffect(() => {
    if (storeSettings && Object.keys(storeSettings).length > 0) {
      setSettingsForm(prev => ({
        ...prev,
        ...storeSettings
      }));
    }
  }, [storeSettings]);

  const handleSaveSettings = (e) => {
    if (e) e.preventDefault();
    if (typeof onUpdateSettings === 'function') {
      const sanitizedSettings = {
        ...settingsForm,
        storeName: sanitizeString(settingsForm.storeName, 100),
        storeSubtitle: sanitizeString(settingsForm.storeSubtitle, 100),
        storeDescription: sanitizeString(settingsForm.storeDescription, 500),
        logoUrl: sanitizeUrl(settingsForm.logoUrl, '/logo.png'),
        announcementText: sanitizeString(settingsForm.announcementText, 200),
        couponCode: sanitizeString(settingsForm.couponCode, 30).toUpperCase(),
        couponDiscountPercent: sanitizeNumber(settingsForm.couponDiscountPercent, { min: 1, max: 90, fallback: 10 }),
        freeShippingThreshold: sanitizeNumber(settingsForm.freeShippingThreshold, { min: 0, fallback: 299 }),
        standardShippingFee: sanitizeNumber(settingsForm.standardShippingFee, { min: 0, fallback: 25 }),
        whatsappNumber: sanitizeString(settingsForm.whatsappNumber, 20).replace(/[^0-9]/g, ''),
        displayPhoneNumber: sanitizeString(settingsForm.displayPhoneNumber, 30),
        instagramUrl: sanitizeUrl(settingsForm.instagramUrl, ''),
        tiktokUrl: sanitizeUrl(settingsForm.tiktokUrl, ''),
        snapchatUrl: sanitizeUrl(settingsForm.snapchatUrl, '')
      };
      onUpdateSettings(sanitizedSettings);
      showToast('تم حفظ إعدادات المتجر بنجاح وتطبيقها فوراً!');
    }
  };

  // Safe collections
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeUsers = Array.isArray(users) ? users : [];

  // Active Operator Permissions (for enforcement)
  const currentOperatorPerms = getEffectivePermissions(currentUser || { role: 'admin' });

  // Users Filter & Modals State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [editingUserForEdit, setEditingUserForEdit] = useState(null);
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);

  const filteredUsers = safeUsers.filter(u => {
    if (!u) return false;
    const cleanSearch = userSearch.trim().toLowerCase();
    const nameMatch = u.name && u.name.toLowerCase().includes(cleanSearch);
    const emailMatch = u.email && u.email.toLowerCase().includes(cleanSearch);
    const phoneMatch = u.phone && u.phone.includes(cleanSearch);
    const cityMatch = u.city && u.city.toLowerCase().includes(cleanSearch);
    const matchesSearch = !cleanSearch || nameMatch || emailMatch || phoneMatch || cityMatch;
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Product Filter & Search
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState('all');

  const filteredProducts = safeProducts.filter(prod => {
    if (!prod) return false;
    const cleanSearch = productSearch.trim().toLowerCase();
    const nameMatch = prod.name && prod.name.toLowerCase().includes(cleanSearch);
    const tagMatch = prod.tags && prod.tags.some(t => typeof t === 'string' && t.toLowerCase().includes(cleanSearch));
    const matchesSearch = !cleanSearch || nameMatch || tagMatch;
    const matchesCategory = productCategoryFilter === 'all' || prod.category === productCategoryFilter;
    const matchesStock = productStockFilter === 'all' || 
      (productStockFilter === 'inStock' ? prod.inStock !== false : prod.inStock === false);
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Orders Filter & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const filteredOrders = safeOrders.filter(ord => {
    if (!ord) return false;
    const cleanSearch = orderSearch.trim().toLowerCase();
    const idMatch = ord.id && ord.id.toLowerCase().includes(cleanSearch);
    const nameMatch = ord.customer?.name && ord.customer.name.toLowerCase().includes(cleanSearch);
    const phoneMatch = ord.customer?.phone && ord.customer.phone.includes(cleanSearch);
    const matchesSearch = !cleanSearch || idMatch || nameMatch || phoneMatch;
    const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormError, setProductFormError] = useState('');
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    hasDiscount: false,
    hasCustomName: true,
    availableSizes: ['0-3 أشهر', '3-6 أشهر', '6-12 شهر'],
    availableColors: ['وردي هادئ', 'أزرق سماوي', 'أبيض قطني', 'بيج كريمي'],
    images: [],
    video: '',
    primaryMediaType: 'image',
    primaryImageIndex: 0,
    description: '',
    tags: ['#الملاك_الصغير', '#جديد'],
    inStock: true
  });

  const [tagInput, setTagInput] = useState('');
  const [urlImageInput, setUrlImageInput] = useState('');
  const fileInputRef = useRef(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryStoryName, setCategoryStoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [categorySubtitle, setCategorySubtitle] = useState('');
  const [categoryFormError, setCategoryFormError] = useState('');

  // Selected Order details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Safe Confirmation Modal (Replaces browser confirm)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const totalSales = safeOrders.reduce((sum, order) => sum + (Number(order?.total) || 0), 0);
  const pendingOrdersCount = safeOrders.filter(o => o && (o.status === 'قيد التجهيز' || o.status === 'قيد المراجعة')).length;

  // Handlers for products
  const handleOpenAddProduct = () => {
    if (!currentOperatorPerms.canAddProduct) {
      showToast('عذراً: ليس لديك صلاحية لإضافة منتجات جديدة. تواصل مع المدير العام.');
      return;
    }
    setEditingProduct(null);
    setProductFormError('');
    setProductForm({
      name: '',
      category: safeCategories.filter(c => c.id !== 'all')[0]?.id || 'baby-clothes',
      price: '125',
      originalPrice: '',
      hasDiscount: false,
      hasCustomName: true,
      availableSizes: ['0-3 أشهر', '3-6 أشهر', '6-12 شهر'],
      availableColors: ['وردي هادئ', 'أزرق سماوي', 'أبيض قطني', 'بيج كريمي'],
      images: [],
      video: '',
      primaryMediaType: 'image',
      primaryImageIndex: 0,
      description: '',
      tags: ['#الملاك_الصغير', '#جديد'],
      inStock: true
    });
    setTagInput('');
    setUrlImageInput('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    if (!prod) return;
    setEditingProduct(prod);
    setProductFormError('');
    const existingImages = Array.isArray(prod.images) && prod.images.length > 0 
      ? prod.images.map(img => sanitizeUrl(img, DEFAULT_IMAGE)) 
      : [sanitizeUrl(prod.image, DEFAULT_IMAGE)].filter(Boolean);

    const existingTags = Array.isArray(prod.tags) && prod.tags.length > 0 
      ? prod.tags 
      : (prod.tag ? [prod.tag.startsWith('#') ? prod.tag : `#${prod.tag}`] : ['#الملاك_الصغير']);
    const hasDisc = Boolean(prod.originalPrice && Number(prod.originalPrice) > Number(prod.price));

    setProductForm({
      name: prod.name || '',
      category: prod.category || 'baby-clothes',
      price: prod.price ?? '',
      originalPrice: prod.originalPrice ?? '',
      hasDiscount: hasDisc,
      hasCustomName: prod.hasCustomName !== false,
      availableSizes: Array.isArray(prod.availableSizes) && prod.availableSizes.length > 0 
        ? prod.availableSizes 
        : ['0-3 أشهر', '3-6 أشهر', '6-12 شهر'],
      availableColors: Array.isArray(prod.availableColors) && prod.availableColors.length > 0 
        ? prod.availableColors 
        : ['وردي هادئ', 'أزرق سماوي', 'أبيض قطني', 'بيج كريمي'],
      images: existingImages,
      video: sanitizeUrl(prod.video, ''),
      primaryMediaType: prod.primaryMediaType || 'image',
      primaryImageIndex: prod.primaryImageIndex ?? 0,
      description: prod.description || '',
      tags: existingTags,
      inStock: prod.inStock !== false
    });
    setTagInput('');
    setUrlImageInput('');
    setIsProductModalOpen(true);
  };

  const handleMultipleFilesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showToast('تنبيه: يمكن رفع ملفات الصور فقط!');
        return;
      }
      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        showToast('حجم الصورة كبير جداً! الحد الأقصى 5 ميجابايت لكل صورة.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string' && result.startsWith('data:image/')) {
          setProductForm(prev => ({
            ...prev,
            images: [...prev.images, result]
          }));
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    const safeUrl = sanitizeUrl(urlImageInput.trim(), '');
    if (!safeUrl) {
      showToast('يرجى إدخال رابط صورة صحيح وآمن (HTTP/HTTPS)!');
      return;
    }
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, safeUrl]
    }));
    setUrlImageInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    let clean = sanitizeString(tagInput, 30);
    if (!clean) return;
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (!productForm.tags.includes(clean)) {
      setProductForm(prev => ({
        ...prev,
        tags: [...prev.tags, clean]
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setProductForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  const handleProductSubmit = (e) => {
    e.preventDefault();
    setProductFormError('');

    const cleanName = sanitizeString(productForm.name, 120);
    const cleanPrice = sanitizeNumber(productForm.price, { min: 1, fallback: 0 });

    if (!cleanName) {
      setProductFormError('يرجى إدخال اسم المنتج.');
      return;
    }

    if (cleanPrice <= 0) {
      setProductFormError('يرجى إدخال سعر صحيح أكبر من الصفر.');
      return;
    }

    const finalImages = productForm.images.length > 0 ? productForm.images : [DEFAULT_IMAGE];
    const chosenPrimaryIndex = Math.min(productForm.primaryImageIndex || 0, Math.max(0, finalImages.length - 1));
    const primaryImg = finalImages[chosenPrimaryIndex] || finalImages[0];

    const cleanOriginalPrice = productForm.hasDiscount && productForm.originalPrice
      ? sanitizeNumber(productForm.originalPrice, { min: cleanPrice + 1, fallback: null })
      : null;

    const productPayload = {
      id: editingProduct ? editingProduct.id : Date.now(),
      name: cleanName,
      category: sanitizeString(productForm.category, 50) || 'baby-clothes',
      price: cleanPrice,
      originalPrice: cleanOriginalPrice,
      rating: editingProduct ? (editingProduct.rating || 5.0) : 5.0,
      reviewsCount: editingProduct ? (editingProduct.reviewsCount || 1) : 1,
      image: primaryImg,
      images: finalImages,
      video: sanitizeUrl(productForm.video, null),
      primaryMediaType: productForm.primaryMediaType || 'image',
      primaryImageIndex: chosenPrimaryIndex,
      description: sanitizeString(productForm.description, 800),
      tags: productForm.tags.map(t => sanitizeString(t, 30)),
      tag: productForm.tags[0] ? sanitizeString(productForm.tags[0].replace('#', ''), 20) : 'مميز',
      inStock: Boolean(productForm.inStock),
      hasCustomName: Boolean(productForm.hasCustomName),
      availableSizes: productForm.availableSizes,
      availableColors: productForm.availableColors
    };

    if (editingProduct) {
      if (typeof onUpdateProduct === 'function') onUpdateProduct(productPayload);
      showToast(`تم تعديل منتج "${productPayload.name}" بنجاح!`);
    } else {
      if (typeof onAddProduct === 'function') onAddProduct(productPayload);
      showToast(`تم إضافة منتج "${productPayload.name}" بنجاح!`);
    }

    setIsProductModalOpen(false);
  };

  // Category Submit
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    setCategoryFormError('');

    const cleanCatName = sanitizeString(categoryName, 80);
    const cleanStoryName = sanitizeString(categoryStoryName, 40) || cleanCatName;
    const cleanSubtitle = sanitizeString(categorySubtitle, 200);
    const cleanCatImage = sanitizeUrl(categoryImage, '');

    if (!cleanCatName) {
      setCategoryFormError('يرجى إدخال اسم القسم.');
      return;
    }

    if (editingCategory) {
      if (typeof onUpdateCategory === 'function') {
        onUpdateCategory({
          ...editingCategory,
          name: cleanCatName,
          storyName: cleanStoryName,
          image: cleanCatImage,
          subtitle: cleanSubtitle
        });
      }
      showToast(`تم تحديث قسم "${cleanCatName}" بنجاح!`);
    } else {
      const newId = 'cat-' + Date.now();
      if (typeof onAddCategory === 'function') {
        onAddCategory({
          id: newId,
          name: cleanCatName,
          storyName: cleanStoryName,
          image: cleanCatImage,
          subtitle: cleanSubtitle
        });
      }
      showToast(`تم إنشاء قسم جديد "${cleanCatName}" بنجاح!`);
    }
    setCategoryName('');
    setCategoryStoryName('');
    setCategoryImage('');
    setCategorySubtitle('');
    setIsCategoryModalOpen(false);
  };

  // WhatsApp launcher for orders with secure URI encoding
  const openOrderWhatsApp = (ord) => {
    if (!ord || !ord.customer?.phone) {
      showToast('رقم هاتف العميل غير متوفر في الطلب!');
      return;
    }
    const phone = ord.customer.phone;
    const itemsText = (Array.isArray(ord.items) ? ord.items : [])
      .map(it => `• ${it.name} (كمية: ${it.quantity}${it.customBabyName ? `، تطريز: "${it.customBabyName}"` : ''}${it.selectedSize ? `، مقاس: ${it.selectedSize}` : ''})`)
      .join('\n');

    const message = `مرحباً ${ord.customer?.name || 'عميلنا العزيز'}، معك متجر ${settingsForm.storeName}.\n\nبخصوص طلبك رقم (${ord.id}) بقيمة ${ord.total} ر.س:\n${itemsText}\n\nعنوان التوصيل: ${ord.customer?.city || ''} - ${ord.customer?.address || ''}\nحالة الطلب الحالية: ${ord.status || 'قيد التجهيز'}\n\nهل تود تأكيد شحن الطلب؟`;
    
    const waUrl = buildWhatsAppUrl(phone, message);
    safeOpenExternal(waUrl);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7 select-none animate-fadeIn">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Bar: Profile & Action buttons */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-extrabold text-slate-500">مركز القيادة والتحكم الشامل 100%</span>
            <span className="text-[11px] font-mono bg-pink-50 text-brand-700 px-2.5 py-0.5 rounded-md font-bold border border-pink-100">
              {settingsForm.storeName}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            لوحة إدارة المتجر - تحكم المبرمج الكامل
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            بضغطات بسيطة يمكنك تعديل الألوان، الأسماء، المنتجات، الأقسام، الشحن، والكوبونات بكل حرية وأمان.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onReturnToStore}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Store className="w-4 h-4 text-brand-600" />
            <span>معاينة المتجر المباشر</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95"
            title="تسجيل خروج"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold">إجمالي المبيعات</p>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">{totalSales} ر.س</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold">الطلبات المسجلة</p>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">{safeOrders.length} طلب</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold">المنتجات المعروضة</p>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">{safeProducts.length} منتج</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold">الأقسام النشطة</p>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">{safeCategories.filter(c => c && c.id !== 'all').length} قسم</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Tab Bar */}
      <div className="bg-white p-2 rounded-3xl border border-slate-200/80 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-[#DF7E93] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات والمخزون ({safeProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-[#DF7E93] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>الأقسام والبنرات ({safeCategories.filter(c => c && c.id !== 'all').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#DF7E93] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>الطلبات والمبيعات ({safeOrders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingOrdersCount} جديد
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'users'
                ? 'bg-[#DF7E93] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>المستخدمين والصلاحيات ({safeUsers.length})</span>
            <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              RBAC
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'branding'
                ? 'bg-[#DF7E93] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>الهوية والألوان والشعار</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discounts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'discounts'
                ? 'bg-[#DF7E93] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>الشحن والكوبونات والعروض</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'contact'
                ? 'bg-[#DF7E93] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>التواصل وخدمة العملاء</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: 📦 PRODUCTS MANAGEMENT (إدارة المنتجات الكاملة) */}
      {/* ======================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header & Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="text-lg font-black text-slate-900">كتالوج المنتجات والأسعار والوسوم</h3>
              <p className="text-xs text-slate-500">إضافة منتج جديد، تعديل الصور والأسعار والألوان، وضبط حالة التوفر.</p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddProduct}
              className="bg-[#DF7E93] hover:bg-[#D46B82] text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-200/50 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>

          {/* Search & Filtering Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث بالاسم أو الهاشتاغ..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs font-bold outline-none focus:border-brand-500 shadow-2xs"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div>
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-500 shadow-2xs text-slate-700"
              >
                <option value="all">جميع الأقسام ({safeProducts.length})</option>
                {safeCategories.filter(c => c && c.id !== 'all').map(cat => (
                  <option key={cat.id} value={cat.id}>قسم: {cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={productStockFilter}
                onChange={(e) => setProductStockFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-500 shadow-2xs text-slate-700"
              >
                <option value="all">حالة المخزون (الكل)</option>
                <option value="inStock">متوفر فقط</option>
                <option value="outOfStock">غير متوفر / نفد</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">الصورة</th>
                    <th className="p-4">اسم المنتج</th>
                    <th className="p-4">القسم</th>
                    <th className="p-4">السعر</th>
                    <th className="p-4">الخيارات</th>
                    <th className="p-4">المخزون</th>
                    <th className="p-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="relative inline-block">
                          <img
                            src={sanitizeUrl(prod.image || (prod.images && prod.images[0]), DEFAULT_IMAGE)}
                            alt={prod.name || 'منتج'}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                          />
                          {Array.isArray(prod.images) && prod.images.length > 1 && (
                            <span className="absolute -bottom-1 -left-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white">
                              +{prod.images.length - 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 text-sm max-w-xs">{prod.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(prod.tags) && prod.tags.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="bg-pink-50 text-[#DF7E93] font-bold px-1.5 py-0.2 rounded text-[10px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-brand-600">
                        {safeCategories.find(c => c && c.id === prod.category)?.name || prod.category}
                      </td>
                      <td className="p-4">
                        <span className="font-black text-slate-900 text-sm">{prod.price} ر.س</span>
                        {prod.originalPrice && (
                          <span className="block text-[11px] text-slate-400 line-through">
                            {prod.originalPrice} ر.س
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                          prod.hasCustomName ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {prod.hasCustomName ? 'تطريز اسم' : 'بدون تطريز'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (!currentOperatorPerms.canToggleStock) {
                              showToast('عذراً: ليس لديك صلاحية لتعديل حالة توفر المخزون!');
                              return;
                            }
                            const updated = { ...prod, inStock: !prod.inStock };
                            if (typeof onUpdateProduct === 'function') onUpdateProduct(updated);
                            showToast(`تم تغيير حالة مخزون "${prod.name}"`);
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            prod.inStock !== false 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {prod.inStock !== false ? 'متوفر ✓' : 'غير متوفر ✕'}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (!currentOperatorPerms.canEditProduct) {
                                showToast('عذراً: ليس لديك صلاحية لتعديل بيانات المنتجات!');
                                return;
                              }
                              handleOpenEditProduct(prod);
                            }}
                            className="p-2 text-slate-600 hover:text-brand-600 rounded-xl hover:bg-pink-50 transition-colors"
                            title="تعديل المنتج"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!currentOperatorPerms.canDeleteProduct) {
                                showToast('عذراً: ليس لديك صلاحية لحذف المنتجات من المتجر!');
                                return;
                              }
                              setConfirmDialog({
                                isOpen: true,
                                title: 'تأكيد حذف المنتج',
                                message: `هل أنت متأكد من رغبتك في حذف منتج "${prod.name}" نهائياً من المتجر؟`,
                                onConfirm: () => {
                                  if (typeof onDeleteProduct === 'function') onDeleteProduct(prod.id);
                                  showToast(`تم حذف منتج "${prod.name}" بنجاح`);
                                }
                              });
                            }}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: 🗂️ CATEGORIES & BANNERS (الأقسام والبنرات) */}
      {/* ======================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h3 className="text-lg font-black text-slate-900">أقسام وتصنيفات المتجر وبنراتها</h3>
              <p className="text-xs text-slate-500">إضافة وحذف الأقسام، تحديد صور البنرات العريضة، وضبط نصوص الستوري والوصف.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setCategoryName('');
                setCategoryStoryName('');
                setCategoryImage('');
                setCategorySubtitle('');
                setCategoryFormError('');
                setIsCategoryModalOpen(true);
              }}
              className="bg-[#DF7E93] hover:bg-[#D46B82] text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-200/50 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeCategories.filter(c => c && c.id !== 'all').map((cat) => {
              const productCount = safeProducts.filter(p => p && p.category === cat.id).length;
              return (
                <div key={cat.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  {/* Category Banner Preview */}
                  <div className="relative h-28 sm:h-32 bg-slate-100 overflow-hidden">
                    {cat.image ? (
                      <img src={sanitizeUrl(cat.image, DEFAULT_IMAGE)} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Folder className="w-8 h-8 text-brand-300" />
                      </div>
                    )}
                    <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                      {productCount} منتجات
                    </span>
                  </div>

                  {/* Category Info */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">{cat.name}</h4>
                      {cat.subtitle && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{cat.subtitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold text-[#DF7E93] bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
                          نص الستوري: {cat.storyName || cat.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryName(cat.name || '');
                          setCategoryStoryName(cat.storyName || cat.name || '');
                          setCategoryImage(cat.image || '');
                          setCategorySubtitle(cat.subtitle || '');
                          setCategoryFormError('');
                          setIsCategoryModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-brand-600 text-xs font-bold transition-all border border-slate-200/70"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: 'تأكيد حذف القسم',
                            message: `هل أنت متأكد من حذف قسم "${cat.name}"؟ سيتم حذف التصنيف من القائمة.`,
                            onConfirm: () => {
                              if (typeof onDeleteCategory === 'function') onDeleteCategory(cat.id);
                              showToast(`تم حذف قسم "${cat.name}"`);
                            }
                          });
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        title="حذف القسم"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: 🛍️ ORDERS & SALES (الطلبات والمبيعات وتواصل واتساب) */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header & Filter */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">سجل الطلبات الواردة والمبيعات</h3>
                <p className="text-xs text-slate-500">إدارة الطلبات، تحديث حالات الشحن، ومراسلة الزبائن مباشرة عبر واتساب بضغطة زر.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث برقم الطلب، اسم العميل، أو رقم هاتفه..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs font-bold outline-none focus:border-brand-500"
                />
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-500 text-slate-700"
                >
                  <option value="all">كافة حالات الطلب ({safeOrders.length})</option>
                  <option value="قيد التجهيز">قيد التجهيز</option>
                  <option value="قيد المراجعة">قيد المراجعة</option>
                  <option value="تم الشحن">تم الشحن</option>
                  <option value="تم التوصيل">تم التوصيل</option>
                  <option value="ملغي">ملغي</option>
                </select>
              </div>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 text-slate-400 text-xs space-y-2">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700 text-base">لا توجد طلبات مطابقة للبحث</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4">رقم الطلب</th>
                      <th className="p-4">العميل</th>
                      <th className="p-4">المدينة والعنوان</th>
                      <th className="p-4">المبلغ والدفع</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4 text-center">مراسلة واتساب</th>
                      <th className="p-4 text-center">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 font-mono font-bold text-brand-600">
                          {ord.id}
                          <span className="block text-[10px] text-slate-400 font-normal">{ord.date}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900 text-sm">{ord.customer?.name}</p>
                          <p className="font-mono text-slate-500 text-[11px]" dir="ltr">{ord.customer?.phone}</p>
                        </td>
                        <td className="p-4 text-slate-600 max-w-xs">
                          <p className="font-bold text-slate-800">{ord.customer?.city}</p>
                          <p className="text-[11px] text-slate-500 truncate">{ord.customer?.address}</p>
                        </td>
                        <td className="p-4">
                          <span className="font-black text-slate-900 text-sm">{ord.total} ر.س</span>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase">
                            {ord.customer?.paymentMethod || 'الدفع عند الاستلام'}
                          </span>
                        </td>
                        <td className="p-4">
                          <select
                            value={ord.status || 'قيد التجهيز'}
                            onChange={(e) => {
                              if (typeof onUpdateOrderStatus === 'function') onUpdateOrderStatus(ord.id, e.target.value);
                              showToast(`تم تحديث حالة الطلب (${ord.id}) إلى "${e.target.value}"`);
                            }}
                            className={`rounded-xl p-1.5 text-xs font-bold outline-none border ${
                              ord.status === 'تم التوصيل' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              ord.status === 'تم الشحن' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                              ord.status === 'ملغي' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            <option value="قيد التجهيز">قيد التجهيز</option>
                            <option value="قيد المراجعة">قيد المراجعة</option>
                            <option value="تم الشحن">تم الشحن</option>
                            <option value="تم التوصيل">تم التوصيل</option>
                            <option value="ملغي">ملغي</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => openOrderWhatsApp(ord)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1.5 mx-auto transition-all shadow-2xs hover:scale-105 active:scale-95"
                            title="إرسال رسالة واتساب للعميل"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>واتساب</span>
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="p-2 text-slate-500 hover:text-brand-600 rounded-xl hover:bg-pink-50 transition-colors"
                            title="عرض أصناف وتطريزات الطلب"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: 🎨 BRANDING & THEME COLORS (الهوية والألوان والشعار) */}
      {/* ======================================================== */}
      {activeTab === 'branding' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-fadeIn">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">هوية المتجر والألوان والشعار الرسمي</h3>
              <p className="text-xs text-slate-500">تحكم كامل بالاسم، اللوجو، ودرجات الألوان الملكية بضغطة زر واحدة.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">اسم المتجر بالعربية *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={settingsForm.storeName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">اسم المتجر بالإنجليزية *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={settingsForm.storeSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storeSubtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1.5">وصف المتجر ونبذة من نحن (تظهر في الفوتر) *</label>
              <textarea
                rows={3}
                required
                maxLength={500}
                value={settingsForm.storeDescription}
                onChange={(e) => setSettingsForm({ ...settingsForm, storeDescription: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium outline-none focus:border-brand-500 focus:bg-white leading-relaxed"
              />
            </div>

            {/* Logo Settings & Upload */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <label className="block font-bold text-slate-800 text-xs">شعار المتجر الرسمي (Logo)</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-2 shrink-0">
                  <img src={sanitizeUrl(settingsForm.logoUrl, '/logo.png')} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 w-full space-y-2">
                  <input
                    type="text"
                    placeholder="رابط صورة الشعار..."
                    value={settingsForm.logoUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-brand-500"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة الشعار من الجهاز</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            if (file.size > MAX_UPLOAD_SIZE_BYTES) {
                              showToast('حجم الشعار كبير! يرجى اختيار ملف أقل من 5 ميجابايت.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setSettingsForm(prev => ({ ...prev, logoUrl: reader.result }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Colors Palette */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-brand-600" />
                    <span>لون الثيم والهوية الملكية للمتجر</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">اختر قالباً لونياً بضغطة زر أو حدد أي لون مخصص يعجبك.</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: settingsForm.primaryColor }}></span>
                  <span className="font-mono text-xs font-black text-slate-800" dir="ltr">{settingsForm.primaryColor}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {COLOR_PALETTES.map((palette, idx) => {
                  const isSelected = settingsForm.primaryColor.toLowerCase() === palette.primary.toLowerCase();
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSettingsForm({
                        ...settingsForm,
                        primaryColor: palette.primary,
                        secondaryColor: palette.secondary
                      })}
                      className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                        isSelected 
                          ? 'border-slate-900 bg-white shadow-sm ring-2 ring-slate-900/10' 
                          : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-100/50'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-xl bg-gradient-to-tr ${palette.bgClass} shadow-2xs shrink-0`}></span>
                      <div className="truncate">
                        <span className="block text-xs font-bold text-slate-800 truncate">{palette.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">أو اختيار درجة لون مخصصة (Custom HEX):</label>
                <input
                  type="color"
                  value={settingsForm.primaryColor}
                  onChange={(e) => setSettingsForm({ ...settingsForm, primaryColor: e.target.value, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1.5">شريط الإعلانات أعلى المتجر (Announcement Bar)</label>
              <input
                type="text"
                maxLength={200}
                value={settingsForm.announcementText}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-[#DF7E93] hover:bg-[#D46B82] text-white font-bold px-7 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-pink-200/50 transition-all hover:scale-105 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>حفظ تعديلات الهوية والألوان</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 5: 🏷️ DISCOUNTS & SHIPPING (الشحن والكوبونات والعروض) */}
      {/* ======================================================== */}
      {activeTab === 'discounts' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-fadeIn">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">إعدادات الشحن والكوبونات الترويجية</h3>
              <p className="text-xs text-slate-500">تحديد كود الخصم الفعال، نسبة الخصم، والحد الأدنى للشحن المجاني.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-brand-600" />
                  <span>كود الخصم النشط للمتجر</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  placeholder="مثال: FIRST10"
                  value={settingsForm.couponCode}
                  onChange={(e) => setSettingsForm({ ...settingsForm, couponCode: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black font-mono tracking-wider text-slate-800 outline-none focus:border-brand-500"
                />
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Percent className="w-4 h-4 text-brand-600" />
                  <span>نسبة الخصم المئوية (%)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={settingsForm.couponDiscountPercent}
                    onChange={(e) => setSettingsForm({ ...settingsForm, couponDiscountPercent: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-800 outline-none focus:border-brand-500"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>الحد الأدنى للشحن المجاني (ر.س)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={settingsForm.freeShippingThreshold}
                    onChange={(e) => setSettingsForm({ ...settingsForm, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-800 outline-none focus:border-brand-500"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">ر.س</span>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-slate-600" />
                  <span>تكلفة الشحن العادي (ر.س)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    required
                    value={settingsForm.standardShippingFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, standardShippingFee: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black text-slate-800 outline-none focus:border-brand-500"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">ر.س</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-[#DF7E93] hover:bg-[#D46B82] text-white font-bold px-7 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-pink-200/50 transition-all hover:scale-105 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>حفظ إعدادات الشحن والكوبونات</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 6: 📞 CONTACT & SOCIAL LINKS (التواصل وخدمة العملاء) */}
      {/* ======================================================== */}
      {activeTab === 'contact' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 animate-fadeIn">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">بيانات التواصل الرسمية وخدمة العملاء</h3>
              <p className="text-xs text-slate-500">رقم الواتساب المباشر لزر الطلبات والاستفسارات، وحسابات التواصل الاجتماعي.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>رقم الواتساب الرسمي (لاستقبال الاستفسارات والطلبات) *</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  placeholder="مثال: 967775302137"
                  value={settingsForm.whatsappNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono font-bold outline-none focus:border-brand-500 focus:bg-white text-left"
                  dir="ltr"
                />
                <p className="text-[10px] text-slate-400 mt-1">يُكتب بصيغة دولية بدون أصفار أو رمز + (مثال: 967775302137 أو 966500000000)</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-700" />
                  <span>رقم الهاتف المعروض في الفوتر *</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={30}
                  value={settingsForm.displayPhoneNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, displayPhoneNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">رابط إنستغرام (Instagram)</label>
                <input
                  type="url"
                  maxLength={200}
                  value={settingsForm.instagramUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">رابط تيك توك (TikTok)</label>
                <input
                  type="url"
                  maxLength={200}
                  value={settingsForm.tiktokUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">رابط سناب شات (Snapchat)</label>
                <input
                  type="url"
                  maxLength={200}
                  value={settingsForm.snapchatUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, snapchatUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-[#DF7E93] hover:bg-[#D46B82] text-white font-bold px-7 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-pink-200/50 transition-all hover:scale-105 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>حفظ بيانات التواصل</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* TAB 7: 👥 USERS & FINE-GRAINED RBAC (إدارة المستخدمين والصلاحيات) */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Add User Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                <span className="text-xs font-black text-purple-700">نظام الصلاحيات المتقدم (RBAC)</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                إدارة المستخدمين وفريق العمل والصلاحيات الدقيقة
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                يمكنك هنا رؤية جميع المستخدمين المسجلين، منح صلاحيات الأقسام، التحكم في حذف وإضافة وتعديل المنتجات، تعديل الأسعار، توفر المخزون، وتطريز اسم المولود.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingUserForEdit(null);
                setIsUserEditModalOpen(true);
              }}
              className="bg-[#DF7E93] hover:bg-[#D46B82] text-white font-bold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-200/50 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة مستخدم / موظف جديد</span>
            </button>
          </div>

          {/* Quick Metrics Bar for Users */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400">إجمالي الحسابات</p>
                <h4 className="text-lg font-black text-slate-900 mt-0.5">{safeUsers.length} مستخدم</h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400">المدراء والمشرفين</p>
                <h4 className="text-lg font-black text-slate-900 mt-0.5">
                  {safeUsers.filter(u => u.role === 'admin' || u.role === 'supervisor').length} مشرف
                </h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#DF7E93] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400">مسؤولو المنتجات والأقسام</p>
                <h4 className="text-lg font-black text-slate-900 mt-0.5">
                  {safeUsers.filter(u => u.role === 'editor' || u.role === 'order_specialist').length} موظف
                </h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400">العملاء المسجلين</p>
                <h4 className="text-lg font-black text-slate-900 mt-0.5">
                  {safeUsers.filter(u => u.role === 'customer').length} عميل
                </h4>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <input
                type="text"
                placeholder="ابحث بالاسم، البريد الإلكتروني، رقم الجوال أو المدينة..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs font-bold outline-none focus:border-brand-500 shadow-2xs"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-500 shadow-2xs text-slate-700"
              >
                <option value="all">جميع الأدوار ({safeUsers.length})</option>
                <option value="admin">المدير العام فقط (Admin)</option>
                <option value="supervisor">المشرفون (Supervisor)</option>
                <option value="editor">مديرو المنتجات والمخزون</option>
                <option value="order_specialist">مسؤولو الطلبات والشحن</option>
                <option value="customer">العملاء العاديون</option>
              </select>
            </div>
          </div>

          {/* Users List Cards */}
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-2">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">لم يتم العثور على أي مستخدمين مطابقين للبحث</h4>
                <p className="text-xs text-slate-400">جرب البحث بكلمات أخرى أو اختر دوراً مختلفاً</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const perms = getEffectivePermissions(user);
                const roleData = ROLE_PRESETS[user.role] || ROLE_PRESETS.customer;
                const isAdmin = user.role === 'admin';
                const isSuper = user.role === 'supervisor';
                const isCust = user.role === 'customer';

                return (
                  <div 
                    key={user.id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    {/* User Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 shadow-xs ${
                          isAdmin 
                            ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                            : isSuper 
                              ? 'bg-pink-100 text-[#DF7E93] border border-pink-200' 
                              : isCust 
                                ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                                : 'bg-sky-100 text-sky-700 border border-sky-200'
                        }`}>
                          {user.name ? user.name.charAt(0) : 'م'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-black text-slate-900">{user.name}</h4>
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                              isAdmin
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : isSuper
                                  ? 'bg-pink-50 text-brand-700 border-pink-200'
                                  : isCust
                                    ? 'bg-slate-50 text-slate-600 border-slate-200'
                                    : 'bg-sky-50 text-sky-700 border-sky-200'
                            }`}>
                              {roleData.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-100">
                              {user.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span dir="ltr">{user.phone || 'بدون جوال'}</span>
                            </span>
                            {user.email && (
                              <span className="flex items-center gap-1 font-mono">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{user.email}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{user.city || 'الرياض'}</span>
                            </span>
                            {user.createdAt && (
                              <span className="text-[11px] text-slate-400">
                                مسجل في: {user.createdAt}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUserForPermissions(user);
                            setIsPermissionsModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 bg-[#DF7E93] hover:bg-[#d46b82] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                          title="تعديل وتعيين الصلاحيات الدقيقة"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>تعديل الصلاحيات 🛡️</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingUserForEdit(user);
                            setIsUserEditModalOpen(true);
                          }}
                          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          title="تعديل بيانات الحساب"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {!isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                title: `تأكيد حذف حساب (${user.name})`,
                                message: `هل أنت متأكد من حذف حساب المستخدم نهائياً؟ لن يتمكن من تسجيل الدخول بعد الآن.`,
                                onConfirm: () => onDeleteUser(user.id)
                              });
                            }}
                            className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                            title="حذف الحساب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Permissions Badges Row */}
                    <div className="bg-slate-50/80 p-3 sm:p-4 rounded-2xl border border-slate-200/60 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-[#DF7E93]" />
                          <span>الصلاحيات الممنوحة حالياً لهذا الحساب:</span>
                        </div>
                        
                        {/* Categories Mode Badge */}
                        <div className="text-[11px]">
                          {perms.categoriesMode === 'all' ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg font-bold">
                              أقسام المتجر: جميع الأقسام مصرح بها (كامل الكتالوج)
                            </span>
                          ) : perms.categoriesMode === 'custom' ? (
                            <span className="bg-pink-100 text-brand-800 px-2.5 py-0.5 rounded-lg font-bold">
                              أقسام المتجر: ({Array.isArray(perms.allowedCategories) ? perms.allowedCategories.length : 0} قسم مخصص)
                            </span>
                          ) : (
                            <span className="bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-lg font-bold">
                              أقسام المتجر: لا توجد صلاحيات إدارة (عميل)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Display Allowed Categories if custom */}
                      {perms.categoriesMode === 'custom' && Array.isArray(perms.allowedCategories) && perms.allowedCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {perms.allowedCategories.map(catId => {
                            const catObj = safeCategories.find(c => c.id === catId);
                            return (
                              <span key={catId} className="bg-white border border-pink-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                                📁 {catObj?.name || catId}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Product & General Action Permissions Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          perms.canAddProduct 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                        }`}>
                          <Plus className="w-2.5 h-2.5" /> إضافة منتجات
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          perms.canEditProduct 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                        }`}>
                          <Edit3 className="w-2.5 h-2.5" /> تعديل منتجات
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          perms.canDeleteProduct 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                        }`}>
                          <Trash2 className="w-2.5 h-2.5" /> حذف منتجات
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          perms.canEditPrice 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                        }`}>
                          <DollarSign className="w-2.5 h-2.5" /> تعديل الأسعار
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          perms.canToggleStock 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                        }`}>
                          <Package className="w-2.5 h-2.5" /> توفر الصنف بالمخزون
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          perms.canToggleCustomName 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                        }`}>
                          <Sparkles className="w-2.5 h-2.5" /> تطريز وتعديل اسم المولود
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          perms.canManageOrders 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60'
                        }`}>
                          <ShoppingBag className="w-2.5 h-2.5" /> إدارة ومتابعة الطلبات
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT PRODUCT MODAL */}
      {/* ======================================================== */}
      {isProductModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
        >
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingProduct ? `تعديل المنتج: ${editingProduct.name}` : 'إضافة منتج جديد'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">أدخل تفاصيل المنتج وارفع عدة صور وحدد الهاشتاغات.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {productFormError && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center gap-2 text-rose-700 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{productFormError}</span>
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  placeholder="مثال: طقم بيجاما مواليد قطن عضوي ناعم"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-500 focus:bg-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">القسم / التصنيف *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-500 focus:bg-white text-xs font-bold"
                >
                  {safeCategories
                    .filter(c => c && c.id !== 'all')
                    .filter(c => currentOperatorPerms.categoriesMode === 'all' || (Array.isArray(currentOperatorPerms.allowedCategories) && currentOperatorPerms.allowedCategories.includes(c.id)))
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                {currentOperatorPerms.categoriesMode === 'custom' && (
                  <p className="text-[10px] text-pink-600 font-bold mt-1">
                    ملاحظة: تظهر فقط الأقسام المصرح لك بإدارتها ({Array.isArray(currentOperatorPerms.allowedCategories) ? currentOperatorPerms.allowedCategories.length : 0} قسم).
                  </p>
                )}
              </div>

              {/* Prices & Discount Controls */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                    <DollarSign className="w-4 h-4 text-brand-600" />
                    <span>تحديد السعر والخصم</span>
                  </label>

                  {currentOperatorPerms.canEditPrice ? (
                    <button
                      type="button"
                      onClick={() => setProductForm(prev => {
                        const nextDiscount = !prev.hasDiscount;
                        return {
                          ...prev,
                          hasDiscount: nextDiscount,
                          originalPrice: nextDiscount && !prev.originalPrice
                            ? Math.round(Number(prev.price || 100) * 1.3)
                            : prev.originalPrice
                        };
                      })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        productForm.hasDiscount
                          ? 'bg-rose-500 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>{productForm.hasDiscount ? 'إطفاء الخصم (سعر واحد)' : 'تشغيل الخصم (سعرين)'}</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-200 px-2 py-0.5 rounded-md">
                      تعديل السعر مقفل للصلاحيات
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      {productForm.hasDiscount ? 'سعر البيع النهائي بعد الخصم (ر.س) *' : 'سعر المنتج (ر.س) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      disabled={!currentOperatorPerms.canEditPrice}
                      placeholder="مثال: 125"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className={`w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-500 text-xs font-bold ${
                        !currentOperatorPerms.canEditPrice ? 'bg-slate-100 cursor-not-allowed opacity-75' : ''
                      }`}
                    />
                    {!currentOperatorPerms.canEditPrice && (
                      <span className="text-[10px] text-rose-500 font-bold block mt-1">ليس لديك صلاحية لتعديل السعر</span>
                    )}
                  </div>

                  {productForm.hasDiscount && (
                    <div className="animate-fadeIn">
                      <label className="block font-bold text-rose-600 mb-1">السعر الأصلي المشطوب قبل الخصم (ر.س)</label>
                      <input
                        type="number"
                        min="1"
                        disabled={!currentOperatorPerms.canEditPrice}
                        placeholder="مثال: 180"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                        className={`w-full bg-white border border-rose-200 rounded-xl p-2.5 outline-none focus:border-rose-400 text-xs font-bold text-rose-700 ${
                          !currentOperatorPerms.canEditPrice ? 'bg-slate-100 cursor-not-allowed opacity-75' : ''
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Image Gallery & Uploader */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-brand-600" />
                    <span>معرض صور المنتج ({productForm.images.length})</span>
                  </label>
                  <span className="text-[10px] text-slate-400">يمكنك رفع عدة صور أو إضافتها بروابط</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="ضع رابط صورة (URL) واضغط إضافة..."
                    value={urlImageInput}
                    onChange={(e) => setUrlImageInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-brand-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-2 rounded-xl text-xs shrink-0"
                  >
                    إضافة رابط
                  </button>
                  <label className="cursor-pointer bg-[#DF7E93] hover:bg-[#D46B82] text-white font-bold px-3 py-2 rounded-xl text-xs shrink-0 flex items-center gap-1 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع من الجهاز</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleMultipleFilesUpload}
                    />
                  </label>
                </div>

                {productForm.images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                    {productForm.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <img src={sanitizeUrl(img, DEFAULT_IMAGE)} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] text-center font-bold py-0.5">
                            الرئيسية
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-purple-600" />
                  <span>رابط فيديو المنتج (اختياري - MP4 أو رابط مباشر)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://.../video.mp4"
                  value={productForm.video}
                  onChange={(e) => setProductForm({ ...productForm, video: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-500 text-xs font-mono"
                />
              </div>

              {/* Tags Section */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-brand-600" />
                  <span>الوسوم والهاشتاغات للمنتج</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="أضف هاشتاغ جديد (مثال: #جديد)..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl p-2 text-xs outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-2 rounded-xl text-xs shrink-0"
                  >
                    إضافة وسم
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {productForm.tags.map((tg, idx) => (
                    <span key={idx} className="bg-pink-100 text-[#DF7E93] text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1">
                      <span>{tg}</span>
                      <button type="button" onClick={() => handleRemoveTag(tg)} className="hover:text-rose-700">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Embroidery & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className={`flex items-start gap-2.5 p-3 rounded-xl border select-none ${
                  !currentOperatorPerms.canToggleCustomName 
                    ? 'bg-slate-100 opacity-60 cursor-not-allowed border-slate-200' 
                    : 'bg-slate-50 border-slate-200 cursor-pointer hover:bg-slate-100/70'
                }`}>
                  <input
                    type="checkbox"
                    disabled={!currentOperatorPerms.canToggleCustomName}
                    checked={productForm.hasCustomName}
                    onChange={(e) => setProductForm({ ...productForm, hasCustomName: e.target.checked })}
                    className="w-4 h-4 accent-brand-600 rounded mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">تطريز وتعديل اسم المولود متاح</span>
                    {!currentOperatorPerms.canToggleCustomName ? (
                      <span className="text-[10px] text-rose-500 font-bold block mt-0.5">ليس لديك صلاحية لتعديل خيار التطريز</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 block mt-0.5">يتيح للعميل كتابة اسم المولود واختيار لون الخيط</span>
                    )}
                  </div>
                </label>

                <label className={`flex items-start gap-2.5 p-3 rounded-xl border select-none ${
                  !currentOperatorPerms.canToggleStock 
                    ? 'bg-slate-100 opacity-60 cursor-not-allowed border-slate-200' 
                    : 'bg-slate-50 border-slate-200 cursor-pointer hover:bg-slate-100/70'
                }`}>
                  <input
                    type="checkbox"
                    disabled={!currentOperatorPerms.canToggleStock}
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded mt-0.5"
                  />
                  <div>
                    <span className="font-bold text-slate-800 text-xs block">
                      {productForm.inStock ? 'المنتج متوفر بالمخزون حالياً ✓' : 'المنتج غير متوفر (نفدت الكمية) ✕'}
                    </span>
                    {!currentOperatorPerms.canToggleStock ? (
                      <span className="text-[10px] text-rose-500 font-bold block mt-0.5">ليس لديك صلاحية لتعديل توفر المخزون</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 block mt-0.5">التحكم في ظهور زر الشراء أو شارة نفدت الكمية</span>
                    )}
                  </div>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف المنتج ومميزاته</label>
                <textarea
                  rows={3}
                  maxLength={800}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-500 text-xs font-medium"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#DF7E93] hover:bg-[#D46B82] text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD / EDIT CATEGORY MODAL */}
      {/* ======================================================== */}
      {isCategoryModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
        >
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 my-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingCategory ? `تعديل قسم: ${editingCategory.name}` : 'إضافة قسم جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {categoryFormError && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center gap-2 text-rose-700 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{categoryFormError}</span>
              </div>
            )}

            <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم القسم المعروض *</label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  placeholder="مثال: أطقم الاستقبال الملكية"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-500 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الستوري المختصر (للدائرة أعلى الموقع) *</label>
                <input
                  type="text"
                  required
                  maxLength={40}
                  placeholder="مثال: استقبال"
                  value={categoryStoryName}
                  onChange={(e) => setCategoryStoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-500 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف القسم (يظهر أسفل عنوان القسم)</label>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="مثال: أطقم استقبال للمستشفى والزيارات من أقمشة تركية فاخرة"
                  value={categorySubtitle}
                  onChange={(e) => setCategorySubtitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-500 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">صورة بنر القسم (رابط URL أو رفع)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://.../banner.jpg"
                    value={categoryImage}
                    onChange={(e) => setCategoryImage(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-mono outline-none focus:border-brand-500"
                  />
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>رفع</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > MAX_UPLOAD_SIZE_BYTES) {
                            showToast('حجم بنر القسم كبير جداً! الحد الأقصى 5 ميجابايت.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              setCategoryImage(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#DF7E93] hover:bg-[#D46B82] text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {editingCategory ? 'حفظ التعديلات' : 'إضافة القسم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ORDER DETAILS MODAL */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
        >
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">تفاصيل الطلب: {selectedOrder.id}</h3>
                <p className="text-xs text-slate-400 mt-0.5">تاريخ الطلب: {selectedOrder.date || 'اليوم'}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <p><strong className="text-slate-900">العميل:</strong> {selectedOrder.customer?.name || 'غير معروف'}</p>
              <p><strong className="text-slate-900">الهاتف:</strong> <span dir="ltr">{selectedOrder.customer?.phone || 'غير مسجل'}</span></p>
              <p><strong className="text-slate-900">العنوان:</strong> {selectedOrder.customer?.city || ''} - {selectedOrder.customer?.address || ''}</p>
              <p><strong className="text-slate-900">طريقة الدفع:</strong> {selectedOrder.customer?.paymentMethod || 'الدفع عند الاستلام'}</p>
            </div>

            {/* Order Items List */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs">الأصناف والتطريز المطلوب ({selectedOrder.items?.length || 0}):</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
                    <img 
                      src={sanitizeUrl(item.image, DEFAULT_IMAGE)} 
                      alt={item.name || 'منتج'} 
                      className="w-12 h-12 rounded-xl object-cover shrink-0" 
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1 text-[11px] text-slate-600">
                        {item.selectedSize && <span className="bg-slate-100 px-1.5 py-0.2 rounded font-bold">المقاس: {item.selectedSize}</span>}
                        {item.selectedColor && <span className="bg-slate-100 px-1.5 py-0.2 rounded font-bold">اللون: {item.selectedColor}</span>}
                        {item.customBabyName && (
                          <span className="bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded font-black">
                            تطريز اسم: "{item.customBabyName}"
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <span className="font-bold text-slate-900 text-xs">{item.price} ر.س</span>
                      <span className="block text-[10px] text-slate-400">الكمية: {item.quantity || 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي:</span>
                <span>{selectedOrder.subtotal || selectedOrder.total || 0} ر.س</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>الخصم:</span>
                  <span>-{selectedOrder.discountAmount} ر.س</span>
                </div>
              )}
              <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-100">
                <span>الإجمالي النهائي:</span>
                <span>{selectedOrder.total || 0} ر.س</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => openOrderWhatsApp(selectedOrder)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>مراسلة العميل بالواتساب</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: IN-APP CONFIRMATION DIALOG (Non-blocking) */}
      {/* ======================================================== */}
      {confirmDialog.isOpen && (
        <div 
          role="alertdialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
        >
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">{confirmDialog.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof confirmDialog.onConfirm === 'function') {
                    confirmDialog.onConfirm();
                  }
                  setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: USER PERMISSIONS MODAL (RBAC) */}
      {/* ======================================================== */}
      <UserPermissionsModal
        isOpen={isPermissionsModalOpen}
        user={selectedUserForPermissions}
        categories={safeCategories}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedUserForPermissions(null);
        }}
        onSave={(userId, newPerms, newRole) => {
          onUpdateUserPermissions(userId, newPerms, newRole);
          showToast('تم حفظ وتحديث صلاحيات المستخدم بنجاح وتطبيقها فوراً!');
        }}
      />

      {/* ======================================================== */}
      {/* MODAL 6: ADD / EDIT USER MODAL */}
      {/* ======================================================== */}
      <UserEditModal
        isOpen={isUserEditModalOpen}
        user={editingUserForEdit}
        onClose={() => {
          setIsUserEditModalOpen(false);
          setEditingUserForEdit(null);
        }}
        onSave={(userData) => {
          if (editingUserForEdit && editingUserForEdit.id) {
            onUpdateUser(editingUserForEdit.id, userData);
            showToast(`تم تحديث بيانات المستخدم (${userData.name}) بنجاح!`);
          } else {
            onAddUser(userData);
            showToast(`تمت إضافة المستخدم الجديد (${userData.name}) بنجاح!`);
          }
        }}
      />

    </div>
  );
}
