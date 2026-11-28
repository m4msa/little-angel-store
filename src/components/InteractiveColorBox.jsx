import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Sparkles, RotateCcw, Check } from 'lucide-react';

/**
 * Color conversion utilities for RGB, HSL, and Hex
 */
export function hslToRgb(h, s, l) {
  // h: 0-360, s: 0-1, l: 0-1
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h <= 360) { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

export function rgbToHsl(r, g, b) {
  r = Math.max(0, Math.min(255, r)) / 255;
  g = Math.max(0, Math.min(255, g)) / 255;
  b = Math.max(0, Math.min(255, b)) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [Math.round(h), s, l];
}

export function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0').toUpperCase();
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return [223, 126, 147];
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return [223, 126, 147];
  const num = parseInt(clean, 16);
  if (isNaN(num)) return [223, 126, 147];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/**
 * Intelligent helper to map RGB values to elegant Arabic baby store names
 */
export function getArabicColorName(r, g, b) {
  if (r > 245 && g > 245 && b > 245) return 'أبيض ناصع';
  if (r > 235 && g > 235 && b > 235) return 'أبيض قطني';
  if (r > 240 && g > 235 && b > 215) return 'سكري ملكي';
  if (r > 230 && g > 215 && b > 185) return 'بيج كريمي';
  if (r > 210 && g > 190 && b > 160) return 'بيج كراميل';
  if (r < 30 && g < 30 && b < 30) return 'أسود ملكي';
  if (r < 65 && g < 65 && b < 65) return 'رصاصي داكن';
  if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15) {
    if (r > 180) return 'رمادي فاتح';
    if (r > 120) return 'رمادي ناعم';
    return 'رمادي متوسط';
  }

  // Pinks & Roses
  if (r > 210 && g < 195 && b > 175) {
    if (b > 210) return 'وردي فوشي ناعم';
    if (g > 150) return 'وردي هادئ';
    return 'وردي بودري';
  }
  if (r > 190 && g < 130 && b < 150) return 'وردي توتي';

  // Blues & Navies
  if (b > 180 && r < 180) {
    if (g > 180) return 'أزرق سماوي فاتح';
    if (b > 220 && g < 100) return 'أزرق ملكي';
    return 'أزرق سماوي';
  }
  if (b > 80 && r < 50 && g < 70) return 'كحلي فاخر';
  if (b > 100 && r < 80 && b > r) return 'كحلي بترولي';

  // Greens & Mints
  if (g > 180 && r < 190 && b > 170) return 'أخضر نعناعي (Mint)';
  if (g > 170 && r < 160 && b < 160) return 'أخضر فستقي ناعم';
  if (g > 100 && r < 80 && b < 80) return 'أخضر زيتي';

  // Yellows & Golds
  if (r > 220 && g > 200 && b < 120) return 'أصفر ليموني ناعم';
  if (r > 200 && g > 150 && b < 60) return 'ذهبي تطريز ملكي';
  if (r > 180 && g > 100 && b < 50) return 'بني كراميل';

  // Purples
  if (r > 170 && b > 190 && g < 170) return 'لافندر ناعم';
  if (r > 120 && b > 160 && g < 100) return 'بنفسجي ملكي';

  // Peaches
  if (r > 220 && g > 150 && b < 150) return 'مشمشي هادئ (Peach)';

  return 'لون مخصص';
}

/**
 * Standard Presets Grid (like the Office/Windows "Standard" tab)
 */
const STANDARD_PALETTE = [
  // Row 1: Grayscale
  ['#FFFFFF', '#E2E8F0', '#CBD5E1', '#94A3B8', '#64748B', '#334155', '#0F172A', '#000000'],
  // Row 2: Baby pastels
  ['#FFFBEB', '#FEF3C7', '#FDE68A', '#FEE2E2', '#FCE7F3', '#F3E8FF', '#E0E7FF', '#E0F2FE'],
  // Row 3: Signature store tones
  ['#F4B5C3', '#E88E9F', '#DF7E93', '#F87171', '#FB923C', '#FBBF24', '#34D399', '#38BDF8'],
  // Row 4: Deep luxurious tones
  ['#BE185D', '#B91C1C', '#C2410C', '#B45309', '#047857', '#0369A1', '#1D4ED8', '#1E3A8A'],
  // Row 5: Embroidery & earth tones
  ['#78350F', '#92400E', '#D97706', '#F59E0B', '#84CC16', '#10B981', '#06B6D4', '#6366F1']
];

