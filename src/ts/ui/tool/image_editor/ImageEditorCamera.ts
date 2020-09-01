import ImageEditor from './ImageEditor';
import { clearCanvas, projectCanvasToCanvas } from '../../../util/DrawUtils';

/**
 * The <i>ImageEditorCamera</i> class. The camera handles the orientation, scale, and projection of
 * all image data for the ImageEditor.
 *
 * @author Jab
 */
export default class ImageEditorCamera {
  static SCALES = [1, 2, 4, 8, 16];
  editor: ImageEditor;
  x: number = 0;
  y: number = 0;
  _scale: number = 0;

  /** @param {ImageEditor} editor */
  constructor(editor: ImageEditor) {
    this.editor = editor;
  }

  /** Projects the image on the pane to align with the camera's position. */
  project(): void {
    const scale = this.getScale();
    const paneWidth = this.editor.$pane.width();
    const paneHeight = this.editor.$pane.height();
    const x = Math.floor((paneWidth / 2) - (this.x * scale));
    const y = Math.floor((paneHeight / 2) - (this.y * scale));
    this.editor.paneCursor.style.left = `${x}px`;
    this.editor.paneCursor.style.top = `${y}px`;
  }

  /** Projects the scale of the image on the pane as the camera's scale. */
  projectScale() {
    const scale = this.getScale();
    const srcDims = this.editor.srcDims;
    const canvasWidth = srcDims.w * scale;
    const canvasHeight = srcDims.h * scale;
    this.editor.projectedCanvas.width = canvasWidth;
    this.editor.projectedCanvas.height = canvasHeight;
    this.editor.projectedDrawCanvas.width = canvasWidth;
    this.editor.projectedDrawCanvas.height = canvasHeight;
    this.projectBrush();
    this.editor.renderer.render();
  }

  /** Projects the brush on the pane to align with the cursor's position. */
  projectBrush() {
    const scale = this.getScale();
    const brush = this.editor.brush;
    const src = this.editor.brushSourceCanvas;
    const dst = this.editor.projectedBrushCanvas;
    const width = src.width * scale;
    const height = src.height * scale;
    const globalAlpha = brush ? brush.options.opacity : 1;
    clearCanvas(dst, 'transparent', {w: width, h: height});
    projectCanvasToCanvas(src, dst, null, null, globalAlpha);
  }

  /** Projects the current drawings on the pane. */
  projectDraw() {
    const scale = this.getScale();
    const srcDims = this.editor.srcDims;
    const width = srcDims.w * scale;
    const height = srcDims.h * scale;
    this.editor.projectedDrawCanvas.width = width;
    this.editor.projectedDrawCanvas.height = height;
    clearCanvas(this.editor.projectedDrawCanvas);
    projectCanvasToCanvas(this.editor.drawSourceCanvas, this.editor.projectedDrawCanvas);
  }

  positionBrush(x: number, y: number): void {
    const scale = this.getScale();
    let radiusW = this.editor.brushSourceCanvas.width;
    let radiusH = this.editor.brushSourceCanvas.height;
    let px = (x - Math.floor(this.editor.projectedBrushCanvas.width / 2));
    let py = (y - Math.floor(this.editor.projectedBrushCanvas.height / 2));
    if (radiusW % 2 == 0 /* even */) {
      px -= Math.floor(scale / 2);
    }
    if (radiusH % 2 == 0 /* even */) {
      py -= Math.floor(scale / 2);
    }
    this.editor.projectedBrushCanvas.style.top = `${(py)}px`;
    this.editor.projectedBrushCanvas.style.left = `${(px)}px`;
  }

  /**
   * Moves the camera.
   *
   * @param {number} x The amount of pixels to move on the X axis.
   * @param {number} y The amount of pixels to move on the Y axis.
   */
  move(x: number, y: number): void {
    this.position(this.x + x, this.y + y);
  }

  /**
   * Positions the camera.
   *
   * @param {number} x The pixel coordinate on the X axis.
   * @param {number} y The pixel coordinate on the Y axis.
   */
  position(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.project();
  }

  /** Centers the camera on the image. */
  center(): void {
    const srcDims = this.editor.srcDims;
    this.position(srcDims.w / 2, srcDims.h / 2);
  }

  /**
   * @param {number | {x: number, y: number}} x
   * @param {number?} y
   *
   * @return {x: number, y: number}
   */
  asPixelCoordinates(x: number | { x: number, y: number }, y?: number): { x: number, y: number } {
    if (typeof x === 'object') {
      const o = x;
      x = o.x;
      y = o.y;
    }
    const scale = this.getScale();
    return {
      x: Math.floor(x / scale),
      y: Math.floor(y / scale)
    };
  }

  /**
   * @param {number} x
   * @param {number} y
   *
   * @return {x: number, y: number}
   */
  canvasToPaneCoordinates(x: number, y: number): { x: number, y: number } {
    const position = this.editor.$paneCursor.position();
    return {
      x: x - position.left - (this.editor.content.offsetWidth / 2),
      y: y - position.top - (this.editor.content.offsetHeight / 2)
    };
  }

  /**
   * @param {number} x
   * @param {number} y
   *
   * @return {x: number, y: number}
   */
  paneToCanvasCoordinates(x: number, y: number): { x: number, y: number } {
    const position = this.editor.$paneCursor.position();
    return {
      x: x + ((this.editor.content.offsetWidth / 2) + position.left),
      y: y + ((this.editor.content.offsetHeight / 2) + position.top)
    };
  }

  /**
   * Zooms the camera in.
   *
   * @throws Error Thrown if the camera cannot zoom in further.
   */
  zoomIn(): void {
    if (this._scale >= ImageEditorCamera.SCALES.length) {
      throw new Error('Cannot zoom in further.');
    }
    this._scale++;
    this.project();
    this.projectScale();
  }

  /**
   * Zooms the camera out.
   *
   * @throws Error Thrown if the camera cannot zoom out further.
   */
  zoomOut(): void {
    if (this._scale <= 0) {
      throw new Error('Cannot zoom out further.');
    }
    this._scale--;
    this.project();
    this.projectScale();
  }

  /** @return {boolean} Returns true if the camera can zoom in. */
  canZoomIn(): boolean {
    return this._scale < ImageEditorCamera.SCALES.length - 1;
  }

  /** @return {boolean} Returns true if the camera can zoom out. */
  canZoomOut(): boolean {
    return this._scale > 0;
  }

  /** @return {number} Returns the scale-factor of the camera. */
  getScale(): number {
    return ImageEditorCamera.SCALES[this._scale];
  }

  /** Resets the camera to the most zoomed out scale. */
  resetScale(): void {
    this._scale = 0;
    this.project();
    this.projectScale();
  }

  // eventToPixelCoordinates(x: number | { x: number, y: number }, y?: number): { x: number, y: number } {
  //   if (typeof x === 'object') {
  //     const o = x;
  //     x = o.x;
  //     y = o.y;
  //   }
  //   const scale = this.getScale();
  //   const sOffset = Math.floor(scale / 2) - 1;
  //   x = ((Math.floor(x / scale)) * scale) + sOffset;
  //   y = ((Math.floor(y / scale)) * scale) + sOffset;
  //   return {x, y};
  // }
}
