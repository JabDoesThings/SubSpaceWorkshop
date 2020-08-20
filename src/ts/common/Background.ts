// eslint no-unused-vars: "off"

import * as PIXI from 'pixi.js';
import { MapRenderer } from '../editor/render/MapRenderer';
import { SeededRandom } from '../util/SeededRandom';
import type { Project } from '../editor/Project';
import type { Renderer } from './Renderer';

/**
 * The <i>Background</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Background extends PIXI.Container {
  view: Renderer;
  project: Project;
  g: PIXI.Graphics;
  texLayer: BackgroundObjectLayer;
  random: SeededRandom;
  private readonly layer1: StarFieldLayer;
  private readonly layer2: StarFieldLayer;
  private lw: number;
  private lh: number;
  private dirty: boolean = true;

  /**
   * @constructor
   *
   * @param {Project} project
   * @param {Renderer} view
   * @param {number} seed
   */
  constructor(project: Project, view: Renderer, seed: number) {
    super();

    this.project = project;
    this.view = view;
    this.random = new SeededRandom(seed);

    this.filters = [];
    this.filterArea = view.app.screen;

    this.g = new PIXI.Graphics();
    this.lw = -1;
    this.lh = -1;

    this.layer1 = new StarFieldLayer(this, 0x606060, 8);
    this.layer2 = new StarFieldLayer(this, 0xB8B8B8, 6);
    this.texLayer = new BackgroundObjectLayer(this);

    this.draw();

    this.addChild(this.layer1);
    this.addChild(this.layer2);
    this.addChild(this.texLayer);
  }

  /**
   * Draws the background.
   */
  draw(): void {
    this.removeChildren();
    this.layer1.plotAndDraw();
    this.layer2.plotAndDraw();
    this.texLayer.draw();
    this.dirty = false;
  }

  /**
   * Updates the background.
   */
  update(): void {
    if (this.dirty) {
      this.draw();
    }

    const camera = this.view.camera;

    const screen = this.view.app.screen;
    if (screen.width != this.lw || screen.height != this.lh) {
      this.g.clear();
      this.g.beginFill(0x000000);
      this.g.drawRect(0, 0, screen.width, screen.height);
      this.g.endFill();

      this.lw = screen.width;
      this.lh = screen.height;
    }

    const scale = camera.position.scale;

    let alpha = 1;
    if (scale >= 0.25 && scale <= 0.5) {
      alpha = (scale - 0.25) * 4;
      if (alpha > 1) {
        alpha = 1;
      } else if (alpha < 0) {
        alpha = 0;
      }
    } else if (scale < 0.25) {
      alpha = 0;
    }
    this.alpha = alpha;

    if (this.alpha == 0) {
      return;
    }

    if (camera.isDirty()) {
      this.texLayer.update();
      const cpos = camera.position;
      const scale = cpos.scale;
      const invScale = 1 / scale;
      const sw2 = invScale * (this.view.app.screen.width / 2.0);
      const sh2 = invScale * (this.view.app.screen.height / 2.0);
      const cx = (cpos.x * 16);
      const cy = (cpos.y * 16);

      this.layer1.x = (sw2 + (-(cx / this.layer1._scale))) * scale;
      this.layer1.y = (sh2 + (-(cy / this.layer1._scale))) * scale;
      this.layer1.scale.x = scale;
      this.layer1.scale.y = scale;

      this.layer2.x = (sw2 + (-(cx / this.layer2._scale))) * scale;
      this.layer2.y = (sh2 + (-(cy / this.layer2._scale))) * scale;
      this.layer2.scale.x = scale;
      this.layer2.scale.y = scale;
    }

    this.dirty = false;
  }

  /**
   * Sets the seed for the background to generate background objects & stars.
   *
   * @param {number} seed The seed to set.
   */
  setSeed(seed: number) {
    this.random = new SeededRandom(seed);
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }
}

