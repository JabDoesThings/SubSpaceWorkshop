import TileEditTool from './TileEditTool';
import TileEditor from '../TileEditor';
import TileEdit from '../TileEdit';
import CircleBrush from '../brush/CircleBrush';
import Brush from '../brush/Brush';
import TileEditorEvent from '../TileEditorEvent';

export default class LineTool extends TileEditTool {
  private middleDown: boolean = false;
  private brush: Brush;
  private down: { x: number, y: number };
  private last: { x: number, y: number };
  private penDown: boolean = false;

  /** @override */
  onActivate(tileEditor: TileEditor): void {
    tileEditor.setCursor('none');
    if (!this.brush) {
      this.brush = new CircleBrush();
    }
    tileEditor.setBrush(this.brush);
    this.brush.renderMouse(tileEditor.brushSourceCanvas);
    tileEditor.projectBrush();
  }

  /** @override */
  protected onStart(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    if (event.button === 1) {
      this.middleDown = true;
      this.fallback();
      return;
    }

    this.down = tileEditor.toPixelCoordinates(event.e.offsetX, event.e.offsetY);
    this.last = {x: this.down.x, y: this.down.y};

    this.brush.renderMouse(tileEditor.brushSourceCanvas);
    this.draw(tileEditor, this.down.x, this.down.y);

    return null;
  }

  /** @override */
  protected onDrag(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    return [];
  }

  /** @override */
  protected onStop(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    return [];
  }

  /** @override */
  protected onEnter(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    return [];
  }

  /** @override */
  protected onExit(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    return [];
  }

  /** @override */
  protected onWheel(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    return [];
  }

  /** @override */
  protected onPenStart(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    return [];
  }

  /** @override */
  protected onPenDrag(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    return [];
  }

  /** @override */
  protected onPenStop(tileEditor: TileEditor, event: TileEditorEvent): TileEdit[] {
    return [];
  }

}
