import TileEditor from '../TileEditor';
import TileTool from './TileEditTool';

import { TileEditorEvent, TileEditorEventType } from '../TileEditorEvents';
import TileEdit from '../TileEdit';

class TileEditToolManager {

  private readonly tools: { [id: string]: TileTool } = {};
  private tileEditor: TileEditor;
  private active: string = null;
  private fallback: string = null;

  /**
   * @constructor
   *
   * @param {TileEditor} tileEditor
   */
  constructor(tileEditor: TileEditor) {
    this.tileEditor = tileEditor;

    let downTool: TileTool;

    tileEditor.events.addMouseListener((event: TileEditorEvent) => {
      let edits: TileEdit[];
      let push = false;
      let reset = false;

      downTool = this.getActive();
      const target = event.e ? event.e.target : null;
      if (event.type !== TileEditorEventType.EXIT && event.type !== TileEditorEventType.ENTER && target !== tileEditor.canvas) {
        downTool = this.tools[this.fallback];
      }
      if (downTool == null) {
        return;
      }

      switch (event.type) {

        // Pen events.
        case TileEditorEventType.PEN_HOVER:
          break;
        case TileEditorEventType.PEN_DOWN:
          edits = downTool.penStart(tileEditor, event);
          break;
        case TileEditorEventType.PEN_DRAG:
          edits = downTool.penDrag(tileEditor, event);
          break;
        case TileEditorEventType.PEN_UP:
          edits = downTool.penStop(tileEditor, event);
          push = reset = true;
          break;

        case TileEditorEventType.DOWN:
          edits = downTool.start(tileEditor, event);
          break;
        case TileEditorEventType.DRAG:
          edits = downTool.drag(tileEditor, event);
          break;
        case TileEditorEventType.UP:
          edits = downTool.stop(tileEditor, event);
          push = reset = true;
          break;
        case TileEditorEventType.ENTER:
          edits = downTool.enter(tileEditor, event);
          break;
        case TileEditorEventType.EXIT:
          edits = downTool.exit(tileEditor, event);
          break;
        case TileEditorEventType.WHEEL_UP:
        case TileEditorEventType.WHEEL_DOWN:
          edits = downTool.wheel(tileEditor, event);
          break;
      }

      if (edits != null && edits.length !== 0) {
        tileEditor.editManager.append(edits);
      }
      if (push) {
        tileEditor.editManager.push();
      }
      if (reset) {
        downTool = null;
      }
    });
  }

  getActive(): TileTool {
    return this.active == null ? null : this.tools[this.active];
  }

  setActive(id: string): void {
    this.active = id;
    const activeTool = this.tools[this.active];
    if (activeTool) {
      activeTool.onActivate(this.tileEditor);
    }
  }

  addTool(id: string, brush: TileTool): void {
    this.tools[id] = brush;
  }

  getTool(id: string): TileTool {
    return this.tools[id];
  }

  getFallback(): TileTool {
    return this.tools[this.fallback];
  }

  setFallback(id: string): void {
    this.fallback = id;
  }
}

export default TileEditToolManager;
