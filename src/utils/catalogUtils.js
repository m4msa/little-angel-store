/**
 * Little Angel Store - Catalog & Product Utility Functions
 * Centralized helpers for media building, category filtering, discount calculations,
 * color resolution, and robust fallbacks.
 */

// Premium pastel fallback image for missing or failed product/category images
export const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
  <rect width="600" height="600" fill="#FFF5F7"/>
  <circle cx="300" cy="270" r="110" fill="#FCE7EC"/>
  <path d="M300 210C315 210 327 222 327 237C327 252 315 264 300 264C285 264 273 252 273 237C273 222 285 210 300 210Z" fill="#DF7E93"/>
  <path d="M250 330C250 302 272 280 300 280C328 280 350 302 350 330H250Z" fill="#DF7E93"/>
  <circle cx="270" cy="235" r="3" fill="#FFFFFF"/>
  <circle cx="330" cy="235" r="3" fill="#FFFFFF"/>
  <path d="M240 370H360" stroke="#DF7E93" stroke-width="4" stroke-linecap="round"/>
  <text x="300" y="430" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold" fill="#DF7E93" text-anchor="middle">الملاك الصغير</text>
  <text x="300" y="460" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#94A3B8" text-anchor="middle">الصورة غير متوفرة</text>
</svg>
`.trim());

/**
 * Gracefully handles image load errors by setting the fallback placeholder
 * and removing the error listener to prevent infinite loops.
 */
export function handleImageError(event, fallback = FALLBACK_IMAGE) {
  if (event?.currentTarget && event.currentTarget.src !== fallback) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallback;
  }
}

/**
 * Builds a unified list of media items (video + images) for a product.
 * Guarantees at least one valid media item and properly flags the primary item.
 */
export function buildProductMediaItems(product) {
  if (!product) return [{ type: 'image', url: FALLBACK_IMAGE, isPrimary: true }];

  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images.filter(Boolean)
    : [product.image].filter(Boolean);

  const images = rawImages.length > 0 ? rawImages : [FALLBACK_IMAGE];
  const mediaItems = [];

  const hasVideo = Boolean(product.video && typeof product.video === 'string' && product.video.trim());
  const isVideoPrimary = hasVideo && product.primaryMediaType === 'video';

  if (isVideoPrimary) {
    mediaItems.push({ type: 'video', url: product.video, isPrimary: true });
    images.forEach((img, idx) => {
      mediaItems.push({ type: 'image', url: img, isPrimary: false, originalIndex: idx });
    });
  } else {
    const primaryImgIndex = typeof product.primaryImageIndex === 'number' ? product.primaryImageIndex : 0;
    images.forEach((img, idx) => {
      const isPrimary = idx === primaryImgIndex || (primaryImgIndex >= images.length && idx === 0);
      mediaItems.push({ type: 'image', url: img, isPrimary, originalIndex: idx });
    });
    if (hasVideo) {
      mediaItems.push({ type: 'video', url: product.video, isPrimary: false });
    }
  }

  // Ensure exactly one item is marked primary
  if (!mediaItems.some(item => item.isPrimary) && mediaItems.length > 0) {
    mediaItems[0].isPrimary = true;
  }

  return mediaItems;
}

/**
 * Calculates discount percentage between original price and current price.
 */
export function calculateDiscountPercent(originalPrice, currentPrice) {
  const orig = Number(originalPrice);
  const curr = Number(currentPrice);
  if (!orig || !curr || orig <= curr) return 0;
  return Math.round(((orig - curr) / orig) * 100);
}

/**
 * Determines whether a product requires options/customization selection before checkout.
 */
export function hasProductOptions(product) {
  if (!product) return false;
  return Boolean(
    product.hasCustomName === true ||
    (Array.isArray(product.availableSizes) && product.availableSizes.length > 0) ||
    (Array.isArray(product.availableColors) && product.availableColors.length > 0)
  );
}

/**
 * Adaptive typography and line-clamping classes based on title length
 * to prevent clipping and maintain harmonious card grid heights.
 */
export function getTitleClampingStyle(name = '') {
  const len = (name || '').trim().length;
  if (len > 55) {
    return 'text-[9.5px] xs:text-[10px] sm:text-[11px] leading-tight line-clamp-3';
  }
  if (len > 35) {
    return 'text-[11px] xs:text-[11.5px] sm:text-xs leading-snug line-clamp-2';
  }
  if (len > 22) {
    return 'text-[11.5px] xs:text-xs sm:text-[13px] leading-snug line-clamp-2';
  }
  return 'text-xs sm:text-sm leading-normal line-clamp-2';
}

/**
 * Standard color mapping for baby store themes.
 */
export const COLOR_CLASS_MAP = {
  'وردي هادئ': 'bg-pink-300',
  'أزرق سماوي': 'bg-sky-300',
  'أبيض قطني': 'bg-slate-100',
  'بيج كريمي': 'bg-amber-100',
  'رمادي فاتح': 'bg-slate-300',
  'رمادي ناعم': 'bg-slate-300',
  'أصفر ليموني': 'bg-amber-200',
  'مشمشي هادئ': 'bg-orange-200',
  'أخضر نعناعي': 'bg-emerald-200',
  'كحلي فاخر': 'bg-blue-900',
  'بني كراميل': 'bg-amber-700',
  'خشب طبيعي ناعم': 'bg-amber-200'
};

/**
 * Standard thread colors for custom embroidery.
 */
export const THREAD_COLORS = ['ذهبي ملكي', 'فضي ناعم', 'بني كراميل', 'كحلي فاخر', 'وردي'];

/**
 * Default sizes when a product does not specify available sizes.
 */
export const DEFAULT_SIZES = ['0-3 أشهر', '3-6 أشهر', '6-12 شهر', '1-2 سنة'];

/**
 * Normalizes product colors into objects with name and Tailwind background class.
 */
export function normalizeProductColors(availableColors) {
  if (!Array.isArray(availableColors) || availableColors.length === 0) {
    return [];
  }
  return availableColors.map(c => {
    if (typeof c === 'string') {
      return { name: c, bg: COLOR_CLASS_MAP[c] || 'bg-brand-200' };
    }
    return {
      name: c.name || '',
      bg: c.bg || COLOR_CLASS_MAP[c.name] || 'bg-brand-200'
    };
  });
}

/**
 * Filters products by category ID adhering to store grouping rules.
 */
export function filterProductsByCategory(products, categoryId) {
  if (!Array.isArray(products)) return [];
  if (!categoryId || categoryId === 'all') return products;

  return products.filter((product) => {
    if (categoryId === 'offers') {
      return Boolean(product.originalPrice && Number(product.originalPrice) > Number(product.price));
    }
    if (categoryId === 'custom-embroidery') {
      return Boolean(
        product.hasCustomName ||
        product.category === 'hospital-sets' ||
        product.category === 'custom-embroidery'
      );
    }
    if (categoryId === 'strollers-cribs') {
      return Boolean(
        product.category === 'strollers-cribs' ||
        product.category === 'moses-baskets'
      );
    }
    if (categoryId === 'play-mats') {
      return Boolean(
        product.category === 'play-mats' ||
        product.category === 'swaddles'
      );
    }
    if (categoryId === 'baby-clothes') {
      return Boolean(
        product.category === 'baby-clothes' ||
        product.category === 'heritage-clothes' ||
        product.category === 'mom-care'
      );
    }
    return product.category === categoryId;
  });
}

/**
 * Core visual sections defined on the home page and category grid.
 */
export const CORE_VISUAL_SECTIONS = [
  {
    id: 'hospital-sets',
    defaultName: 'أطقم الاستقبال الملكية',
    defaultImage: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'custom-embroidery',
    defaultName: 'تفصيل حسب الطلب',
    defaultImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'swaddles',
    defaultName: 'مهادات المواليد',
    defaultImage: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'moses-baskets',
    defaultName: 'سلال موسى',
    defaultImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'heritage-clothes',
    defaultName: 'الملابس التراثية (سديري وثوب)',
    defaultImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'strollers-cribs',
    defaultName: 'سرائر وعربات الأطفال',
    defaultImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'play-mats',
    defaultName: 'مفارش اللعب والمهادات',
    defaultImage: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'baby-clothes',
    defaultName: 'ملابس المواليد والأزياء',
    defaultImage: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=1200&q=80',
  }
];
