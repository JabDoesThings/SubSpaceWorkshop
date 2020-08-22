import * as PIXI from "pixi.js";
import MapRenderer from '../../editor/render/MapRenderer';
import Background from './Background';

/**
 * The <i>BackgroundObjectLayer</i> class. TODO: Document.
 *
 * @author Jab
 */
class BackgroundObjectLayer extends PIXI.Container {
  _scale: number;
  private background: Background;

  /**
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

export default BackgroundObjectLayer;
