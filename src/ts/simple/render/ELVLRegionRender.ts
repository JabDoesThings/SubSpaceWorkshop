import * as PIXI from "pixi.js";

import { ELVLRegion } from '../../io/ELVL';
import { MapRenderer } from './MapRenderer';

/**
 * The <i>TileEntry</i> interface. TODO: Document.
 *
 * @author Jab
 */
interface TileEntry {
  index: number;
  x: number;
  y: number;
}

/**
 * The <i>ELVLRegionRender</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegionRender {

  private entries: TileEntry[];

  private region: ELVLRegion;

  container: PIXI.Container;

  private bounds: PIXI.Rectangle;
  private view: MapRenderer;

  /**
   * Main constructor.
   *
   * @param {MapRenderer} view
   * @param {ELVLRegion} region The region to render.
   */
  constructor(view: MapRenderer, region: ELVLRegion) {
    this.view = view;
    this.region = region;
    this.entries = [];
    this.container = new PIXI.Container();
    this.container.cacheAsBitmap = true;
    this.bounds = new PIXI.Rectangle(0, 0, 0, 0);
    this.compile();
  }

  update(): void {
    const camera = this.view.camera;

    if (camera.isDirty()) {
      const cpos = camera.position;
      const cx = cpos.x * 16;
      const cy = cpos.y * 16;
      const scale = cpos.scale;
      const invScale = 1 / scale;
      const sw = this.view.app.screen.width;
      const sh = this.view.app.screen.height;
      const sw2 = (sw / 2) * invScale;
      const sh2 = (sh / 2) * invScale;

      const x1 = this.bounds.x;
      const y1 = this.bounds.y;
      const cx1 = cx - sw2;
      const cy1 = cy - sh2;

      this.container.x = Math.floor(x1 - cx1) * scale;
      this.container.y = Math.floor(y1 - cy1) * scale;
      this.container.scale.x = scale;
      this.container.scale.y = scale;
    }
  }

  private compile(): void {
    const tileData = this.region.tileData;
    const tiles = tileData.tiles;

    let minX = 999999;
    let minY = 999999;
    let maxX = -999999;
    let maxY = -999999;

    this.entries = [];

    for (let y = 0; y < 1024; y++) {
      for (let x = 0; x < 1024; x++) {
        if (tiles[x][y]) {
          const entry = {
            x: x,
            y: y,
            index: this.entries.length
          };
          this.entries.push(entry);
          if (x < minX) {
            minX = x;
          }
          if (x > maxX) {
            maxX = x;
          }
          if (y < minY) {
            minY = y;
          }
          if (y > maxY) {
            maxY = y;
          }
        }
      }
    }

    if (this.entries.length != 0) {
      this.bounds.x = minX;
      this.bounds.y = minY;
      this.bounds.width = maxX - minX;
      this.bounds.height = maxY - minY;
    } else {
      this.bounds.x = 0;
      this.bounds.y = 0;
      this.bounds.width = 0;
      this.bounds.height = 0;
    }

    this.draw();
  }

  private draw() {
    this.container.removeChildren();
    const x1 = this.bounds.x;
    const y1 = this.bounds.y;
    const c = this.region.color;
    const color = (255 & 0xFF) << 24 | (c[0] & 0xFF) << 16 | (c[1] & 0xFF) << 8 | (c[2] & 0xFF);
    let index = 0;
    while (index < this.entries.length) {
      const g = new PIXI.Graphics();
      let gIndex = 0;

      while (gIndex < 0x1000) {
        const next = this.entries[index++];
        g.beginFill(color);
        g.drawRect(-x1 + (next.x * 16), -y1 + (next.y * 16), 16, 16);
        g.endFill();
        gIndex++;
        if (index == this.entries.length) {
          break;
        }
      }
      this.container.addChild(g);
    }
  }

  /** @return {ELVLRegion} Returns the ELVLRegion rendered. */
  getRegion(): ELVLRegion {
    return this.region;
  }

  /**
   * @param {ELVLRegion} region
   */
  setRegion(region: ELVLRegion): void {
    if (this.region === region) {
      return;
    }
    this.region = region;
  }
}
