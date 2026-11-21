import React, { useState, useRef } from 'react';
import { 
  Package, ShoppingBag, Plus, Trash2, Edit3, Upload, Image, 
  DollarSign, FolderPlus, Folder, Layers, Check, Clock, Truck, 
  X, LogOut, Store, Eye, Hash, Percent, Scissors, 
  Palette, Ruler, Sparkles, Video, Play
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

export default function AdminPanel({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  orders,
  onUpdateOrderStatus,
  onLogout,
  onReturnToStore
}) {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories' | 'orders'
  
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
    images: [], // Multiple images array
    video: '', // Product demonstration video URL
    primaryMediaType: 'image', // 'image' | 'video'
    primaryImageIndex: 0, // Which image is primary if image is chosen
    description: '',
    tags: [], // Multiple hashtags array
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

  // Selected Order details
  const [selectedOrder, setSelectedOrder] = useState(null);

  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  // Open Add Product Modal
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

  // Open Edit Product Modal
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
      inStock: prod.inStock ?? true
    });
    setTagInput('');
    setUrlImageInput('');
    setCustomSizeInput('');
    setCustomColorInput('');
    setIsProductModalOpen(true);
  };

  // Handle multiple file upload from computer / phone
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

  // Add image by URL
  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!urlImageInput.trim()) return;
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, urlImageInput.trim()]
    }));
    setUrlImageInput('');
  };

  // Remove an image from gallery
  const handleRemoveImage = (indexToRemove) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Set primary image (move to index 0)
  const handleSetPrimaryImage = (index) => {
    setProductForm(prev => {
      const selected = prev.images[index];
      const rest = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: [selected, ...rest]
      };
    });
  };

  // Add a hashtag
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

  // Remove a hashtag
  const handleRemoveTag = (tagToRemove) => {
    setProductForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  // Submit product
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
    } else {
      onAddProduct(productPayload);
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
        storyName: editingCategory.storyName || categoryName.trim(),
        image: categoryImage.trim(),
        subtitle: categorySubtitle.trim()
      });
    } else {
      const newId = 'cat-' + Date.now();
      onAddCategory({
        id: newId,
        name: categoryName.trim(),
        storyName: categoryName.trim(),
        image: categoryImage.trim(),
        subtitle: categorySubtitle.trim()
      });
    }
    setCategoryName('');
    setCategoryStoryName('');
    setCategoryImage('');
    setCategorySubtitle('');
    setIsCategoryModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-500">لوحة تحكم المتجر الاحترافية</span>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold" dir="ltr">
              msaawadi2016@gmail.com
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            إدارة المنتجات والأصناف والوسوم
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onReturnToStore}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <Store className="w-4 h-4 text-brand-600" />
            <span>عرض واجهة المتجر</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all"
            title="تسجيل خروج"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold">إجمالي المبيعات</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalSales} ر.س</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold">عدد الطلبات</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{orders.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-bold">المنتجات والتصنيفات</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{products.length} منتج / {categories.length - 1} قسم</h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-brand-600" />
          <span>المنتجات والصور والوسوم ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'categories' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderPlus className="w-4 h-4 text-pink-600" />
          <span>إدارة الأصناف والأقسام ({categories.length - 1})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <span>الطلبات الواردة ({orders.length})</span>
        </button>
      </div>

      {/* TAB 1: PRODUCTS TABLE */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">قائمة المنتجات الكاملة</h3>
              <p className="text-xs text-slate-500">إضافة وتعديل المنتجات، رفع صور متعددة، وضبط الهاشتاغات والأسعار.</p>
            </div>
            <button
              onClick={handleOpenAddProduct}
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-pink-200 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="p-4">الصور</th>
                    <th className="p-4">اسم المنتج</th>
                    <th className="p-4">القسم</th>
                    <th className="p-4">الهاشتاغات والوسوم</th>
                    <th className="p-4">السعر</th>
                    <th className="p-4">المخزون</th>
                    <th className="p-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4">
                        <div className="relative inline-block">
                          <img
                            src={prod.image || (prod.images && prod.images[0])}
                            alt={prod.name}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                          />
                          {prod.images && prod.images.length > 1 && (
                            <span className="absolute -bottom-1 -left-1 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white">
                              +{prod.images.length - 1} صور
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 text-sm">{prod.name}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{prod.description}</p>
                      </td>
                      <td className="p-4 font-bold text-brand-600">
                        {categories.find(c => c.id === prod.category)?.name || prod.category}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {prod.tags && prod.tags.length > 0 ? (
                            prod.tags.map((t, idx) => (
                              <span key={idx} className="bg-pink-50 text-brand-700 font-bold px-2 py-0.5 rounded-md text-[10px] border border-pink-100">
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </div>
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
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {prod.inStock ? 'متوفر' : 'نفد'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-2 text-slate-500 hover:text-brand-600 rounded-xl hover:bg-brand-50 transition-colors"
                            title="تعديل المنتج"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف منتج "${prod.name}"؟`)) {
                                onDeleteProduct(prod.id);
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

      {/* TAB 2: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">إدارة أصناف وأقسام المتجر</h3>
              <p className="text-xs text-slate-500">إضافة وتعديل وحذف الأقسام وتصنيف المنتجات تحتها.</p>
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
              className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-pink-200 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة صنف جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.filter(c => c.id !== 'all').map((cat) => {
              const productCount = products.filter(p => p.category === cat.id).length;
              return (
                <div key={cat.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-100 overflow-hidden flex items-center justify-center font-black text-lg shrink-0">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <Folder className="w-6 h-6 text-brand-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                      {cat.subtitle && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">{cat.subtitle}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-400">{productCount} منتجات</span>
                        {cat.storyName && (
                          <span className="text-[10px] font-bold text-brand-600 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-100">
                            الستوري: {cat.storyName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryName(cat.name);
                        setCategoryStoryName(cat.storyName || '');
                        setCategoryImage(cat.image || '');
                        setCategorySubtitle(cat.subtitle || '');
                        setIsCategoryModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-brand-50"
                      title="تعديل اسم الصنف والستوري"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف قسم "${cat.name}"؟`)) {
                          onDeleteCategory(cat.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                      title="حذف الصنف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-lg font-black text-slate-900">الطلبات المسجلة</h3>
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 text-slate-400 text-xs space-y-2">
              <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-bold text-slate-700 text-sm">لا توجد طلبات واردة بعد</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-4">رقم الطلب</th>
                      <th className="p-4">تاريخ الطلب</th>
                      <th className="p-4">العميل</th>
                      <th className="p-4">المدينة والعنوان</th>
                      <th className="p-4">الدفع</th>
                      <th className="p-4">المبلغ</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4 text-center">الأصناف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/60">
                        <td className="p-4 font-mono font-bold text-brand-600">{ord.id}</td>
                        <td className="p-4 text-slate-500">{ord.date}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{ord.customer?.name}</p>
                          <p className="font-mono text-slate-500 text-[11px]" dir="ltr">{ord.customer?.phone}</p>
                        </td>
                        <td className="p-4 text-slate-600">
                          {ord.customer?.city} - {ord.customer?.address}
                        </td>
                        <td className="p-4 text-slate-700 uppercase font-bold text-[11px]">
                          {ord.customer?.paymentMethod}
                        </td>
                        <td className="p-4 font-black text-slate-900 text-sm">{ord.total} ر.س</td>
                        <td className="p-4">
                          <select
                            value={ord.status}
                            onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs font-bold text-slate-800 outline-none focus:border-brand-500"
                          >
                            <option value="قيد المراجعة">قيد المراجعة</option>
                            <option value="قيد التجهيز">قيد التجهيز</option>
                            <option value="تم الشحن">تم الشحن</option>
                            <option value="تم التوصيل">تم التوصيل</option>
                            <option value="ملغي">ملغي</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-2 text-slate-500 hover:text-brand-600 rounded-xl hover:bg-brand-50"
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

      {/* FULL PRODUCT MODAL: MULTI-IMAGE + HASHTAGS + EDIT */}
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

                  {/* Discount Toggle Switch */}
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

                {/* When discount is OFF: Exactly 1 box */}
                {!productForm.hasDiscount ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      سعر البيع (ر.س) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="مثال: 125"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-500 text-sm font-black text-slate-900"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        ريال سعودي
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-600 mt-1.5 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>سيظهر السعر في المتجر كما هو: {productForm.price || 0} ريال سعودي</span>
                    </p>
                  </div>
                ) : (
                  /* When discount is ON: Exactly 2 boxes */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-rose-700 mb-1 flex items-center justify-between">
                        <span>المربع 1: السعر السابق (قبل الخصم) *</span>
                        <span className="text-[10px] text-slate-400 font-normal">مشطوب</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="مثال: 180"
                          value={productForm.originalPrice}
                          onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                          className="w-full bg-white border border-rose-200 rounded-xl p-2.5 outline-none focus:border-rose-500 text-xs font-bold text-slate-700"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                          ر.س
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-emerald-700 mb-1 flex items-center justify-between">
                        <span>المربع 2: السعر الحالي (المخفض) *</span>
                        {productForm.originalPrice && productForm.price && Number(productForm.originalPrice) > Number(productForm.price) && (
                          <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-md">
                            خصم {Math.round(((Number(productForm.originalPrice) - Number(productForm.price)) / Number(productForm.originalPrice)) * 100)}%
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="مثال: 125"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          className="w-full bg-white border border-emerald-300 rounded-xl p-2.5 outline-none focus:border-emerald-500 text-xs font-black text-slate-900"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-emerald-600">
                          ر.س
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Baby Name Embroidery Feature Toggle (زر تشغيل وإطفاء تطريز الاسم) */}
              <div className={`p-4 rounded-2xl border transition-all ${
                productForm.hasCustomName 
                  ? 'bg-pink-50/80 border-pink-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                        <Scissors className="w-4 h-4 text-brand-600" />
                        <span>ميزة تطريز اسم المولود حسب الطلب (مجاناً)</span>
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        productForm.hasCustomName ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {productForm.hasCustomName ? 'مفعل ✓' : 'معطل ✕'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {productForm.hasCustomName 
                        ? 'مفعل: يظهر في بطاقة المنتج ومتجر العميل مربع إدخال اسم المولود وخيارات خيط التطريز (للملابس والمهادات والكوفيات).'
                        : 'معطل: يختفي مربع التطريز نهائياً من المتجر (مناسب للسرائر، العربات، الألعاب ومستلزمات التغذية).'}
                    </p>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setProductForm(prev => ({ ...prev, hasCustomName: !prev.hasCustomName }))}
                    className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${
                      productForm.hasCustomName ? 'bg-brand-600 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                    title="تشغيل أو إطفاء ميزة التطريز"
                  >
                    <span className="bg-white w-6 h-6 rounded-full shadow-md transform transition-transform" />
                  </button>
                </div>
              </div>

              {/* SIZES SELECTION */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                    <Ruler className="w-4 h-4 text-brand-600" />
                    <span>المقاسات المتاحة لهذا المنتج</span>
                  </label>
                  <span className="text-[11px] text-brand-600 font-bold">
                    {productForm.availableSizes.length} مقاسات مختارة
                  </span>
                </div>

                {/* Preset Size Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {PRESET_SIZES.map((sz) => {
                    const isSelected = productForm.availableSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => {
                          setProductForm(prev => ({
                            ...prev,
                            availableSizes: isSelected
                              ? prev.availableSizes.filter(s => s !== sz)
                              : [...prev.availableSizes, sz]
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isSelected ? `✓ ${sz}` : sz}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Sizes Added */}
                {productForm.availableSizes.filter(s => !PRESET_SIZES.includes(s)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {productForm.availableSizes.filter(s => !PRESET_SIZES.includes(s)).map((s, idx) => (
                      <span key={idx} className="bg-pink-100 text-brand-800 font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1">
                        <span>{s}</span>
                        <button
                          type="button"
                          onClick={() => setProductForm(prev => ({ ...prev, availableSizes: prev.availableSizes.filter(item => item !== s) }))}
                          className="hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Custom Size Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="أضف مقاساً خاصاً (مثال: من الولادة حتى 6 أشهر، أو 120×120 سم)..."
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customSizeInput.trim() && !productForm.availableSizes.includes(customSizeInput.trim())) {
                          setProductForm(prev => ({ ...prev, availableSizes: [...prev.availableSizes, customSizeInput.trim()] }));
                          setCustomSizeInput('');
                        }
                      }
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customSizeInput.trim() && !productForm.availableSizes.includes(customSizeInput.trim())) {
                        setProductForm(prev => ({ ...prev, availableSizes: [...prev.availableSizes, customSizeInput.trim()] }));
                        setCustomSizeInput('');
                      }
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                  >
                    إضافة مقاس
                  </button>
                </div>
              </div>

              {/* COLORS SELECTION */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                    <Palette className="w-4 h-4 text-brand-600" />
                    <span>الألوان المتاحة لهذا المنتج</span>
                  </label>
                  <span className="text-[11px] text-brand-600 font-bold">
                    {productForm.availableColors.length} ألوان مختارة
                  </span>
                </div>

                {/* Preset Color Swatches */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_COLORS.map((c) => {
                    const isSelected = productForm.availableColors.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setProductForm(prev => ({
                            ...prev,
                            availableColors: isSelected
                              ? prev.availableColors.filter(col => col !== c.name)
                              : [...prev.availableColors, c.name]
                          }));
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-white text-slate-900 border-brand-500 ring-2 ring-brand-200 shadow-xs'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 opacity-70'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border border-slate-300 ${c.bg}`} />
                        <span>{c.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Colors Added */}
                {productForm.availableColors.filter(c => !PRESET_COLORS.some(pc => pc.name === c)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {productForm.availableColors.filter(c => !PRESET_COLORS.some(pc => pc.name === c)).map((c, idx) => (
                      <span key={idx} className="bg-pink-100 text-brand-800 font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1">
                        <span>{c}</span>
                        <button
                          type="button"
                          onClick={() => setProductForm(prev => ({ ...prev, availableColors: prev.availableColors.filter(col => col !== c) }))}
                          className="hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Custom Color Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="أضف لوناً خاصاً (مثال: لافندر ناعم، تفاحي، موف)..."
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customColorInput.trim() && !productForm.availableColors.includes(customColorInput.trim())) {
                          setProductForm(prev => ({ ...prev, availableColors: [...prev.availableColors, customColorInput.trim()] }));
                          setCustomColorInput('');
                        }
                      }
                    }}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customColorInput.trim() && !productForm.availableColors.includes(customColorInput.trim())) {
                        setProductForm(prev => ({ ...prev, availableColors: [...prev.availableColors, customColorInput.trim()] }));
                        setCustomColorInput('');
                      }
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs"
                  >
                    إضافة لون
                  </button>
                </div>
              </div>

              {/* MULTIPLE IMAGES & VIDEO MEDIA SECTION */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                    <Image className="w-4 h-4 text-brand-600" />
                    <span>الوسائط المتعددة (الصور والفيديو التشغيلي للمنتج)</span>
                  </label>
                  <span className="text-[11px] text-brand-600 font-bold">
                    {productForm.images.length} صور {productForm.video ? '+ فيديو تشغيلي' : ''}
                  </span>
                </div>

                {/* Explanation about choosing primary media */}
                <p className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200/80">
                  <strong>تحديد العنصر الأساسي:</strong> اضغط على زر <strong>(تعيين كعنصر أساسي)</strong> على أي صورة أو الفيديو ليصبح هو العنصر الذي يظهر كغلاف في واجهة المتجر وعند فتح تفاصيل المنتج، ويشتغل الفيديو أوتوماتيكياً.
                </p>

                {/* Unified Media Cards: Video + All Images */}
                <div className="flex flex-wrap gap-3 pt-1">
                  
                  {/* Video Card (if video URL is provided) */}
                  {productForm.video && (
                    <div className={`relative w-28 h-28 rounded-2xl overflow-hidden border-2 shadow-md bg-slate-900 flex flex-col justify-between p-2 transition-all ${
                      productForm.primaryMediaType === 'video'
                        ? 'border-brand-500 ring-2 ring-brand-300 scale-105'
                        : 'border-slate-300 opacity-90'
                    }`}>
                      <div className="flex justify-between items-start z-10">
                        <span className="bg-pink-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Video className="w-2.5 h-2.5" />
                          <span>فيديو</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setProductForm(prev => ({ 
                            ...prev, 
                            video: '', 
                            primaryMediaType: prev.primaryMediaType === 'video' ? 'image' : prev.primaryMediaType 
                          }))}
                          className="p-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-700"
                          title="حذف الفيديو"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex flex-col items-center justify-center my-auto text-white">
                        <Play className="w-6 h-6 fill-white text-white opacity-80" />
                        <span className="text-[8px] font-bold mt-1 text-pink-300">فيديو تشغيلي</span>
                      </div>

                      {/* Primary Button / Badge for Video */}
                      {productForm.primaryMediaType === 'video' ? (
                        <div className="bg-brand-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg text-center shadow-xs">
                          الأساسي (يعمل تلقائياً)
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setProductForm(prev => ({ ...prev, primaryMediaType: 'video' }))}
                          className="bg-white/95 hover:bg-white text-slate-800 text-[9px] font-bold py-1 rounded-lg text-center transition-colors shadow-xs"
                        >
                          تعيين كعنصر أساسي
                        </button>
                      )}
                    </div>
                  )}

                  {/* Images Cards */}
                  {productForm.images.map((imgUrl, idx) => {
                    const isThisImagePrimary = productForm.primaryMediaType === 'image' && productForm.primaryImageIndex === idx;
                    return (
                      <div 
                        key={idx} 
                        className={`relative w-28 h-28 rounded-2xl overflow-hidden border-2 shadow-sm bg-white flex flex-col justify-between p-1.5 transition-all ${
                          isThisImagePrimary
                            ? 'border-brand-500 ring-2 ring-brand-300 scale-105'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img 
                          src={imgUrl} 
                          alt={`صورة ${idx + 1}`} 
                          className="absolute inset-0 w-full h-full object-contain p-1" 
                        />
                        
                        {/* Top bar on image card: index badge + delete button */}
                        <div className="relative flex justify-between items-center z-10">
                          <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newImgs = productForm.images.filter((_, i) => i !== idx);
                              setProductForm(prev => ({
                                ...prev,
                                images: newImgs,
                                primaryImageIndex: prev.primaryImageIndex >= newImgs.length ? Math.max(0, newImgs.length - 1) : prev.primaryImageIndex
                              }));
                            }}
                            className="p-1 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 shadow-xs"
                            title="حذف الصورة"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Bottom bar on image card: Primary Button or Primary Badge */}
                        <div className="relative z-10 mt-auto">
                          {isThisImagePrimary ? (
                            <div className="bg-brand-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg text-center shadow-xs">
                              الأساسية (الغلاف)
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setProductForm(prev => ({ 
                                ...prev, 
                                primaryMediaType: 'image', 
                                primaryImageIndex: idx 
                              }))}
                              className="w-full bg-white/95 hover:bg-white text-slate-800 text-[9px] font-bold py-1 rounded-lg text-center border border-slate-200 shadow-xs hover:border-brand-400 transition-all"
                            >
                              تعيين كصورة أساسية
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                </div>

                {/* Upload Images from device */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleFilesUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-white hover:bg-pink-50 border border-brand-300 text-brand-700 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 text-xs shadow-sm"
                  >
                    <Upload className="w-4 h-4 text-brand-600" />
                    <span>تحميل صور من هاتفك / جهازك (يمكنك اختيار عدة صور)</span>
                  </button>
                </div>

                {/* Add Image by direct URL */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    placeholder="أو أضف رابط صورة مباشر (https://...)"
                    value={urlImageInput}
                    onChange={(e) => setUrlImageInput(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-1.5 rounded-xl text-xs"
                  >
                    إضافة رابط الصورة
                  </button>
                </div>

                {/* Video URL Input & Samples */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <label className="font-bold text-slate-800 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-brand-600" />
                      <span>رابط فيديو تشغيلي للمنتج (MP4 / فيديو مباشر):</span>
                    </span>
                    <span className="text-[10px] text-brand-600 font-medium">اختياري</span>
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="ضع رابط فيديو تشغيلي مباشر (مثال: https://.../video.mp4)"
                      value={productForm.video}
                      onChange={(e) => setProductForm({ ...productForm, video: e.target.value })}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-500"
                    />
                    {productForm.video && (
                      <button
                        type="button"
                        onClick={() => setProductForm(prev => ({ 
                          ...prev, 
                          video: '', 
                          primaryMediaType: prev.primaryMediaType === 'video' ? 'image' : prev.primaryMediaType 
                        }))}
                        className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl text-xs font-bold"
                      >
                        مسح
                      </button>
                    )}
                  </div>

                  {/* Preset Sample Video Buttons for instant testing */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-slate-500 font-bold">نماذج سريعة للتجربة:</span>
                    <button
                      type="button"
                      onClick={() => setProductForm(prev => ({ 
                        ...prev, 
                        video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
                        primaryMediaType: 'video'
                      }))}
                      className="bg-white hover:bg-pink-50 border border-pink-200 text-brand-700 px-2.5 py-1 rounded-lg font-bold transition-all shadow-2xs"
                    >
                      فيديو عرض تجريبي 1 (أساسي)
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductForm(prev => ({ 
                        ...prev, 
                        video: 'https://vjs.zencdn.net/v/oceans.mp4',
                        primaryMediaType: 'video'
                      }))}
                      className="bg-white hover:bg-pink-50 border border-pink-200 text-brand-700 px-2.5 py-1 rounded-lg font-bold transition-all shadow-2xs"
                    >
                      فيديو عرض تجريبي 2 (أساسي)
                    </button>
                  </div>
                </div>

              </div>

              {/* HASHTAGS SECTION (MULTIPLE TAGS) */}
              <div className="space-y-2 bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
                <label className="font-black text-slate-800 flex items-center gap-1.5 text-xs">
                  <Hash className="w-4 h-4 text-brand-600" />
                  <span>الهاشتاغات والوسوم المتعددة للمنتج</span>
                </label>

                {/* Active Hashtag Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {productForm.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-white text-brand-700 border border-pink-200 font-bold px-2.5 py-1 rounded-xl text-xs flex items-center gap-1 shadow-sm"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Tag Input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="اكتب هاشتاغ واضغط إضافة (مثال: #ألعاب_ذكاء، #ملابس_بنات، #قطن)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(e);
                      }
                    }}
                    className="flex-1 bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
                  >
                    إضافة وسم
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">وصف المنتج ومميزاته</label>
                <textarea
                  rows="3"
                  placeholder="اكتب تفاصيل الخامة، إرشادات الغسيل، الفئة العمرية..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-brand-500 focus:bg-white text-xs"
                />
              </div>

              {/* In Stock */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="stockCheck"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="w-4 h-4 accent-brand-600 rounded"
                />
                <label htmlFor="stockCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  المنتج متوفر بالمخزون حالياً وجاهز للطلب
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 text-slate-500 hover:text-slate-800 rounded-xl font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-7 py-2.5 rounded-xl shadow-md shadow-pink-200 text-xs"
                >
                  {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingCategory ? 'تعديل بيانات القسم' : 'إضافة قسم جديد'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
              {/* 1. Category Image */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. صورة القسم (الصورة الكبيرة التي تظهر في المربع بالأعلى) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={categoryImage}
                    onChange={(e) => setCategoryImage(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-500 focus:bg-white text-xs font-mono"
                  />
                  {categoryImage && (
                    <div className="w-11 h-11 rounded-xl border border-pink-200 overflow-hidden shrink-0 bg-slate-100">
                      <img src={categoryImage} alt="معاينة" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Category Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  2. اسم القسم (الاسم الذي يظهر بالأسفل خارج الصورة) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أطقم الاستقبال الملكية"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-500 focus:bg-white text-xs font-bold"
                />
              </div>

              {/* 3. Category Subtitle / Slogan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. وصف القسم (الوصف أو الشعار الذي يظهر أسفل الاسم)
                </label>
                <input
                  type="text"
                  placeholder="مثال: أطقم استقبال للمستشفى والزيارات من أقمشة قطنية تركية فاخرة"
                  value={categorySubtitle}
                  onChange={(e) => setCategorySubtitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-brand-500 focus:bg-white text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2 rounded-xl shadow-md text-xs"
                >
                  {editingCategory ? 'تحديث القسم' : 'إضافة القسم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">تفاصيل الطلب #{selectedOrder.id}</h3>
                <p className="text-xs text-slate-400">{selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl space-y-1">
                <p><strong>العميل:</strong> {selectedOrder.customer?.name}</p>
                <p><strong>رقم الجوال:</strong> <span dir="ltr">{selectedOrder.customer?.phone}</span></p>
                <p><strong>العنوان:</strong> {selectedOrder.customer?.city} - {selectedOrder.customer?.address}</p>
                <p><strong>طريقة الدفع:</strong> {selectedOrder.customer?.paymentMethod}</p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">الأصناف المشتراة:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          {item.selectedSize && <p className="text-[10px] text-slate-500">مقاس: {item.selectedSize}</p>}
                        </div>
                      </div>
                      <div className="text-left font-black">
                        <p>{item.price} ر.س × {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>المبلغ الكلي المدفوع:</span>
                <span className="text-brand-600">{selectedOrder.total} ر.س</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-800"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
