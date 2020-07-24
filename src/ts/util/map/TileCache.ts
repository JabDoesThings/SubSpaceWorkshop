import { TileData } from './TileData';

/**
 * The <i>TileCache</i> class handles storage of cached Tile IDs for the map when processing
 *   multiple transactions of tiles.
 *
 * @author Jab
 */
export class TileCache {

  private readonly tiles: number[][];

  /** @constructor */
  constructor() {
    this.tiles = [];
  }

  /**
   * @param {TileData} tiles The map to read if the tile's ID isn't cached.
   * @param {number} x The 'X' coordinate of the tile.
   * @param {number} y The 'Y' coordinate of the tile.
   *
   * @return {number} Returns the tile ID of the map. If the tile exists in the cache,
   *   then this value is returned.
   */
  getTile(tiles: TileData, x: number, y: number): number {
    if (this.isCached(x, y)) {
      return this.getCachedTile(x, y);
    }
    const tileId = tiles.get(x, y);
    this.setCached(x, y, tileId);
    return tileId;
  }

  /**
   * @param {number} x The 'X' coordinate of the tile.
   * @param {number} y The 'Y' coordinate of the tile.
   *
   * @return {boolean} Returns true if the tile's ID is cached.
   */
  isCached(x: number, y: number): boolean {
    return this.tiles[x] != null && this.tiles[x][y] != null;
  }

  /**
   * Sets the tile's ID in the cache.
   *
   * @param {number} x The 'X' coordinate of the tile.
   * @param {number} y The 'Y' coordinate of the tile.
   * @param id The ID of the tile to set in the cache.
   */
  setCached(x: number, y: number, id: number): void {
    let cx = this.tiles[x];
    if (cx == null) {
      cx = this.tiles[x] = [];
    }
    cx[y] = id;
  }

  /**
   * @param {number} x The 'X' coordinate of the tile.
   * @param {number} y The 'Y' coordinate of the tile.
   *
   * @return {number} Returns the ID of the cached tile. If the tile is not cached,
   *   null is returned.
   */
  getCachedTile(x: number, y: number): number {
    return this.tiles[x] != null ? this.tiles[x][y] : null;
  }

  /** Clears the cache of stored tile ID values. */
  clear(): void {
    this.tiles.length = 0;
  }
}
