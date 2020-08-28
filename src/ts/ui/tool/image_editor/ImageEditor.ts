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
import ImageEditorEvent from './ImageEditorEvent';
import UIPanelFrame from '../../component/frame/UIPanelFrame';
import ImageEditorRenderer from './ImageEditorRenderer';
import ImageEditorCamera from './ImageEditorCamera';

/**
 * The <i>ImageEditor</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ImageEditor extends UIPanelFrame<ImageEditorEvent> {
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
  sourceCanvas: HTMLCanvasElement;
  sourceDim: number[] = [0, 0, 16, 16];
  $parent: JQuery;
  $paneCursor: JQuery;
  events: ImageEditorEvents;
  palette: Palette;
  brush: Brush;
  camera: ImageEditorCamera;
  renderer: ImageEditorRenderer;

  readonly projectedCtx: CanvasRenderingContext2D;
  readonly modifiedCanvas: HTMLCanvasElement;
  private readonly parent: HTMLElement;
  private _onSave: (canvas: HTMLCanvasElement) => void;
  private _onCancel: () => void;
  private _bufferCanvas: HTMLCanvasElement = document.createElement('canvas');
  private _bufferCtx = this._bufferCanvas.getContext('2d');

  /** @param {HTMLElement} parentElement */
  constructor(parentElement: HTMLElement) {
    super(false, true);
    if (!parentElement) {
      throw new Error('Parent element given is null or undefined.');
    }

    this.palette = new Palette();

    this.content.classList.add('ui-image-editor');

    // This canvas will project the modified canvas.
    this.projectedCanvas = <HTMLCanvasElement> document.createElement('canvas');
    this.projectedCanvas.classList.add('view');
    // Pane Cursor
    this.paneCursor = document.createElement('div');
    this.paneCursor.classList.add('pane-cursor');

    // Left Toolbar container.
    const toolbarElement = document.createElement('div');
    toolbarElement.classList.add('ui-icon-toolbar', 'image-editor-toolbar', 'left', 'medium');
    // Pane
    this.pane = document.createElement('div');
    this.pane.classList.add('pane');
    this.pane.appendChild(this.paneCursor);
    this.element.appendChild(toolbarElement);

    this.content.appendChild(this.pane);
    parentElement.appendChild(this.element);
    // parentElement.appendChild(this.pane);

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
    this.content.appendChild(this.projectedBrushCanvas);

    // The brush source canvas to store the rendered brush.
    this.brushSourceCanvas = document.createElement('canvas');
    // The draw source canvas to store the currently drawn result to apply to the modified canvas.
    this.drawSourceCanvas = document.createElement('canvas');
    this.drawSourceCtx = this.drawSourceCanvas.getContext('2d');

    this.camera = new ImageEditorCamera(this);
    this.renderer = new ImageEditorRenderer(this);

    this.leftToolbar = new IconToolbar(toolbarElement);
    this.editManager = new ImageEditManager(this);
    this.events = new ImageEditorEvents(this);

    this.toolManager = new ToolManager(this);

    const brushTool = new BrushTool();
    this.toolManager.addTool('brush', brushTool);
    this.toolManager.addTool('pan', new PanTool());
    this.toolManager.setFallback('pan');

    // this.rightPanel = new UIPanel(null, null, PanelOrientation.RIGHT, TabOrientation.RIGHT);

    const paletteTab = new UIPanelTab('palette-tab');

    const colorPanelSection = new ColorPanelSection(this.palette);
    const palettePanelSection = new PalettePanelSection(this.palette);
    const brushPanelSection = new BrushPanelSection(this, brushTool.brush);
    paletteTab.add(colorPanelSection);
    paletteTab.add(palettePanelSection);
    paletteTab.add(brushPanelSection);

    this.panelRight.add(paletteTab, 'Palette', true);
    // this.parent.appendChild(this.panelRight.element);
    this.rightOpen = true;

    this.palette.addEventListener((event: PaletteEvent) => {
      if (event.action === PaletteAction.SET_PRIMARY) {
        if (this.brush) {
          this.brush.renderMouse(this.brushSourceCanvas, this.palette, 'primary');
        }
        this.camera.projectBrush();
      }
    });

    $(this.content).on('pointermove', (e) => {
      if (e.target !== this.content && e.target !== this.projectedDrawCanvas) {
        return;
      }
      // e.stopPropagation();
      if (this.brush) {
        let coords = {x: e.offsetX, y: e.offsetY};
        if (e.target === this.projectedDrawCanvas) {
          coords = this.camera.paneToCanvasCoordinates(coords.x, coords.y);
        }
        this.positionBrush(coords.x, coords.y);
      }
    });

    this.content.style.cursor = 'none';
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
  }

  positionBrush(x: number, y: number): void {
    const scale = this.camera.getScale();
    let radiusW = this.brushSourceCanvas.width;
    let radiusH = this.brushSourceCanvas.height;
    let px = (x - Math.floor(this.projectedBrushCanvas.width / 2));
    let py = (y - Math.floor(this.projectedBrushCanvas.height / 2));
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
    this.sourceDim = dim;
    this.sourceCanvas = source;
    this.camera.resetScale();
    this._onSave = onSave;
    this._onCancel = onCancel;

    this.renderer.drawSourceToModified();

    setTimeout(() => {
      this.panelRight.getOpenTab().openAllSections();
      // this._centerPane();
      this.camera.center();
      this.renderer.render();
      this.setTool('brush');
    }, 10);
  }

  save() {
    if (this._onSave) {
      this._onSave(this.modifiedCanvas);
    }
    this._reset();
  }

  cancel() {
    if (this._onCancel) {
      this._onCancel();
    }
    this._reset();
  }

  setCursor(cursor: string): void {
    this.content.style.cursor = cursor;
  }

  private _reset() {
    this._onCancel = null;
    this._onSave = null;
    this.sourceCanvas = null;
    this.sourceDim = [0, 0, 16, 16];
    // const scale = this.camera.getScale();

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

    // this._centerPane();

    // this.project();
    this.camera.center();
    this.renderer.render();
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

  showBrush() {
    this.projectedBrushCanvas.style.visibility = 'visible';
    this.setCursor('none');
  }

  hideBrush() {
    this.projectedBrushCanvas.style.visibility = 'hidden';
    this.setCursor('default');
  }
}

