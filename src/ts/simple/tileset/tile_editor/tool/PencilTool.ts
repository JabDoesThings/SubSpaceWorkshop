import TileEditor from '../TileEditor';
import TileEdit from '../TileEdit';
import TileEditTool from './TileEditTool';
import { TileEditorEvent } from '../TileEditorEvents';
import CircleBrush from '../brush/CircleBrush';
import { Path } from '../../../../util/Path';

class PencilTool extends TileEditTool {

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
    this.brush.onRender(tileEditor.brushSourceCanvas);
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

    this.brush.onRender(tileEditor.brushSourceCanvas);
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
    this.brush.onPressure(tileEditor.brushSourceCanvas, pressure);
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
    this.brush.onRender(tileEditor.brushSourceCanvas);
    return edits;
  }
}

export default PencilTool;
