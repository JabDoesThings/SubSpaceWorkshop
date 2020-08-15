import { TileEditManager } from './TileEditManager';

abstract class TileEdit {

  private done: boolean = false;

  protected constructor() {
  }

  do(editManager: TileEditManager) {
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

  undo(editManager: TileEditManager) {
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

  abstract onDo(editManager: TileEditManager): void;

  abstract onUndo(editManager: TileEditManager): void;
}

export default TileEdit;
