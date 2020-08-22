import * as PIXI from "pixi.js";
import MapRenderer from './MapRenderer';

/**
 * The <i>MapGrid</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class MapGrid extends PIXI.Container {
  scalePrevious: number = -1;
  renderBaseGrid: boolean;
  renderAxisLines: boolean;
  renderBorderLines: boolean;
  renderChunkGrid: boolean;
  private view: MapRenderer;
  private readonly baseGrid: PIXI.Graphics;
  private readonly chunkGrid: PIXI.Graphics;
  private readonly axisLines: PIXI.Graphics;
  private readonly borderLines: PIXI.Graphics;

  /**
   * @param {MapRenderer} view
   */
  constructor(view: MapRenderer) {
    super();
    this.view = view;
    this.cacheAsBitmap = false;
    this.renderBaseGrid = true;
    this.renderAxisLines = true;
    this.renderBorderLines = true;
    this.renderChunkGrid = true;
    this.baseGrid = new PIXI.Graphics();
    this.chunkGrid = new PIXI.Graphics();
    this.axisLines = new PIXI.Graphics();
    this.borderLines = new PIXI.Graphics();
    this.addChild(this.baseGrid);
    this.addChild(this.chunkGrid);
    this.addChild(this.axisLines);
    this.addChild(this.borderLines);
    this.drawActual();
  }

  private drawActual(): void {
    const camera = this.view.camera;
    const cpos = camera.position;
    const scale = cpos.scale;
    const mapLength = 1024;
    const tileLength = 16 * scale;

    this.baseGrid.clear();
    this.chunkGrid.clear();
    this.axisLines.clear();
    this.borderLines.clear();

    if (this.renderBaseGrid && scale > 0.25) {
      let alpha = (scale - 0.25) * 2;
      if (alpha > 1) {
        alpha = 1;
      } else if (alpha <= 0) {
        alpha = 0;
      }
      this.baseGrid.alpha = alpha;
      if (alpha > 0) {
        this.baseGrid.lineStyle(1, 0x444444, 0.1, 0.5, true);
        for (let index = 0; index < 1025; index++) {
          const x1 = index * tileLength;
          const y1 = 0;
          const x2 = index * tileLength;
          const y2 = mapLength * tileLength;
          this.baseGrid.moveTo(x1, y1);
          this.baseGrid.lineTo(x2, y2);
          // noinspection JSSuspiciousNameCombination
          this.baseGrid.moveTo(y1, x1);
          // noinspection JSSuspiciousNameCombination
          this.baseGrid.lineTo(y2, x2);
        }
      }
    }
    if (scale > 0.1) {
      let alpha = (scale - 0.1) * 4;
      if (alpha > 1) {
        alpha = 1;
      } else if (alpha < 0) {
        alpha = 0;
      }
      this.chunkGrid.alpha = alpha;
      this.axisLines.alpha = alpha;
      if (alpha > 0) {
        if (this.renderChunkGrid) {
          this.chunkGrid.lineStyle(1, 0x770000, 1, 0.5, true);
          for (let index = 0; index <= 16; index++) {
            const x1 = (index * 64) * tileLength;
            const y1 = 0;
            const y2 = (16 * 64) * tileLength;
            this.chunkGrid.moveTo(x1, y1);
            this.chunkGrid.lineTo(x1, y2);
            // noinspection JSSuspiciousNameCombination
            this.chunkGrid.moveTo(y1, x1);
            // noinspection JSSuspiciousNameCombination
            this.chunkGrid.lineTo(y2, x1);
          }
        }
        if (this.renderAxisLines) {
          this.axisLines.lineStyle(3, 0x7777ff, 1, 0.5, true);
          this.axisLines.moveTo((mapLength / 2) * 16 * scale, 0);
          this.axisLines.lineTo((mapLength / 2) * 16 * scale, 1024 * 16 * scale);
          this.axisLines.moveTo(0, (mapLength / 2) * 16 * scale);
          this.axisLines.lineTo(1024 * 16 * scale, (mapLength / 2) * 16 * scale);
        }
      }
    }
    if (this.renderBorderLines) {
      const length = mapLength * tileLength;
      this.borderLines.lineStyle(3, 0x7777ff, 0.5, 0.5, true);
      this.borderLines.moveTo(0, 0);
      this.borderLines.lineTo(0, length);
      this.borderLines.moveTo(0, 0);
      this.borderLines.lineTo(length, 0);
      this.borderLines.moveTo(length, 0);
      this.borderLines.lineTo(length, length);
      this.borderLines.moveTo(0, length);
      this.borderLines.lineTo(length, length);
    }
  }

  draw() {
    const camera = this.view.camera;
    const cPos = camera.position;
    const cx = cPos.x * 16;
    const cy = cPos.y * 16;
    const scale = cPos.scale;
    if (scale != this.scalePrevious) {
      this.drawActual();
      this.scalePrevious = scale;
    }
    const screen = this.view.app.screen;
    const sw2 = screen.width / 2;
    const sh2 = screen.height / 2;
    const gx = (sw2 - (cx * scale));
    const gy = (sh2 - (cy * scale));
    this.baseGrid.position.x = gx;
    this.baseGrid.position.y = gy;
    this.borderLines.position.x = gx;
    this.borderLines.position.y = gy;
    this.chunkGrid.position.x = gx;
    this.chunkGrid.position.y = gy;
    this.axisLines.position.x = gx;
    this.axisLines.position.y = gy;
  }
}
