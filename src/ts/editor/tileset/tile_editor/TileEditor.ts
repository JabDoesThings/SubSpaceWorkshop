import UIInnerWindow from '../../../ui/component/UIInnerWindow';
import TilesetEditor from '../tileset_editor/TilesetEditor';
import { IconToolbar, IconToolbarEvent, IconToolbarEventType } from '../IconToolbar';
import { TileEditManager } from './TileEditManager';
import { TileEditorEvents } from './TileEditorEvents';
import TileToolManager from './tool/TileEditToolManager';
import BrushTool from './tool/BrushTool';
import PanTool from './tool/PanTool';
import Brush from './brush/Brush';
import TileEdit from './TileEdit';
import TileEditSection from './TileEditSection';
import Palette from './Palette';
import PaletteColor from './PaletteColor';

class TileEditor extends UIInnerWindow {

  static SCALES = [1, 2, 4, 8, 16];

  readonly editManager: TileEditManager;
  readonly toolManager: TileToolManager;
  readonly tilesetEditor: TilesetEditor;
  readonly leftToolbar: IconToolbar;
  readonly canvas: HTMLCanvasElement;
  readonly $canvas: JQuery<HTMLCanvasElement>;
  readonly modCtx: CanvasRenderingContext2D;
  $content: JQuery;
  paneContainer: HTMLElement;
  pane: HTMLElement;
  $pane: JQuery<HTMLElement>;
  paneOffset: number[] = [0, 0];
  scaleIndex: number = 0;
  events: TileEditorEvents;
  grid: boolean = true;
  private readonly _ctx: CanvasRenderingContext2D;
  private readonly modCanvas: HTMLCanvasElement;
  private _sourceDim: number[] = [0, 0, 16, 16];
  private _sourceCanvas: HTMLCanvasElement;
  private _onSave: (canvas: HTMLCanvasElement) => void;
  private _onCancel: () => void;

  palette: Palette;

  brushSourceCanvas: HTMLCanvasElement;
  brushCanvas: HTMLCanvasElement;
  brush: Brush;

  drawCanvas: HTMLCanvasElement;
  drawSourceCanvas: HTMLCanvasElement;

  constructor(tilesetEditor: TilesetEditor) {
    super(document.getElementById('tile-editor'));
    this.tilesetEditor = tilesetEditor;

    this.palette = new Palette();

    // Will be used to store the edits.
    this.modCanvas = document.createElement('canvas');
    this.modCtx = this.modCanvas.getContext('2d');

    // This canvas will project the modified canvas.
    this.canvas = <HTMLCanvasElement> document.getElementById('tile-editor-view');
    this.$canvas = $(this.canvas);
    this._ctx = this.canvas.getContext('2d');
    this.pane = document.getElementById('tile-editor-view-pane');
    this.$pane = $(this.pane);
    this.paneContainer = this.pane.parentElement;

    this.$content = $(this.pane.parentElement);
    this.brushSourceCanvas = document.createElement('canvas');

    this.brushCanvas = <HTMLCanvasElement> document.getElementById('tile-editor-brush');
    this.drawCanvas = <HTMLCanvasElement> document.getElementById('tile-editor-view-draw');

    this.drawSourceCanvas = document.createElement('canvas');
    const toolbarElement = document.getElementById('tile-editor-left-toolbar');

    this.leftToolbar = new IconToolbar(toolbarElement);
    this.editManager = new TileEditManager(this);
    this.events = new TileEditorEvents(this);

    this.toolManager = new TileToolManager(this);
    this.toolManager.addTool('brush', new BrushTool());
    this.toolManager.addTool('pan', new PanTool());
    this.toolManager.setFallback('pan');
    this.setTool('brush');
  }

  /** @override */
  onInit(): void {
    this._ctx.fillStyle = 'white';
    this._ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.leftToolbar.create('brush', ['fas', 'fa-paint-brush'], 'Brush');
    this.leftToolbar.create('line', ['fas', 'fa-slash'], 'Line');
    this.leftToolbar.create('square', ['fas', 'fa-square'], 'Square');
    this.leftToolbar.create('circle', ['fas', 'fa-circle'], 'Circle');
    this.leftToolbar.addEventListener((event: IconToolbarEvent) => {
      if (event.type === IconToolbarEventType.SET_ACTIVE) {
        this.toolManager.setActive(event.tool.id);
      }
    });
    this._reset();

    $(this.canvas).on('pointermove', (e) => {
      e.stopPropagation();
      if (e.target === this.canvas || e.target === this.paneContainer) {
        if (this.brush) {
          this.positionBrush(this.eventToPixelCoordinates(e.offsetX, e.offsetY));
        }
      }
    });

    $('#tile-editor-save').on('click', () => {
      this.save();
    });
  }

