import { EditManager } from '../EditManager';

/**
 * The <i>Edit</i> abstract class. TODO: Document.
 *
 * @author Jab
 */
export abstract class Edit {

  /** @constructor */
  protected constructor() {
  }

  /**
   * Redoes the edit.
   *
   * @param {EditManager} history The history of the project.
   */
  abstract do(history: EditManager): void;

  /**
   * Undoes the edit.
   *
   * @param {EditManager} history The history of the project.
   */
  abstract undo(history: EditManager): void;
}
