/**
 * The <i>Path</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Path {

  tick: number;
  x: number;
  y: number;
  scale: number;
  ticks: number;
  private mode: PathMode;
  private _from: PathCoordinates;
  private _to: PathCoordinates;
  private callbacks: ((x: number, y: number, scale: number, lerp: number) => void)[];

  /** @constructor */
  constructor() {
    this.callbacks = [];
    this.x = 0;
    this.y = 0;
    this.scale = 1;
  }

  update(): void {
    if (this._to != null) {
      this.tick++;
      const lerp = this.tick / this.ticks;
      if (!isNaN(lerp) && isFinite(lerp)) {
        let tickLerpFactor;
        if (this.mode == PathMode.EASE_IN) {
          tickLerpFactor = Path.easeIn(lerp);
        } else if (this.mode == PathMode.EASE_OUT) {
          tickLerpFactor = Path.easeOut(lerp);
        } else if (this.mode == PathMode.EASE_IN_OUT) {
          tickLerpFactor = Path.easeInOut(lerp);
        } else if (this.mode === PathMode.LINEAR) {
          tickLerpFactor = lerp;
        }

        if (this._to.x != null) {
          this.x = Path.lerp(this._from.x, this._to.x, tickLerpFactor);
        } else {
          this.x = null;
        }
        if (this._to.y != null) {
          this.y = Path.lerp(this._from.y, this._to.y, tickLerpFactor);
        } else {
          this.y = null;
        }
        if (this._to.scale != null) {
          this.scale = Path.lerp(this._from.scale, this._to.scale, tickLerpFactor);
        } else {
          this.scale = null;
        }
        if (this.callbacks != null) {
          for (let index = 0; index < this.callbacks.length; index++) {
            this.callbacks[index](this.x, this.y, this.scale, lerp);
          }
        }
      }
      if (this.tick >= this.ticks) {
        this.resetTo(this._to);
      }
    }
  }

  to(
    to: PathCoordinates,
    callbacks: [(x: number, y: number, scale: number, lerp: number) => void] = null,
    ticks: number = 60,
    mode: PathMode = PathMode.LINEAR
  ): void {
    if (to.x == this.x && to.y == this.y && this.scale == to.scale) {
      return;
    }
    this._to = {x: to.x, y: to.y, scale: to.scale};
    if (to.x == this.x) {
      this._to.x = null;
    }
    if (to.y == this.y) {
      this._to.y = null;
    }
    if (to.scale == this.scale) {
      this._to.scale = null;
    }
    if (ticks == 0) {
      ticks = 1;
    }
    this.callbacks = callbacks;
    this._from = {x: this.x, y: this.y, scale: this.scale};
    this.tick = 0;
    this.ticks = ticks;
    this.mode = mode;
  }

  private static checkNumber(value: number): void {
    if (value == null || isNaN(value) || !isFinite(value)) {
      throw new Error('Number as NULL, NaN, or Infinite: ' + value);
    }
  }

  public static easeInOut(t: number): number {
    this.checkNumber(t);
    return t > 0.5 ? 4 * Math.pow((t - 1), 3) + 1 : 4 * Math.pow(t, 3);
  }

  public static easeIn(t: number): number {
    this.checkNumber(t);
    return 1.0 - Math.cos(t * Math.PI * 0.5);
  }

  public static easeOut(t: number): number {
    this.checkNumber(t);
    return Math.sin(t * Math.PI * 0.5);
  }

  public static lerp(start: number, stop: number, percent: number): number {
    this.checkNumber(start);
    this.checkNumber(stop);
    this.checkNumber(percent);
    if (start == stop) {
      return start;
    }
    return start + percent * (stop - start);
  }

  public static unlerp(start: number, stop: number, value: number): number {
    this.checkNumber(start);
    this.checkNumber(stop);
    this.checkNumber(value);
    if (value == stop || start == stop) {
      return 1;
    }
    const swap = start > stop;
    if (swap) {
      let temp = start;
      start = stop;
      stop = temp;
    }
    if (swap) {
      return 1.0 - (value - start) / (stop - start);
    } else {
      return (value - start) / (stop - start);
    }
  }

  cancel(x: boolean | number = true, y: boolean | number = true, scale: boolean | number = true) {
    if (this._to == null) {
      return;
    }
    if ((typeof x === 'boolean' && x) || typeof x === 'number') {
      if (typeof x === 'number') {
        this.x = x;
      }
      this._to.x = null;
    }
    if ((typeof y === 'boolean' && y) || typeof y === 'number') {
      if (typeof y === 'number') {
        this.y = y;
      }
      this._to.y = null;
    }
    if ((typeof scale === 'boolean' && scale) || typeof scale === 'number') {
      if (typeof scale === 'number') {
        this.scale = scale;
      }
      this._to.scale = null;
    }
  }

  resetTo(coordinates: PathCoordinates) {
    if (coordinates.x != null) {
      this.x = coordinates.x;
    }
    if (coordinates.y != null) {
      this.y = coordinates.y;
    }
    if (coordinates.scale != null) {
      this.scale = coordinates.scale;
    }
    if (this.callbacks != null && this.callbacks.length !== 0) {
      for (let index = 0; index < this.callbacks.length; index++) {
        this.callbacks[index](this.x, this.y, this.scale, 1);
      }
    }
    this._from = null;
    this._to = null;
    this.callbacks = null;
    this.mode = null;
    this.tick = 0;
    this.ticks = 0;
  }

  isActive(): boolean {
    return this._to != null;
  }
}

/**
 * The <i>PathMode</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum PathMode {
  LINEAR = 'linear',
  EASE_OUT = 'ease_out',
  EASE_IN = 'ease_in',
  EASE_IN_OUT = 'ease_in_out'
}

/**
 * The <i>PathCoordinates</i> interface. TODO: Document.
 *
 * @author Jab
 */
export interface PathCoordinates {
  x: number;
  y: number;
  scale: number;
}
