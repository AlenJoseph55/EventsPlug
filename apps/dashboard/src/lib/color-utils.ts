export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleanHex = hex.replace(/^#/, '');
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return '#' + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1);
}

export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Convert OKLCH to sRGB
export function oklchToRgb(l: number, c: number, h: number): { r: number; g: number; b: number } {
  // Convert hue angle to radians
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const bVal = c * Math.sin(hRad);

  // OKLab to LMS
  const l_ = l + 0.3963377774 * a + 0.2158037573 * bVal;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * bVal;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * bVal;

  // LMS linear
  const lLinear = l_ * l_ * l_;
  const mLinear = m_ * m_ * m_;
  const sLinear = s_ * s_ * s_;

  // LMS to linear sRGB
  const rL = +4.0767416621 * lLinear - 3.3077115913 * mLinear + 0.2309699292 * sLinear;
  const gL = -1.2684380046 * lLinear + 2.6097574011 * mLinear - 0.3413193965 * sLinear;
  const bL = -0.0041960863 * lLinear - 0.7034186142 * mLinear + 1.7076147004 * sLinear;

  // Gamma correction
  const gamma = (val: number) => {
    return val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };

  const r = Math.max(0, Math.min(255, Math.round(gamma(rL) * 255)));
  const g = Math.max(0, Math.min(255, Math.round(gamma(gL) * 255)));
  const b = Math.max(0, Math.min(255, Math.round(gamma(bL) * 255)));

  return { r, g, b };
}

export function oklchToHex(l: number, c: number, h: number): string {
  const { r, g, b } = oklchToRgb(l, c, h);
  return rgbToHex(r, g, b);
}

export function getContrastAdjustedOklch(
  l: number,
  c: number,
  h: number,
  bgHex: string
): { l: number; c: number; h: number; hex: string } {
  let currentL = l;
  let currentHex = oklchToHex(currentL, c, h);
  let ratio = getContrastRatio(currentHex, bgHex);

  if (ratio >= 4.5) {
    return { l: currentL, c, h, hex: currentHex };
  }

  const bgRgb = hexToRgb(bgHex);
  const bgL = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const shouldLighten = bgL < 0.5;

  const adjustment = 0.02;
  let attempts = 0;
  while (ratio < 4.5 && attempts < 50) {
    if (shouldLighten) {
      currentL = Math.min(1.0, currentL + adjustment);
      if (currentL >= 1.0) break;
    } else {
      currentL = Math.max(0.0, currentL - adjustment);
      if (currentL <= 0.0) break;
    }
    currentHex = oklchToHex(currentL, c, h);
    ratio = getContrastRatio(currentHex, bgHex);
    attempts++;
  }

  return { l: currentL, c, h, hex: currentHex };
}

export interface PaletteIntent {
  baseMode?: "dark" | "light" | "auto" | string | null;
  accentHue?: number | null;
  accentChroma?: number | null;
  surfaceTone?: "deep" | "mid" | "soft" | string | null;
  skinId?: "frosted" | "sharp" | "soft" | "retro" | string | null;
  fontPairingId?: string | null;
  cssVariables?: any;
}

export interface DerivedPalette {
  primaryColor: string;
  bgColor: string;
  textColor: string;
  textSecondary: string;
  cardBg: string;
  cardBorder: string;
  gridLineColor: string;
  gridOpacity: number;
  radiusCard: string;
  shadowCard: string;
  fontDisplay: string;
  fontBody: string;
  baseMode: string;
  accentHue: number;
  accentChroma: number;
  surfaceTone: string;
  skinId: string;
  fontPairingId: string;
}

function getFontVariables(pairingId: string) {
  const p = pairingId || 'inter-inter';
  switch (p) {
    case 'outfit-inter':
    case 'outfit-sans':
      return { display: 'var(--font-outfit)', body: 'var(--font-inter)' };
    case 'space-inter':
    case 'space-sans':
      return { display: 'var(--font-space-grotesk)', body: 'var(--font-inter)' };
    case 'fira-inter':
    case 'fira-sans':
      return { display: 'var(--font-fira-code)', body: 'var(--font-inter)' };
    case 'inter-mono':
      return { display: 'var(--font-inter)', body: 'var(--font-fira-code)' };
    case 'inter-inter':
    default:
      return { display: 'var(--font-inter)', body: 'var(--font-inter)' };
  }
}

