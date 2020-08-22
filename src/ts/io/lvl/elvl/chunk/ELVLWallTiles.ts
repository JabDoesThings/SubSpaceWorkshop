import ELVLChunk from './ELVLChunk';

/**
 * The <i>ELVLWallTiles</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ELVLWallTiles extends ELVLChunk {
  public static readonly TOP_LEFT_CORNER = 9;
  public static readonly TOP_JUNCTION = 13;
  public static readonly TOP_RIGHT_CORNER = 12;
  public static readonly LEFT_JUNCTION = 11;
  public static readonly CENTER = 15;
  public static readonly RIGHT_JUNCTION = 14;
  public static readonly BOTTOM_LEFT_CORNER = 3;
  public static readonly BOTTOM_JUNCTION = 7;
  public static readonly BOTTOM_RIGHT_CORNER = 6;
  public static readonly VERTICAL_TOP_CAP = 8;
  public static readonly VERTICAL = 10;
  public static readonly VERTICAL_BOTTOM_CAP = 2;
  public static readonly HORIZONTAL_LEFT_CAP = 1;
  public static readonly HORIZONTAL = 5;
  public static readonly HORIZONTAL_RIGHT_CAP = 4;
  public static readonly DOT = 0;

  tiles: number[];

  constructor(tiles: number[] = null) {
    super('DCWT');
    if (tiles == null) {
      tiles = new Array(16);
      for (let index = 0; index < 16; index++) {
        tiles[index] = 0;
      }
    }
    this.tiles = tiles;
  }

  getTile(index: number): number {
    if (index < 0) {
      throw new Error(`The "index" given is negative. (${index} given)`);
    } else if (index > 15) {
      throw new Error(`The "index" given is greater than 15. (${index} given)`);
    }
    return this.tiles[index];
  }

  setTile(index: number, tileId: number): void {
    if (index < 0) {
      throw new Error(`The "index" given is negative. (${index} given)`);
    } else if (index > 15) {
      throw new Error(`The "index" given is greater than 15. (${index} given)`);
    }
    if (tileId < 0) {
      throw new Error(`The "tileId" given is negative. (${tileId} given)`);
    } else if (tileId > 255) {
      throw new Error(`The "tileId" given is greater than 255. (${tileId} given)`);
    }
    this.tiles[index] = tileId;
  }

  unsetTile(index: number): void {
    this.setTile(index, 0);
  }

  /** @override */
  equals(next: any): boolean {
    // Make sure that this is a wall-tile definition.
    if (next == null || !(next instanceof ELVLWallTiles)) {
      return false;
    }
    // Check each wall-tile definition.
    for (let index = 0; index < 16; index++) {
      // If these don't match, there's a difference.
      if (next.tiles[index] !== this.tiles[index]) {
        return false;
      }
    }
    // These are both equal.
    return true;
  }

  /** @override */
  validate(): void {
    if (this.tiles == null) {
      throw new Error('The "tiles" array for the ELVLDCMEWallTile is null or undefined.');
    } else if (this.tiles.length !== 16) {
      throw new Error('The "tiles" array for the ELVLDCMEWallTile is not a size of 16 numbers.');
    } else {
      // Go through each tile index to make sure that it is a valid tile ID.
      for (let index = 0; index < 16; index++) {
        if (typeof this.tiles[index] !== 'number') {
          throw new Error(
            `The entry "tiles[${index}]" for the ELVLDCMEWallTile is not a number. (${this.tiles[index]} assigned)`
          );
        } else if (this.tiles[index] < 0) {
          throw new Error(
            `The entry "tiles[${index}]" for the ELVLDCMEWallTile is less than 0. (${this.tiles[index]} assigned)`
          );
        } else if (this.tiles[index] > 255) {
          throw new Error(
            `The entry "tiles[${index}]" for the ELVLDCMEWallTile is greater than 255. (${this.tiles[index]} assigned)`
          );
        }
      }
    }
  }
}
