import ImageEditManager from './ImageEditManager';

/**
 * The <i>ImageEdit</i> class. TODO: Document.
 *
 * @author Jab
 */
export default abstract class ImageEdit {
  private done: boolean = false;

  do(editManager: ImageEditManager) {
    if (this.done) {
      throw new Error(`The edit is already done: ${this}`);
    }
    try {
      this.onDo(editManager);
      this.done = true;
    } catch (e) {
      throw e;
    }
  }

  undo(editManager: ImageEditManager) {
    if (!this.done) {
      throw new Error(`The edit is not done: ${this}`);
    }
    try {
      this.onUndo(editManager);
      this.done = false;
    } catch (e) {
      throw e;
    }
  }

  abstract onDo(editManager: ImageEditManager): void;

  abstract onUndo(editManager: ImageEditManager): void;
}
