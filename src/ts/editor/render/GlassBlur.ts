import MapRenderer from './MapRenderer';

import { MathUtils } from 'three';
import ColorMatrixFilter = PIXI.filters.ColorMatrixFilter;
import BlurFilter = PIXI.filters.BlurFilter;
import NoiseFilter = PIXI.filters.NoiseFilter;
import lerp = MathUtils.lerp;

const lerpRGB = (color1: number[], color2: number[], _lerp: number) => {
  return [lerp(color1[0], color2[0], _lerp), lerp(color1[1], color2[1], _lerp), lerp(color1[2], color2[2], _lerp)];
};

export default class GlassBlur {
  private renderer: MapRenderer;
  private lerp: number = 0;
  private toggle: boolean = false;
  private lerpStep = 0.1;

  // Lerp values.
  private saturate = [0, -0.7];
  private brightness = [1, 1.1];
  private contrast = [0, 0.4];
  private blur = [0, 6];
  private noise = [0, 0.15];

  // Filters.
  private readonly colorMatrixFilter: PIXI.filters.ColorMatrixFilter;
  private readonly blurFilter: PIXI.filters.BlurFilter;
  private readonly noiseFilter: PIXI.filters.NoiseFilter;
  private readonly filters: PIXI.Filter[];
  private backgroundColor = [[0, 0, 0], [4, 4, 5]];

  constructor(renderer: MapRenderer) {
    this.renderer = renderer;
    this.colorMatrixFilter = new ColorMatrixFilter();
    this.blurFilter = new BlurFilter(0, 5);
    this.noiseFilter = new NoiseFilter(0, 0.5);
    this.filters = [this.colorMatrixFilter, this.noiseFilter, this.blurFilter];
    this.set();
  }

  apply(container: PIXI.Container): void {
    container.filters = this.filters;
    container.filterArea = this.renderer.app.renderer.screen;
  }

  onUpdate(): void {
    let change = false;
    if (this.toggle && this.lerp < 1) {
      this.lerp += this.lerpStep;
      if (this.lerp > 1) {
        this.lerp = 1;
      }
      change = true;
    } else if (!this.toggle && this.lerp > 0) {
      this.lerp -= this.lerpStep;
      if (this.lerp < 0) {
        this.lerp = 0;
      }
      change = true;
    }

    if (change) {
      this.set();
    }
  }

  private set() {
    this.colorMatrixFilter.reset();
    this.colorMatrixFilter.saturate(lerp(this.saturate[0], this.saturate[1], this.lerp), true);
    this.colorMatrixFilter.brightness(lerp(this.brightness[0], this.brightness[1], this.lerp), true);
    this.colorMatrixFilter.contrast(lerp(this.contrast[0], this.contrast[1], this.lerp), true);
    this.blurFilter.blur = lerp(this.blur[0], this.blur[1], this.lerp);
    this.noiseFilter.noise = lerp(this.noise[0], this.noise[1], this.lerp);

    if (this.renderer.app) {
      const lerpColor = lerpRGB(this.backgroundColor[0], this.backgroundColor[1], this.lerp);
      this.renderer.app.renderer.backgroundColor = (1 << 24) + (lerpColor[0] << 16) + (lerpColor[1] << 8) + lerpColor[2];
    }

    if (this.lerp === 0) {
      this.colorMatrixFilter.enabled = false;
      this.noiseFilter.enabled = false;
      this.blurFilter.enabled = false;
    } else {
      this.colorMatrixFilter.enabled = true;
      this.noiseFilter.enabled = true;
      this.blurFilter.enabled = true;
    }
  }

  enable(ticks: number = 5): void {
    this.lerpStep = 1 / ticks;
    this.toggle = true;
  }

  disable(ticks: number = 5): void {
    this.lerpStep = 1 / ticks;
    this.toggle = false;
  }
}
