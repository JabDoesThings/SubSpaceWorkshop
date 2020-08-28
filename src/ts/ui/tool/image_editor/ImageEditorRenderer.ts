import ImageEditor from './ImageEditor';

/**
 * The <i>ImageEditorRenderer</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ImageEditorRenderer {
  editor: ImageEditor;
  grid: boolean = true;


  constructor(editor: ImageEditor) {
    this.editor = editor;
  }

  drawSourceToModified() {
    const modCanvas = this.editor.modifiedCanvas;
    const modCtx = this.editor.modifiedCtx;
    const dim = this.editor.sourceDim;
    const drawSourceCanvas = this.editor.drawSourceCanvas;
    const sourceCanvas = this.editor.sourceCanvas;

    modCanvas.width = dim[2];
    modCanvas.height = dim[3];
    drawSourceCanvas.width = dim[2];
    drawSourceCanvas.height = dim[3];
    // Clear.
    modCtx.imageSmoothingEnabled = false;
    modCtx.fillStyle = 'black';
    modCtx.fillRect(0, 0, dim[2], dim[3]);
    modCtx.imageSmoothingEnabled = false;
    modCtx.imageSmoothingQuality = 'low';
    // Project.
    modCtx.drawImage(sourceCanvas, dim[0], dim[1], dim[2], dim[3], 0, 0, dim[2], dim[3],);
  }

  render(): void {
    const projCanvas = this.editor.projectedCanvas;
    const projCtx = this.editor.projectedCtx;
    const modCanvas = this.editor.modifiedCanvas;
    // Clear.
    projCtx.fillStyle = 'black';
    projCtx.fillRect(0, 0, projCanvas.width, projCanvas.height);
    projCtx.imageSmoothingEnabled = false;
    projCtx.imageSmoothingQuality = 'low';

    // Project modified canvas onto the visual canvas.
    projCtx.drawImage(
      modCanvas, 0, 0, modCanvas.width, modCanvas.height, 0, 0, projCanvas.width, projCanvas.height);

    const scale = this.editor.camera.getScale();

    if (this.grid && scale >= 8) {
      this.renderGrid();
    }
  }

  renderGrid(): void {
    const scale = this.editor.camera.getScale();
    const projCtx = this.editor.projectedCtx;
    const projCanvas = this.editor.projectedCanvas;
    projCtx.strokeStyle = 'rgba(127,127,127,0.5)';
    projCtx.lineWidth = 1;
    projCtx.beginPath();
    for (let y = 0; y < projCanvas.height; y += scale) {
      projCtx.moveTo(-0.5, y - 0.5);
      projCtx.lineTo(projCanvas.width - 0.5, y - 0.5);
    }
    for (let x = 0; x < projCanvas.width; x += scale) {
      projCtx.moveTo(x - 0.5, -0.5);
      projCtx.lineTo(x - 0.5, projCanvas.height - 0.5);
    }
    projCtx.stroke();

    projCtx.lineWidth = 1;
    projCtx.beginPath();
    projCtx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    for (let y = 0; y < projCanvas.height; y += scale * 16) {
      projCtx.moveTo(-0.5, y - 0.5);
      projCtx.lineTo(projCanvas.width - 0.5, y - 0.5);
    }
    for (let x = 0; x < projCanvas.width; x += scale * 16) {
      projCtx.moveTo(x - 0.5, -0.5);
      projCtx.lineTo(x - 0.5, projCanvas.height - 0.5);
    }
    projCtx.stroke();
  }

  clearDraw(): void {
    this.editor.drawSourceCtx.clearRect(
      0,
      0,
      this.editor.drawSourceCanvas.width,
      this.editor.drawSourceCanvas.height
    );
    this.editor.camera.projectDraw();
  }
}
