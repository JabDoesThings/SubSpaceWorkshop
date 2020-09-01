import ImageTool from './ImageTool';
import ImageEditor from '../ImageEditor';
import ImageEditorInputEvent from '../ImageEditorInputEvent';
import ImageEdit from '../ImageEdit';
import PencilBrush from '../brush/PencilBrush';
import PencilBrushOptions from '../brush/PencilBrushOptions';

export default class PencilTool extends ImageTool {
  private readonly _pressures: number[] = [];
  brush: PencilBrush = new PencilBrush();
  private middleDown: boolean = false;
  private last: {x: number, y: number};
  private down: {x: number, y: number};
  private penDown: {x: number, y: number};

  /** @override */
  onActivate(editor: ImageEditor): void {
    editor.brush = this.brush;
    editor.showBrush();
    this.brush.renderMouse(editor.brushSourceCanvas, editor.palette, 'primary');
    editor.camera.projectBrush();
  }

  /** @override */
  protected onStart(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    if (event.button === 1) {
      editor.setCursor('move');
      this.middleDown = true;
      this.fallback();
      return;
    }
    const type = event.button === 0 ? 'primary' : 'secondary';
    this.down = editor.camera.asPixelCoordinates(event.data);
    this.last = {x: this.down.x, y: this.down.y};
    this.brush.renderMouse(editor.brushSourceCanvas, editor.palette, type);
    this.draw(editor, this.down.x, this.down.y);
    return null;
  }

  /** @override */
  protected onStop(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    if (event.button === 1) {
      this.middleDown = false;
      this.fallback();
      return;
    }
    this.last = null;
    this.down = null;
    this.penDown = null;
    return [editor.renderer.pushDrawing(true)];
  }

  /** @override */
  protected onDrag(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    if (this.middleDown) {
      this.fallback();
      return;
    }

    const c = editor.camera.asPixelCoordinates(event.data);
    if (this.last == null) {
      this.last = {x: c.x, y: c.y};
    } else if (c.x === this.last.x && c.y === this.last.y) {
      return;
    }

    const type = event.button === 0 ? 'primary' : 'secondary';
    this.drawAsLine(editor, this.last.x, this.last.y, c.x, c.y, editor.palette, type, null, 1);
    editor.camera.projectDraw();
    this.last.x = c.x;
    this.last.y = c.y;
    return null;
  }

  /** @override */
  protected onEnter(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    editor.showBrush();
    return null;
  }

  /** @override */
  protected onExit(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this.last = null;
    editor.hideBrush();
    return null;
  }

  /** @override */
  protected onWheel(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this.fallback();
    return null;
  }

  /** @override */
  protected onPenStart(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    const type = event.button === 0 ? 'primary' : 'secondary';
    const c = editor.camera.asPixelCoordinates(event.data);
    this.down = {x: c.x, y: c.y};
    this.last = {x: c.x, y: c.y};

    let pressure = event.data.pressure;
    const options = <PencilBrushOptions> this.brush.options;
    if (options.smoothPressure) {
      pressure = this.pushAveragePressure(pressure, options.smoothAverageCount);
    } else {
      this.clearAveragePressure();
    }

    this.brush.renderPen(editor.brushSourceCanvas, editor.palette, type, pressure);
    this.draw(editor, c.x, c.y);
    editor.camera.projectDraw();
    return;
  }

  /** @override */
  protected onPenDrag(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    const c = editor.camera.asPixelCoordinates(event.data);
    if (!this.last || (c.x === this.last.x && c.y === this.last.y)) {
      this.last = {
        x: c.x,
        y: c.y
      };
      return;
    }

    const type = event.button === 0 ? 'primary' : 'secondary';
    const pressure = event.data.pressure;
    this.drawAsLine(editor, this.last.x, this.last.y, c.x, c.y, editor.palette, type, true, pressure);
    editor.camera.projectDraw();

    this.clearAveragePressure();

    this.last.x = c.x;
    this.last.y = c.y;
    return;
  }

  /** @override */
  protected onPenStop(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this.last = null;
    this.down = null;
    this.penDown = null;
    const edits = [editor.renderer.pushDrawing(true)];
    const type = event.button === 0 ? 'primary' : 'secondary';
    this.brush.renderMouse(editor.brushSourceCanvas, editor.palette, type);
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