/**
 * Interactive Windows / Office Style Color Picker
 * Faithfully reproduces the exact visual dialog from the user's reference:
 * 1. Tabs: "ألوان مخصصة (تدرج شامل)" & "ألوان قياسية (جاهزة)"
 * 2. 2D continuous color spectrum canvas with live crosshair '+' cursor
 * 3. Vertical luminescence / brightness gradient bar with slider arrow
 * 4. RGB numeric spinners (Red, Green, Blue) and Hex input
 * 5. Split comparison box: Top = "الجديد" (New), Bottom = "الحالي" (Current)
 */
export default function InteractiveColorBox({
  colorHex = '#DF7E93',
  onChangeHex = () => {},
  onSuggestName = () => {},
  label = 'مربع الألوان الشامل (مرر المؤشر واضغط لاختيار اللون فوراً)'
}) {
  const [activeTab, setActiveTab] = useState('custom'); // 'custom' (Pasirinktinės) | 'standard' (Standartinės)
  const initialColorRef = useRef(colorHex || '#DF7E93');

  // Parse initial HSL & RGB
  const initialRgb = useMemo(() => hexToRgb(colorHex), [colorHex]);
  const [rgb, setRgb] = useState(initialRgb);
  const [hsl, setHsl] = useState(() => rgbToHsl(initialRgb[0], initialRgb[1], initialRgb[2]));

  // Sync state if colorHex changes externally
  useEffect(() => {
    const newRgb = hexToRgb(colorHex);
    setRgb(newRgb);
    setHsl(rgbToHsl(newRgb[0], newRgb[1], newRgb[2]));
  }, [colorHex]);

  const spectrumCanvasRef = useRef(null);
  const lumCanvasRef = useRef(null);

  const [isSpectrumDragging, setIsSpectrumDragging] = useState(false);
  const [isLumDragging, setIsLumDragging] = useState(false);

  // Crosshair position in 2D spectrum canvas (0 to 1 normalized)
  const crosshairPos = useMemo(() => {
    const [h, s] = hsl;
    const x = (h / 360);
    const y = 1 - s;
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
  }, [hsl]);

  // Lum slider position (0 to 1 normalized, 0 = top/white, 1 = bottom/black)
  const lumPos = useMemo(() => {
    const [, , l] = hsl;
    return 1 - l; // l=1 is top (pos=0), l=0 is bottom (pos=1)
  }, [hsl]);

  // 1. Draw 2D Spectrum Canvas (X: Hue 0..360, Y: Saturation 1..0)
  const drawSpectrum = useCallback(() => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Horizontal rainbow (Hue 0° to 360°)
    const hGrad = ctx.createLinearGradient(0, 0, width, 0);
    hGrad.addColorStop(0, '#FF0000');
    hGrad.addColorStop(0.17, '#FFFF00');
    hGrad.addColorStop(0.33, '#00FF00');
    hGrad.addColorStop(0.50, '#00FFFF');
    hGrad.addColorStop(0.67, '#0000FF');
    hGrad.addColorStop(0.83, '#FF00FF');
    hGrad.addColorStop(1, '#FF0000');
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, width, height);

    // Vertical desaturation to white/gray (top = full saturation, bottom = desaturated)
    const vGrad = ctx.createLinearGradient(0, 0, 0, height);
    vGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    vGrad.addColorStop(1, 'rgba(128, 128, 128, 1)');
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, width, height);
  }, []);

  // 2. Draw Luminescence Vertical Slider (Top: White, Middle: Pure Hue/Sat, Bottom: Black)
  const drawLuminance = useCallback(() => {
    const canvas = lumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const [h, s] = hsl;
    const [mr, mg, mb] = hslToRgb(h, s, 0.5);
    const midHex = rgbToHex(mr, mg, mb);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.5, midHex);
    grad.addColorStop(1, '#000000');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }, [hsl]);

  useEffect(() => {
    if (activeTab === 'custom') {
      drawSpectrum();
      drawLuminance();
    }
  }, [activeTab, drawSpectrum, drawLuminance]);

  // Commit updated color to parent
  const commitColor = useCallback((newRgb, newHsl) => {
    setRgb(newRgb);
    setHsl(newHsl);
    const hex = rgbToHex(newRgb[0], newRgb[1], newRgb[2]);
    onChangeHex(hex);
    if (onSuggestName) {
      const name = getArabicColorName(newRgb[0], newRgb[1], newRgb[2]);
      onSuggestName(name);
    }
  }, [onChangeHex, onSuggestName]);

  // Handle click/drag on 2D Spectrum Box
  const handleSpectrumMove = useCallback((e) => {
    const canvas = spectrumCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let x = (clientX - rect.left) / rect.width;
    let y = (clientY - rect.top) / rect.height;

    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));

    const newH = Math.round(x * 360);
    const newS = Math.max(0, Math.min(1, 1 - y));
    const currentL = hsl[2];

    const newHsl = [newH, newS, currentL];
    const newRgb = hslToRgb(newH, newS, currentL);
    commitColor(newRgb, newHsl);
  }, [hsl, commitColor]);

  // Handle click/drag on Luminescence Vertical Bar
  const handleLumMove = useCallback((e) => {
    const canvas = lumCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let y = (clientY - rect.top) / rect.height;
    y = Math.max(0, Math.min(1, y));

    const newL = Math.max(0, Math.min(1, 1 - y));
    const newHsl = [hsl[0], hsl[1], newL];
    const newRgb = hslToRgb(hsl[0], hsl[1], newL);
    commitColor(newRgb, newHsl);
  }, [hsl, commitColor]);

  // RGB Input change handlers
  const handleRgbChange = (index, value) => {
    const num = Math.max(0, Math.min(255, Number(value) || 0));
    const newRgb = [...rgb];
    newRgb[index] = num;
    const newHsl = rgbToHsl(newRgb[0], newRgb[1], newRgb[2]);
    commitColor(newRgb, newHsl);
  };

  const currentHex = rgbToHex(rgb[0], rgb[1], rgb[2]);

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-md p-3.5 space-y-3 select-none">
      
      {/* Top Windows/Office Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            تخصيص شامل (طيف الألوان)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('standard')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'standard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ألوان قياسية جاهزة
          </button>
        </div>

        <span className="text-[11px] font-bold text-slate-500 hidden sm:inline-block">
          لوحة اختيار الألوان الاحترافية
        </span>
      </div>

      {activeTab === 'custom' ? (
        <div className="space-y-3">
          {/* Main Spectrum + Luminescence Bar Row */}
          <div className="flex gap-3 items-stretch">
            
            {/* 1. Main 2D Color Spectrum Box (Spalvos) */}
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">
                طيف الألوان الكامل (مرر واضغط لاختيار أي درجة):
              </span>
              <div
                className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden border-2 border-slate-300 cursor-crosshair shadow-inner"
                onMouseDown={(e) => {
                  setIsSpectrumDragging(true);
                  handleSpectrumMove(e);
                }}
                onMouseMove={(e) => {
                  if (isSpectrumDragging || e.buttons === 1) handleSpectrumMove(e);
                }}
                onMouseUp={() => setIsSpectrumDragging(false)}
                onTouchStart={(e) => {
                  setIsSpectrumDragging(true);
                  handleSpectrumMove(e);
                }}
                onTouchMove={(e) => {
                  if (isSpectrumDragging) handleSpectrumMove(e);
                }}
                onTouchEnd={() => setIsSpectrumDragging(false)}
              >
                <canvas
                  ref={spectrumCanvasRef}
                  width={320}
                  height={180}
                  className="w-full h-full block"
                />

                {/* Crosshair indicator '+' */}
                <div
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center transition-all duration-75"
                  style={{
                    left: `${crosshairPos.x * 100}%`,
                    top: `${crosshairPos.y * 100}%`
                  }}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-md ring-1 ring-black/70 flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-black" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Vertical Luminescence / Brightness Bar */}
            <div className="w-10 sm:w-12 space-y-1 shrink-0">
              <span className="text-[10px] font-bold text-slate-500 block text-center">
                الإضاءة
              </span>
              <div
                className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden border-2 border-slate-300 cursor-pointer shadow-inner"
                onMouseDown={(e) => {
                  setIsLumDragging(true);
                  handleLumMove(e);
                }}
                onMouseMove={(e) => {
                  if (isLumDragging || e.buttons === 1) handleLumMove(e);
                }}
                onMouseUp={() => setIsLumDragging(false)}
                onTouchStart={(e) => {
                  setIsLumDragging(true);
                  handleLumMove(e);
                }}
                onTouchMove={(e) => {
                  if (isLumDragging) handleLumMove(e);
                }}
                onTouchEnd={() => setIsLumDragging(false)}
              >
                <canvas
                  ref={lumCanvasRef}
                  width={40}
                  height={180}
                  className="w-full h-full block"
                />

                {/* Arrow slider indicator on the edge */}
                <div
                  className="absolute pointer-events-none -translate-y-1/2 inset-x-0 flex items-center justify-between px-0.5"
                  style={{ top: `${lumPos * 100}%` }}
                >
                  <span className="w-0 h-0 border-y-4 border-y-transparent border-l-6 border-l-black drop-shadow-xs" />
                  <span className="w-0 h-0 border-y-4 border-y-transparent border-r-6 border-r-black drop-shadow-xs" />
                </div>
              </div>
            </div>

          </div>

          {/* Lower Section: RGB Spinners + Split Comparison Box (Highlighted in user's image) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-200 items-center">
            
            {/* RGB Inputs (Raudona, Žalia, Mėlyna) */}
            <div className="sm:col-span-8 grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                  <span>الأحمر (R):</span>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                </label>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[0]}
                  onChange={(e) => handleRgbChange(0, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-center font-mono font-bold text-slate-900 focus:bg-white focus:border-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                  <span>الأخضر (G):</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </label>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[1]}
                  onChange={(e) => handleRgbChange(1, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-center font-mono font-bold text-slate-900 focus:bg-white focus:border-slate-800 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                  <span>الأزرق (B):</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </label>
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[2]}
                  onChange={(e) => handleRgbChange(2, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-xs text-center font-mono font-bold text-slate-900 focus:bg-white focus:border-slate-800 outline-none"
                />
              </div>
            </div>

            {/* Split Comparison Box: New (Nauja) vs Current (Dabartinė) - highlighted with magenta border in reference */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-slate-500 mb-1">
                مقارنة اللون:
              </span>
              
              <div className="w-full h-16 rounded-xl overflow-hidden border-2 border-purple-500 shadow-sm flex flex-col">
                {/* Top Half: New Color (Nauja) */}
                <div
                  className="flex-1 flex items-center justify-between px-2 text-[10px] font-bold text-white drop-shadow-xs"
                  style={{ backgroundColor: currentHex }}
                >
                  <span className="bg-black/30 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px]">الجديد</span>
                  <span className="font-mono text-[9px] bg-black/30 backdrop-blur-xs px-1.5 py-0.5 rounded">{currentHex}</span>
                </div>

                {/* Bottom Half: Current Color (Dabartinė) */}
                <button
                  type="button"
                  onClick={() => {
                    const prevRgb = hexToRgb(initialColorRef.current);
                    const prevHsl = rgbToHsl(prevRgb[0], prevRgb[1], prevRgb[2]);
                    commitColor(prevRgb, prevHsl);
                  }}
                  className="flex-1 flex items-center justify-between px-2 text-[10px] font-bold text-white drop-shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: initialColorRef.current }}
                  title="انقر لاستعادة اللون الأصلي السابق"
                >
                  <span className="bg-black/30 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] flex items-center gap-1">
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>الحالي</span>
                  </span>
                  <span className="font-mono text-[9px] bg-black/30 backdrop-blur-xs px-1.5 py-0.5 rounded">{initialColorRef.current}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Standard Palette Tab (Standartinės) */
        <div className="space-y-2 py-1">
          <span className="text-[11px] font-bold text-slate-600 block">
            اختر لوناً من شبكة الألوان القياسية:
          </span>
          <div className="space-y-1.5">
            {STANDARD_PALETTE.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-8 gap-1.5">
                {row.map((itemHex, colIdx) => {
                  const isSelected = currentHex.toUpperCase() === itemHex.toUpperCase();
                  return (
                    <button
                      key={colIdx}
                      type="button"
                      onClick={() => {
                        const newRgb = hexToRgb(itemHex);
                        const newHsl = rgbToHsl(newRgb[0], newRgb[1], newRgb[2]);
                        commitColor(newRgb, newHsl);
                      }}
                      style={{ backgroundColor: itemHex }}
                      className={`h-7 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? 'border-purple-600 ring-2 ring-purple-300 scale-105 z-10 shadow-xs'
                          : 'border-slate-300 hover:scale-110'
                      }`}
                      title={itemHex}
                    >
                      {isSelected && (
                        <Check className={`w-3.5 h-3.5 drop-shadow-xs font-bold ${itemHex === '#FFFFFF' || itemHex === '#FFFBEB' || itemHex === '#FEF3C7' ? 'text-slate-900' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span>اللون المحدد حالياً:</span>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md border border-slate-300" style={{ backgroundColor: currentHex }} />
              <span className="font-mono text-xs">{currentHex}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
