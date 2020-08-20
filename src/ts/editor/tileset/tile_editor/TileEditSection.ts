import TileEdit from './TileEdit';
import { TileEditManager } from './TileEditManager';

/**
 * The <i>TileEditSection</i> class. TODO: Document.
 *
 * @author Jab
 */
class TileEditSection extends TileEdit {

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
  onDo(editManager: TileEditManager): void {
    const tileEditor = editManager.tileEditor;
    tileEditor.modCtx.putImageData(this.after, this.x, this.y);
    tileEditor.project();
  }

  /** @override */
  onUndo(editManager: TileEditManager): void {
    const tileEditor = editManager.tileEditor;
    tileEditor.modCtx.putImageData(this.before, this.x, this.y);
    tileEditor.project();
  }
}

export default TileEditSection;
