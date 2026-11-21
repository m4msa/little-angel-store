import React, { useState, useRef } from 'react';
import { 
  Package, ShoppingBag, Plus, Trash2, Edit3, Upload, Image as ImageIcon, 
  DollarSign, FolderPlus, Folder, Layers, Check, Clock, Truck, 
  X, LogOut, Store, Eye, Hash, Percent, Scissors, 
  Palette, Ruler, Sparkles, Video, Play, MessageCircle, Phone, 
  Tag, ShieldCheck, Search, Filter, CheckCircle2, Sliders, Globe, Send
} from 'lucide-react';

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
  { name: 'وردي هادئ', bg: 'bg-pink-300' },
  { name: 'أزرق سماوي', bg: 'bg-sky-300' },
  { name: 'أبيض قطني', bg: 'bg-slate-100' },
  { name: 'بيج كريمي', bg: 'bg-amber-100' },
  { name: 'رمادي ناعم', bg: 'bg-slate-300' },
  { name: 'أخضر نعناعي', bg: 'bg-emerald-200' },
  { name: 'كحلي فاخر', bg: 'bg-blue-900' },
  { name: 'بني كراميل', bg: 'bg-amber-700' }
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

export default function AdminPanel({
  products = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  categories = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  orders = [],
  onUpdateOrderStatus,
  onLogout,
  onReturnToStore,
  storeSettings = {},
  onUpdateSettings
}) {
  // Navigation Tabs: 'products' | 'categories' | 'orders' | 'branding' | 'discounts' | 'contact'
  const [activeTab, setActiveTab] = useState('products');
  
  // Feedback toast state
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Local Settings Form State (Initialized from storeSettings)
  const [settingsForm, setSettingsForm] = useState({
    storeName: storeSettings.storeName || 'الملاك الصغير',
    storeSubtitle: storeSettings.storeSubtitle || 'Little Angel Store',
    storeDescription: storeSettings.storeDescription || 'المتجر الفاخر لأطقم استقبال المواليد الملكية، التفصيل حسب الطلب وتطريز اسم المولود مجاناً مع أسرع توصيل لجميع المدن.',
    logoUrl: storeSettings.logoUrl || '/logo.png',
    primaryColor: storeSettings.primaryColor || '#DF7E93',
    secondaryColor: storeSettings.secondaryColor || '#E88E9F',
    announcementText: storeSettings.announcementText || 'شحن مجاني للطلبات الأكثر من 299 ر.س | استخدمي كود FIRST10 لخصم 10%',
    couponCode: storeSettings.couponCode || 'FIRST10',
    couponDiscountPercent: storeSettings.couponDiscountPercent ?? 10,
    freeShippingThreshold: storeSettings.freeShippingThreshold ?? 299,
    standardShippingFee: storeSettings.standardShippingFee ?? 25,
    whatsappNumber: storeSettings.whatsappNumber || '967775302137',
    displayPhoneNumber: storeSettings.displayPhoneNumber || '+967 775 302 137',
    instagramUrl: storeSettings.instagramUrl || 'https://instagram.com',
    tiktokUrl: storeSettings.tiktokUrl || 'https://tiktok.com',
    snapchatUrl: storeSettings.snapchatUrl || 'https://snapchat.com'
  });

  React.useEffect(() => {
    if (storeSettings && Object.keys(storeSettings).length > 0) {
      setSettingsForm(prev => ({
        ...prev,
        ...storeSettings
      }));
    }
  }, [storeSettings]);

  const handleSaveSettings = (e) => {
    if (e) e.preventDefault();
    if (onUpdateSettings) {
      onUpdateSettings(settingsForm);
      showToast('تم حفظ إعدادات المتجر بنجاح وتطبيقها فوراً!');
    }
  };

  // Product Filter & Search
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState('all');

  const filteredProducts = products.filter(prod => {
    const matchesSearch = !productSearch.trim() || 
      prod.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (prod.tags && prod.tags.some(t => t.toLowerCase().includes(productSearch.toLowerCase())));
    const matchesCategory = productCategoryFilter === 'all' || prod.category === productCategoryFilter;
    const matchesStock = productStockFilter === 'all' || 
      (productStockFilter === 'inStock' ? prod.inStock !== false : prod.inStock === false);
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Orders Filter & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const filteredOrders = orders.filter(ord => {
    const matchesSearch = !orderSearch.trim() || 
      ord.id?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer?.phone?.includes(orderSearch);
    const matchesStatus = orderStatusFilter === 'all' || ord.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
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
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [customColorInput, setCustomColorInput] = useState('');
  const fileInputRef = useRef(null);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryStoryName, setCategoryStoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState('');
  const [categorySubtitle, setCategorySubtitle] = useState('');

  // Selected Order details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'قيد التجهيز' || o.status === 'قيد المراجعة').length;

  // Handlers for products
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categories.filter(c => c.id !== 'all')[0]?.id || 'baby-clothes',
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
    setCustomSizeInput('');
    setCustomColorInput('');
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    const existingImages = prod.images && prod.images.length > 0 ? prod.images : [prod.image].filter(Boolean);
    const existingTags = prod.tags && prod.tags.length > 0 
      ? prod.tags 
      : (prod.tag ? [prod.tag.startsWith('#') ? prod.tag : `#${prod.tag}`] : ['#الملاك_الصغير']);
    const hasDisc = Boolean(prod.originalPrice && Number(prod.originalPrice) > Number(prod.price));

    setProductForm({
      name: prod.name,
      category: prod.category,
      price: prod.price ?? '',
      originalPrice: prod.originalPrice ?? '',
      hasDiscount: hasDisc,
      hasCustomName: prod.hasCustomName !== false,
      availableSizes: prod.availableSizes && prod.availableSizes.length > 0 ? prod.availableSizes : ['0-3 أشهر', '3-6 أشهر', '6-12 شهر'],
      availableColors: prod.availableColors && prod.availableColors.length > 0 ? prod.availableColors : ['وردي هادئ', 'أزرق سماوي', 'أبيض قطني', 'بيج كريمي'],
      images: existingImages,
      video: prod.video || '',
      primaryMediaType: prod.primaryMediaType || 'image',
      primaryImageIndex: prod.primaryImageIndex ?? 0,
      description: prod.description || '',
      tags: existingTags,
      inStock: prod.inStock !== false
    });
    setTagInput('');
    setUrlImageInput('');
    setCustomSizeInput('');
    setCustomColorInput('');
    setIsProductModalOpen(true);
  };

  const handleMultipleFilesUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!urlImageInput.trim()) return;
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, urlImageInput.trim()]
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
    let clean = tagInput.trim();
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
    if (!productForm.name || !productForm.price) return;

    const defaultImage = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80';
    const finalImages = productForm.images.length > 0 ? productForm.images : [defaultImage];
    const chosenPrimaryIndex = Math.min(productForm.primaryImageIndex || 0, Math.max(0, finalImages.length - 1));
    const primaryImg = finalImages[chosenPrimaryIndex] || finalImages[0];

    const productPayload = {
      id: editingProduct ? editingProduct.id : Date.now(),
      name: productForm.name,
      category: productForm.category,
      price: Number(productForm.price),
      originalPrice: productForm.hasDiscount && productForm.originalPrice ? Number(productForm.originalPrice) : null,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 1,
      image: primaryImg,
      images: finalImages,
      video: productForm.video ? productForm.video.trim() : null,
      primaryMediaType: productForm.primaryMediaType || 'image',
      primaryImageIndex: chosenPrimaryIndex,
      description: productForm.description,
      tags: productForm.tags,
      tag: productForm.tags[0] ? productForm.tags[0].replace('#', '') : 'مميز',
      inStock: productForm.inStock,
      hasCustomName: productForm.hasCustomName,
      availableSizes: productForm.availableSizes,
      availableColors: productForm.availableColors
    };

    if (editingProduct) {
      onUpdateProduct(productPayload);
      showToast(`تم تعديل منتج "${productPayload.name}" بنجاح!`);
    } else {
      onAddProduct(productPayload);
      showToast(`تم إضافة منتج "${productPayload.name}" بنجاح!`);
    }

    setIsProductModalOpen(false);
  };

  // Category Submit
  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editingCategory) {
      onUpdateCategory({
        ...editingCategory,
        name: categoryName.trim(),
        storyName: categoryStoryName.trim() || categoryName.trim(),
        image: categoryImage.trim(),
        subtitle: categorySubtitle.trim()
      });
      showToast(`تم تحديث قسم "${categoryName.trim()}" بنجاح!`);
    } else {
      const newId = 'cat-' + Date.now();
      onAddCategory({
        id: newId,
        name: categoryName.trim(),
        storyName: categoryStoryName.trim() || categoryName.trim(),
        image: categoryImage.trim(),
        subtitle: categorySubtitle.trim()
      });
      showToast(`تم إنشاء قسم جديد "${categoryName.trim()}" بنجاح!`);
    }
    setCategoryName('');
    setCategoryStoryName('');
    setCategoryImage('');
    setCategorySubtitle('');
    setIsCategoryModalOpen(false);
  };

  // WhatsApp quick launcher for orders
  const openOrderWhatsApp = (ord) => {
    if (!ord || !ord.customer?.phone) return;
    let phone = ord.customer.phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) phone = '966' + phone.substring(1);
    if (!phone.startsWith('966') && !phone.startsWith('967') && phone.length === 9) {
      phone = '966' + phone;
    }
    const itemsText = (ord.items || []).map(it => 
      `• ${it.name} (كمية: ${it.quantity}${it.customBabyName ? `، تطريز: "${it.customBabyName}"` : ''}${it.selectedSize ? `، مقاس: ${it.selectedSize}` : ''})`
    ).join('%0A');

    const msg = `مرحباً ${ord.customer.name}، معك متجر ${settingsForm.storeName}.%0A%0Aبخصوص طلبك رقم (${ord.id}) بقيمة ${ord.total} ر.س:%0A${itemsText}%0A%0Aعنوان التوصيل: ${ord.customer.city} - ${ord.customer.address}%0Aحالة الطلب الحالية: ${ord.status}%0A%0Aهل تود تأكيد شحن الطلب؟`;
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
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
            بضغطات بسيطة يمكنك تعديل الألوان، الأسماء، المنتجات، الأقسام، الشحن، والكوبونات بكل حرية.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onReturnToStore}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs active:scale-95"
          >
            <Store className="w-4 h-4 text-brand-600" />
            <span>معاينة المتجر المباشر</span>
          </button>

          <button
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
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">{orders.length} طلب</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold">المنتجات المعروضة</p>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">{products.length} منتج</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold">الأقسام النشطة</p>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">{categories.filter(c => c.id !== 'all').length} قسم</h3>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Tab Bar (Segmented 6 Master Tabs) */}
      <div className="bg-white p-2 rounded-3xl border border-slate-200/80 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'products'
                ? 'bg-[#DF7E93] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات والمخزون ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'categories'
                ? 'bg-[#DF7E93] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>الأقسام والبنرات ({categories.filter(c => c.id !== 'all').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#DF7E93] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>الطلبات والمبيعات ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingOrdersCount} جديد
              </span>
            )}
          </button>

          <button
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
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            <div>
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-500 shadow-2xs text-slate-700"
              >
                <option value="all">جميع الأقسام ({products.length})</option>
                {categories.filter(c => c.id !== 'all').map(cat => (
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
                            src={prod.image || (prod.images && prod.images[0])}
                            alt={prod.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                          />
                          {prod.images && prod.images.length > 1 && (
                            <span className="absolute -bottom-1 -left-1 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white">
                              +{prod.images.length - 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 text-sm max-w-xs">{prod.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {prod.tags && prod.tags.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="bg-pink-50 text-[#DF7E93] font-bold px-1.5 py-0.2 rounded text-[10px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-brand-600">
                        {categories.find(c => c.id === prod.category)?.name || prod.category}
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
                            const updated = { ...prod, inStock: !prod.inStock };
                            onUpdateProduct(updated);
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
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-2 text-slate-600 hover:text-brand-600 rounded-xl hover:bg-pink-50 transition-colors"
                            title="تعديل المنتج"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف منتج "${prod.name}"؟`)) {
                                onDeleteProduct(prod.id);
                                showToast(`تم حذف منتج "${prod.name}"`);
                              }
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
              onClick={() => {
                setEditingCategory(null);
                setCategoryName('');
                setCategoryStoryName('');
                setCategoryImage('');
                setCategorySubtitle('');
                setIsCategoryModalOpen(true);
              }}
              className="bg-[#DF7E93] hover:bg-[#D46B82] text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-pink-200/50 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.filter(c => c.id !== 'all').map((cat) => {
              const productCount = products.filter(p => p.category === cat.id).length;
              return (
                <div key={cat.id} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                  {/* Category Banner Preview */}
                  <div className="relative h-28 sm:h-32 bg-slate-100 overflow-hidden">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
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
                        onClick={() => {
                          setEditingCategory(cat);
                          setCategoryName(cat.name);
                          setCategoryStoryName(cat.storyName || cat.name);
                          setCategoryImage(cat.image || '');
                          setCategorySubtitle(cat.subtitle || '');
                          setIsCategoryModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-700 hover:text-brand-600 text-xs font-bold transition-all border border-slate-200/70"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من حذف قسم "${cat.name}"؟`)) {
                            onDeleteCategory(cat.id);
                            showToast(`تم حذف قسم "${cat.name}"`);
                          }
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
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>

              <div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold outline-none focus:border-brand-500 text-slate-700"
                >
                  <option value="all">كافة حالات الطلب ({orders.length})</option>
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
                            value={ord.status}
                            onChange={(e) => {
                              onUpdateOrderStatus(ord.id, e.target.value);
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
              {/* Store Name Arabic */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">اسم المتجر بالعربية *</label>
                <input
                  type="text"
                  required
                  value={settingsForm.storeName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              {/* Store Name English */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">اسم المتجر بالإنجليزية *</label>
                <input
                  type="text"
                  required
                  value={settingsForm.storeSubtitle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storeSubtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Store Description in Footer */}
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1.5">وصف المتجر ونبذة من نحن (تظهر في الفوتر) *</label>
              <textarea
                rows={3}
                required
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
                  <img src={settingsForm.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
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
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSettingsForm(prev => ({ ...prev, logoUrl: reader.result }));
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
                {/* Live color badge */}
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: settingsForm.primaryColor }}></span>
                  <span className="font-mono text-xs font-black text-slate-800" dir="ltr">{settingsForm.primaryColor}</span>
                </div>
              </div>

              {/* Presets Grid */}
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

              {/* Custom Color Input */}
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

            {/* Announcement Bar */}
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1.5">شريط الإعلانات أعلى المتجر (Announcement Bar)</label>
              <input
                type="text"
                value={settingsForm.announcementText}
                onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* Save Button */}
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
              {/* Coupon Code */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-brand-600" />
                  <span>كود الخصم النشط للمتجر</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: FIRST10"
                  value={settingsForm.couponCode}
                  onChange={(e) => setSettingsForm({ ...settingsForm, couponCode: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-black font-mono tracking-wider text-slate-800 outline-none focus:border-brand-500"
                />
              </div>

              {/* Discount Percentage */}
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
              {/* Free Shipping Threshold */}
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

              {/* Standard Shipping Fee */}
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

            {/* Save Button */}
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
              {/* WhatsApp Number */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>رقم الواتساب الرسمي (لاستقبال الاستفسارات والطلبات) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 967775302137"
                  value={settingsForm.whatsappNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value.replace(/[^0-9]/g, '') })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono font-bold outline-none focus:border-brand-500 focus:bg-white text-left"
                  dir="ltr"
                />
                <p className="text-[10px] text-slate-400 mt-1">يُكتب بصيغة دولية بدون أصفار أو رمز + (مثال: 967775302137 أو 966500000000)</p>
              </div>

              {/* Display Phone Number */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-700" />
                  <span>رقم الهاتف المعروض في الفوتر *</span>
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.displayPhoneNumber}
                  onChange={(e) => setSettingsForm({ ...settingsForm, displayPhoneNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Instagram URL */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">رابط إنستغرام (Instagram)</label>
                <input
                  type="url"
                  value={settingsForm.instagramUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white text-left"
                  dir="ltr"
                />
              </div>

              {/* TikTok URL */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">رابط تيك توك (TikTok)</label>
                <input
                  type="url"
                  value={settingsForm.tiktokUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white text-left"
                  dir="ltr"
                />
              </div>

              {/* Snapchat URL */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1.5">رابط سناب شات (Snapchat)</label>
                <input
                  type="url"
                  value={settingsForm.snapchatUrl}
                  onChange={(e) => setSettingsForm({ ...settingsForm, snapchatUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold outline-none focus:border-brand-500 focus:bg-white text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Save Button */}
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
      {/* MODAL 1: ADD / EDIT PRODUCT MODAL */}
      {/* ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  {editingProduct ? `تعديل المنتج: ${editingProduct.name}` : 'إضافة منتج جديد'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">أدخل تفاصيل المنتج وارفع عدة صور وحدد الهاشتاغات.</p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              
              {/* Product Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: طقم بيجاما مواليد قطن عضوي ناعم"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-500 focus:bg-white text-xs font-bold"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">القسم / التصنيف *</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-500 focus:bg-white text-xs font-bold"
                >
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Prices & Discount Controls */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                    <DollarSign className="w-4 h-4 text-brand-600" />
                    <span>تحديد السعر والخصم</span>
                  </label>

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
                      placeholder="مثال: 125"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-500 text-xs font-bold"
                    />
                  </div>

                  {productForm.hasDiscount && (
                    <div className="animate-fadeIn">
                      <label className="block font-bold text-rose-600 mb-1">السعر الأصلي المشطوب قبل الخصم (ر.س)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="مثال: 180"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                        className="w-full bg-white border border-rose-200 rounded-xl p-2.5 outline-none focus:border-rose-400 text-xs font-bold text-rose-700"
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

                {/* Thumbnails list */}
                {productForm.images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                    {productForm.images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
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

              {/* Custom Embroidery & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.hasCustomName}
                    onChange={(e) => setProductForm({ ...productForm, hasCustomName: e.target.checked })}
                    className="w-4 h-4 accent-brand-600 rounded"
                  />
                  <span className="font-bold text-slate-800 text-xs">تطريز اسم المولود متاح ومجاني</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.inStock}
                    onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span className="font-bold text-slate-800 text-xs">المنتج متوفر بالمخزون حالياً</span>
                </label>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف المنتج ومميزاته</label>
                <textarea
                  rows={3}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 my-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingCategory ? `تعديل قسم: ${editingCategory.name}` : 'إضافة قسم جديد'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم القسم المعروض *</label>
                <input
                  type="text"
                  required
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
                          const reader = new FileReader();
                          reader.onloadend = () => setCategoryImage(reader.result);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 my-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">تفاصيل الطلب: {selectedOrder.id}</h3>
                <p className="text-xs text-slate-400 mt-0.5">تاريخ الطلب: {selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <p><strong className="text-slate-900">العميل:</strong> {selectedOrder.customer?.name}</p>
              <p><strong className="text-slate-900">الهاتف:</strong> <span dir="ltr">{selectedOrder.customer?.phone}</span></p>
              <p><strong className="text-slate-900">العنوان:</strong> {selectedOrder.customer?.city} - {selectedOrder.customer?.address}</p>
              <p><strong className="text-slate-900">طريقة الدفع:</strong> {selectedOrder.customer?.paymentMethod}</p>
            </div>

            {/* Order Items List */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs">الأصناف والتطريز المطلوب ({selectedOrder.items?.length || 0}):</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
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
                      <span className="block text-[10px] text-slate-400">الكمية: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>المجموع الفرعي:</span>
                <span>{selectedOrder.subtotal || selectedOrder.total} ر.س</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>الخصم:</span>
                  <span>-{selectedOrder.discountAmount} ر.س</span>
                </div>
              )}
              <div className="flex justify-between font-black text-slate-900 text-sm pt-1 border-t border-slate-100">
                <span>الإجمالي النهائي:</span>
                <span>{selectedOrder.total} ر.س</span>
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

    </div>
  );
}