  eventToPixelCoordinates(x: number | { x: number, y: number }, y?: number): { x: number, y: number } {
    if (typeof x === 'object') {
      const o = x;
      x = o.x;
      y = o.y;
    }
    const scale = TileEditor.SCALES[this.scaleIndex];
    const sOffset = Math.floor(scale / 2) - 1;
    x = ((Math.floor(x / scale)) * scale) + sOffset;
    y = ((Math.floor(y / scale)) * scale) + sOffset;
    return {x, y};
  }

  toPixelCoordinates(x: number | { x: number, y: number }, y?: number): { x: number, y: number } {
    if (typeof x === 'object') {
      const o = x;
      x = o.x;
      y = o.y;
    }
    const scale = TileEditor.SCALES[this.scaleIndex];
    return {
      x: Math.floor(x / scale),
      y: Math.floor(y / scale)
    };
  }

  positionBrush(x: number | { x: number, y: number }, y?: number): void {
    if (typeof x === 'object') {
      const o = x;
      x = o.x;
      y = o.y;
    }
    const position = this.$pane.position();
    this.brushCanvas.style.top = `${(position.top + y) - Math.floor(this.brushCanvas.height / 2)}px`;
    this.brushCanvas.style.left = `${(position.left + x) - Math.floor(this.brushCanvas.width / 2)}px`;
  }

  /** @override */
  onOpen(): void {
    this.setTool('brush');
  }

  /** @override */
  onClose(): void {
  }

  setSource(
    source: HTMLCanvasElement,
    dim: number[],
    onSave: (source: HTMLCanvasElement) => void,
    onCancel: () => void) {
    if (dim.length !== 4) {
      throw new Error('The dim array does not contain 4 numbers representing sx, sy, sw, and sh.');
    }

    source.getContext('2d').imageSmoothingEnabled = false;
    this._sourceDim = dim;
    this._sourceCanvas = source;
    this.scaleIndex = 0;
    this._onSave = onSave;
    this._onCancel = onCancel;

    this._projectSource();
    this.project();
    setTimeout(() => {
      this._centerPane();
    }, 10);
  }

  save() {
    if (this._onSave) {
      this._onSave(this.modCanvas);
    }
    this._reset();
    this.close();
  }

  cancel() {
    if (this._onCancel) {
      this._onCancel();
    }
    this._reset();
    this.close();
  }

