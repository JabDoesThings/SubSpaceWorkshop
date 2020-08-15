import TileEditor from '../TileEditor';
import TileEdit from '../TileEdit';
import TileEditTool from './TileEditTool';
import { TileEditorEvent } from '../TileEditorEvents';
import PencilBrush from '../brush/PencilBrush';
import { MathUtils } from 'three';
import lerp = MathUtils.lerp;
import { Path } from '../../../../util/Path';

class PencilTool extends TileEditTool {

  private middleDown: boolean = false;
  private brush: PencilBrush;

  private down: { x: number, y: number };
  private last: { x: number, y: number };
  private penDown: boolean = false;

  constructor() {
    super();
  }

  /** @override */
  onActivate(tileEditor: TileEditor): void {
    tileEditor.setCursor('none');
    if (!this.brush) {
      this.brush = new PencilBrush(tileEditor.brushSourceCanvas);
    }
    tileEditor.setBrush(this.brush);
    this.brush.onRender();
    tileEditor.projectBrush();
  }

  /** @override */
  protected onStart(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    if (event.button === 1) {
      this.middleDown = true;
      this.fallback();
      return;
    }

    this.down = tileEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    this.last = {x: this.down.x, y: this.down.y};

    this.brush.onRender();
    this.draw(tileEditor, this.down.x, this.down.y);

    return null;
  }

  /** @override */
  protected onStop(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    if (event.button === 1) {
      this.middleDown = false;
      this.fallback();
      return;
    }

    this.last = null;
    this.down = null;
    this.penDown = null;

    const edits = [tileEditor.applyDraw()];
    tileEditor.clearDraw();
    return edits;
  }

  /** @override */
  protected onDrag(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    if (this.middleDown) {
      this.fallback();
      return;
    }

    const c = tileEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    if (c.x === this.last.x && c.y === this.last.y) {
      return;
    }

    this.drawAsLine(tileEditor, this.last.x, this.last.y, c.x, c.y, null, 1);
    tileEditor.projectDraw();

    this.last.x = c.x;
    this.last.y = c.y;
    return null;
  }

  /** @override */
  protected onEnter(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    return null;
  }

  /** @override */
  protected onExit(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    return null;
  }

  /** @override */
  protected onWheel(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    if (this.down !== null) {
      return null;
    }
    this.fallback();
    return null;
  }

  /** @override */
  protected onPenStart(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    // console.log(`PEN_DOWN. pressure: ${event.data.pressure}`);
    const c = tileEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    this.down = {x: c.x, y: c.y};
    this.last = {x: c.x, y: c.y};
    const p = event.data.pressure;
    const opacity = p * p;
    const pressure = Path.easeIn(p);
    this.brush.onPressure(pressure);
    this.draw(tileEditor, c.x, c.y, opacity);
    tileEditor.projectDraw();
    return;
  }

  /** @override */
  protected onPenDrag(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    // console.log(`PEN_DRAG. pressure: ${event.data.pressure}`);

    const c = tileEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    if (c.x === this.last.x && c.y === this.last.y) {
      return;
    }

    const p = event.data.pressure;
    const opacity = p * p;

    const pressure = Path.easeIn(p);
    this.drawAsLine(tileEditor, this.last.x, this.last.y, c.x, c.y, pressure, opacity);
    tileEditor.projectDraw();

    this.last.x = c.x;
    this.last.y = c.y;

    return;
  }

  /** @override */
  protected onPenStop(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    // console.log(`PEN_UP. pressure: ${event.data.pressure}`);

    this.last = null;
    this.down = null;
    this.penDown = null;

    const edits = [tileEditor.applyDraw()];
    tileEditor.clearDraw();
    this.brush.onRender();
    return edits;
  }

  drawAsLine(
    tileEditor: TileEditor,
    x1: number,
    y1: number,
    x2: number = null,
    y2: number = null,
    size: number = null,
    opacity: number = 1
  ): void {

    if (size) {
      this.brush.onPressure(size);
    }

    if (!x2 || !y2) {
      this.draw(tileEditor, x1, y1, opacity);
      return;
    }

    const scale = TileEditor.SCALES[tileEditor.scaleIndex];
    const a = x1 - x2;
    const b = y1 - y2;
    const distance = Math.ceil(Math.sqrt(a * a + b * b) / (scale / 2));

    if (distance <= 1) {
      this.draw(tileEditor, x2, y2, opacity);
      return;
    }

    for (let position = 0; position <= distance; position++) {
      const _lerp = position / distance;
      const x = lerp(x1, x2, _lerp);
      const y = lerp(y1, y2, _lerp);
      this.draw(tileEditor, x, y, opacity);
    }
  }

  draw(tileEditor: TileEditor, x: number, y: number, opacity: number = 1): void {
    const bx = x - Math.floor(this.brush.size / 2);
    const by = y - Math.floor(this.brush.size / 2);
    const ctx = tileEditor.drawSourceCanvas.getContext('2d');
    ctx.globalAlpha = opacity;
    ctx.drawImage(tileEditor.brushSourceCanvas, bx, by);
  }
}

export default PencilTool;