function getSkinStyles(skinId: string, primaryColor: string, textColor: string, mode: "dark" | "light") {
  const s = skinId || 'frosted';
  switch (s) {
    case 'sharp':
      return {
        radiusCard: '0px',
        shadowCard: `4px 4px 0px 0px ${textColor}`,
        cardBorder: `2.5px solid ${textColor}`,
      };
    case 'soft':
      return {
        radiusCard: '24px',
        shadowCard: mode === 'light' ? '0 10px 30px -10px rgba(0,0,0,0.08)' : '0 10px 30px -10px rgba(0,0,0,0.4)',
        cardBorder: 'none',
      };
    case 'retro':
      return {
        radiusCard: '4px',
        shadowCard: `0 0 10px ${primaryColor}40`,
        cardBorder: `1px solid ${primaryColor}`,
      };
    case 'frosted':
    default:
      return {
        radiusCard: '16px',
        shadowCard: mode === 'light' ? '0 8px 32px 0 rgba(31, 38, 135, 0.05)' : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        cardBorder: mode === 'light' ? '1px solid rgba(15, 23, 42, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)',
      };
  }
}

function getBackgroundOklch(surfaceTone: string, mode: "dark" | "light", hue: number): { l: number; c: number; h: number } {
  const t = surfaceTone || 'mid';
  if (mode === 'light') {
    switch (t) {
      case 'soft':
      case 'neutral':
        return { l: 0.98, c: 0.005, h: hue };
      case 'mid':
        return { l: 0.96, c: 0.008, h: hue };
      case 'deep':
      case 'tinted':
      default:
        return { l: 0.94, c: 0.012, h: hue };
    }
  } else {
    switch (t) {
      case 'deep':
        return { l: 0.06, c: 0.008, h: hue };
      case 'mid':
      case 'neutral':
        return { l: 0.10, c: 0.012, h: hue };
      case 'soft':
      case 'tinted':
      default:
        return { l: 0.14, c: 0.016, h: hue };
    }
  }
}

export function deriveThemeVariables(
  intent: PaletteIntent,
  mode: "dark" | "light"
): DerivedPalette {
  // Check if new semantic fields are null/undefined (defensive migration fallback)
  let baseMode = intent.baseMode;
  let accentHue = intent.accentHue;
  let accentChroma = intent.accentChroma;
  let surfaceTone = intent.surfaceTone;
  let skinId = intent.skinId;
  let fontPairingId = intent.fontPairingId;

  const isLegacy = (accentHue === undefined || accentHue === null);

  if (isLegacy) {
    // Fall back to system defaults
    baseMode = 'dark';
    accentHue = 250;
    accentChroma = 0.18;
    surfaceTone = 'mid';
    skinId = 'frosted';
    fontPairingId = 'inter-inter';
  } else {
    baseMode = baseMode || 'dark';
    accentHue = typeof accentHue === 'number' ? accentHue : 250;
    accentChroma = typeof accentChroma === 'number' ? accentChroma : 0.18;
    surfaceTone = surfaceTone || 'mid';
    skinId = skinId || 'frosted';
    fontPairingId = fontPairingId || 'inter-inter';
  }

  // Derive background color
  const bgOklch = getBackgroundOklch(surfaceTone, mode, accentHue);
  const bgColor = oklchToHex(bgOklch.l, bgOklch.c, bgOklch.h);

  // Contrast adjusted accent color (primaryColor)
  const baseL = mode === 'dark' ? 0.65 : 0.50;
  const accentAdjusted = getContrastAdjustedOklch(baseL, accentChroma, accentHue, bgColor);
  const primaryColor = accentAdjusted.hex;

  // Determine text colors
  let textColor: string;
  let textSecondary: string;
  if (mode === 'dark') {
    textColor = oklchToHex(0.98, 0.004, accentHue);
    textSecondary = oklchToHex(0.75, 0.012, accentHue);
  } else {
    textColor = oklchToHex(0.15, 0.012, accentHue);
    textSecondary = oklchToHex(0.45, 0.015, accentHue);
  }

  // Card settings
  const skinStyles = getSkinStyles(skinId, primaryColor, textColor, mode);
  
  let cardBg: string;
  if (mode === 'dark') {
    cardBg = skinId === 'frosted' ? 'rgba(255, 255, 255, 0.045)' : 'rgba(255, 255, 255, 0.025)';
  } else {
    cardBg = skinId === 'sharp' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.75)';
  }

  // Font settings
  const fonts = getFontVariables(fontPairingId);

  // Grid settings
  const gridLineColor = mode === 'dark' ? '255, 255, 255' : '0, 0, 0';
  const gridOpacity = mode === 'dark' ? 0.035 : 0.04;

  return {
    primaryColor,
    bgColor,
    textColor,
    textSecondary,
    cardBg,
    cardBorder: skinStyles.cardBorder,
    gridLineColor,
    gridOpacity,
    radiusCard: skinStyles.radiusCard,
    shadowCard: skinStyles.shadowCard,
    fontDisplay: fonts.display,
    fontBody: fonts.body,
    baseMode,
    accentHue,
    accentChroma,
    surfaceTone,
    skinId,
    fontPairingId,
  };
}

