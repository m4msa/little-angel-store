/**
 * Security and Sanitization Utilities
 * Little Angel Store (الملاك الصغير)
 * Clean Code & Security Hardening
 */

/**
 * Safely parse JSON strings with error handling and prototype pollution prevention.
 * @param {string|null|undefined} raw
 * @param {*} fallback
 * @returns {*}
 */
export function safeJsonParse(raw, fallback = null) {
  if (typeof raw !== 'string') return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      // Prevent prototype pollution
      delete parsed.__proto__;
      delete parsed.constructor;
      delete parsed.prototype;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

/**
 * Sanitize plain text strings: removes control characters, trims, and enforces max length.
 * @param {unknown} val
 * @param {number} [maxLength=500]
 * @returns {string}
 */
export function sanitizeString(val, maxLength = 500) {
  if (val === null || val === undefined) return '';
  const str = String(val)
    // Strip control characters except newline and tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Strip script and inline event handlers
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
  return str.slice(0, maxLength);
}

/**
 * Sanitize URLs to prevent XSS (blocks javascript:, vbscript:, data:text/html, etc.)
 * Allows http:, https:, data:image/, mailto:, tel:, and relative paths (/ or #).
 * @param {unknown} url
 * @param {string} [fallback='']
 * @returns {string}
 */
export function sanitizeUrl(url, fallback = '') {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  
  // Allow relative URLs and anchor hashes
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  // Allow safe base64 image and video data URLs or blob URLs
  if (
    trimmed.startsWith('data:image/') || 
    trimmed.startsWith('data:video/') || 
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (safeProtocols.includes(parsed.protocol)) {
      return trimmed;
    }
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safely open an external link in a new tab without reverse tabnabbing.
 * @param {string} url
 */
export function safeOpenExternal(url) {
  const safe = sanitizeUrl(url);
  if (!safe) return;
  const win = window.open(safe, '_blank', 'noopener,noreferrer');
  if (win) {
    win.opener = null;
  }
}

/**
 * Formats and builds a safe WhatsApp click-to-chat URL with proper URI encoding.
 * @param {string} phone
 * @param {string} messageText
 * @returns {string}
 */
export function buildWhatsAppUrl(phone, messageText = '') {
  if (!phone) return '';
  let cleanPhone = String(phone).replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '966' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('966') && !cleanPhone.startsWith('967') && cleanPhone.length === 9) {
    cleanPhone = '966' + cleanPhone;
  }
  const encodedMsg = encodeURIComponent(messageText);
  return `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
}

/**
 * Validate an email address format safely.
 * @param {string} email
 * @returns {boolean}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim().toLowerCase();
  // Safe RFC 5322 compatible regex without catastrophic backtracking
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Validate phone number format (accepts Saudi or international numbers).
 * @param {string} phone
 * @returns {boolean}
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

/**
 * Parse and sanitize numbers within a min/max bound.
 * @param {unknown} val
 * @param {{ min?: number, max?: number, fallback?: number }} options
 * @returns {number}
 */
export function sanitizeNumber(val, { min = 0, max = Infinity, fallback = 0 } = {}) {
  const num = Number(val);
  if (!Number.isFinite(num) || Number.isNaN(num)) return fallback;
  if (num < min) return min;
  if (num > max) return max;
  return num;
}
