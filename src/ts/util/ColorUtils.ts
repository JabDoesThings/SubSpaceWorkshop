/**
 * @param {number} h
 * @param {number} s
 * @param {number} v
 */
export const HSVtoRGB = (h: number, s: number, v: number): { r: number, g: number, b: number } => {
  let r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
};

/**
 * @param {number} r
 * @param {number} g
 * @param {number} b
 */
export const RGBtoHSV = (r: number, g: number, b: number): { h: number, s: number, v: number } => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b),
    d = max - min,
    s = (max === 0 ? 0 : d / max),
    v = max / 255;
  let h;

  switch (max) {
    case min:
      h = 0;
      break;
    case r:
      h = (g - b) + d * (g < b ? 6 : 0);
      h /= 6 * d;
      break;
    case g:
      h = (b - r) + d * 2;
      h /= 6 * d;
      break;
    case b:
      h = (r - g) + d * 4;
      h /= 6 * d;
      break;
  }
  return {
    h: h,
    s: s,
    v: v
  };
};
