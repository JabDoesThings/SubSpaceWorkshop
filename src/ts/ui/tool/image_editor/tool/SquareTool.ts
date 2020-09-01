import ImageTool from './ImageTool';
import ImageEditor from '../ImageEditor';
import ImageEditorInputEvent from '../ImageEditorInputEvent';
import ImageEdit from '../ImageEdit';

export default class SquareTool extends ImageTool {
  /** @override */
  onActivate(editor: ImageEditor): void {
  }

  /** @override */
  protected onDrag(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
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

  /** @override */
  protected onStart(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return null;
  }

  /** @override */
  protected onStop(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return null;
  }

  /** @override */
  protected onWheel(editor: ImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    return null;
  }
}
