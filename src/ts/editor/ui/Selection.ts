import { Dirtable } from '../../util/Dirtable';

/**
 * The <i>SelectionGroup</i> class. TODO: Document.
 *
 * @author Jab
 */
export class SelectionGroup implements Dirtable {

  selections: { [slot: number]: Selection };
  private dirty: boolean;

  /** @constructor */
  constructor() {
    this.selections = {};
    this.setDirty(true);
  }

  setSelection(slot: number, selection: Selection): void {
    console.log(`setSelection(slot: ${slot}, selection: `, selection, "}");
    this.selections[slot] = selection;
    this.setDirty(true);
  }

  getSelection(slot: number): Selection {
    return this.selections[slot];
  }

  getSelectionId(slot: number) {
    const selection = this.selections[slot];
    if (selection != null) {
      return selection.id;
    }
    return null;
  }

  clear(): void {
    for (let key in this.selections) {
      this.selections[key] = undefined;
    }
  }

  /** @override */
  isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }
}

/**
 * The <i>Selection</i> class. TODO: Document.
 *
 * @author Jab
 */
export class Selection {

  type: string;
  id: number | string;

  /**
   * @constructor
   *
   * @param {string} type
   * @param {number | string} id
   */
  constructor(type: string, id: number | string) {
    this.type = type;
    this.id = id;
  }
}

/**
 * The <i>SelectionType</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum SelectionType {
  TILE = 'tile',
  IMAGE = 'image',
  MAP_OBJECT = 'map_object',
  SCREEN_OBJECT = 'screen_object',
  REGION = 'region'
}

/**
 * The <i>SelectionSlot</i> enum. TODO: Document.
 *
 * @author Jab
 */
export enum SelectionSlot {
  PRIMARY = 0,
  MIDDLE = 1,
  SECONDARY = 2
}
