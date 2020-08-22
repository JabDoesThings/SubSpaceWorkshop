import uuid = require('uuid');
import Dirtable from '../../../util/Dirtable';
import WallSet from './';

/**
 * The <i>WallTile</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class WallTile implements Dirtable {
  private readonly sets: WallSet[];
  private readonly id: string;
  private dirty: boolean;

  /**
   * @param id
   */
  constructor(id: string = null) {
    // Make sure the WallTile has an ID.
    if (id == null) {
      id = uuid.v4();
    }
    this.id = id;
    this.sets = [];
    this.dirty = true;
  }

  preUpdate(): void {
    if (this.sets.length !== 0) {
      for (let index = 0; index < this.sets.length; index++) {
        this.sets[index].preUpdate();
      }
    }
  }

  update(): void {
    if (this.sets.length !== 0) {
      for (let index = 0; index < this.sets.length; index++) {
        this.sets[index].update();
      }
    }
  }

  postUpdate(): void {
    this.setDirty(false);
    if (this.sets.length !== 0) {
      for (let index = 0; index < this.sets.length; index++) {
        this.sets[index].postUpdate();
      }
    }
  }

  addSet(set: WallSet): void {
    if (set == null) {
      throw new Error('The WallSet given is null or undefined.');
    }
    this.sets.push(set);
  }

  removeSet(set: WallSet): void {
    if (set == null) {
      throw new Error('The WallSet given is null or undefined.');
    }
    if (this.sets.length === 0) {
      return;
    }
    const newArray: WallSet[] = [];
    for (let index = 0; index < this.sets.length; index++) {
      const next = this.sets[index];
      if (next === set) {
        continue;
      }
      newArray.push(next);
    }
    this.sets.length = 0;
    if (newArray.length === 0) {
      return;
    }
    for (let index = 0; index < newArray.length; index++) {
      this.sets.push(newArray[index]);
    }
  }

  contains(set: WallSet): boolean {
    if (set == null) {
      throw new Error('The WallSet given is null or undefined.');
    }
    if (this.sets.length === 0) {
      return false;
    }
    for (let index = 0; index < this.sets.length; index++) {
      if (this.sets[index] === set) {
        return true;
      }
    }
    return false;
  }

  getSets(): WallSet[] {
    return this.sets;
  }

  size(): number {
    return this.sets.length;
  }

  clear(): void {
    this.sets.length = 0;
  }

  getId(): string {
    return this.id;
  }

  /** @override */
  isDirty(): boolean {
    if (this.dirty) {
      return true;
    }
    if (this.sets.length !== 0) {
      for (let index = 0; index < this.sets.length; index++) {
        if (this.sets[index].isDirty()) {
          return true;
        }
      }
    }
    return false;
  }

  /** @override */
  setDirty(flag: boolean): void {
    this.dirty = flag;
  }
}

