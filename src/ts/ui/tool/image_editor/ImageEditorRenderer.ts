import { clearCanvas, projectCanvasToCanvas, renderGrid } from '../../../util/DrawUtils';
import ImageEditor from './ImageEditor';
import ImageEdit from './ImageEdit';
import ImageEditSection from './edit/ImageEditSection';

/**
 * The <i>ImageEditorRenderer</i> class. The renderer handles all rendering for the ImageEditor.
 *
 * @author Jab
 */
export default class ImageEditorRenderer {
  editor: ImageEditor;
  grid: boolean = true;
  private _bufferCanvas: HTMLCanvasElement = document.createElement('canvas');
  private _bufferCtx = this._bufferCanvas.getContext('2d');

  /** @param {ImageEditor} editor */
  constructor(editor: ImageEditor) {
    this.editor = editor;
  }

  /**
   * Applies the drawing buffer to the modified canvas to store the result.
   *
   * @param {boolean} antialias Set to true to enable HTMLCanvasElement's high image smoothing utility.
   */
  pushDrawing(antialias: boolean = false): ImageEdit {
    const modCanvas = this.editor.modifiedCanvas;
    const canvas = this._bufferCanvas;
    const ctx = this._bufferCtx;
    const w = modCanvas.width;
    const h = modCanvas.height;
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(modCanvas, 0, 0);

    if (antialias) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    } else {
      ctx.imageSmoothingEnabled = false;
      ctx.imageSmoothingQuality = 'low';
    }

    const before: ImageData = ctx.getImageData(0, 0, w, h);
    ctx.drawImage(this.editor.drawSourceCanvas, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = 'low';

    const after: ImageData = ctx.getImageData(0, 0, w, h);
    return new ImageEditSection(before, after);
  }

  /**
   * Projects the incoming source image data to the modifiedCanvas, which stores the modified image data to send back
   *   when saved.
   *
   * @param {x: number, y: number, w: number, h: number} srcDims The dimensions of the source canvas to edit.
   */
  drawSourceToModified(srcDims: { x: number, y: number, w: number, h: number }) {
    clearCanvas(this.editor.modifiedCanvas, 'black', srcDims);
    clearCanvas(this.editor.drawSourceCanvas, 'transparent', srcDims);
    clearCanvas(this.editor.projectedCanvas, 'transparent', srcDims);
    projectCanvasToCanvas(this.editor.sourceCanvas, this.editor.modifiedCanvas, srcDims);
  }

  /** Renders the modified image data to the projection canvas in the ImageEditor, along with a grid. */
  render(): void {
    clearCanvas(this.editor.projectedCanvas);
    projectCanvasToCanvas(this.editor.modifiedCanvas, this.editor.projectedCanvas);
    const scale = this.editor.camera.getScale();
    if (this.grid && scale >= 8) {
      renderGrid(this.editor.projectedCanvas, scale);
    }
  }

  /** Clears the current drawing on the drawing canvas. */
  clearDraw(): void {
    clearCanvas(this.editor.drawSourceCanvas);
    this.editor.camera.projectDraw();
  }
}
