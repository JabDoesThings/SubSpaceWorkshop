import { LVLTileSet, toTilesetCoords } from '../../io/LVL';
import { drawAspect } from '../../util/DrawUtils';
import Editor from '../Editor';
import UIInnerWindow from '../../ui/component/frame/UIInnerWindow';
import TileEditor from './TileEditor';
import { Anchor } from '../../ui/UIProperties';
import MouseDownEvent = JQuery.MouseDownEvent;
import MouseMoveEvent = JQuery.MouseMoveEvent;
import WindowDimensions from '../../ui/component/frame/WindowDimensions';

export default class TilesetEditor extends UIInnerWindow {
  private readonly selection: number[] = [0, 0, 18, 9];
  editor: Editor;
  private readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private readonly sourceCanvas: HTMLCanvasElement;
  private sourceCtx: CanvasRenderingContext2D;
  private readonly selectionCanvas: HTMLCanvasElement;
  private selectionCtx: CanvasRenderingContext2D;
  private tileEditor: TileEditor;
  private tileset: LVLTileSet;

  constructor(editor: Editor) {
    super(document.getElementById('tileset-editor'),
      {
        canClose: true,
        canResize: true,
        canMinimize: false,
        dimensions: new WindowDimensions({
            x: 0,
            y: 0,
            width: 336,
            height: 360
          },
          {
            width: 336,
            height: 360
          }),
        anchor: Anchor.CENTER
      });
    this.editor = editor;
    this.canvas = <HTMLCanvasElement> document.getElementById('tileset-editor-view');
    this.ctx = this.canvas.getContext('2d');
    this.sourceCanvas = <HTMLCanvasElement> document.createElement('canvas');
    this.sourceCanvas.width = 304;
    this.sourceCanvas.height = 160;
    this.sourceCtx = this.sourceCanvas.getContext('2d');
    this.selectionCanvas = <HTMLCanvasElement> document.getElementById('tileset-editor-selection-view');
    this.selectionCtx = this.selectionCanvas.getContext('2d');
    this.selectionCtx.fillStyle = 'black';
    this.selectionCtx.fillRect(0, 0, 128, 128);
    this.selectionCtx.imageSmoothingEnabled = false;
    this.tileEditor = new TileEditor();
  }

  editTiles() {
    const dim = {
      x: this.selection[0] * 16,
      y: this.selection[1] * 16,
      w: (this.selection[2] + 1 - this.selection[0]) * 16,
      h: (this.selection[3] + 1 - this.selection[1]) * 16
    };

    this.options.canClose = false;
    this.tileEditor.editImage(this.sourceCanvas, dim, (source => {
      this.sourceCtx.imageSmoothingEnabled = false;
      this.sourceCtx.drawImage(source, dim.x, dim.y);
      this.draw();
      this.options.canClose = true;
    }), () => {
      this.options.canClose = true;
    });

    this.tileEditor.open();
  }

  /** @override */
  onInit() {
    this.element.style.display = 'none';
    this.tileEditor.init();
    this._initCanvasEventListeners();

    $('#tileset-editor-button-edit-tiles').on('click', () => {
      this.editTiles();
    });

    $('#tileset-editor-save').on('click', () => {
      this.save();
    });
  }

  save(): void {
    this.tileset.set(this.sourceCanvas);
    console.log('Setting Atlas Tileset.');

    const atlas = this.editor.getActiveProject().atlas;
    atlas.getTextureAtlas('tiles').setTexture(this.tileset.texture);
    atlas.setDirty(true);

    this.close(false);
  }

  /** @override */
  onOpen() {
    const activeProject = this.editor.getActiveProject();
    if (!activeProject) {
      return;
    }
    this.tileset = activeProject.tileset;
    this.revert();
    this.draw();
    this.editor.renderer.setGlassBlur(true);
  }

  /** @override */
  onClose(buttonPressed: boolean) {
    this.editor.renderer.setGlassBlur(false);
  }

  revert() {
    this.sourceCtx.fillStyle = 'red';
    this.sourceCtx.fillRect(0, 0, 304, 160);
    this.sourceCtx.drawImage(this.tileset.canvas, 0, 0);
  }

  draw() {
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(0, 0, 304, 160);
    this.ctx.drawImage(this.sourceCanvas, 0, 0);

    if (this.hasSelection()) {
      // Calculate canvas arguments from selection range.
      const tx = this.selection[0] * 16;
      const ty = this.selection[1] * 16;
      const tw = (this.selection[2] + 1) * 16 - tx;
      const th = (this.selection[3] + 1) * 16 - ty;

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
      if (event.offsetX) {
        if (mCurrent) {
          mLast = mCurrent;
        }
        mCurrent = toTilesetCoords(event.offsetX, event.offsetY);
        this.setSelection(mDown, mCurrent);
      }
    });
  }

  setSelection(topLeft: { x: number, y: number }, bottomRight: { x: number, y: number }) {
    if (topLeft == null) {
      throw new Error('the topLeft argument is null or undefined.');
    } else if (topLeft.x == null || topLeft.y == null) {
      throw new Error(`The topLeft argument has null or undefined numbers: [${topLeft.x}, ${topLeft.y}]`);
    }
    if (bottomRight == null) {
      throw new Error('the bottomRight argument is null or undefined.');
    } else if (bottomRight.x == null || bottomRight.y == null) {
      throw new Error(`The bottomRight argument has null or undefined numbers: [${bottomRight.x}, ${bottomRight.y}]`);
    }

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
