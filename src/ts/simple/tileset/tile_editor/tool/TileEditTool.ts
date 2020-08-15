import TileEditor from '../TileEditor';
import TileEdit from '../TileEdit';
import { TileEditorEvent } from '../TileEditorEvents';
import { MathUtils } from 'three';
import lerp = MathUtils.lerp;

export abstract class TileEditTool {

  isSelector: boolean = false;

  private _tileEditor: TileEditor;
  private _event: TileEditorEvent;
  private _type: string;

  private _penDown: boolean = false;

  penStart(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {

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

  penDrag(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'penDrag';

    const edits = this.onPenDrag(tileEditor, event);

    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  penStop(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
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

  start(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {

    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'start';

    const edits = this.onStart(tileEditor, event);

    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  drag(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
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

  stop(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
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

  enter(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'enter';

    const edits = this.onEnter(tileEditor, event);

    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  exit(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    this._tileEditor = tileEditor;
    this._event = event;
    this._type = 'exit';

    const edits = this.onExit(tileEditor, event);

    this._tileEditor = null;
    this._event = null;
    this._type = null;
    return edits;
  }

  wheel(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
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
    tileEditor: TileEditor,
    x1: number,
    y1: number,
    x2: number = null,
    y2: number = null,
    size: number = null,
    opacity: number = 1
  ): void {

    if (size) {
      tileEditor.brush.onPressure(tileEditor.brushSourceCanvas, size);
    }

    if (!x2 || !y2) {
      this.draw(tileEditor, x1, y1, opacity);
      return;
    }

    const scale = TileEditor.SCALES[tileEditor.scaleIndex];
    const a = x1 - x2;
    const b = y1 - y2;
    const distance = Math.ceil(Math.sqrt(a * a + b * b) / (scale / 2));

    if (distance <= 1) {
      this.draw(tileEditor, x2, y2, opacity);
      return;
    }

    for (let position = 0; position <= distance; position++) {
      const _lerp = position / distance;
      const x = lerp(x1, x2, _lerp);
      const y = lerp(y1, y2, _lerp);
      this.draw(tileEditor, x, y, opacity);
    }
  }

  draw(tileEditor: TileEditor, x: number, y: number, opacity: number = 1): void {
    const bx = x - Math.floor(tileEditor.brush.size / 2);
    const by = y - Math.floor(tileEditor.brush.size / 2);
    const ctx = tileEditor.drawSourceCanvas.getContext('2d');
    ctx.globalAlpha = opacity;
    ctx.drawImage(tileEditor.brushSourceCanvas, bx, by);
  }

  protected abstract onStart(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[];

  protected abstract onDrag(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[];

  protected abstract onEnter(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[];

  protected abstract onExit(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[];

  protected abstract onStop(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[];

  protected abstract onWheel(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[];

  protected abstract onPenStart(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[];

  protected abstract onPenDrag(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[];

  protected abstract onPenStop(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[];

  abstract onActivate(tileEditor: TileEditor): void;
}

export default TileEditTool;
