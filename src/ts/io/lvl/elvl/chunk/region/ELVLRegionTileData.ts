import ELVLRegionChunk from './ELVLRegionChunk';

/**
 * The <i>ELVLRegionTileData<i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegionTileData extends ELVLRegionChunk {
  readonly tiles: boolean[][];

  /**
   * @param {boolean[][]} tiles
   */
  constructor(tiles: boolean[][] = null) {
    super('rTIL');
    if (tiles == null) {
      // Create a new blank array.
      tiles = new Array(1024);
      for (let x = 0; x < 1024; x++) {
        tiles[x] = new Array(1024);
        for (let y = 0; y < 1024; y++) {
          tiles[x][y] = false;
        }
      }
    }
    this.tiles = tiles;
    this.validate();
  }

  /** @override */
  validate(): void {
    // TODO: Implement.
  }
}

export default ELVLRegionTileData;
