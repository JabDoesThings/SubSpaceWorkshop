import { clearCanvas } from '../../../util/DrawUtils';
import Palette from '../../util/Palette';
import PaletteEvent from '../../util/PaletteEvent';
import PaletteAction from '../../util/PaletteAction';
import BrushPanelSection from './panel/BrushPanelSection';
import ColorPanelSection from './panel/ColorPanelSection';
import UIPanelFrame from '../../component/frame/UIPanelFrame';
import UIPanelTab from '../../../ui/component/UIPanelTab';
import IconToolbar from './toolbar/IconToolbar';
import IconToolbarEvent from './toolbar/IconToolbarEvent';
import IconToolbarEventType from './toolbar/IconToolbarEventType';
import ImageEditorRenderer from './ImageEditorRenderer';
import ImageEditorCamera from './ImageEditorCamera';
import ImageEditManager from './ImageEditManager';
import ImageEditorEvents from './ImageEditorEvents';
import ImageEditorEvent from './ImageEditorEvent';
import ToolManager from './ToolManager';
import BrushTool from './tool/BrushTool';
import PanTool from './tool/PanTool';
import Brush from './brush/Brush';
import ImageTool from './tool/ImageTool';
import LineTool from './tool/LineTool';
import SquareTool from './tool/SquareTool';
import CircleTool from './tool/CircleTool';
import PencilTool from './tool/PencilTool';

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
  readonly camera: ImageEditorCamera;
  readonly renderer: ImageEditorRenderer;
  readonly projectedCtx: CanvasRenderingContext2D;
  readonly modifiedCanvas: HTMLCanvasElement;
  pane: HTMLElement;
  paneCursor: HTMLElement;
  sourceCanvas: HTMLCanvasElement;
  srcDims: { x: number, y: number, w: number, h: number } = {x: 0, y: 0, w: 16, h: 16};
  $pane: JQuery;
  $paneCursor: JQuery;
  events: ImageEditorEvents;
  palette: Palette;
  brush: Brush;
  private _onSave: (canvas: HTMLCanvasElement) => void;
  private _onCancel: () => void;

  /** @param {HTMLElement} parentElement */
  constructor(parentElement: HTMLElement) {
    super(false, true);
    if (!parentElement) {
      throw new Error('Parent element given is null or undefined.');
    }

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
    this.$pane = $(this.pane);
    this.$paneCursor = $(this.paneCursor);
    this.$projectedCanvas = $(this.projectedCanvas);
    this.projectedCtx = this.projectedCanvas.getContext('2d');
    // Will be used to store the edits.
    this.modifiedCanvas = document.createElement('canvas');
    this.modifiedCtx = this.modifiedCanvas.getContext('2d');
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

    $(this.content).on('pointermove', (e) => {
      if (e.target !== this.content && e.target !== this.projectedDrawCanvas) {
        return;
      }
      if (this.brush) {
        let coords = {x: e.offsetX, y: e.offsetY};
        if (e.target === this.projectedDrawCanvas) {
          coords = this.camera.paneToCanvasCoordinates(coords.x, coords.y);
        }
        this.camera.positionBrush(coords.x, coords.y);
      }
    });

    const brushTool = new BrushTool();
    this.addTool('pencil', 'Pencil', new PencilTool(), ['fas', 'fa-pencil-alt']);
    this.addTool('brush', 'Brush', brushTool, ['fas', 'fa-paint-brush']);
    this.addTool('line', 'Line', new LineTool(), ['fas', 'fa-slash']);
    this.addTool('square', 'Square', new SquareTool(), ['fas', 'fa-square']);
    this.addTool('circle', 'Circle', new CircleTool(), ['fas', 'fa-circle']);
    this.addTool('pan', 'Pan', new PanTool(), ['fas', 'fa-arrows-alt']);
    this.toolManager.setFallback('pan');

    this.palette = new Palette();

    const paletteTab = new UIPanelTab('palette-tab');
    const colorPanelSection = new ColorPanelSection(this.palette);
    const brushPanelSection = new BrushPanelSection(this, brushTool.brush);
    paletteTab.add(colorPanelSection);
    paletteTab.add(brushPanelSection);
    this.panelRight.add(paletteTab, 'Options', true);

    this.reset();
    this.setCursor('none');

    this.palette.addEventListener((event: PaletteEvent) => {
      if (event.action === PaletteAction.SET_PRIMARY) {
        if (this.brush) {
          this.brush.renderMouse(this.brushSourceCanvas, this.palette, 'primary');
        }
        this.camera.projectBrush();
      }
    });

    this.leftToolbar.addEventListener((event: IconToolbarEvent) => {
      if (event.type === IconToolbarEventType.SET_ACTIVE) {
        this.toolManager.setActive(event.tool.id);
      }
    });
  }

  editImage(
    source: HTMLCanvasElement,
    srcDims: { x: number, y: number, w: number, h: number },
    onSave: (source: HTMLCanvasElement) => void,
    onCancel: () => void) {
    if (srcDims == null) {
      throw new Error('The source dimensions is undefined or null');
    } else if (srcDims.x == null || srcDims.y == null || srcDims.w == null || srcDims.h == null) {
      throw new Error(
        `The source dimensions contain null or undefined values: {x: ${srcDims.x}, y: ${srcDims.y}, w: ${srcDims.w}, h: ${srcDims.h}`
      );
    }
    source.getContext('2d').imageSmoothingEnabled = false;
    this.srcDims = srcDims;
    this.sourceCanvas = source;
    this._onSave = onSave;
    this._onCancel = onCancel;
    this.renderer.drawSourceToModified(srcDims);
    this.camera.resetScale();
    this.camera.center();

    setTimeout(() => {
      this.panelRight.getOpenTab().openAllSections();
      this.renderer.render();
      this.setTool('brush');
      this.updateFrame();
    }, 10);
  }

  save() {
    if (this._onSave) {
      this._onSave(this.modifiedCanvas);
    }
    this.reset();
  }

  cancel() {
    if (this._onCancel) {
      this._onCancel();
    }
    this.reset();
  }

  setCursor(cursor: string): void {
    this.content.style.cursor = cursor;
  }

  showBrush(): void {
    this.projectedBrushCanvas.style.visibility = 'visible';
    this.setCursor('none');
  }

  hideBrush(): void {
    this.projectedBrushCanvas.style.visibility = 'hidden';
    this.setCursor('default');
  }

  addTool(id: string, tooltip: string, tool: ImageTool, classes: string[] | null = null): void {
    if (classes == null) {
      classes = ['fas', 'fa-wrench'];
    }
    this.toolManager.addTool(id, tool);
    this.leftToolbar.create(id, classes, tooltip);
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

  private reset() {
    this._onCancel = null;
    this._onSave = null;
    this.sourceCanvas = null;
    this.srcDims = {x: 0, y: 0, w: 16, h: 16};
    this.modifiedCanvas.width = 16;
    this.modifiedCanvas.height = 16;
    this.projectedDrawCanvas.width = 16;
    this.projectedDrawCanvas.height = 16;
    this.drawSourceCanvas.width = 16;
    this.drawSourceCanvas.height = 16;
    clearCanvas(this.projectedCanvas, 'white');
    clearCanvas(this.modifiedCanvas, 'black');
    this.toolManager.setActive('brush');
    this.editManager.clear();
    this.camera.center();
    this.renderer.render();
  }
}
