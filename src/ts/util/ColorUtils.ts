import { clamp } from './MathUtil';

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 1].
 *
 * @param {{h: number, s: number, l: number}} color
 * @return {{r: number, g: number, b: number}}
 */
export const HSL2RGB = (color: { h: number, s: number, l: number }): { r: number, g: number, b: number } => {
  let r: number;
  let g: number;
  let b: number;
  let h = color.h;
  let s = color.s;
  let l = color.l;
  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1 / 2) {
        return q;
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
      }
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {r, g, b};
};

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 1] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {{r: number, g: number, b: number}} color
 * @return  {{h: number, s: number, l: number}}
 */
export const RGB2HSL = (color: { r: number, g: number, b: number }): { h: number, s: number, l: number } => {
  let r = color.r;
  let g = color.g;
  let b = color.b;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max == min) {
    h = s = 0; // achromatic
  } else {
    let d = max - min;
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
  return {h, s, l};
};

export const asRGB255 = (color: { r: number, g: number, b: number }): { r: number, g: number, b: number } => {
  return {
    r: Math.round(color.r * 255.0),
    g: Math.round(color.g * 255.0),
    b: Math.round(color.b * 255.0)
  };
};

export const asRGBFloat = (color: { r: number, g: number, b: number }): { r: number, g: number, b: number } => {
  return {
    r: color.r / 255.0,
    g: color.g / 255.0,
    b: color.b / 255.0
  };
};

export const asRGBA255 = (color: { r: number, g: number, b: number, a: number }): { r: number, g: number, b: number, a: number } => {
  return {
    r: Math.round(color.r * 255.0),
    g: Math.round(color.g * 255.0),
    b: Math.round(color.b * 255.0),
    a: Math.round(color.a * 255.0)
  };
};

export const asRGBAFloat = (color: { r: number, g: number, b: number, a: number }): { r: number, g: number, b: number, a: number } => {
  return {
    r: color.r / 255.0,
    g: color.g / 255.0,
    b: color.b / 255.0,
    a: color.a / 255.0
  };
};

export const clampRGB255 = (color: { r: number, g: number, b: number }): { r: number, g: number, b: number } => {
  return {
    r: clamp(color.r, 0, 255.0),
    g: clamp(color.g, 0, 255.0),
    b: clamp(color.b, 0, 255.0)
  };
};

export const clampRGB = (color: { r: number, g: number, b: number }): { r: number, g: number, b: number } => {
  return {
    r: clamp(color.r, 0, 1),
    g: clamp(color.g, 0, 1),
    b: clamp(color.b, 0, 1)
  };
};

export const clampRGBA255 = (color: { r: number, g: number, b: number, a: number }): { r: number, g: number, b: number, a: number } => {
  return {
    r: clamp(color.r, 0, 255.0),
    g: clamp(color.g, 0, 255.0),
    b: clamp(color.b, 0, 255.0),
    a: clamp(color.a, 0, 255.0)
  };
};

export const clampRGBA = (color: { r: number, g: number, b: number, a: number }): { r: number, g: number, b: number, a: number } => {
  return {
    r: clamp(color.r, 0, 1),
    g: clamp(color.g, 0, 1),
    b: clamp(color.b, 0, 1),
    a: clamp(color.a, 0, 1)
  };
};
