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

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h, s, l };
}

export function hslToRgb(h: number, s: number, l: number) {
  let r = l;
  let g = l;
  let b = l;

  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function getContrastAdjustedColor(accentHex: string, bgHex: string = '#090d16'): string {
  if (!/^#[0-9A-Fa-f]{6}$/.test(accentHex)) return accentHex;
  if (!/^#[0-9A-Fa-f]{6}$/.test(bgHex)) bgHex = '#090d16';

  let currentHex = accentHex;
  let ratio = getContrastRatio(currentHex, bgHex);

  if (ratio >= 4.5) {
    return currentHex;
  }

  const rgb = hexToRgb(currentHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const bgRgb = hexToRgb(bgHex);
  const bgL = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const shouldLighten = bgL < 0.5;

  const adjustment = 0.02;
  let attempts = 0;
  while (ratio < 4.5 && attempts < 50) {
    if (shouldLighten) {
      hsl.l = Math.min(1.0, hsl.l + adjustment);
      if (hsl.l >= 1.0) break;
    } else {
      hsl.l = Math.max(0.0, hsl.l - adjustment);
      if (hsl.l <= 0.0) break;
    }
    const newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
    currentHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    ratio = getContrastRatio(currentHex, bgHex);
    attempts++;
  }
  return currentHex;
}
