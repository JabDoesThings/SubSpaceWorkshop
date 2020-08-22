import Dirtable from '../../../util/Dirtable';
import WallTileType from './WallTileType';

/**
 * The <i>WallSet</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class WallSet implements Dirtable {
  private readonly tiles: number[] = new Array(16).fill(0);
  private dirty: boolean = true;

  preUpdate(): void {
  }

  update(): void {
  }

  postUpdate(): void {
    this.setDirty(false);
  }

  getTile(offset: WallTileType): number {
    if (offset == null) {
      throw new Error('The offset given is null or undefined.');
    } else if (offset < 0) {
      throw new Error('The offset given is negative. Offsets can only be between 0 and 15.');
    } else if (offset > 15) {
      throw new Error('The offset given is greater than 15. Offsets can only be between 0 and 15.');
    }
    return this.tiles[offset];
  }

  setTile(offset: WallTileType, id: number): void {
    if (offset == null) {
      throw new Error('The offset given is null or undefined.');
    } else if (offset < 0) {
      throw new Error('The offset given is negative. Offsets can only be between 0 and 15.');
    } else if (offset > 15) {
      throw new Error('The offset given is greater than 15. Offsets can only be between 0 and 15.');
    }
    if (id == null) {
      throw new Error('The tile ID given is null or undefined.');
    } else if (id < 0) {
      throw new Error('The tile ID given is negative. Tile IDs can only be between 1 and 255.');
    } else if (id > 255) {
      throw new Error('The tile ID given is greater than 255. Tile IDs can only be between 1 and 255.');
    }
    this.tiles[offset] = id;
    this.setDirty(true);
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
