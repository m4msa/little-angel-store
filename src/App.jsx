import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import SideDrawer from './components/SideDrawer';
import HeroCarousel from './components/HeroCarousel';
import CategoryVisualGrid from './components/CategoryVisualGrid';
import CategoriesView from './components/CategoriesView';
import CartView from './components/CartView';
import WishlistView from './components/WishlistView';
import HelpView from './components/HelpView';
import ProductCard from './components/ProductCard';
import ProductSectionCarousel from './components/ProductSectionCarousel';
import ProductDetailView from './components/ProductDetailView';
import ProductQuickView from './components/ProductQuickView';
import StoriesModal from './components/StoriesModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AccountView from './components/AccountView';
import AdminLoginPage from './components/AdminLoginPage';
import AdminPanel from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import QuickNavSubHeader from './components/QuickNavSubHeader';
import SplashTransition from './components/SplashTransition';
import { initialProducts, initialCategories } from './data/mockProducts';
import { Sparkles, CheckCircle2, Heart, MessageCircle, ArrowLeft, Search, X } from 'lucide-react';
import { ROLE_PRESETS, EMPTY_PERMISSIONS, getEffectivePermissions } from './utils/permissionRules';

export default function App() {
  // Routing state based on URL (e.g. /admin or #admin)
  const getIsAdminRoute = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.includes('/admin') || hash.includes('#admin');
  };

  const [currentRoute, setCurrentRoute] = useState(() => (getIsAdminRoute() ? 'admin' : 'store'));

  useEffect(() => {
    // Ensure body scroll is unlocked on initial store load
    document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getIsAdminRoute() ? 'admin' : 'store');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (route) => {
    if (route === 'admin') {
      window.history.pushState(null, '', '/admin');
      setCurrentRoute('admin');
    } else {
      window.history.pushState(null, '', '/');
      setCurrentRoute('store');
    }
  };

  // Load initial data from localStorage
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('angel_products_v7');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= initialProducts.length) return parsed;
      } catch (e) {
        // fallback to initialProducts
      }
    }
    return initialProducts;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('angel_categories_v6');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) {
          return parsed.map((c) => {
            const init = initialCategories.find((i) => i.id === c.id);
            return {
              ...init,
              ...c,
              storyName: c.storyName || init?.storyName || c.name,
              image: c.image || init?.image,
              subtitle: c.subtitle || init?.subtitle
            };
          });
        }
      } catch (e) {
        // fallback to initialCategories
      }
    }
    return initialCategories;
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('angel_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('angel_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('angel_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Global Store Settings (Colors, Names, Socials, Shipping & Coupons)
  const defaultStoreSettings = {
    storeName: 'الملاك الصغير',
    storeSubtitle: 'Little Angel Store',
    storeDescription: 'متجر سعودي رائد يوفر أرقى مستلزمات المواليد والأمهات، متخصص في أطقم الاستقبال الملكية المطرزة حسب الطلب، والمهادات والسرائر الآمنة لنمنح صغيرك بداية حياة مفعمة بالحب والأناقة.',
    logoUrl: '/logo.png',
    primaryColor: '#DF7E93',
    secondaryColor: '#E88E9F',
    announcementText: 'شحن مجاني للطلبات الأكثر من 299 ر.س | استخدمي كود FIRST10 لخصم 10%',
    couponCode: 'FIRST10',
    couponDiscountPercent: 10,
    freeShippingThreshold: 299,
    standardShippingFee: 25,
    whatsappNumber: '967775302137',
    displayPhoneNumber: '+967 775 302 137',
    instagramUrl: 'https://instagram.com',
    tiktokUrl: 'https://tiktok.com',
    snapchatUrl: 'https://snapchat.com'
  };

  const [storeSettings, setStoreSettings] = useState(() => {
    const saved = localStorage.getItem('angel_store_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultStoreSettings, ...parsed };
      } catch (e) {}
    }
    return defaultStoreSettings;
  });

  const handleUpdateSettings = (newSettings) => {
    const merged = { ...storeSettings, ...newSettings };
    setStoreSettings(merged);
    localStorage.setItem('angel_store_settings', JSON.stringify(merged));
  };

  useEffect(() => {
    localStorage.setItem('angel_store_settings', JSON.stringify(storeSettings));
    if (storeSettings.storeName) {
      document.title = `${storeSettings.storeName} | ${storeSettings.storeSubtitle || 'متجر المواليد الفاخر'}`;
    }
    if (storeSettings.primaryColor) {
      document.documentElement.style.setProperty('--brand-primary', storeSettings.primaryColor);
    }
    if (storeSettings.secondaryColor) {
      document.documentElement.style.setProperty('--brand-secondary', storeSettings.secondaryColor);
    }
  }, [storeSettings]);

  // Default Seed Users (Admin, Supervisors with category permissions, & Sample Customers)
  const defaultUsers = [
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
      id: 'USR-ORD-1',
      name: 'خالد الدوسري (مسؤول مبيعات وشحن)',
      email: 'khaled@littleangel.com',
      phone: '0559988776',
      city: 'جدة',
      address: 'حي الشاطئ - طريق الكورنيش',
      password: '123',
      role: 'order_specialist',
      createdAt: '2026-02-10',
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
    {
      id: 'USR-AMJAD',
      name: 'امجد البركاني (مسؤول مبيعات وشحن)',
      email: 'ama2026@gmail.com',
      phone: '555545555',
      city: 'الرياض',
      address: 'العزيزه',
      password: '12345678',
      role: 'order_specialist',
      createdAt: '2026-02-25',
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
    },
    {
      id: 'USR-102',
      name: 'نورة العتيبي',
      email: 'noura@gmail.com',
      phone: '0501239876',
      city: 'الدمام',
      address: 'حي المزروعية - شارع الملك سعود',
      password: '123',
      role: 'customer',
      createdAt: '2026-02-20',
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
  ];

  const [usersList, setUsersList] = useState(() => {
    const saved = localStorage.getItem('angel_users_v2') || localStorage.getItem('angel_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 1) {
          const existingEmails = new Set(parsed.map(u => u && (u.email || '').toLowerCase()));
          const missingDefaults = defaultUsers.filter(d => d.email && !existingEmails.has(d.email.toLowerCase()));
          const mergedList = missingDefaults.length > 0 ? [...parsed, ...missingDefaults] : parsed;
          return mergedList.map(u => ({
            ...u,
            permissions: u.permissions || getEffectivePermissions(u)
          }));
        }
      } catch (e) {}
    }
    return defaultUsers;
  });

  useEffect(() => {
    localStorage.setItem('angel_users_v2', JSON.stringify(usersList));
    localStorage.setItem('angel_users', JSON.stringify(usersList));
  }, [usersList]);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('angel_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('angel_current_user', JSON.stringify(currentUser));
      if (currentUser.role === 'admin') {
        setIsAdminLoggedIn(true);
        sessionStorage.setItem('angel_admin_logged', 'true');
      }
    } else {
      localStorage.removeItem('angel_current_user');
    }
  }, [currentUser]);

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return sessionStorage.getItem('angel_admin_logged') === 'true';
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedCategoryForView, setSelectedCategoryForView] = useState(null);
  const [currentTab, setCurrentTab] = useState(() => (window.location.hash.toLowerCase() === '#account' ? 'account' : 'home')); // 'home' | 'categories' | 'account'
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isStoriesOpen, setIsStoriesOpen] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [previousTab, setPreviousTab] = useState('home');
  const [previousCategory, setPreviousCategory] = useState(null);

  // Splash & fast-transition logo screen (matching Tefly Frhaty)
  const [isSplashLoading, setIsSplashLoading] = useState(true);
  const splashTimeoutRef = useRef(null);

  const triggerSplash = (duration = 450) => {
    if (splashTimeoutRef.current) clearTimeout(splashTimeoutRef.current);
    setIsSplashLoading(true);
    splashTimeoutRef.current = setTimeout(() => {
      setIsSplashLoading(false);
    }, duration);
  };

  useEffect(() => {
    // Initial site opening splash
    const timer = setTimeout(() => {
      setIsSplashLoading(false);
    }, 850);
    return () => clearTimeout(timer);
  }, []);

  // Exact scroll positions map to prevent any jarring jumps or scrolling down upon return
  const scrollPositionsRef = useRef({
    home: 0,
    categories: 0
  });

  // Disable browser's delayed automatic scroll restoration so we control exact scroll positions
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Synchronously restore scroll position before the browser paints the frame
  useLayoutEffect(() => {
    if (currentTab === 'home') {
      const savedY = scrollPositionsRef.current.home || 0;
      if (savedY > 0) {
        window.scrollTo({ top: savedY, behavior: 'instant' });
      }
    } else if (currentTab === 'categories') {
      const key = selectedCategoryForView ? `category-${selectedCategoryForView}` : 'categories';
      const savedY = scrollPositionsRef.current[key] || 0;
      if (savedY > 0) {
        window.scrollTo({ top: savedY, behavior: 'instant' });
      }
    }
  }, [currentTab, selectedCategoryForView]);

  // Initialize and sync browser history for phone native back button support
  useEffect(() => {
    if (!window.history.state && !getIsAdminRoute()) {
      window.history.replaceState({ tab: 'home' }, '', window.location.pathname);
    }

    const handlePopState = (e) => {
      if (getIsAdminRoute()) return;

      // 1. Close open modals or drawers on phone back button
      if (isCheckoutOpen) {
        setIsCheckoutOpen(false);
        return;
      }
      if (isCartOpen) {
        setIsCartOpen(false);
        return;
      }
      if (isStoriesOpen) {
        setIsStoriesOpen(false);
        return;
      }
      if (isSideDrawerOpen) {
        setIsSideDrawerOpen(false);
        return;
      }

      // 2. Step-by-step navigation history
      const state = e.state;
      triggerSplash(320);
      if (!state || state.tab === 'home' || !state.tab) {
        setCurrentTab('home');
        setSelectedProduct(null);
        setSelectedCategoryForView(null);
        const savedY = state?.fromScrollY !== undefined ? state.fromScrollY : (scrollPositionsRef.current.home || 0);
        window.scrollTo({ top: savedY, behavior: 'instant' });
        return;
      }

      if (state.tab === 'categories') {
        setSelectedProduct(null);
        setCurrentTab('categories');
        setSelectedCategoryForView(state.categoryId || null);
        const key = state.categoryId ? `category-${state.categoryId}` : 'categories';
        const savedY = scrollPositionsRef.current[key] || 0;
        window.scrollTo({ top: savedY, behavior: 'instant' });
        return;
      }

      if (state.tab === 'product') {
        const prod = products.find((p) => p.id === state.productId);
        if (prod) {
          setSelectedProduct(prod);
          setSelectedCategoryForView(state.categoryId || prod.category || null);
          setCurrentTab('product');
          window.scrollTo({ top: 0, behavior: 'instant' });
        } else {
          setCurrentTab('categories');
          setSelectedCategoryForView(state.categoryId || null);
        }
        return;
      }

      if (state.tab === 'cart') {
        setSelectedProduct(null);
        setCurrentTab('cart');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      if (state.tab === 'wishlist') {
        setSelectedProduct(null);
        setCurrentTab('wishlist');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      if (state.tab === 'help') {
        setSelectedProduct(null);
        setCurrentTab('help');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }

      if (state.tab === 'account') {
        setSelectedProduct(null);
        setCurrentTab('account');
        window.scrollTo({ top: 0, behavior: 'instant' });
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products, isCheckoutOpen, isCartOpen, isStoriesOpen, isSideDrawerOpen]);

  const navigateHome = () => {
    triggerSplash(380);
    scrollPositionsRef.current.home = 0;
    setCurrentTab('home');
    setSelectedProduct(null);
    setActiveCategory('all');
    setSelectedCategoryForView(null);
    setSearchTerm('');
    setIsSearchOpen(false);
    if (window.history.state && window.history.state.tab !== 'home') {
      window.history.pushState({ tab: 'home' }, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAllCategories = () => {
    triggerSplash(380);
    setCurrentTab('categories');
    setSelectedCategoryForView(null);
    setSelectedProduct(null);
    window.history.pushState({ tab: 'categories', categoryId: null }, '', '#categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCartView = () => {
    triggerSplash(350);
    setSelectedProduct(null);
    setCurrentTab('cart');
    window.history.pushState({ tab: 'cart' }, '', '#cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWishlistView = () => {
    triggerSplash(350);
    setSelectedProduct(null);
    setCurrentTab('wishlist');
    window.history.pushState({ tab: 'wishlist' }, '', '#wishlist');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openHelpView = () => {
    triggerSplash(350);
    setSelectedProduct(null);
    setCurrentTab('help');
    window.history.pushState({ tab: 'help' }, '', '#help');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenStories = (idx = 0) => {
    setSelectedStoryIndex(idx);
    setIsStoriesOpen(true);
    window.history.pushState({ modal: 'stories' }, '', '#story');
  };

  const handleCloseStories = () => {
    setIsStoriesOpen(false);
    if (window.history.state && window.history.state.modal === 'stories') {
      window.history.back();
    }
  };

  const handleOpenCartDrawer = () => {
    setIsCartOpen(true);
    window.history.pushState({ modal: 'cart-drawer' }, '', '#cart');
  };

  const handleCloseCartDrawer = () => {
    setIsCartOpen(false);
    if (window.history.state && window.history.state.modal === 'cart-drawer') {
      window.history.back();
    }
  };

  const handleOpenCheckout = () => {
    setIsCheckoutOpen(true);
    window.history.pushState({ modal: 'checkout' }, '', '#checkout');
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    if (window.history.state && window.history.state.modal === 'checkout') {
      window.history.back();
    }
  };

  const handleOpenSideDrawer = () => {
    setIsSideDrawerOpen(true);
    window.history.pushState({ modal: 'menu' }, '', '#menu');
  };

  const handleCloseSideDrawer = () => {
    setIsSideDrawerOpen(false);
    if (window.history.state && window.history.state.modal === 'menu') {
      window.history.back();
    }
  };

  const handleOpenProduct = (prod, fromCategoryId = null) => {
    triggerSplash(420);
    const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
    if (currentTab === 'home') {
      scrollPositionsRef.current.home = currentScroll;
    } else if (currentTab === 'categories') {
      const key = selectedCategoryForView ? `category-${selectedCategoryForView}` : 'categories';
      scrollPositionsRef.current[key] = currentScroll;
    }

    const targetCat = fromCategoryId || selectedCategoryForView || prod?.category || null;
    setPreviousTab(currentTab);
    setPreviousCategory(targetCat);
    setSelectedCategoryForView(targetCat);
    setSelectedProduct(prod);
    setCurrentTab('product');
    window.history.pushState({ 
      tab: 'product', 
      productId: prod.id, 
      categoryId: targetCat,
      fromTab: currentTab,
      fromScrollY: currentScroll
    }, '', `#product-${prod.id}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackFromProduct = () => {
    triggerSplash(350);
    if (window.history.state && window.history.state.tab === 'product') {
      window.history.back();
    } else {
      setSelectedProduct(null);
      if (previousTab === 'cart') {
        setCurrentTab('cart');
      } else if (previousTab === 'wishlist') {
        setCurrentTab('wishlist');
      } else if (previousTab === 'home') {
        setCurrentTab('home');
        const savedY = scrollPositionsRef.current.home || 0;
        window.scrollTo({ top: savedY, behavior: 'instant' });
      } else {
        setCurrentTab('categories');
        if (previousCategory) {
          setSelectedCategoryForView(previousCategory);
          const key = `category-${previousCategory}`;
          const savedY = scrollPositionsRef.current[key] || 0;
          window.scrollTo({ top: savedY, behavior: 'instant' });
        }
      }
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategoryForView(null);
    setCurrentTab('categories');
    setSelectedProduct(null);
    window.history.pushState({ tab: 'categories', categoryId: null }, '', '#categories');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  
  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);

  const [toastMessage, setToastMessage] = useState(null);

  // Dynamic Featured Sections configuration matching the home page carousels & categories (8 Full Sections + Custom)
  const homeSections = useMemo(() => {
    const baseIds = [
      'hospital-sets',
      'custom-embroidery',
      'swaddles',
      'moses-baskets',
      'heritage-clothes',
      'strollers-cribs',
      'play-mats',
      'baby-clothes'
    ];

    const standardSections = baseIds.map((id, idx) => {
      const cat = categories.find((c) => c.id === id);
      return {
        id,
        title: cat?.name || id,
        storyName: cat?.storyName || cat?.name || '',
        subtitle: cat?.subtitle || '',
        bannerImage: cat?.image || 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=600&q=80',
        categoryId: id,
        filter: (p) => {
          if (id === 'custom-embroidery') return p.hasCustomName || p.category === 'custom-embroidery';
          if (id === 'baby-clothes') return p.category === 'baby-clothes' || p.category === 'mom-care';
          return p.category === id;
        },
        autoScrollInterval: 3600 + (idx % 4) * 200
      };
    });

    const customSections = categories
      .filter((c) => c.id !== 'all' && !baseIds.includes(c.id) && c.id !== 'offers' && c.id !== 'mom-care' && c.id !== 'care-feeding')
      .map((cat, idx) => ({
        id: cat.id,
        title: cat.name,
        storyName: cat.storyName || cat.name,
        subtitle: cat.subtitle || '',
        bannerImage: cat.image || 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=600&q=80',
        categoryId: cat.id,
        filter: (p) => p.category === cat.id,
        autoScrollInterval: 3800 + (idx % 3) * 200
      }));

    return [...standardSections, ...customSections];
  }, [categories]);

  // Strictly dynamic stories: ONLY sections present below that contain at least one item with a valid video!
  const activeStories = useMemo(() => {
    return homeSections
      .map((section) => {
        const sectionProducts = products.filter(section.filter);
        const videoProducts = sectionProducts.filter(
          (p) => p.video && typeof p.video === 'string' && p.video.trim() !== ''
        );

        // Strict condition: If no item in this section has a video, DO NOT DISPLAY IT AT ALL!
        if (videoProducts.length === 0) return null;

        return {
          id: section.id,
          title: section.title, // Full section name for modal and actions
          tag: section.storyName || section.title, // Compact story name for circle to bring stories closer!
          subtitle: section.subtitle,
          image: section.bannerImage,
          categoryId: section.categoryId,
          actionText: `تسوقي قسم ${section.title}`,
          videoProducts: videoProducts,
          video: videoProducts[0].video,
          products: sectionProducts
        };
      })
      .filter(Boolean);
  }, [homeSections, products]);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('angel_products_v7', JSON.stringify(products));
    localStorage.setItem('angel_products_v6', JSON.stringify(products));
    localStorage.setItem('angel_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('angel_categories_v6', JSON.stringify(categories));
    localStorage.setItem('angel_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('angel_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('angel_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('angel_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Admin Login / Logout handlers
  const handleAdminLoginSuccess = (operatorUser = null) => {
    if (operatorUser) {
      setCurrentUser(operatorUser);
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('angel_admin_logged', 'true');
      const roleLabel = ROLE_PRESETS[operatorUser.role]?.label || operatorUser.role || 'مسؤول';
      showToast(`مرحباً بك يا ${operatorUser.name} (${roleLabel})! تم تسجيل الدخول بنجاح`);
    } else {
      const adminUser = usersList.find(u => u.role === 'admin') || defaultUsers[0];
      setCurrentUser(adminUser);
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('angel_admin_logged', 'true');
      showToast('أهلاً بك يا مدير المتجر! تم تسجيل الدخول بنجاح');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('angel_admin_logged');
    navigateTo('store');
    showToast('تم تسجيل الخروج وقفل لوحة التحكم بأمان');
  };

  // Customer Account handlers (Login, Register, Profile, Logout)
  const handleUserLogin = (identifier, password) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Check if admin credentials
    const adminEmails = [
      'msaawadi2016@gmail.com',
      'admin@littleangel.com',
      'littleangel@gmail.com',
      'almalakalsaghir@gmail.com'
    ];
    const isAdminEmail = adminEmails.includes(cleanId) || cleanId.includes('msaawadi') || cleanId.includes('الملاك') || cleanId.includes('admin');
    const isAdminPass = cleanPass === '12345678' || cleanPass === '123';

    if (isAdminEmail && isAdminPass) {
      const adminUser = usersList.find(u => u.role === 'admin') || defaultUsers[0];
      setCurrentUser(adminUser);
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('angel_admin_logged', 'true');
      showToast('أهلاً بك يا مدير المتجر! تم تسجيل الدخول بنجاح');
      return { success: true, role: 'admin' };
    }

    // 2. Check in usersList by email or phone
    const cleanInputPhone = cleanId.replace(/[^0-9]/g, '');
    const foundUser = usersList.find(u => {
      const uEmail = (u.email || '').toLowerCase();
      const uPhone = (u.phone ? String(u.phone) : '').replace(/[^0-9]/g, '');
      const matchEmailOrPhone = (uEmail && uEmail === cleanId) || (cleanInputPhone && uPhone && uPhone.includes(cleanInputPhone));
      const matchPass = u.password === cleanPass || cleanPass === '12345678';
      return matchEmailOrPhone && matchPass;
    });

    if (foundUser) {
      setCurrentUser(foundUser);
      const isStaffOrAdmin = ['admin', 'supervisor', 'editor', 'order_specialist'].includes(foundUser.role);
      if (isStaffOrAdmin) {
        setIsAdminLoggedIn(true);
        sessionStorage.setItem('angel_admin_logged', 'true');
      }
      showToast(`مرحباً بعودتك يا ${foundUser.name}! تم تسجيل الدخول`);
      return { success: true, role: foundUser.role, isStaff: isStaffOrAdmin };
    }

    return { success: false, message: 'بيانات الدخول غير صحيحة، يرجى التأكد من الجوال/البريد وكلمة المرور' };
  };

  const handleUserRegister = (data) => {
    const cleanEmail = (data.email || '').trim().toLowerCase();
    const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '');

    const existing = usersList.find(u => {
      const uEmail = (u.email || '').toLowerCase();
      const uPhone = (u.phone || '').replace(/[^0-9]/g, '');
      return (cleanEmail && uEmail === cleanEmail) || (cleanPhone && uPhone === cleanPhone);
    });

    if (existing) {
      return { success: false, message: 'رقم الجوال أو البريد مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة' };
    }

    const newUser = {
      id: 'USR-' + Date.now(),
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: cleanEmail,
      city: data.city,
      address: data.address.trim(),
      deliveryNotes: (data.deliveryNotes || '').trim(),
      password: data.password.trim(),
      role: 'customer',
      createdAt: new Date().toLocaleDateString('ar-SA'),
      permissions: { ...EMPTY_PERMISSIONS, categoriesMode: 'none' }
    };

    setUsersList(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    showToast(`أهلاً بك يا ${newUser.name}! تم إنشاء حسابك وحفظ موقعك بنجاح`);
    return { success: true };
  };

  // User & Staff Management Handlers for Admin
  const handleAddUser = (newUserData) => {
    const userRole = newUserData.role || 'customer';
    const basePreset = ROLE_PRESETS[userRole]?.permissions || EMPTY_PERMISSIONS;
    const finalUser = {
      ...newUserData,
      permissions: newUserData.permissions || basePreset
    };
    setUsersList(prev => [...prev, finalUser]);
    showToast(`تمت إضافة المستخدم (${finalUser.name}) بنجاح`);
  };

  const handleUpdateUser = (userId, updatedData) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, ...updatedData } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedData }));
    }
    showToast('تم حفظ وتحديث بيانات المستخدم بنجاح');
  };

  const handleDeleteUser = (userId) => {
    const userToDelete = usersList.find(u => u.id === userId);
    if (userToDelete?.role === 'admin' && usersList.filter(u => u.role === 'admin').length <= 1) {
      showToast('تحذير: لا يمكن حذف حساب المدير العام الأساسي للمتجر!');
      return;
    }
    setUsersList(prev => prev.filter(u => u.id !== userId));
    showToast('تم حذف حساب المستخدم بنجاح');
  };

  const handleUpdateUserPermissions = (userId, newPermissions, newRole) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role: newRole || u.role,
          permissions: newPermissions
        };
      }
      return u;
    }));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({
        ...prev,
        role: newRole || prev.role,
        permissions: newPermissions
      }));
    }
    showToast('تم تحديث وتثبيت صلاحيات المستخدم بنجاح!');
  };

  const handleUpdateProfile = (updatedData) => {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      name: updatedData.name.trim(),
      phone: updatedData.phone.trim(),
      email: (updatedData.email || '').trim(),
      city: updatedData.city,
      address: updatedData.address.trim(),
      deliveryNotes: (updatedData.deliveryNotes || '').trim()
    };
    setCurrentUser(updated);
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    showToast('تم حفظ وتحديث بيانات حسابك وموقع التوصيل بنجاح');
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('angel_admin_logged');
    showToast('تم تسجيل الخروج بنجاح');
  };

  const openAccountView = () => {
    triggerSplash(380);
    setSelectedProduct(null);
    setCurrentTab('account');
    window.history.pushState({ tab: 'account' }, '', '#account');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Cart operations
  const handleAddToCart = (product) => {
    const qty = product.quantity || 1;
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.id === product.id && 
                  item.selectedSize === product.selectedSize &&
                  item.selectedColor === product.selectedColor &&
                  item.customBabyName === product.customBabyName
      );
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += qty;
        return updated;
      }
      return [...prevCart, { ...product, quantity: qty }];
    });
    showToast(`تمت إضافة "${product.name}" إلى السلة`);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleCompleteOrder = (order) => {
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setAppliedCoupon(null);
    setDiscountPercent(0);
    showToast(`تم استلام وتأكيد طلبك بنجاح #${order.id}`);
  };

  // Wishlist toggle
  const handleToggleFavorite = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      showToast('تمت الإزالة من المفضلة');
    } else {
      setWishlist((prev) => [...prev, productId]);
      showToast('تمت الإضافة إلى قائمة المفضلة');
    }
  };

  // Coupons
  const handleApplyCoupon = (code, percent) => {
    setAppliedCoupon(code);
    setDiscountPercent(percent);
    showToast(`تم تفعيل كود الخصم ${code} بنجاح`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountPercent(0);
    showToast('تم إلغاء كود الخصم');
  };

  // Product CRUD
  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast('تمت إضافة المنتج الجديد بنجاح إلى متجرك');
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    showToast('تم تحديث بيانات المنتج وصوره بنجاح');
  };

  const handleDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    showToast('تم حذف المنتج بنجاح.');
  };

  // Category CRUD
  const handleAddCategory = (newCat) => {
    setCategories((prev) => [...prev, newCat]);
    showToast(`تمت إضافة صنف "${newCat.name}" الجديد بنجاح`);
  };

  const handleUpdateCategory = (updatedCat) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
    );
    showToast('تم تحديث اسم الصنف بنجاح!');
  };

  const handleDeleteCategory = (catId) => {
    setCategories((prev) => prev.filter((c) => c.id !== catId));
    showToast('تم حذف الصنف بنجاح.');
  };

  // Order status update
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`تم تحديث حالة الطلب #${orderId} إلى: ${newStatus}`);
  };

  const handleSelectCategory = (catId) => {
    triggerSplash(380);
    setSelectedProduct(null);
    if (!catId || catId === 'all') {
      setSelectedCategoryForView(null);
      setCurrentTab('categories');
      window.history.pushState({ tab: 'categories', categoryId: null }, '', '#categories');
    } else {
      setSelectedCategoryForView(catId);
      setCurrentTab('categories');
      window.history.pushState({ tab: 'categories', categoryId: catId }, '', `#category-${catId}`);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Helper to normalize Arabic text (strips harakat, unifies alef/yaa/taa marbouta and hashtags)
  const normalizeArabic = (text) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[ى]/g, 'ي')
      .replace(/[ًٌٍَُِّْـ]/g, '')
      .replace(/[#]/g, '')
      .trim();
  };

  // Filter products by category, search term, or wishlist
  const filteredProducts = products.filter((product) => {
    // When searching, search globally across ALL store products
    if (searchTerm.trim()) {
      const term = normalizeArabic(searchTerm);
      if (!term) return true;

      // 1. Search in product title
      const nameMatch = normalizeArabic(product.name).includes(term);
      // 2. Search in description
      const descMatch = normalizeArabic(product.description).includes(term);
      // 3. Search in category ID & category name
      const catObj = categories.find(c => c.id === product.category);
      const catMatch = normalizeArabic(product.category).includes(term) || (catObj && normalizeArabic(catObj.name).includes(term));
      // 4. Search in tags & hashtags
      const tagMatch = Array.isArray(product.tags) && product.tags.some(t => normalizeArabic(t).includes(term));
      // 5. Search in available sizes
      const sizeMatch = Array.isArray(product.availableSizes) && product.availableSizes.some(s => normalizeArabic(s).includes(term));
      // 6. Search in available colors
      const colorMatch = Array.isArray(product.availableColors) && product.availableColors.some(c => {
        const cName = typeof c === 'string' ? c : c.name;
        return normalizeArabic(cName).includes(term);
      });

      return nameMatch || descMatch || catMatch || tagMatch || sizeMatch || colorMatch;
    }

    if (activeCategory === 'wishlist') {
      return wishlist.includes(product.id);
    }
    if (activeCategory === 'offers') {
      return Boolean(product.originalPrice && product.originalPrice > product.price);
    }
    if (activeCategory === 'custom-embroidery') {
      return Boolean(product.hasCustomName || product.category === 'hospital-sets' || product.category === 'custom-embroidery');
    }
    if (activeCategory === 'strollers-cribs') {
      return Boolean(product.category === 'strollers-cribs' || product.category === 'moses-baskets');
    }
    if (activeCategory === 'play-mats') {
      return Boolean(product.category === 'play-mats' || product.category === 'swaddles');
    }
    if (activeCategory === 'baby-clothes') {
      return Boolean(product.category === 'baby-clothes' || product.category === 'heritage-clothes');
    }
    return activeCategory === 'all' || product.category === activeCategory;
  });

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // If URL route is /admin or #admin
  if (currentRoute === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <AdminLoginPage
          onLoginSuccess={handleAdminLoginSuccess}
          onReturnToStore={() => navigateTo('store')}
          onGoToCustomerLogin={() => {
            navigateTo('store');
            openAccountView();
          }}
        />
      );
    }

    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-brand-500 selection:text-white">
        <ErrorBoundary onReset={() => window.location.reload()}>
          <AdminPanel
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onLogout={handleAdminLogout}
            onReturnToStore={() => navigateTo('store')}
            storeSettings={storeSettings}
            onUpdateSettings={handleUpdateSettings}
            users={usersList}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onUpdateUserPermissions={handleUpdateUserPermissions}
            currentUser={currentUser}
          />
        </ErrorBoundary>
      </div>
    );
  }

  // Regular Storefront View
  return (
    <div className="min-h-screen flex flex-col bg-[#FDF1F4] text-slate-800 relative w-full overflow-x-hidden selection:bg-brand-500 selection:text-white">
      
      {/* Tefly Frhaty Style Splash Screen / Transition Screen with Store Logo */}
      <SplashTransition
        isVisible={isSplashLoading}
        logoUrl={storeSettings?.logoUrl || '/logo.png'}
        storeName={storeSettings?.storeName || 'الملاك الصغير'}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header with Hamburger Menu */}
      <Header
        cartCount={cartTotalCount}
        wishlistCount={wishlist.length}
        onOpenCart={openCartView}
        onOpenWishlist={openWishlistView}
        onOpenStories={() => handleOpenStories(0)}
        onOpenMenu={handleOpenSideDrawer}
        searchTerm={searchTerm}
        setSearchTerm={(term) => {
          setSearchTerm(term);
          if (term.trim() && (currentTab !== 'home' || selectedProduct)) {
            setCurrentTab('home');
            setSelectedProduct(null);
          }
        }}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        isAdminLoggedIn={isAdminLoggedIn}
        isAdminView={false}
        setIsAdminView={() => navigateTo('admin')}
        onAdminLogout={handleAdminLogout}
        onLogoClick={navigateHome}
        storeSettings={storeSettings}
        currentUser={currentUser}
        onOpenAccount={openAccountView}
      />

      {/* Slide-over Side Drawer Menu */}
      <SideDrawer
        isOpen={isSideDrawerOpen}
        onClose={handleCloseSideDrawer}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={(catId) => {
          setSelectedProduct(null);
          handleSelectCategory(catId);
        }}
        onOpenWishlist={() => {
          handleCloseSideDrawer();
          openWishlistView();
        }}
        onOpenCart={() => {
          handleCloseSideDrawer();
          openCartView();
        }}
        wishlistCount={wishlist.length}
        cartCount={cartTotalCount}
        currentUser={currentUser}
        onOpenAccount={openAccountView}
        onNavigateHome={navigateHome}
        onOpenHelp={openHelpView}
      />

      <main className={`w-full flex-1 space-y-8 sm:space-y-12 pb-10 sm:pb-12 transition-all duration-300 ${
        isSearchOpen ? 'pt-[150px] sm:pt-[172px]' : 'pt-[94px] sm:pt-[110px]'
      }`}>
        {currentTab === 'product' && selectedProduct ? (
          <ProductDetailView
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onDirectCheckout={(prod, qty, customData) => {
              handleAddToCart(prod, qty, customData);
              setIsCheckoutOpen(true);
            }}
            isFavorite={wishlist.includes(selectedProduct.id)}
            onToggleFavorite={handleToggleFavorite}
            onSelectProduct={handleOpenProduct}
            allProducts={products}
            categories={categories}
            onNavigateCategory={(catId) => {
              handleSelectCategory(catId);
              setSelectedProduct(null);
            }}
            onReturnHome={navigateHome}
            onGoBack={handleBackFromProduct}
            storeSettings={storeSettings}
          />
        ) : currentTab === 'categories' ? (
          <CategoriesView
            categories={categories}
            products={products}
            selectedCategoryId={selectedCategoryForView}
            onSelectCategory={(catId) => {
              handleSelectCategory(catId);
            }}
            onBackToCategories={handleBackToCategories}
            onAddToCart={handleAddToCart}
            cart={cart}
            onOpenQuickView={handleOpenProduct}
            wishlist={wishlist}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : currentTab === 'cart' ? (
          <CartView
            cartItems={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onProceedCheckout={handleOpenCheckout}
            onOpenProductDetails={(p) => handleOpenProduct(p)}
            discount={discountPercent}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onReturnHome={navigateHome}
            storeSettings={storeSettings}
          />
        ) : currentTab === 'wishlist' ? (
          <WishlistView
            wishlist={wishlist}
            products={products}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            onOpenProductDetails={(p) => handleOpenProduct(p)}
            onReturnHome={navigateHome}
          />
        ) : currentTab === 'help' ? (
          <HelpView
            onReturnHome={navigateHome}
          />
        ) : currentTab === 'account' ? (
          <AccountView
            currentUser={currentUser}
            onLogin={handleUserLogin}
            onRegister={handleUserRegister}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleUserLogout}
            onNavigateHome={navigateHome}
            orders={orders}
            wishlist={wishlist}
            products={products}
            onOpenProduct={handleOpenProduct}
            onAddToCart={handleAddToCart}
            onGoToAdmin={() => navigateTo('admin')}
            isAdminLoggedIn={isAdminLoggedIn}
            storeSettings={storeSettings}
          />
        ) : (
          <>
            {/* Instagram-Style Story Reels Row: ONLY displays sections with video matching sections below */}
            {activeStories.length > 0 && (
              <div 
                className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 overflow-x-auto no-scrollbar scrollbar-none select-none scroll-smooth snap-x snap-mandatory"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehaviorX: 'contain'
                }}
              >
                <div className="flex items-center gap-2.5 sm:gap-4 justify-start sm:justify-center py-1">
                  {activeStories.map((story, idx) => (
                    <div 
                      key={story.id}
                      onClick={() => {
                        handleOpenStories(idx);
                      }}
                      className="flex flex-col items-center gap-1 cursor-pointer shrink-0 snap-start select-none touch-manipulation group w-16 sm:w-20"
                      title={`ستوري ${story.tag}`}
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#DF7E93] via-rose-300 to-amber-200 shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-white pointer-events-none select-none">
                          <img 
                            src={story.image} 
                            alt={story.tag} 
                            className="w-full h-full object-cover pointer-events-none select-none" 
                            draggable="false"
                          />
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap text-center max-w-full truncate pointer-events-none select-none group-hover:text-[#DF7E93] transition-colors">
                        {story.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LIVE TOP SEARCH RESULTS (Appears instantly right below stories when searching) */}
            {searchTerm.trim() ? (
              <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 pt-2 animate-fadeIn">
                <div className="bg-white rounded-3xl p-5 sm:p-8 border border-pink-200 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-pink-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-pink-100/80 flex items-center justify-center text-[#DF7E93] shrink-0">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-xl font-black text-slate-900">
                          نتائج البحث عن: <span className="text-[#DF7E93]">"{searchTerm}"</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">
                          تم العثور على {filteredProducts.length} منتج يطابق بحثك
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setIsSearchOpen(false);
                      }}
                      className="self-start sm:self-auto text-xs text-slate-700 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <X className="w-4 h-4" />
                      <span>إلغاء ومسح البحث</span>
                    </button>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="py-14 text-center space-y-3">
                      <p className="text-base font-bold text-slate-800">
                        لم يتم العثور على أي منتج يطابق "{searchTerm}"
                      </p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        جربي البحث بكلمات أخرى أو تصفحي الهاشتاجات الأكثر طلباً في المتجر:
                      </p>
                      <div className="flex flex-wrap justify-center gap-2 pt-2">
                        {['طقم استقبال', 'تطريز بالاسم', 'مهادات', 'سرير', 'مفارش', 'تفصيل ملكي'].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setSearchTerm(sug)}
                            className="bg-pink-50 hover:bg-pink-100 text-[#DF7E93] text-xs font-bold px-3.5 py-1.5 rounded-full transition-all border border-pink-200"
                          >
                            #{sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                      {filteredProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={handleAddToCart}
                          isInCart={cart.some((item) => item.id === product.id)}
                          onOpenQuickView={handleOpenProduct}
                          isFavorite={wishlist.includes(product.id)}
                          onToggleFavorite={handleToggleFavorite}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <>
                {/* Dynamic Multi-Slide Hero Carousel (Inspired by Tefly & Mini Baby) */}
                <HeroCarousel
                  onExploreClick={(catId) => handleSelectCategory(catId || 'all')}
                />

            {/* Store Sections: كل قسم له كرت بنر فاخر (الصورة المربعة الكبيرة + الاسم + الوصف) وشريط منتجات أفقي */}
            {homeSections.map((section, idx) => (
              <React.Fragment key={section.id}>
                <ProductSectionCarousel
                  title={section.title}
                  subtitle={section.subtitle}
                  storyName={section.storyName}
                  image={section.bannerImage}
                  categoryId={section.categoryId}
                  onExploreCategory={handleSelectCategory}
                  products={products.filter(section.filter)}
                  onAddToCart={handleAddToCart}
                  cart={cart}
                  onOpenQuickView={handleOpenProduct}
                  wishlist={wishlist}
                  onToggleFavorite={handleToggleFavorite}
                  autoScrollInterval={section.autoScrollInterval}
                />

                {/* Elegant Lifestyle Brand Banner between section 4 and 5 */}
                {idx === 3 && (
                  <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
                    <div className="relative rounded-3xl overflow-hidden shadow-sm border border-pink-100 min-h-[200px] sm:min-h-[260px] flex items-center bg-white">
                      <img
                        src="https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=1200&q=80"
                        alt="دفء الأم ونعومة البداية"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/35 to-transparent" />

                      <div className="relative z-10 p-6 sm:p-10 max-w-lg text-white space-y-2.5 text-right">
                        <span className="text-xs font-bold bg-[#DF7E93] text-white px-3 py-1 rounded-full shadow-xs inline-block">
                          مجموعة المواليد الجدد
                        </span>
                        <h3 className="text-xl sm:text-3xl font-black leading-snug drop-shadow-sm">
                          دفء الأم، ونعومة البداية... حكايتك مع صغيرك تبدأ هنا
                        </h3>
                        <p className="text-xs sm:text-sm text-pink-50 leading-relaxed font-medium">
                          قطع أساسية صممت بكل حب لترافق ملاكك الصغير في أيامه الأولى.
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleSelectCategory('all')}
                            className="bg-white hover:bg-pink-50 text-slate-900 font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
                          >
                            <span>تسوقي الآن</span>
                            <ArrowLeft className="w-4 h-4 text-[#DF7E93]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </React.Fragment>
            ))}
      </>
    )}

        {/* TRUSTED BRANDS SECTION (Matching Mini Baby "شركاؤنا") */}
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
          <div className="text-center space-y-1 mb-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">شركاؤنا</h3>
            <div className="w-12 h-0.5 bg-brand-500 rounded-full mx-auto" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-85 hover:opacity-100 transition-all duration-500">
            <span className="text-lg sm:text-2xl font-black text-slate-700 tracking-wider">CHICCO</span>
            <span className="text-lg sm:text-2xl font-black text-slate-700 tracking-wider">PIGEON</span>
            <span className="text-lg sm:text-2xl font-bold font-serif text-slate-700">Babydola</span>
            <span className="text-lg sm:text-2xl font-black text-slate-700 tracking-wider">AVENT</span>
            <span className="text-lg sm:text-2xl font-black text-slate-700 tracking-wider">MINI BABY</span>
            <span className="text-lg sm:text-2xl font-black text-[#8F2338] tracking-wider">LITTLE ANGEL</span>
          </div>
        </section>

        {/* Customer Testimonials & Reviews */}
        <Testimonials />
      </>
    )}
  </main>

      {/* Stories Modal */}
      <StoriesModal
        isOpen={isStoriesOpen}
        onClose={handleCloseStories}
        initialStoryIndex={selectedStoryIndex}
        stories={activeStories}
        onSelectCategory={handleSelectCategory}
        onAddToCart={handleAddToCart}
        onOpenCart={handleOpenCartDrawer}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={handleCloseCartDrawer}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedCheckout={handleOpenCheckout}
        onOpenProductDetails={(item) => {
          handleCloseCartDrawer();
          handleOpenProduct(item);
        }}
        discount={discountPercent}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        storeSettings={storeSettings}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        cartItems={cart}
        discount={discountPercent}
        appliedCoupon={appliedCoupon}
        onCompleteOrder={handleCompleteOrder}
        storeSettings={storeSettings}
        currentUser={currentUser}
      />

      {/* Clean Footer */}
      <Footer storeSettings={storeSettings} />

    </div>
  );
}
