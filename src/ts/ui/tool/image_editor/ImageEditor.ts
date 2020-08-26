import { PanelOrientation, TabOrientation } from '../../UIProperties';
import UIPanel from '../../../ui/component/UIPanel';
import UIPanelTab from '../../../ui/component/UIPanelTab';
import ImageEditManager from './ImageEditManager';
import ToolManager from './ToolManager';
import ImageEditorEvents from './ImageEditorEvents';
import Palette from '../../util/Palette';
import Brush from './brush/Brush';
import BrushTool from './tool/BrushTool';
import PanTool from './tool/PanTool';
import IconToolbarEvent from './toolbar/IconToolbarEvent';
import IconToolbarEventType from './toolbar/IconToolbarEventType';
import IconToolbar from './toolbar/IconToolbar';
import ImageEdit from './ImageEdit';
import ImageEditSection from './edit/ImageEditSection';
import BrushPanelSection from './panel/BrushPanelSection';
import PalettePanelSection from './panel/PalettePanelSection';
import ColorPanelSection from './panel/ColorPanelSection';
import PaletteEvent from '../../util/PaletteEvent';
import PaletteAction from '../../util/PaletteAction';
import CustomEventListener from '../../CustomEventListener';
import ImageEditorEvent from './ImageEditorEvent';

export default class ImageEditor extends CustomEventListener<ImageEditorEvent> {
  static SCALES = [1, 2, 4, 8, 16];
  readonly editManager: ImageEditManager;
  readonly toolManager: ToolManager;
  readonly leftToolbar: IconToolbar;
  readonly projectedCanvas: HTMLCanvasElement;
  readonly projectedBrushCanvas: HTMLCanvasElement;
  readonly projectedDrawCanvas: HTMLCanvasElement;
  readonly modifiedCtx: CanvasRenderingContext2D;
  readonly brushSourceCanvas: HTMLCanvasElement;
  readonly drawSourceCanvas: HTMLCanvasElement;
  readonly drawSourceCtx: CanvasRenderingContext2D;
  readonly $projectedCanvas: JQuery<HTMLCanvasElement>;
  pane: HTMLElement;
  paneCursor: HTMLElement;
  $parent: JQuery;
  $paneCursor: JQuery;
  events: ImageEditorEvents;
  palette: Palette;
  brush: Brush;
  rightPanel: UIPanel;
  paneOffset: number[] = [0, 0];
  scaleIndex: number = 0;
  grid: boolean = true;
  private readonly parent: HTMLElement;
  private readonly projectedCtx: CanvasRenderingContext2D;
  private readonly modifiedCanvas: HTMLCanvasElement;
  private _sourceCanvas: HTMLCanvasElement;
  private _sourceDim: number[] = [0, 0, 16, 16];
  private _onSave: (canvas: HTMLCanvasElement) => void;
  private _onCancel: () => void;
  private _bufferCanvas: HTMLCanvasElement = document.createElement('canvas');
  private _bufferCtx = this._bufferCanvas.getContext('2d');
  private cursor: { x: number, y: number } = {x: 0, y: 0};

