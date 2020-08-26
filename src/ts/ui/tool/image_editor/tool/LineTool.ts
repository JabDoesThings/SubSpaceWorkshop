import CircleBrush from '../brush/CircleBrush';
import Brush from '../brush/Brush';
import ImageTool from './ImageTool';
import ImageEditor from '../ImageEditor';
import ImageEditorInputEvent from '../ImageEditorInputEvent';
import ImageEdit from '../ImageEdit';

export default class LineTool extends ImageTool {
  private middleDown: boolean = false;
  private brush: Brush;
  private down: { x: number, y: number };
  private last: { x: number, y: number };
  private penDown: boolean = false;

  /** @override */
  onActivate(imageEditor: ImageEditor): void {
    imageEditor.setCursor('none');
    if (!this.brush) {
      this.brush = new CircleBrush();
    }
    imageEditor.setBrush(this.brush);
    this.brush.renderMouse(imageEditor.brushSourceCanvas);
    imageEditor.projectBrush();
  }

  /** @override */
  protected onStart(imageEditor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    if (event.button === 1) {
      this.middleDown = true;
      this.fallback();
      return;
    }

    this.down = imageEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    this.last = {x: this.down.x, y: this.down.y};

    this.brush.renderMouse(imageEditor.brushSourceCanvas);
    this.draw(imageEditor, this.down.x, this.down.y);

    return null;
  }

  /** @override */
  protected onDrag(imageEditor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return [];
  }

  /** @override */
  protected onStop(imageEditor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return [];
  }

  /** @override */
  protected onEnter(imageEditor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return [];
  }

  /** @override */
  protected onExit(imageEditor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return [];
  }

  /** @override */
  protected onWheel(imageEditor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return [];
  }

  /** @override */
  protected onPenStart(imageEditor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return [];
  }

  /** @override */
  protected onPenDrag(imageEditor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return [];
  }

  /** @override */
  protected onPenStop(imageEditor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return [];
  }

}
