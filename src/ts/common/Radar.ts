import MouseDownEvent = JQuery.MouseDownEvent;
import MouseMoveEvent = JQuery.MouseMoveEvent;
import { Vector2 } from 'three';
import { PathMode } from '../util/Path';
import type { Renderer } from './Renderer';
import type { Dirtable } from '../util/Dirtable';
import { MapRenderer } from '../editor/render/MapRenderer';
import { Editor } from '../editor/Editor';
import { HSVtoRGB, RGBtoHSV } from '../util/ColorUtils';

const hsv216 = RGBtoHSV(75, 50, 37);
const hsv217 = RGBtoHSV(75, 50, 37);
const hsv218 = RGBtoHSV(75, 50, 37);
const hsv219 = RGBtoHSV(75, 75, 75);
const hsv220 = RGBtoHSV(113, 0, 102);
const hsvMisc = RGBtoHSV(238, 238, 238);
const rgb216 = HSVtoRGB(hsv216.h, hsv216.s, hsv216.v < 0.5 ? 0.5 : hsv216.v);
const rgb217 = HSVtoRGB(hsv217.h, hsv217.s, hsv217.v < 0.5 ? 0.5 : hsv217.v);
const rgb218 = HSVtoRGB(hsv218.h, hsv218.s, hsv218.v < 0.5 ? 0.5 : hsv218.v);
const rgb219 = HSVtoRGB(hsv219.h, hsv219.s, hsv219.v < 0.5 ? 0.5 : hsv219.v);
const rgb220 = HSVtoRGB(hsv220.h, hsv220.s, hsv220.v < 0.5 ? 0.5 : hsv220.v);
const rgbMisc = HSVtoRGB(hsvMisc.h, hsvMisc.s, hsvMisc.v < 0.5 ? 0.5 : hsvMisc.v);

