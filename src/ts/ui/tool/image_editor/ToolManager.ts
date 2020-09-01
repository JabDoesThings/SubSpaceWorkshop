import UIImageEditor from './ImageEditor';
import ImageEdit from './ImageEdit';
import ImageEditorInputEvent from './ImageEditorInputEvent';
import ImageEditorEventType from './ImageEditorEventType';
import ImageTool from './tool/ImageTool';

/**
 * The <i>ToolManager</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ToolManager {
  private readonly tools: { [id: string]: ImageTool } = {};
  private readonly editor: UIImageEditor;
  private active: string = null;
  private fallback: string = null;

  /** @param {UIImageEditor} editor */
  constructor(editor: UIImageEditor) {
    this.editor = editor;
    let downTool: ImageTool;

    editor.events.addMouseListener((event: ImageEditorInputEvent) => {
      let edits: ImageEdit[];
      let push = false;
      let reset = false;

      downTool = this.getActive();
      if (downTool == null) {
        return;
      }
      switch (event.type) {
        // Pen events.
        case ImageEditorEventType.PEN_HOVER:
          break;
        case ImageEditorEventType.PEN_DOWN:
          edits = downTool.penStart(editor, event);
          break;
        case ImageEditorEventType.PEN_DRAG:
          edits = downTool.penDrag(editor, event);
          break;
        case ImageEditorEventType.PEN_UP:
          edits = downTool.penStop(editor, event);
          push = reset = true;
          break;
        // Mouse events.
        case ImageEditorEventType.DOWN:
          edits = downTool.start(editor, event);
          break;
        case ImageEditorEventType.DRAG:
          edits = downTool.drag(editor, event);
          break;
        case ImageEditorEventType.UP:
          edits = downTool.stop(editor, event);
          push = reset = true;
          break;
        case ImageEditorEventType.WHEEL_UP:
        case ImageEditorEventType.WHEEL_DOWN:
          edits = downTool.wheel(editor, event);
          break;
        // General events.
        case ImageEditorEventType.ENTER:
          edits = downTool.enter(editor, event);
          break;
        case ImageEditorEventType.EXIT:
          edits = downTool.exit(editor, event);
          break;
      }

      if (edits != null && edits.length !== 0) {
        editor.editManager.append(edits);
      }
      if (push) {
        editor.editManager.push();
      }
      if (reset) {
        downTool = null;
      }
    });
  }

  getActive(): ImageTool {
    return this.active == null ? null : this.tools[this.active];
  }

  setActive(id: string): void {
    this.active = id;
    const activeTool = this.tools[this.active];
    if (activeTool) {
      activeTool.onActivate(this.editor);
    }
  }

  addTool(id: string, brush: ImageTool): void {
    this.tools[id] = brush;
  }

  getTool(id: string): ImageTool {
    return this.tools[id];
  }

  getFallback(): ImageTool {
    return this.tools[this.fallback];
  }

  setFallback(id: string): void {
    this.fallback = id;
  }
}