  /** @param {HTMLElement} parentElement */
  constructor(parentElement: HTMLElement) {
    super();
    if (!parentElement) {
      throw new Error('Parent element given is null or undefined.');
    }

    this.palette = new Palette();

    // This canvas will project the modified canvas.
    this.projectedCanvas = <HTMLCanvasElement> document.createElement('canvas');
    this.projectedCanvas.classList.add('view');
    // Pane Cursor
    this.paneCursor = document.createElement('div');
    this.paneCursor.classList.add('pane-cursor');

    // Left Toolbar container.
    const toolbarElement = document.createElement('div');
    toolbarElement.classList.add('ui-icon-toolbar', 'left', 'medium');
    // Pane
    this.pane = document.createElement('div');
    this.pane.classList.add('pane');
    this.pane.appendChild(this.paneCursor);
    this.pane.appendChild(toolbarElement);

    parentElement.appendChild(this.pane);

    this.$paneCursor = $(this.paneCursor);
    this.$projectedCanvas = $(this.projectedCanvas);
    this.projectedCtx = this.projectedCanvas.getContext('2d');

    // Will be used to store the edits.
    this.modifiedCanvas = document.createElement('canvas');
    this.modifiedCtx = this.modifiedCanvas.getContext('2d');

    this.parent = this.pane;
    this.$parent = $(this.parent);

    // The draw projection canvas.
    this.projectedDrawCanvas = <HTMLCanvasElement> document.createElement('canvas');
    this.projectedDrawCanvas.classList.add('draw');
    // The brush projection canvas.
    this.projectedBrushCanvas = <HTMLCanvasElement> document.createElement('canvas');
    this.projectedBrushCanvas.classList.add('brush');

    // Add the projected canvases to the cursor in the pane container.
    this.paneCursor.appendChild(this.projectedCanvas);
    this.paneCursor.appendChild(this.projectedDrawCanvas);
    this.paneCursor.appendChild(this.projectedBrushCanvas);

    // The brush source canvas to store the rendered brush.
    this.brushSourceCanvas = document.createElement('canvas');
    // The draw source canvas to store the currently drawn result to apply to the modified canvas.
    this.drawSourceCanvas = document.createElement('canvas');
    this.drawSourceCtx = this.drawSourceCanvas.getContext('2d');

    this.leftToolbar = new IconToolbar(toolbarElement);
    this.editManager = new ImageEditManager(this);
    this.events = new ImageEditorEvents(this);

    this.toolManager = new ToolManager(this);

    const brushTool = new BrushTool();
    this.toolManager.addTool('brush', brushTool);
    this.toolManager.addTool('pan', new PanTool());
    this.toolManager.setFallback('pan');

    this.rightPanel = new UIPanel(null, null, PanelOrientation.RIGHT, TabOrientation.RIGHT);

    const paletteTab = new UIPanelTab('palette-tab');

    const colorPanelSection = new ColorPanelSection(this.palette);
    const palettePanelSection = new PalettePanelSection(this.palette);
    const brushPanelSection = new BrushPanelSection(this, brushTool.brush);
    paletteTab.add(colorPanelSection);
    paletteTab.add(palettePanelSection);
    paletteTab.add(brushPanelSection);

    this.rightPanel.add(paletteTab, 'Palette', true);
    this.parent.appendChild(this.rightPanel.element);

    this.palette.addEventListener((event: PaletteEvent) => {
      if (event.action === PaletteAction.SET_PRIMARY) {
        if (this.brush) {
          this.brush.renderMouse(this.brushSourceCanvas, this.palette, 'primary');
        }
        this.projectBrush();
      }
    });
  }

  /** @override */
  init(): void {
    this.projectedCtx.fillStyle = 'white';
    this.projectedCtx.fillRect(0, 0, this.projectedCanvas.width, this.projectedCanvas.height);
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

    $(this.projectedCanvas).on('pointermove', (e) => {
      e.stopPropagation();
      if (e.target === this.projectedCanvas || e.target === this.pane) {
        if (this.brush) {
          this.positionBrush(this.eventToPixelCoordinates(e.offsetX, e.offsetY));
        }
      }
    });
  }

  eventToPixelCoordinates(x: number | { x: number, y: number }, y?: number): { x: number, y: number } {
    if (typeof x === 'object') {
      const o = x;
      x = o.x;
      y = o.y;
    }
    const scale = ImageEditor.SCALES[this.scaleIndex];
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
    const scale = ImageEditor.SCALES[this.scaleIndex];
    return {
      x: Math.floor(x / scale),
      y: Math.floor(y / scale)
    };
  }

