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
  private _tileEditor: UIImageEditor;
  private _event: ImageEditorInputEvent;
  private _type: string;
  private _penDown: boolean = false;

  penStart(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'penStart';

    let edits;
    if (event.e.originalEvent.pointerType === 'pen') {
      this._penDown = true;
      edits = this.onPenStart(tileEditor, event);
    } else {
      edits = this.onStart(tileEditor, event);
    }

    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  penDrag(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'penDrag';
    const edits = this.onPenDrag(tileEditor, event);
    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  penStop(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'penStop';
    this._penDown = false;
    const edits = this.onPenStop(tileEditor, event);
    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  start(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    // console.log('start');
    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'start';
    const edits = this.onStart(tileEditor, event);
    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  drag(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    // console.log('drag');
    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'drag';

    const origEvent = event.e.originalEvent;

    let edits;
    if (this._penDown) {
      if (origEvent.pressure === 0) {
        this._penDown = false;
        edits = this.onPenStop(tileEditor, event);
      } else {
        edits = this.onPenDrag(tileEditor, event);
      }
    } else {
      if (origEvent.pointerType === 'pen' && origEvent.pressure !== 0) {
        this._penDown = true;
        edits = this.onPenStart(tileEditor, event);
      } else {
        edits = this.onDrag(tileEditor, event);
      }
    }

    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  stop(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    // console.log('stop');
    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'stop';

    let edits;
    if (this._penDown) {
      this._penDown = false;
      edits = this.onPenStop(tileEditor, event);
    } else {
      edits = this.onStop(tileEditor, event);
    }

    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  enter(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'enter';
    const edits = this.onEnter(tileEditor, event);
    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  exit(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'exit';
    const edits = this.onExit(tileEditor, event);
    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  wheel(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[] {
    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'wheel';
    const edits = this.onWheel(tileEditor, event);
    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  protected fallback() {
    if (!this._type) {
      return;
    }
    const toolManager = this._tileEditor.toolManager;
    const fallback = toolManager.getFallback();
    if (!fallback || fallback === this) {
      return;
    }
    switch (this._type) {
      case 'start':
        fallback.start(this._tileEditor, this._event);
        break;
      case 'drag':
        fallback.drag(this._tileEditor, this._event);
        break;
      case 'stop':
        fallback.stop(this._tileEditor, this._event);
        break;
      case 'enter':
        fallback.enter(this._tileEditor, this._event);
        break;
      case 'exit':
        fallback.exit(this._tileEditor, this._event);
        break;
      case 'wheel':
        fallback.wheel(this._tileEditor, this._event);
        break;
      case 'penStart':
        fallback.penStart(this._tileEditor, this._event);
        break;
      case 'penDrag':
        fallback.penDrag(this._tileEditor, this._event);
        break;
      case 'penStop':
        fallback.penStop(this._tileEditor, this._event);
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
    const scale = editor.camera.getScale();
    const a = x1 - x2;
    const b = y1 - y2;
    const distance = Math.ceil(Math.sqrt(a * a + b * b) / (scale / 2));
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

  draw(tileEditor: UIImageEditor, x: number, y: number): void {
    const bx = x - Math.floor(tileEditor.brush.options.size / 2);
    const by = y - Math.floor(tileEditor.brush.options.size / 2);
    const ctx = tileEditor.drawSourceCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = 'low';
    ctx.drawImage(tileEditor.brushSourceCanvas, bx, by);
  }

  protected abstract onStart(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onDrag(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onEnter(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onExit(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onStop(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onWheel(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onPenStart(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onPenDrag(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  protected abstract onPenStop(tileEditor: UIImageEditor, event: ImageEditorInputEvent): ImageEdit[];

  abstract onActivate(tileEditor: UIImageEditor): void;
}
