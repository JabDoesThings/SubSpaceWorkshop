import MouseDownEvent = JQuery.MouseDownEvent;
import MouseMoveEvent = JQuery.MouseMoveEvent;
import { Vector2 } from 'three';
import { PathMode } from '../util/Path';
import type { Renderer } from './Renderer';
import type { Dirtable } from '../util/Dirtable';

/**
 * The <i>Radar</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Radar implements Dirtable {
  lock: boolean;
  protected readonly view: Renderer;
  protected readonly drawCanvas: HTMLCanvasElement;
  protected readonly drawCtx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
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
    const alt = false; // this.isAltPressed();
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
      this.draw().finally(() => {
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

  /** @abstract */
  async draw() {
  }
}
