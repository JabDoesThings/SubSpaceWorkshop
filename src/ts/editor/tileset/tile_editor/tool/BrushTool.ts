import TileEditor from '../TileEditor';
import TileEdit from '../TileEdit';
import TileEditTool from './TileEditTool';
import CircleBrush from '../brush/CircleBrush';
import CircleBrushOptions from '../brush/CircleBrushOptions';
import  TileEditorEvent  from '../TileEditorEvent';

export default class BrushTool extends TileEditTool {
  private readonly _pressures: number[] = [];
  private middleDown: boolean = false;
  private brush: CircleBrush;
  private down: { x: number, y: number };
  private last: { x: number, y: number };
  private penDown: boolean = false;

  /** @override */
  onActivate(tileEditor: TileEditor): void {
    tileEditor.setCursor('none');
    if (!this.brush) {
      this.brush = new CircleBrush();
    }
    tileEditor.setBrush(this.brush);
    this.brush.renderMouse(tileEditor.brushSourceCanvas, tileEditor.palette, 'primary');
    tileEditor.projectBrush();
  }

  /** @override */
  protected onStart(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    if (event.button === 1) {
      this.middleDown = true;
      this.fallback();
      return;
    }

    const type = event.button === 0 ? 'primary' : 'secondary';

    this.down = tileEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    this.last = {x: this.down.x, y: this.down.y};

    this.brush.renderMouse(tileEditor.brushSourceCanvas, tileEditor.palette, type);
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

    const edits = [tileEditor.applyDraw(true)];
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

    const type = event.button === 0 ? 'primary' : 'secondary';

    this.drawAsLine(tileEditor, this.last.x, this.last.y, c.x, c.y, tileEditor.palette, type, null, 1);
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
    const type = event.button === 0 ? 'primary' : 'secondary';
    const c = tileEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    this.down = {x: c.x, y: c.y};
    this.last = {x: c.x, y: c.y};

    let pressure = event.data.pressure;
    const options = <CircleBrushOptions> this.brush.options;
    if (options.smoothPressure) {
      pressure = this.pushAveragePressure(pressure, options.smoothAverageCount);
    } else {
      this.clearAveragePressure();
    }

    this.brush.renderPen(tileEditor.brushSourceCanvas, tileEditor.palette, type, pressure);
    this.draw(tileEditor, c.x, c.y);
    tileEditor.projectDraw();
    return;
  }

  /** @override */
  protected onPenDrag(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    const c = tileEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    if (c.x === this.last.x && c.y === this.last.y) {
      return;
    }

    const type = event.button === 0 ? 'primary' : 'secondary';
    const pressure = event.data.pressure;
    this.drawAsLine(tileEditor, this.last.x, this.last.y, c.x, c.y, tileEditor.palette, type, true, pressure);
    tileEditor.projectDraw();

    this.clearAveragePressure();

    this.last.x = c.x;
    this.last.y = c.y;
    return;
  }

  /** @override */
  protected onPenStop(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    this.last = null;
    this.down = null;
    this.penDown = null;

    const edits = [tileEditor.applyDraw(true)];
    tileEditor.clearDraw();

    const type = event.button === 0 ? 'primary' : 'secondary';
    this.brush.renderMouse(tileEditor.brushSourceCanvas, tileEditor.palette, type);

    return edits;
  }

  private pushAveragePressure(value: number, max: number): number {
    if (this._pressures.length === max) {
      this._pressures.reverse();
      this._pressures.length -= 1;
      this._pressures.reverse();
    }
    this._pressures.push(value);

    let sum = 0;
    for (let index = 0; index < this._pressures.length; index++) {
      sum += this._pressures[index];
    }
    sum /= this._pressures.length;

    return sum;
  }

  private clearAveragePressure(): void {
    if (this._pressures.length !== 0) {
      this._pressures.length = 0;
    }
  }
}
