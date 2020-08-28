import ImageTool from './ImageTool';
import ImageEditor from '../ImageEditor';
import ImageEditorInputEvent from '../ImageEditorInputEvent';
import ImageEdit from '../ImageEdit';

/**
 * The <i>PanTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class PanTool extends ImageTool {
  private readonly mouseLast: { x: number, y: number } = {x: 0, y: 0};
  private _down: boolean = false;
  private target: HTMLElement;

  /** @override */
  onActivate(editor: ImageEditor): void {
    editor.setCursor('move');
  }

  /** @override */
  protected onStart(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this._down = true;
    this.mouseLast.x = event.e.offsetX;
    this.mouseLast.y = event.e.offsetY;
    this.target = event.e.target;
    return null;
  }

  /** @override */
  protected onStop(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this._down = false;
    this.target = null;
    this.mouseLast.x = 0;
    this.mouseLast.y = 0;
    return null;
  }

  /** @override */
  protected onDrag(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    if (!this._down) {
      return;
    }

    const cx = event.e.offsetX;
    const cy = event.e.offsetY;
    // Calculate the offset.
    const camera = editor.camera;
    const scale = camera.getScale();
    const deltaX = (this.mouseLast.x - cx) / scale;
    const deltaY = (this.mouseLast.y - cy) / scale;
    this.mouseLast.x = cx;
    this.mouseLast.y = cy;
    camera.move(deltaX, deltaY);
    return null;
  }

  /** @override */
  protected onEnter(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return null;
  }

  /** @override */
  protected onExit(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return null;
  }

  /** @override */
  protected onWheel(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    event.e.stopPropagation();
    const wheel = event.e.originalEvent.wheelDelta;
    if (wheel / 120 > 0) {
      if (editor.camera.canZoomIn()) {
        editor.camera.zoomIn();
      }
    } else {
      if (editor.camera.canZoomOut()) {
        editor.camera.zoomOut();
      }
    }
    return null;
  }

  /** @override */
  protected onPenDrag(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return null;
  }

  /** @override */
  protected onPenStart(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return null;
  }

  /** @override */
  protected onPenStop(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return null;
  }
}
