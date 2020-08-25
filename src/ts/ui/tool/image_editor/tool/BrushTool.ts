import CircleBrush from '../brush/CircleBrush';
import CircleBrushOptions from '../brush/CircleBrushOptions';
import ImageTool from './ImageTool';
import ImageEditor from '../ImageEditor';
import ImageEdit from '../ImageEdit';
import ImageEditorEvent from '../ImageEditorEvent';

export default class BrushTool extends ImageTool {
  private readonly _pressures: number[] = [];
  private middleDown: boolean = false;
  brush: CircleBrush;
  private down: { x: number, y: number };
  private last: { x: number, y: number };
  private penDown: boolean = false;

  constructor() {
    super();
    this.brush = new CircleBrush();
  }

  /** @override */
  onActivate(imageEditor: ImageEditor): void {
    imageEditor.setCursor('none');
    imageEditor.setBrush(this.brush);
    this.brush.renderMouse(imageEditor.brushSourceCanvas, imageEditor.palette, 'primary');
    imageEditor.projectBrush();
  }

  /** @override */
  protected onStart(imageEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    if (event.button === 1) {
      this.middleDown = true;
      this.fallback();
      return;
    }

    const type = event.button === 0 ? 'primary' : 'secondary';

    this.down = imageEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    this.last = {x: this.down.x, y: this.down.y};

    this.brush.renderMouse(imageEditor.brushSourceCanvas, imageEditor.palette, type);
    this.draw(imageEditor, this.down.x, this.down.y);

    return null;
  }

  /** @override */
  protected onStop(imageEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    if (event.button === 1) {
      this.middleDown = false;
      this.fallback();
      return;
    }

    this.last = null;
    this.down = null;
    this.penDown = null;

    const edits = [imageEditor.applyDraw(true)];
    imageEditor.clearDraw();
    return edits;
  }

  /** @override */
  protected onDrag(imageEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    if (this.middleDown) {
      this.fallback();
      return;
    }

    const c = imageEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    if (c.x === this.last.x && c.y === this.last.y) {
      return;
    }

    const type = event.button === 0 ? 'primary' : 'secondary';

    this.drawAsLine(imageEditor, this.last.x, this.last.y, c.x, c.y, imageEditor.palette, type, null, 1);
    imageEditor.projectDraw();

    this.last.x = c.x;
    this.last.y = c.y;
    return null;
  }

  /** @override */
  protected onEnter(imageEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    return null;
  }

  /** @override */
  protected onExit(imageEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    return null;
  }

  /** @override */
  protected onWheel(imageEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    if (this.down !== null) {
      return null;
    }
    this.fallback();
    return null;
  }

  /** @override */
  protected onPenStart(imageEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    const type = event.button === 0 ? 'primary' : 'secondary';
    const c = imageEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    this.down = {x: c.x, y: c.y};
    this.last = {x: c.x, y: c.y};

    let pressure = event.data.pressure;
    const options = <CircleBrushOptions> this.brush.options;
    if (options.smoothPressure) {
      pressure = this.pushAveragePressure(pressure, options.smoothAverageCount);
    } else {
      this.clearAveragePressure();
    }

    this.brush.renderPen(imageEditor.brushSourceCanvas, imageEditor.palette, type, pressure);
    this.draw(imageEditor, c.x, c.y);
    imageEditor.projectDraw();
    return;
  }

  /** @override */
  protected onPenDrag(imageEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    const c = imageEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    if (c.x === this.last.x && c.y === this.last.y) {
      return;
    }

    const type = event.button === 0 ? 'primary' : 'secondary';
    const pressure = event.data.pressure;
    this.drawAsLine(imageEditor, this.last.x, this.last.y, c.x, c.y, imageEditor.palette, type, true, pressure);
    imageEditor.projectDraw();

    this.clearAveragePressure();

    this.last.x = c.x;
    this.last.y = c.y;
    return;
  }

  /** @override */
  protected onPenStop(imageEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    this.last = null;
    this.down = null;
    this.penDown = null;

    const edits = [imageEditor.applyDraw(true)];
    imageEditor.clearDraw();

    const type = event.button === 0 ? 'primary' : 'secondary';
    this.brush.renderMouse(imageEditor.brushSourceCanvas, imageEditor.palette, type);

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
