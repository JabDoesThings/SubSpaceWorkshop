/**
 * The <i>TileEditSection</i> class. TODO: Document.
 *
 * @author Jab
 */
import ImageEdit from '../ImageEdit';
import ImageEditManager from '../ImageEditManager';

export default class ImageEditSection extends ImageEdit {
  private readonly before: ImageData;
  private readonly after: ImageData;
  private readonly x: number;
  private readonly y: number;

  /**
   * @constructor
   *
   * @param {ImageData} before
   * @param {ImageData} after
   * @param {number} x
   * @param {number} y
   */
  constructor(before: ImageData, after: ImageData, x: number = 0, y: number = 0) {
    super();
    this.before = before;
    this.after = after;
    this.x = x;
    this.y = y;
  }

  /** @override */
  onDo(editManager: ImageEditManager): void {
    const tileEditor = editManager.tileEditor;
    tileEditor.modifiedCtx.putImageData(this.after, this.x, this.y);
    tileEditor.project();
  }

  /** @override */
  onUndo(editManager: ImageEditManager): void {
    const tileEditor = editManager.tileEditor;
    tileEditor.modifiedCtx.putImageData(this.before, this.x, this.y);
    tileEditor.project();
  }
}