  positionBrush(
    x: number | { x: number, y: number } | null = null,
    y: number | null = null
  ): void {
    let _x: number = 0;
    let _y: number = 0;
    if (x && typeof x === 'object' && x.x != null && x.y != null) {
      const o = x;
      _x = o.x;
      _y = o.y;
    }

    let xMissing = false;
    let yMissing = false;
    if (!_x && !_y) {
      xMissing = true;
      yMissing = true;
    } else if (!_x) {
      xMissing = true;
    } else if (!_y) {
      yMissing = true;
    }
    if (xMissing) {
      _x = this.cursor.x;
    } else {
      this.cursor.x = _x;
    }
    if (yMissing) {
      _y = this.cursor.y;
    } else {
      this.cursor.y = _y;
    }

    const scale = ImageEditor.SCALES[this.scaleIndex];
    let radiusW = this.brushSourceCanvas.width;
    let radiusH = this.brushSourceCanvas.width;
    let px = (_x - Math.floor(this.projectedBrushCanvas.width / 2));
    let py = (_y - Math.floor(this.projectedBrushCanvas.height / 2));
    if (radiusW % 2 == 0 /* even */) {
      px -= Math.floor(scale / 2);
    }
    if (radiusH % 2 == 0 /* even */) {
      py -= Math.floor(scale / 2);
    }
    this.projectedBrushCanvas.style.top = `${(py)}px`;
    this.projectedBrushCanvas.style.left = `${(px)}px`;
  }

