import ImageTool from './ImageTool';
import ImageEditor from '../ImageEditor';
import ImageEditorEvent from '../ImageEditorEvent';
import ImageEdit from '../ImageEdit';

export default class PanTool extends ImageTool {
  private ox: number = 0;
  private oy: number = 0;
  private moved: boolean = false;
  private _down: boolean = false;
  private mouseDown = [0, 0];
  private mouseCurrent = [0, 0];

  /** @override */
  onActivate(tileEditor: ImageEditor): void {
    tileEditor.setCursor('move');
  }

  /** @override */
  protected onStart(tileEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    this._down = true;
    this.ox = 0;
    this.oy = 0;
    this.mouseDown[0] = event.e.clientX;
    this.mouseDown[1] = event.e.clientY;
    return null;
  }

  /** @override */
  protected onStop(tileEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    this._down = false;
    if (this.moved) {
      tileEditor.paneOffset[0] = this.ox;
      tileEditor.paneOffset[1] = this.oy;
      this.moved = false;
    }
    return null;
  }

  /** @override */
  protected onDrag(tileEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    this.mouseCurrent[0] = event.e.clientX;
    this.mouseCurrent[1] = event.e.clientY;
    if (!this._down) {
      return;
    }
    this.moved = true;
    // Calculate the offset.
    this.ox = tileEditor.paneOffset[0] - (this.mouseDown[0] - this.mouseCurrent[0]);
    this.oy = tileEditor.paneOffset[1] - (this.mouseDown[1] - this.mouseCurrent[1]);
    this.update(tileEditor);
    return null;
  }

  /** @override */
  protected onEnter(tileEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    return null;
  }

  /** @override */
  protected onExit(tileEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    return null;
  }

  /** @override */
  protected onWheel(tileEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    event.e.stopPropagation();
    const scale = ImageEditor.SCALES[tileEditor.scaleIndex];
    const x = Math.floor(event.e.offsetX / scale) * scale;
    const y = Math.floor(event.e.offsetY / scale) * scale;
    if (event.e.target !== tileEditor.projectedCanvas) {
      if (event.e.originalEvent.wheelDelta / 120 > 0) {
        if (tileEditor.scaleIndex >= ImageEditor.SCALES.length - 1) {
          return;
        }
        tileEditor.scaleIndex++;
        tileEditor.project();
        tileEditor.positionBrush(x, y);
        tileEditor.projectBrush();
        tileEditor.paneOffset[0] = (tileEditor.$parent.width() / 2) - (tileEditor.projectedCanvas.width / 2);
        tileEditor.paneOffset[1] = (tileEditor.$parent.height() / 2) - (tileEditor.projectedCanvas.height / 2);
        PanTool.css(tileEditor, tileEditor.paneOffset[0], tileEditor.paneOffset[1]);
      } else {
        if (tileEditor.scaleIndex === 0) {
          return;
        }
        tileEditor.scaleIndex--;
        tileEditor.project();
        tileEditor.positionBrush(x, y);
        tileEditor.projectBrush();
        tileEditor.paneOffset[0] = (tileEditor.$parent.width() / 2) - (tileEditor.projectedCanvas.width / 2);
        tileEditor.paneOffset[1] = (tileEditor.$parent.height() / 2) - (tileEditor.projectedCanvas.height / 2);
        PanTool.css(tileEditor, tileEditor.paneOffset[0], tileEditor.paneOffset[1]);
      }
    } else {
      if (event.e.originalEvent.wheelDelta / 120 > 0) {
        if (tileEditor.scaleIndex >= ImageEditor.SCALES.length - 1) {
          return;
        }
        tileEditor.scaleIndex++;
        tileEditor.project();
        tileEditor.positionBrush(x, y);
        tileEditor.projectBrush();
        const offsetX = event.e.offsetX;
        const offsetY = event.e.offsetY;
        tileEditor.paneOffset[0] -= offsetX;
        tileEditor.paneOffset[1] -= offsetY;
        PanTool.css(tileEditor, tileEditor.paneOffset[0], tileEditor.paneOffset[1]);
      } else {
        if (tileEditor.scaleIndex === 0) {
          return;
        }
        tileEditor.scaleIndex--;
        tileEditor.project();
        tileEditor.positionBrush(x, y);
        tileEditor.projectBrush();
        tileEditor.paneOffset[0] = (tileEditor.$parent.width() / 2) - (tileEditor.projectedCanvas.width / 2);
        tileEditor.paneOffset[1] = (tileEditor.$parent.height() / 2) - (tileEditor.projectedCanvas.height / 2);
        PanTool.css(tileEditor, tileEditor.paneOffset[0], tileEditor.paneOffset[1]);
      }
    }
    return null;
  }

  /** @override */
  protected onPenDrag(tileEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    return null;
  }

  /** @override */
  protected onPenStart(tileEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    return null;
  }

  /** @override */
  protected onPenStop(tileEditor: ImageEditor, event: ImageEditorEvent): ImageEdit[] {
    return null;
  }

  private update(tileEditor: ImageEditor): void {
    const $parent = $(tileEditor.paneCursor.parentElement);
    const scale = ImageEditor.SCALES[tileEditor.scaleIndex];
    const limit = 16 * scale;
    // Clamp the offset to the boundaries of the parent container of the inner window.
    const pw = $parent.width();
    const ph = $parent.height();
    const iww = tileEditor.projectedCanvas.width;
    const iwh = tileEditor.projectedCanvas.height;
    const xMaxLimit = pw - limit;
    const xMinLimit = -iww + limit;
    const yMaxLimit = ph - limit;
    const yMinLimit = -iwh + limit;
    if (this.ox < xMinLimit) {
      this.ox = xMinLimit;
    } else if (this.ox > xMaxLimit) {
      this.ox = xMaxLimit;
    }
    if (this.oy < yMinLimit) {
      this.oy = yMinLimit;
    } else if (this.oy > yMaxLimit) {
      this.oy = yMaxLimit;
    }
    PanTool.css(tileEditor, this.ox, this.oy);
  }

  private static css(tileEditor: ImageEditor, x: number, y: number): void {
    tileEditor.paneCursor.style.top = `${y}px`;
    tileEditor.paneCursor.style.left = `${x}px`;
  }
}
