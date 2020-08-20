import { Path } from '../../../util/Path';

class PaletteColor {
  r: number;
  g: number;
  b: number;
  a: number;
  color: string;

  /**
   * @constructor
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {number} a
   * @param {boolean} use255
   */
  constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1, use255: boolean = false) {
    if (use255) {
      this.set255(r, g, b, a);
    } else {
      this.set(r, g, b, a);
    }
  }

  /**
   * @constructor
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @param {number} a
   */
  set(r: number, g: number, b: number, a: number = 1): void {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.clamp();
    this.compile();
  }

  get255(): { r: number, g: number, b: number, a: number } {
    return {
      r: Math.floor(this.r * 255.0),
      g: Math.floor(this.g * 255.0),
      b: Math.floor(this.b * 255.0),
      a: Math.floor(this.a * 255.0)
    };
  }

  set255(r: number, g: number, b: number, a: number = 255): void {
    this.r = r / 255.0;
    this.g = g / 255.0;
    this.b = b / 255.0;
    this.a = a / 255.0;
    this.clamp();
    this.compile();
  }

  private compile(): void {
    const _255 = this.get255();
    this.color = `rgba(${_255.r},${_255.g},${_255.b},${this.a})`;
  }

  toString(alpha: number = null): string {
    if (alpha == null) {
      alpha = this.a;
    }
    const r = Math.floor(this.r * 255.0);
    const g = Math.floor(this.g * 255.0);
    const b = Math.floor(this.b * 255.0);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  clone(): PaletteColor {
    return new PaletteColor(this.r, this.g, this.b, this.a);
  }

  lerp(other: PaletteColor, value: number): PaletteColor {
    if (value <= 0) {
      return this.clone();
    } else if (value >= 1) {
      return other.clone();
    }

    const r = Path.lerp(this.r, other.r, value);
    const g = Path.lerp(this.g, other.g, value);
    const b = Path.lerp(this.b, other.b, value);
    const a = Path.lerp(this.a, other.a, value);
    return new PaletteColor(r, g, b, a);
  }

  private clamp() {
    if (this.r > 1) {
      this.r = 1;
    } else if (this.r < 0) {
      this.r = 0;
    }
    if (this.g > 1) {
      this.g = 1;
    } else if (this.g < 0) {
      this.g = 0;
    }
    if (this.b > 1) {
      this.b = 1;
    } else if (this.b < 0) {
      this.b = 0;
    }
    if (this.a > 1) {
      this.a = 1;
    } else if (this.a < 0) {
      this.a = 0;
    }
  }
}

export default PaletteColor;
