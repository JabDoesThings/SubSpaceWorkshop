import { MathUtils } from 'three';
import lerp = MathUtils.lerp;
import Palette from '../../../util/Palette';
import UIImageEditor from '../ImageEditor';
import ImageEditorInputEvent from '../ImageEditorInputEvent';
import ImageEdit from '../ImageEdit';

/**
 * The <i>ImageTool</i> class. TODO: Document.
 *
 * @author Jab
 */
export default abstract class ImageTool {
  isSelector: boolean = false;
  private editor: UIImageEditor;
  private _event: ImageEditorInputEvent;
  private _type: string;
  private _penDown: boolean = false;

  penStart(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this.editor = editor;
    this._event = event;
    this._type = 'penStart';

    let edits;
    if (event.e.originalEvent.pointerType === 'pen') {
      this._penDown = true;
      edits = this.onPenStart(editor, event);
    } else {
      edits = this.onStart(editor, event);
    }

    this.editor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  penDrag(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this.editor = editor;
    this._event = event;
    this._type = 'penDrag';
    const edits = this.onPenDrag(editor, event);
    this.editor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  penStop(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this.editor = editor;
    this._event = event;
    this._type = 'penStop';
    this._penDown = false;
    const edits = this.onPenStop(editor, event);
    this.editor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  start(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    // console.log('start');
    this.editor = editor;
    this._event = event;
    this._type = 'start';
    const edits = this.onStart(editor, event);
    this.editor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  drag(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    // console.log('drag');
    this.editor = editor;
    this._event = event;
    this._type = 'drag';

    const origEvent = event.e.originalEvent;

    let edits;
    if (this._penDown) {
      if (origEvent.pressure === 0) {
        this._penDown = false;
        edits = this.onPenStop(editor, event);
      } else {
        edits = this.onPenDrag(editor, event);
      }
    } else {
      if (origEvent.pointerType === 'pen' && origEvent.pressure !== 0) {
        this._penDown = true;
        edits = this.onPenStart(editor, event);
      } else {
        edits = this.onDrag(editor, event);
      }
    }

    this.editor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  stop(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    // console.log('stop');
    this.editor = editor;
    this._event = event;
    this._type = 'stop';

    let edits;
    if (this._penDown) {
      this._penDown = false;
      edits = this.onPenStop(editor, event);
    } else {
      edits = this.onStop(editor, event);
    }

    this.editor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  enter(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this.editor = editor;
    this._event = event;
    this._type = 'enter';
    const edits = this.onEnter(editor, event);
    this.editor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  exit(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this.editor = editor;
    this._event = event;
    this._type = 'exit';
    const edits = this.onExit(editor, event);
    this.editor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  wheel(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this.editor = editor;
    this._event = event;
    this._type = 'wheel';
    const edits = this.onWheel(editor, event);
    this.editor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  protected fallback() {
    if (!this._type) {
      return;
    }
    const toolManager = this.editor.toolManager;
    const fallback = toolManager.getFallback();
    if (!fallback || fallback === this) {
      return;
    }
    switch (this._type) {
      case 'start':
        fallback.start(this.editor, this._event);
        break;
      case 'drag':
        fallback.drag(this.editor, this._event);
        break;
      case 'stop':
        fallback.stop(this.editor, this._event);
        break;
      case 'enter':
        fallback.enter(this.editor, this._event);
        break;
      case 'exit':
        fallback.exit(this.editor, this._event);
        break;
      case 'wheel':
        fallback.wheel(this.editor, this._event);
        break;
      case 'penStart':
        fallback.penStart(this.editor, this._event);
        break;
      case 'penDrag':
        fallback.penDrag(this.editor, this._event);
        break;
      case 'penStop':
        fallback.penStop(this.editor, this._event);
        break;
    }
  }

  drawAsLine(
    editor: UIImageEditor,
    x1: number,
    y1: number,
    x2: number = null,
    y2: number = null,
    palette: Palette,
    colorType: 'primary' | 'secondary',
    update: boolean = false,
    pressure: number = 1
  ): void {
    if (update) {
      editor.brush.renderPen(editor.brushSourceCanvas, palette, colorType, pressure);
    }
    if (!x2 || !y2) {
      this.draw(editor, x1, y1);
      return;
    }
    const a = x1 - x2;
    const b = y1 - y2;
    const distance = Math.ceil(Math.sqrt(a * a + b * b));
    if (distance <= 1) {
      this.draw(editor, x2, y2);
      return;
    }
    for (let position = 0; position <= distance; position++) {
      const _lerp = position / distance;
      const x = lerp(x1, x2, _lerp);
      const y = lerp(y1, y2, _lerp);
      this.draw(editor, x, y);
    }
  }

  draw(editor: UIImageEditor, x: number, y: number): void {
    const bx = x - Math.floor(editor.brush.options.size / 2);
    const by = y - Math.floor(editor.brush.options.size / 2);
    const ctx = editor.drawSourceCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = 'low';
    ctx.drawImage(editor.brushSourceCanvas, bx, by);
  }

  protected abstract onStart(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onDrag(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onEnter(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onExit(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onStop(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onWheel(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onPenStart(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onPenDrag(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onPenStop(editor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  abstract onActivate(editor: UIImageEditor): void;
}