  project(): void {
    const scale = TileEditor.SCALES[this.scaleIndex];
    const scaledWidth = this.modCanvas.width * scale;
    const scaledHeight = this.modCanvas.height * scale;

    this.canvas.width = scaledWidth;
    this.canvas.height = scaledHeight;
    this.drawCanvas.width = scaledWidth;
    this.drawCanvas.height = scaledHeight;

    // Clear.
    this._ctx.fillStyle = 'black';
    this._ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this._ctx.imageSmoothingEnabled = false;
    this._ctx.imageSmoothingQuality = 'low';

    // Project modified canvas onto the visual canvas.
    this._ctx.drawImage(
      this.modCanvas,
      0,
      0,
      this.modCanvas.width,
      this.modCanvas.height,
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    if (this.grid && scale >= 8) {
      this._ctx.strokeStyle = 'rgba(127,127,127,0.5)';
      this._ctx.lineWidth = 1;
      this._ctx.beginPath();
      for (let y = 0; y < this.canvas.height; y += scale) {
        this._ctx.moveTo(-0.5, y - 0.5);
        this._ctx.lineTo(this.canvas.width - 0.5, y - 0.5);
      }
      for (let x = 0; x < this.canvas.width; x += scale) {
        this._ctx.moveTo(x - 0.5, -0.5);
        this._ctx.lineTo(x - 0.5, this.canvas.height - 0.5);
      }
      this._ctx.stroke();

      this._ctx.lineWidth = 1;
      this._ctx.beginPath();
      this._ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      for (let y = 0; y < this.canvas.height; y += scale * 16) {
        this._ctx.moveTo(-0.5, y - 0.5);
        this._ctx.lineTo(this.canvas.width - 0.5, y - 0.5);
      }
      for (let x = 0; x < this.canvas.width; x += scale * 16) {
        this._ctx.moveTo(x - 0.5, -0.5);
        this._ctx.lineTo(x - 0.5, this.canvas.height - 0.5);
      }
      this._ctx.stroke();
    }
  }

  private _projectSource() {
    this.modCanvas.width = this._sourceDim[2];
    this.modCanvas.height = this._sourceDim[3];
    this.drawSourceCanvas.width = this._sourceDim[2];
    this.drawSourceCanvas.height = this._sourceDim[3];
    // Clear.
    this.modCtx.imageSmoothingEnabled = false;
    this.modCtx.fillStyle = 'black';
    this.modCtx.fillRect(0, 0, this.modCanvas.width, this.modCanvas.height);
    this.modCtx.imageSmoothingEnabled = false;
    this.modCtx.imageSmoothingQuality = 'low';

    // Project.
    this.modCtx.drawImage(
      this._sourceCanvas,
      this._sourceDim[0],
      this._sourceDim[1],
      this._sourceDim[2],
      this._sourceDim[3],
      0,
      0,
      this.modCanvas.width,
      this.modCanvas.height,
    );
  }

  setCursor(cursor: string): void {
    this.canvas.style.cursor = cursor;
  }

  private _reset() {
    this._onCancel = null;
    this._onSave = null;
    this._sourceCanvas = null;
    this._sourceDim = [0, 0, 16, 16];
    this.scaleIndex = 0;

    // Reset modified canvas.
    this.modCanvas.width = 16;
    this.modCanvas.height = 16;
    this.drawCanvas.width = 16;
    this.drawCanvas.height = 16;
    this.drawSourceCanvas.width = 16;
    this.drawSourceCanvas.height = 16;

    this.modCtx.fillStyle = 'black';
    this.modCtx.fillRect(0, 0, 16, 16);

    this.toolManager.setActive('brush');

    this._centerPane();
    this.project();
  }

  private _centerPane(): void {
    this.paneOffset[0] = (this.$content.width() / 2) - (this.canvas.width / 2);
    this.paneOffset[1] = (this.$content.height() / 2) - (this.canvas.height / 2);
    this.pane.style.top = `${this.paneOffset[1]}px`;
    this.pane.style.left = `${this.paneOffset[0]}px`;
  }

  setBrush(brush: Brush) {
    this.brush = brush;
  }

  projectBrush() {
    const scale = TileEditor.SCALES[this.scaleIndex];
    const width = this.brushSourceCanvas.width * scale;
    const height = this.brushSourceCanvas.height * scale;
    this.brushCanvas.width = width;
    this.brushCanvas.height = height;
    const ctx = this.brushCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(
      this.brushSourceCanvas,
      0,
      0,
      this.brushSourceCanvas.width,
      this.brushSourceCanvas.height,
      0,
      0,
      width,
      height
    );
  }

  projectDraw(antialias: boolean = false) {
    const scale = TileEditor.SCALES[this.scaleIndex];
    const width = this.drawSourceCanvas.width * scale;
    const height = this.drawSourceCanvas.height * scale;
    this.drawCanvas.width = width;
    this.drawCanvas.height = height;
    const ctx = this.drawCanvas.getContext('2d');

    if (antialias) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    } else {
      ctx.imageSmoothingEnabled = false;
    }
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(
      this.drawSourceCanvas,
      0,
      0,
      this.drawSourceCanvas.width,
      this.drawSourceCanvas.height,
      0,
      0,
      width,
      height
    );
    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = 'low';
  }

  private _buffer: HTMLCanvasElement = document.createElement('canvas');
  private _bufferCtx = this._buffer.getContext('2d');

  applyDraw(antialias: boolean = false): TileEdit {
    this._buffer.width = this.modCanvas.width;
    this._buffer.height = this.modCanvas.height;

    this._bufferCtx.clearRect(0, 0, this._buffer.width, this._buffer.height);
    this._bufferCtx.drawImage(this.modCanvas, 0, 0);

    if (antialias) {
      this._bufferCtx.imageSmoothingEnabled = true;
      this._bufferCtx.imageSmoothingQuality = 'high';
    } else {
      this._bufferCtx.imageSmoothingEnabled = false;
      this._bufferCtx.imageSmoothingQuality = 'low';
    }
    this._bufferCtx.drawImage(this.drawSourceCanvas, 0, 0);

    this._bufferCtx.imageSmoothingEnabled = false;
    this._bufferCtx.imageSmoothingQuality = 'low';

    const before: ImageData = this.modCtx.getImageData(0, 0, this.modCanvas.width, this.modCanvas.height);
    const after: ImageData = this._bufferCtx.getImageData(0, 0, this.modCanvas.width, this.modCanvas.height);

    return new TileEditSection(before, after);
  }

  clearDraw(): void {
    const ctx = this.drawSourceCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.drawSourceCanvas.width, this.drawSourceCanvas.height);
  }

  setTool(id: string): void {
    this.toolManager.setActive(id);
    this.leftToolbar.setActive(id);
  }
}

export default TileEditor;