/**
 * The <i>BackgroundObjectLayer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class BackgroundObjectLayer extends PIXI.Container {
  private background: Background;

  _scale: number;

  /**
   * @constructor
   *
   * @param {Background} background
   */
  constructor(background: Background) {
    super();
    this.background = background;
    this._scale = 2;
    this.filters = [MapRenderer.chromaFilter];
    this.filterArea = this.background.view.app.screen;
  }

  /** Updates the background. */
  update(): void {
    const camera = this.background.view.camera;
    if (camera.isDirty()) {
      const cpos = camera.position;
      const cx = (cpos.x * 16) / this._scale;
      const cy = (cpos.y * 16) / this._scale;
      const scale = cpos.scale;
      const invScale = 1 / scale;

      const screen = this.background.view.app.screen;
      const sw = screen.width;
      const sh = screen.height;

      const sw2 = (sw / 2.0) * invScale;
      const sh2 = (sh / 2.0) * invScale;

      for (const key in this.children) {
        if (!Object.prototype.hasOwnProperty.call(this.children, key)) {
          continue;
        }

        const next = this.children[key];

        // @ts-ignore
        const _x = next._x;
        // @ts-ignore
        const _y = next._y;

        next.x = sw2 + (-cx) + _x;
        next.y = sh2 + (-cy) + _y;
        next.x *= scale;
        next.y *= scale;
        next.scale.x = scale;
        next.scale.y = scale;
      }
    }
  }

  /** Draws the background. */
  draw(): void {
    this.removeChildren();

    const outerRange = 1024;
    const minX = -outerRange * 4;
    const minY = -outerRange * 4;
    const maxX = 32768 / this._scale;
    const maxY = 32768 / this._scale;
    const dx = maxX - minX;
    const dy = maxY - minY;
    const random = this.background.random;
    const atlas = this.background.project.atlas;
    const bgs: PIXI.Texture[] = [];
    const stars: PIXI.Texture[] = [];

    const textures = atlas.getTextureAtlases();
    for (const key in textures) {
      if (key.toLowerCase().startsWith('bg')) {
        bgs.push(textures[key].texture);
      } else if (key.toLowerCase().startsWith('star')) {
        stars.push(textures[key].texture);
      }
    }

    for (let index = 0; index < 256; index++) {
      const textureId = Math.floor(random.nextDouble() * stars.length);
      const texture = stars[textureId];
      if (texture == null || !texture.valid) {
        continue;
      }

      const sprite = new PIXI.Sprite(texture);
      sprite.filters = [MapRenderer.chromaFilter];
      sprite.filterArea = this.background.view.app.screen;
      sprite.x = Math.floor(minX + (random.nextDouble() * dx));
      sprite.y = Math.floor(minY + (random.nextDouble() * dy));

      // @ts-ignore
      sprite._x = sprite.x;
      // @ts-ignore
      sprite._y = sprite.y;

      this.addChild(sprite);
    }

    for (let index = 0; index < 32; index++) {
      const textureId = Math.floor(random.nextDouble() * bgs.length);
      const texture = bgs[textureId];
      if (texture == null || !texture.valid) {
        continue;
      }

      const sprite = new PIXI.Sprite(texture);
      sprite.filters = [MapRenderer.chromaFilter];
      sprite.filterArea = this.background.view.app.screen;
      sprite.x = Math.floor(minX + (random.nextDouble() * dx));
      sprite.y = Math.floor(minY + (random.nextDouble() * dy));

      // @ts-ignore
      sprite._x = sprite.x;
      // @ts-ignore
      sprite._y = sprite.y;

      this.addChild(sprite);
    }
  }
}

/**
 * The <i>StarFieldLayer</i> class. TODO: Document.
 *
 * @author Jab
 */
export class StarFieldLayer extends PIXI.Container {
  _color: number;
  _scale: number;

  private background: Background;

  /**
   * @constructor
   *
   * @param {Background} background
   * @param {number} color
   * @param {number} scale
   */
  constructor(background: Background, color: number, scale: number) {
    super();

    this.background = background;
    this._color = color;
    this._scale = scale;
    this.filters = [MapRenderer.chromaFilter];
    this.filterArea = this.background.view.app.screen;
  }

  plotAndDraw() {
    const points = [];
    const outerRange = 1024;

    const minX = -outerRange * 4;
    const minY = -outerRange * 4;
    const maxX = 32768 / this._scale;
    const maxY = 32768 / this._scale;
    const dx = maxX - minX;
    const dy = maxY - minY;

    for (let index = 0; index < 32768; index++) {
      const x = Math.floor(minX + (Math.random() * dx));
      const y = Math.floor(minY + (Math.random() * dy));
      points.push([x, y]);
    }

    this.removeChildren();
    const g = new PIXI.Graphics();
    g.beginFill(this._color);
    for (let index = 0; index < points.length; index++) {
      const next = points[index];
      // Draw each pixel for the star.
      g.drawRect(next[0], next[1], 1, 1);
    }
    g.endFill();
    this.addChild(g);
  }
}
