import ImageEditor from './ImageEditor';

/**
 * The <i>ImageEditorCamera</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ImageEditorCamera {
  static SCALES = [1, 2, 4, 8, 16];

  editor: ImageEditor;
  x: number = 0;
  y: number = 0;
  _scale: number = 0;

  constructor(editor: ImageEditor) {
    this.editor = editor;
  }

  move(x: number, y: number): void {
    this.position(this.x + x, this.y + y);
  }

  position(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.project();
  }

  center(): void {
    const canvas = this.editor.sourceCanvas;
    if (canvas != null) {
      this.position(canvas.width / 2, canvas.height / 2);
    } else {
      this.position(8, 8);
    }
  }

  project(): void {
    const scale = this.getScale();
    const paneWidth = this.editor.$parent.width();
    const paneHeight = this.editor.$parent.height();
    const x = Math.floor((paneWidth / 2) - (this.x * scale));
    const y = Math.floor((paneHeight / 2) - (this.y * scale));

    this.editor.paneCursor.style.left = `${x}px`;
    this.editor.paneCursor.style.top = `${y}px`;
    // this.editor.renderer.render();
  }

  private projectScale() {
    const scale = this.getScale();
    const canvas = this.editor.sourceCanvas;
    let canvasWidth = 8 * scale;
    let canvasHeight = 8 * scale;
    if (canvas != null) {
      canvasWidth = canvas.width * scale;
      canvasHeight = canvas.height * scale;
    }
    this.editor.projectedCanvas.width = canvasWidth;
    this.editor.projectedCanvas.height = canvasHeight;
    this.editor.projectedDrawCanvas.width = canvasWidth;
    this.editor.projectedDrawCanvas.height = canvasHeight;
    this.projectBrush();
    this.editor.renderer.render();
  }

  projectBrush() {
    const scale = this.getScale();
    const width = this.editor.brushSourceCanvas.width * scale;
    const height = this.editor.brushSourceCanvas.height * scale;
    this.editor.projectedBrushCanvas.width = width;
    this.editor.projectedBrushCanvas.height = height;
    const ctx = this.editor.projectedBrushCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);

    if (this.editor.brush) {
      ctx.globalAlpha = this.editor.brush.options.opacity;
    }

    ctx.drawImage(
      this.editor.brushSourceCanvas,
      0,
      0,
      this.editor.brushSourceCanvas.width,
      this.editor.brushSourceCanvas.height,
      0,
      0,
      width,
      height
    );

    ctx.globalAlpha = 1;
  }

  projectDraw(antialias: boolean = false) {
    const scale = this.getScale();
    const width = this.editor.drawSourceCanvas.width * scale;
    const height = this.editor.drawSourceCanvas.height * scale;
    this.editor.projectedDrawCanvas.width = width;
    this.editor.projectedDrawCanvas.height = height;
    const ctx = this.editor.projectedDrawCanvas.getContext('2d');

    if (antialias) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    } else {
      ctx.imageSmoothingEnabled = false;
    }
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(
      this.editor.drawSourceCanvas,
      0,
      0,
      this.editor.drawSourceCanvas.width,
      this.editor.drawSourceCanvas.height,
      0,
      0,
      width,
      height
    );
    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = 'low';
  }

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

  canvasToPaneCoordinates(x: number, y: number): { x: number, y: number } {
    const position = this.editor.$paneCursor.position();
    return {
      x: x - position.left - (this.editor.content.offsetWidth / 2),
      y: y - position.top - (this.editor.content.offsetHeight / 2)
    };
  }

  paneToCanvasCoordinates(x: number, y: number): { x: number, y: number } {
    const position = this.editor.$paneCursor.position();
    return {
      x: x + ((this.editor.content.offsetWidth / 2) + position.left),
      y: y + ((this.editor.content.offsetHeight / 2) + position.top)
    };
  }

  zoomIn(): void {
    if (this._scale >= ImageEditorCamera.SCALES.length) {
      throw new Error('Cannot zoom in further.');
    }
    this._scale++;
    this.project();
    this.projectScale();
  }

  zoomOut(): void {
    if (this._scale <= 0) {
      throw new Error('Cannot zoom out further.');
    }
    this._scale--;
    this.project();
    this.projectScale();
  }

  canZoomIn(): boolean {
    return this._scale < ImageEditorCamera.SCALES.length - 1;
  }

  canZoomOut(): boolean {
    return this._scale > 0;
  }

  getScale(): number {
    return ImageEditorCamera.SCALES[this._scale];
  }

  resetScale(): void {
    this._scale = 0;
    this.project();
    this.projectScale();
  }

  eventToPixelCoordinates(x: number | { x: number, y: number }, y?: number): { x: number, y: number } {
    if (typeof x === 'object') {
      const o = x;
      x = o.x;
      y = o.y;
    }
    const scale = this.getScale();
    const sOffset = Math.floor(scale / 2) - 1;
    x = ((Math.floor(x / scale)) * scale) + sOffset;
    y = ((Math.floor(y / scale)) * scale) + sOffset;
    return {x, y};
  }
}