  editImage(
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
      this.rightPanel.getOpenTab().openAllSections();
      this._centerPane();
      this.setTool('brush');
    }, 10);

  }

  save() {
    if (this._onSave) {
      this._onSave(this.modifiedCanvas);
    }
    this._reset();
    // this.close();
  }

  cancel() {
    if (this._onCancel) {
      this._onCancel();
    }
    this._reset();
  }

  project(): void {
    const scale = ImageEditor.SCALES[this.scaleIndex];
    const scaledWidth = this.modifiedCanvas.width * scale;
    const scaledHeight = this.modifiedCanvas.height * scale;

    this.projectedCanvas.width = scaledWidth;
    this.projectedCanvas.height = scaledHeight;
    this.projectedDrawCanvas.width = scaledWidth;
    this.projectedDrawCanvas.height = scaledHeight;

    // Clear.
    this.projectedCtx.fillStyle = 'black';
    this.projectedCtx.fillRect(0, 0, this.projectedCanvas.width, this.projectedCanvas.height);
    this.projectedCtx.imageSmoothingEnabled = false;
    this.projectedCtx.imageSmoothingQuality = 'low';

    // Project modified canvas onto the visual canvas.
    this.projectedCtx.drawImage(
      this.modifiedCanvas,
      0,
      0,
      this.modifiedCanvas.width,
      this.modifiedCanvas.height,
      0,
      0,
      this.projectedCanvas.width,
      this.projectedCanvas.height
    );

    if (this.grid && scale >= 8) {
      this.projectedCtx.strokeStyle = 'rgba(127,127,127,0.5)';
      this.projectedCtx.lineWidth = 1;
      this.projectedCtx.beginPath();
      for (let y = 0; y < this.projectedCanvas.height; y += scale) {
        this.projectedCtx.moveTo(-0.5, y - 0.5);
        this.projectedCtx.lineTo(this.projectedCanvas.width - 0.5, y - 0.5);
      }
      for (let x = 0; x < this.projectedCanvas.width; x += scale) {
        this.projectedCtx.moveTo(x - 0.5, -0.5);
        this.projectedCtx.lineTo(x - 0.5, this.projectedCanvas.height - 0.5);
      }
      this.projectedCtx.stroke();

      this.projectedCtx.lineWidth = 1;
      this.projectedCtx.beginPath();
      this.projectedCtx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      for (let y = 0; y < this.projectedCanvas.height; y += scale * 16) {
        this.projectedCtx.moveTo(-0.5, y - 0.5);
        this.projectedCtx.lineTo(this.projectedCanvas.width - 0.5, y - 0.5);
      }
      for (let x = 0; x < this.projectedCanvas.width; x += scale * 16) {
        this.projectedCtx.moveTo(x - 0.5, -0.5);
        this.projectedCtx.lineTo(x - 0.5, this.projectedCanvas.height - 0.5);
      }
      this.projectedCtx.stroke();
    }
  }

  private _projectSource() {
    this.modifiedCanvas.width = this._sourceDim[2];
    this.modifiedCanvas.height = this._sourceDim[3];
    this.drawSourceCanvas.width = this._sourceDim[2];
    this.drawSourceCanvas.height = this._sourceDim[3];
    // Clear.
    this.modifiedCtx.imageSmoothingEnabled = false;
    this.modifiedCtx.fillStyle = 'black';
    this.modifiedCtx.fillRect(0, 0, this.modifiedCanvas.width, this.modifiedCanvas.height);
    this.modifiedCtx.imageSmoothingEnabled = false;
    this.modifiedCtx.imageSmoothingQuality = 'low';

    // Project.
    this.modifiedCtx.drawImage(
      this._sourceCanvas,
      this._sourceDim[0],
      this._sourceDim[1],
      this._sourceDim[2],
      this._sourceDim[3],
      0,
      0,
      this.modifiedCanvas.width,
      this.modifiedCanvas.height,
    );
  }

  setCursor(cursor: string): void {
    this.projectedCanvas.style.cursor = cursor;
  }

  private _reset() {
    this._onCancel = null;
    this._onSave = null;
    this._sourceCanvas = null;
    this._sourceDim = [0, 0, 16, 16];
    this.scaleIndex = 0;

    // Reset modified canvas.
    this.modifiedCanvas.width = 16;
    this.modifiedCanvas.height = 16;
    this.projectedDrawCanvas.width = 16;
    this.projectedDrawCanvas.height = 16;
    this.drawSourceCanvas.width = 16;
    this.drawSourceCanvas.height = 16;

    this.modifiedCtx.fillStyle = 'black';
    this.modifiedCtx.fillRect(0, 0, 16, 16);

    this.toolManager.setActive('brush');
    this.editManager.clear();

    this._centerPane();
    this.project();
  }

  private _centerPane(): void {
    this.paneOffset[0] = (this.$parent.width() / 2) - (this.projectedCanvas.width / 2);
    this.paneOffset[1] = (this.$parent.height() / 2) - (this.projectedCanvas.height / 2);
    this.paneCursor.style.top = `${this.paneOffset[1]}px`;
    this.paneCursor.style.left = `${this.paneOffset[0]}px`;
  }

  projectBrush() {
    const scale = ImageEditor.SCALES[this.scaleIndex];
    const width = this.brushSourceCanvas.width * scale;
    const height = this.brushSourceCanvas.height * scale;
    this.projectedBrushCanvas.width = width;
    this.projectedBrushCanvas.height = height;
    const ctx = this.projectedBrushCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    if (this.brush) {
      ctx.globalAlpha = this.brush.options.opacity;
    }

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

    ctx.globalAlpha = 1;
  }

  projectDraw(antialias: boolean = false) {
    const scale = ImageEditor.SCALES[this.scaleIndex];
    const width = this.drawSourceCanvas.width * scale;
    const height = this.drawSourceCanvas.height * scale;
    this.projectedDrawCanvas.width = width;
    this.projectedDrawCanvas.height = height;
    const ctx = this.projectedDrawCanvas.getContext('2d');

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

  applyDraw(antialias: boolean = false): ImageEdit {
    this._bufferCanvas.width = this.modifiedCanvas.width;
    this._bufferCanvas.height = this.modifiedCanvas.height;

    this._bufferCtx.clearRect(0, 0, this._bufferCanvas.width, this._bufferCanvas.height);
    this._bufferCtx.drawImage(this.modifiedCanvas, 0, 0);

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

    const before: ImageData = this.modifiedCtx.getImageData(0, 0, this.modifiedCanvas.width, this.modifiedCanvas.height);
    const after: ImageData = this._bufferCtx.getImageData(0, 0, this.modifiedCanvas.width, this.modifiedCanvas.height);

    return new ImageEditSection(before, after);
  }

  clearDraw(): void {
    this.drawSourceCtx.clearRect(0, 0, this.drawSourceCanvas.width, this.drawSourceCanvas.height);
  }

  setTool(id: string): void {
    this.toolManager.setActive(id);
    this.leftToolbar.setActive(id);
  }

  canUndo(): boolean {
    return this.editManager.canUndo();
  }

  canRedo(): boolean {
    return this.editManager.canRedo();
  }

  undo(): void {
    this.editManager.undo();
  }

  redo(): void {
    this.editManager.redo();
  }
}