/**
 * The <i>Radar</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Radar implements Dirtable {
  lock: boolean;
  protected readonly view: Renderer;
  protected readonly imgData: ImageData = new ImageData(1024, 1024);
  protected readonly drawCanvas: HTMLCanvasElement;
  protected readonly drawCtx: CanvasRenderingContext2D;
  protected readonly canvas: HTMLCanvasElement;
  protected readonly ctx: CanvasRenderingContext2D;
  private readonly largeSize: number;
  private readonly smallSize: number;
  private dirty: boolean = true;
  private large: boolean = false;
  private visible: boolean = false;

  /**
   * @constructor
   *
   * @param {Renderer} view
   */
  constructor(view: Renderer) {
    this.view = view;
    this.canvas = <HTMLCanvasElement> document.getElementById('radar');
    if (!this.canvas) {
      throw new Error('Failed to create HTMLCanvasElement.');
    }
    this.ctx = <CanvasRenderingContext2D> this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.drawCanvas = <HTMLCanvasElement> document.createElement("canvas");
    if (!this.drawCanvas) {
      throw new Error('Failed to create HTMLCanvasElement.');
    }
    this.drawCanvas.width = 1024;
    this.drawCanvas.height = 1024;
    this.drawCtx = <CanvasRenderingContext2D> this.drawCanvas.getContext('2d');

    this.largeSize = 768;
    this.smallSize = 256;
    this.lock = false;
    let down = false;
    let downButton = -99999;

    const update = (button: number, mx: number, my: number): void => {
      const lx = mx / this.canvas.width;
      const ly = my / this.canvas.height;
      const mapX = Math.floor(lx * 1024);
      const mapY = Math.floor(ly * 1024);
      const cPos = this.view.camera.position;
      const v1 = new Vector2(mapX, mapY);
      const v2 = new Vector2(cPos.x, cPos.y);

      const dist = v1.distanceTo(v2);
      if (dist === 0) {
        return;
      }

      let ticks = Math.floor(dist / 10);
      if (ticks < 10) {
        ticks = 10;
      } else if (ticks > 60) {
        ticks = 60;
      }

      this.view.camera.pathTo({
        x: mapX,
        y: mapY,
        scale: this.view.camera.position.scale,
      }, ticks, PathMode.EASE_OUT);
    };

    $(document).on('mousedown', '#' + this.canvas.id, (e: MouseDownEvent) => {
      down = true;
      const button = e.button;
      downButton = button;
      const mx = e.offsetX;
      const my = e.offsetY;
      update(button, mx, my);
    });

    $(document).on('mouseup', () => {
      down = false;
      downButton = -99999;
    });

    $(document).on('mousemove', '#' + this.canvas.id, (e: MouseMoveEvent) => {
      if (down) {
        let button = e.button;
        const mx = e.offsetX;
        const my = e.offsetY;
        if (downButton !== -99999) {
          button = downButton;
        }
        update(button, mx, my);
      }
    });
  }

  /** Updates the radar. */
  update(): void {
    // TODO: Probably need to hook back up. -Jab
    const alt = this.isAltPressed();
    const screenHeight = this.view.app.screen.height;
    const largeSize = Math.min(this.largeSize, screenHeight - 24);

    if (this.canvas.parentElement) {
      if (!this.large && alt) {
        this.large = true;
        this.canvas.parentElement.classList.add('large');
        this.canvas.width = largeSize;
        this.canvas.height = largeSize;
        this.canvas.parentElement.style.width = largeSize + 'px';
        this.canvas.parentElement.style.height = largeSize + 'px';
        this.apply();
      } else if (this.large && !alt) {
        this.large = false;
        this.canvas.parentElement.classList.remove('large');
        this.canvas.width = this.smallSize;
        this.canvas.height = this.smallSize;
        this.canvas.parentElement.style.width = this.smallSize + 'px';
        this.canvas.parentElement.style.height = this.smallSize + 'px';
        this.apply();
      }
    }

    if (this.isDirty()) {
      this.draw().then(() => {
        this.apply();
      });
      this.setDirty(false);
    }
  }

  /** Applies the rendered radar image to the canvas context. */
  apply(): void {
    const screenHeight = this.view.app.screen.height;
    const largeSize = Math.min(this.largeSize, screenHeight - 24);
    const size = this.large ? largeSize : this.smallSize;

    this.drawCtx.putImageData(this.imgData, 0, 0);
    this.ctx.drawImage(this.drawCanvas, 0, 0, 1024, 1024, 0, 0, size, size);
  }

  /** @return {boolean} Returns true if the radar is visible. */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * Sets the visibility of the radar.
   *
   * @param {boolean} flag The visibility flag to set.
   */
  setVisible(flag: boolean) {
    if (this.visible === flag) {
      return;
    }
    this.visible = flag;
    if (this.canvas.parentElement) {
      if (flag) {
        this.canvas.parentElement.style.display = 'block';
      } else {
        this.canvas.parentElement.style.display = 'none';
      }
    }
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }

  async draw() {
    const project = (<MapRenderer> this.view).project;
    if (project == null) {
      return;
    }

    // const timeStart = new Date().getTime();

    const setColor = (x: number, y: number, r: number, g: number, b: number, a: number = 255) => {
      const index = 4 * (x + y * this.imgData.width);
      this.imgData.data[index] = r;
      this.imgData.data[index + 1] = g;
      this.imgData.data[index + 2] = b;
      this.imgData.data[index + 3] = a;
    };

    const fillRect = (x: number, y: number, w: number, h: number, r: number = 0, g: number = 0, b: number = 0, a: number = 255) => {
      for (let _y = y; _y <= y + h; _y++) {
        for (let _x = x; _x <= x + w; _x++) {
          setColor(_x, _y, r, g, b, a);
        }
      }
    };

    // Clear the radar to its clear color.
    fillRect(0, 0, 1024, 1024);

    const tileset = project.tileset;
    const layers = project.layers;

    for (let y = 0; y < 1024; y++) {
      for (let x = 0; x < 1024; x++) {
        const tileId = layers.getTile(x, y);
        if (tileId > 0) {
          let color = {r: 0, g: 0, b: 0};

          let dim = 1;
          switch (tileId) {
            case 216:
              color = rgb216;
              break;
            case 217:
              dim = 2;
              color = rgb217;
              break;
            case 218:
              color = rgb218;
              break;
            case 219:
              color = rgb219;
              dim = 6;
              break;
            case 220:
              color = rgb220;
              dim = 5;
              break;
            default:
              if (tileset != null) {
                let tColor = tileset.tileColor[tileId];
                if (!tColor) {
                  tColor = tileset.defaultTileColor;
                }
                color = {r: tColor[0], g: tColor[1], b: tColor[2]};
              } else {
                color = rgbMisc;
              }
              break;
          }
          setColor(x, y, color.r, color.g, color.b);
        }
      }
    }

    // console.log(`Radar drawn. Took ${new Date().getTime() - timeStart}ms.`);
  }

  isAltPressed(): boolean {
    // @ts-ignore
    let editor: Editor = global.editor;
    // Make sure that selection tools do not get interrupted by the alt function of the radar.
    let activeTool = editor.renderer.toolManager.getActive();
    if (activeTool != null && activeTool.isSelector) {
      return false;
    }
    return editor.isAltPressed();
  }
}
