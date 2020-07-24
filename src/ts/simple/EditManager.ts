import { LVZDisplayMode, LVZRenderLayer } from '../io/LVZ';
import { Project } from './Project';
import { Edit } from './edits/Edit';

/**
 * The <i>EditManager</i> class. TODO: Document.
 *
 * @author Jab
 */
export class EditManager {

  static readonly EDITOR_HISTORY_LIMIT = 32;
  readonly project: Project;
  edits: Edit[][];
  editsToPush: Edit[];
  private index = 0;

  /**
   * Main constructor.
   *
   * @param project The project instance.
   */
  constructor(project: Project) {
    this.project = project;
    this.edits = [];
    this.editsToPush = [];
    this.index = -1;
  }

  /**
   * Executes edits, filing them into the history of the editor.
   *
   * @param {Edit[]} edits The edits to execute.
   */
  append(edits: Edit[]): void {
    if (edits.length === 0) {
      return;
    }
    for (let index = 0; index < edits.length; index++) {
      const next = edits[index];
      if (next != null) {
        this.editsToPush.push(next);
        next.do(this);
      }
    }
  }

  push(): void {
    if (this.edits.length === 0) {
      this.index = -1;
    } else if (this.edits.length == EditManager.EDITOR_HISTORY_LIMIT) {
      this.edits.shift();
    } else {
      // If an action is done after previous are undone, remove the actions
      //   in-front of it before proceeding.
      while (this.edits.length > this.index + 1) {
        this.edits.pop();
      }
    }
    console.log('pushed ' + this.editsToPush.length + ' edit(s).');
    if (this.editsToPush.length !== 0) {
      this.edits.push(this.editsToPush);
      this.editsToPush = [];
      this.index++;
    }
  }

  reset(): void {
    for (let index = this.editsToPush.length - 1; index >= 0; index--) {
      const next = this.editsToPush[index];
      if (next == null) {
        continue;
      }
      next.undo(this);
    }
    this.editsToPush.length = 0;
  }

  /**
   * Redoes the history of the project.
   *
   * @throws Error Thrown if the history is already at the latest edit.<br/>
   * <b>NOTE</b>: Use {@link EditHistory#canRedo() canRedo()} to check if redo is possible.
   */
  redo(): void {
    // Make sure that the edit history isn't set at the latest edit.
    if (this.index >= this.edits.length - 1) {
      throw new Error('Cannot redo. The project\'s edit history is already at the most recent edit.');
    }
    this.index++;
    const edits = this.edits[this.index];
    for (let index = 0; index < edits.length; index++) {
      try {
        edits[index].do(this);
      } catch (e) {
        console.error('Failed to redo edit.');
        console.error(e);
      }
    }
    this.project.editor.renderer.radar.setDirty(true);
  }

  /**
   * Undoes the history of the project.
   *
   * @throws Error Thrown if the history is already at the earliest edit.<br/>
   * <b>NOTE</b>: Use {@link EditHistory#canUndo() canUndo()} to check if undo is possible.
   */
  undo(): void {
    if (this.index < 0) {
      throw new Error('Cannot undo. The project\'s edit history is already reached.');
    }
    const edits = this.edits[this.index];
    for (let index = edits.length - 1; index >= 0; index--) {
      try {
        edits[index].undo(this);
      } catch (e) {
        console.error('Failed to undo edit.');
        console.error(e);
      }
    }
    this.index--;
    this.project.editor.renderer.radar.setDirty(true);
  }

  /**
   * @return Returns true if the editor can undo edits.
   */
  canUndo(): boolean {
    return this.index > 0;
  }

  /**
   * @return Returns true if the editor can redo edits.
   */
  canRedo(): boolean {
    return this.index < this.edits.length - 1;
  }
}

/**
 * The <i>LVZMapObjectProperties</i> interface. TODO: Documen.
 *
 * @author Jab
 */
export interface LVZMapObjectProperties {
  x: number,
  y: number,
  id: number,
  layer: LVZRenderLayer,
  mode: LVZDisplayMode,
  time: number
}
