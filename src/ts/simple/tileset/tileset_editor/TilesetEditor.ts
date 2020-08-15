import { Editor } from '../../Editor';
import { LVLTileSet } from '../../../io/LVL';
import MouseDownEvent = JQuery.MouseDownEvent;
import MouseMoveEvent = JQuery.MouseMoveEvent;
import { drawAspect } from '../../../util/DrawUtils';
import { toTilesetCoords } from '../../../io/LVLUtils';
import InnerWindow from '../../ui/InnerWindow';
import TileEditor from '../tile_editor/TileEditor';

class TilesetEditor extends InnerWindow {

  private readonly selection: number[] = [0, 0, 0, 0];
  private editor: Editor;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private selectionCanvas: HTMLCanvasElement;
  private selectionCtx: CanvasRenderingContext2D;
  private tileEditor: TileEditor;
  private tileset: LVLTileSet;

  constructor(editor: Editor) {
    super(document.getElementById('tileset-editor'));
    this.editor = editor;
    this.tileEditor = new TileEditor(this);
  }

  /** @override */
  onInit() {
    this.canvas = <HTMLCanvasElement> document.getElementById('tileset-editor-view');
    this.ctx = this.canvas.getContext('2d');
    this.selectionCanvas = <HTMLCanvasElement> document.getElementById('tileset-editor-selection-view');
    this.selectionCtx = this.selectionCanvas.getContext('2d');
    this.selectionCtx.fillStyle = 'black';
    this.selectionCtx.fillRect(0, 0, 128, 128);
    this.selectionCtx.imageSmoothingEnabled = false;
    this.element.style.display = 'none';

    this.tileEditor.init();

    this._initCanvasEventListeners();

    $('#tileset-editor-button-edit-tiles').on('click', () => {

      const dim = [
        this.selection[0] * 16,
        this.selection[1] * 16,
        (this.selection[2] + 1 - this.selection[0]) * 16,
        (this.selection[3] + 1 - this.selection[1]) * 16
      ];

      this.tileEditor.setSource(this.tileset.canvas, dim, (source => {
        this.ctx.drawImage(source, dim[0], dim[1]);
      }), () => {

      });

      $('#tileset-editor-save').on('click', () => {
        this.save();
      });

      this.tileEditor.open();
    });
  }

  save(): void {
    this.tileset.set(this.canvas);
    console.log('Setting Atlas Tileset.');

    const atlas = this.editor.getActiveProject().atlas;
    atlas.getTextureAtlas('tiles').setTexture(this.tileset.texture);
    atlas.setDirty(true);

    this.close();
  }

  /** @override */
  onOpen() {
    const activeProject = this.editor.getActiveProject();
    if (!activeProject) {
      return;
    }
    this.tileset = activeProject.tileset;
    this.draw();
  }

  /** @override */
  onClose() {
  }

  draw() {
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, 304, 160);
    this.ctx.drawImage(this.tileset.canvas, 0, 0);

    if (this.hasSelection()) {
      // Calculate canvas arguments from selection range.
      let tx = this.selection[0] * 16;
      let ty = this.selection[1] * 16;
      let tw = (this.selection[2] + 1) * 16 - tx;
      let th = (this.selection[3] + 1) * 16 - ty;

      // Draw the selected tiles to the preview screen.
      this.selectionCtx.fillStyle = 'black';
      this.selectionCtx.fillRect(0, 0, 128, 128);
      drawAspect(this.canvas, this.selectionCanvas, tx, ty, tw, th);

      // Draw outline.
      this.ctx.strokeStyle = 'red';
      this.ctx.strokeRect(tx + 0.5, ty + 0.5, tw - 1, th - 1);
    }
  }

  private _initCanvasEventListeners(): void {
    let down = false;
    let mDown: { x: number, y: number };
    let mLast: { x: number, y: number };
    let mCurrent: { x: number, y: number };

    $(this.canvas).on('mousedown', (event: MouseDownEvent) => {
      if (!this.enabled) {
        return;
      }
      event.stopPropagation();
      down = true;
      mDown = toTilesetCoords(event.offsetX, event.offsetY);
      mCurrent = mDown;
      this.setSelection(mDown, mCurrent);
    });

    // If the selection ends with the mouse outside of the canvas.
    $(window).on('mouseup', () => {
      down = false;
    });

    $(this.canvas).on('mousemove', (event: MouseMoveEvent) => {
      if (!this.enabled) {
        return;
      }
      if (!down) {
        return;
      }
      if (mCurrent) {
        mLast = mCurrent;
      }
      mCurrent = toTilesetCoords(event.offsetX, event.offsetY);
      this.setSelection(mDown, mCurrent);
    });
  }

  setSelection(topLeft: { x: number, y: number }, bottomRight: { x: number, y: number }) {
    let x1 = topLeft.x;
    let y1 = topLeft.y;
    let x2 = bottomRight.x;
    let y2 = bottomRight.y;

    if (x2 < x1) {
      const temp = x2;
      x2 = x1;
      x1 = temp;
    }
    if (y2 < y1) {
      const temp = y2;
      y2 = y1;
      y1 = temp;
    }

    this.selection[0] = x1;
    this.selection[1] = y1;
    this.selection[2] = x2;
    this.selection[3] = y2;

    this.draw();
  }

  hasSelection(): boolean {
    return this.selection[0] !== -1;
  }
}

export default TilesetEditor;
