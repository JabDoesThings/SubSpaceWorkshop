import { TILE_DIMENSIONS, validateCoordinates, validateTileId } from '../../io/LVL';
import MapArea from './MapArea';
import CoordinateType from './CoordinateType';
import Path from '../Path';
import MapPoint from './MapPoint';
import TileEdit from '../../editor/edits/TileEdit';
import MapSection from './MapSection';
import MapSections from './MapSections';

/**
 * The <i>TileData</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class TileData {
  readonly width: number;
  readonly height: number;
  readonly tiles: number[][];
  readonly dirtyAreas: MapArea[];
  private _bounds: MapArea;
  private dirty: boolean;

  /**
   * @param {number[][]} tiles
   */
  constructor(tiles: number[][] = null) {
    if (tiles != null) {

      const getMaxHeight = (tiles: number[][]): number => {
        let max = 0;
        for (let index = 0; index < tiles.length; index++) {
          const next = tiles[index];
          if (next != null && next.length > max) {
            max = next.length;
          }
        }
        return max;
      };

      this.width = tiles.length;
      this.height = getMaxHeight(tiles);

      const fill = (tiles: number[][], width: number, height: number, value: number = 0): void => {
        for (let x = 0; x < width; x++) {
          let xArray = tiles[x];
          if (xArray == null) {
            tiles[x] = xArray = [];
          }
          for (let y = 0; y < height; y++) {
            if (xArray[y] == null) {
              xArray[y] = value;
            }
          }
        }
      };

      // Make sure the array is fully defined for the maximum dimensions provided.
      fill(tiles, this.width, this.height);
    }

    // If the tile data is not provided, create it.
    else {
      tiles = [];
      // Construct each slice.
      for (let x = 0; x < 1024; x++) {
        tiles[x] = [];
        for (let y = 0; y < 1024; y++) {
          tiles[x][y] = 0;
        }
      }

      this.width = 1024;
      this.height = 1024;
    }

    this.tiles = tiles;
    this.dirtyAreas = [];
    this.setAreaDirty(0, 0, 1023, 1023);
  }

  getBounds(): MapArea {
    if (!this._bounds) {
      let x1 = this.width;
      let y1 = this.height;
      let x2 = -1;
      let y2 = -1;
      let foundTile = false;
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const tile = this.tiles[x][y];
          if (tile !== 0) {
            if (x < x1) {
              x1 = x;
            }
            if (x > x2) {
              x2 = x;
            }
            if (y < y1) {
              y1 = y;
            }
            if (y > y2) {
              y2 = y;
            }
            foundTile = true;
          }
        }
      }
      if (foundTile) {
        this._bounds = new MapArea(CoordinateType.TILE, x1, y1, x2, y2);
      } else {
        this._bounds = new MapArea(CoordinateType.TILE, 0, 0, this.width - 1, this.height - 1);
      }
    }
    return this._bounds;
  }

  /**
   * Clears all tile data.
   *
   * @return {number[][]} Returns the previous tile data that is cleared.
   */
  clear(
    area: MapArea = new MapArea(CoordinateType.TILE, 0, 0, 1023, 1023)
  ): number[][] {
    return this.fill(0, area);
  }

  /**
   * Fills all tiles with a value.
   *
   * @param {number} tileId The tile ID to fill.
   * @param {MapArea} area
   *
   * @return {number[][]} Returns the previous tile data that is filled.
   */
  fill(tileId: number,
       area: MapArea = new MapArea(CoordinateType.TILE, 0, 0, 1023, 1023)
  ): number[][] {
    if (area.type === CoordinateType.PIXEL) {
      area = area.asType(CoordinateType.TILE);
    }

    const copy = this.copy();
    const region = {x1: 1024, y1: 1024, x2: -1, y2: -1};

    for (let x = area.x1; x <= area.x2; x++) {
      for (let y = area.y1; y <= area.y2; y++) {
        if (this.tiles[x][y] !== tileId) {
          this.tiles[x][y] = tileId;
          if (region.x1 > x) {
            region.x1 = x;
          }
          if (region.x2 < x) {
            region.x2 = x;
          }
          if (region.y1 > y) {
            region.y1 = y;
          }
          if (region.y2 < y) {
            region.y2 = y;
          }
        }
      }
    }

    this.setAreaDirty(area.x1, area.y1, area.x2, area.y2);
    return copy;
  }

  /**
   * Copies all tile data to a separate array.
   *
   * @return {number[][]} Returns a copied array of the tile data.
   */
  copy(): number[][] {
    const toCopy: number[][] = [];
    for (let x = 0; x < this.width; x++) {
      const xArray: number[] = [];
      toCopy.push(xArray);
      for (let y = 0; y < this.height; y++) {
        xArray[y] = this.tiles[x][y];
      }
    }
    return toCopy;
  }

  /**
   * @param {number} x The 'X' coordinate for the tile.
   * @param {number} y The 'Y' coordinate for the tile.
   *
   * @return {number} Returns the tile at the 'X' and 'Y' coordinate.
   */
  public get(x: number, y: number): number {
    // Make sure that the coordinates are within bounds.
    validateCoordinates(x, y, 0, 0, this.width - 1, this.height - 1);
    // Grab the value stored in the tile array at the coordinates.
    return this.tiles[x][y];
  }

  /**
   * Sets the tile at the given coordinates with the given value.
   *
   * @param {number} x The 'X' coordinate of the tile to set.
   * @param {number} y The 'Y' coordinate of the tile to set.
   * @param {number} value The tile-value to set.
   * @param {MapSections} mask
   * @param {boolean} applyDimensions
   *
   * @return {TileEdit[]} Returns 'true' if the 'X' and 'Y' coordinates are within range and the tile is set.
   */
  public set(x: number, y: number, value: number, mask: MapSections = null, applyDimensions: boolean = true): TileEdit[] {
    // Make sure that the tile ID is proper.
    validateTileId(value);
    validateCoordinates(x, y, 0, 0, this.width - 1, this.height - 1);
    if (mask != null && !mask.test(x, y)) {
      return [];
    }
    const changed: { x: number, y: number, from: number, to: number }[] = [];
    if (applyDimensions) {

      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;

      const processMinMax = (x: number, y: number): void => {
        if (minX > x) {
          minX = x;
        }
        if (maxX < x) {
          maxX = x;
        }
        if (minY > y) {
          minY = y;
        }
        if (maxY < y) {
          maxY = y;
        }
      };

      const contains = (tx: number, ty: number, x1: number, y1: number, x2: number, y2: number): boolean => {
        return tx >= x1 && tx <= x2 && ty >= y1 && ty <= y2;
      };

      const getSourceTiles = (cx: number, cy: number, to: number): TileEdit[] => {
        const sources: TileEdit[] = [];
        // If the tile to check is already assigned, return this tile as the source.
        if (this.tiles[cx][cy] !== 0) {
          sources.push(new TileEdit(cx, cy, this.tiles[cx][cy], to));
        }
        // Go through all dimensions.
        for (let y = cy - 5; y <= cy; y++) {
          for (let x = cx - 5; x <= cx; x++) {
            // Make sure the tile coordinates are valid.
            if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1) {
              continue;
            }
            const id = this.tiles[x][y];
            if (id != 0) {
              const dimensions = TILE_DIMENSIONS[id];
              const x2 = x + dimensions[0] - 1;
              const y2 = y + dimensions[1] - 1;
              if (contains(cx, cy, x, y, x2, y2)) {
                sources.push(new TileEdit(x, y, id, to));
              }
            }
          }
        }
        return sources;
      };

      const remove = (x1: number, y1: number, x2: number, y2: number) => {
        for (let y = y1; y <= y2; y++) {
          for (let x = x1; x <= x2; x++) {
            // Make sure the tile coordinates are valid.
            if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1) {
              continue;
            }
            const sources = getSourceTiles(x, y, 0);
            if (sources.length !== 0) {
              for (let index = 0; index < sources.length; index++) {
                const next = sources[index];
                this.tiles[next.x][next.y] = 0;
                processMinMax(next.x, next.y);
                changed.push(next);
              }
            }
          }
        }
      };

      const dimensions = TILE_DIMENSIONS[value];
      const x2 = x + dimensions[0] - 1;
      const y2 = y + dimensions[1] - 1;
      remove(x, y, x2, y2);
      this.setAreaDirty(minX, minY, maxX, maxY);
    }

    // Make sure the pre-set value isn't the same as the one to set.
    if (this.tiles[x][y] != value) {
      changed.push(new TileEdit(x, y, this.tiles[x][y], value));
      this.tiles[x][y] = value;
      this.setAreaDirty(x, y, x, y);
    }
    return changed;
  }

  public move(mask: MapSection[], offset: MapPoint, ignoreEmpty: boolean = true): TileEdit[] {
    if (mask == null) {
      throw new Error("The mask given is null or undefined.");
    }
    if (offset == null) {
      throw new Error("The offset given is null or undefined.");
    }
    // Make sure the offset are tile coordinates.
    if (offset.type !== CoordinateType.TILE) {
      offset = offset.asType(CoordinateType.TILE);
    }
    if (mask.length === 0 || (offset.x === 0 && offset.y === 0)) {
      return [];
    }

    const isPositive = (gx: number, gy: number): boolean => {
      let result = false;
      for (let index = 0; index < mask.length; index++) {
        const next = mask[index];
        if (next.contains(gx, gy)) {
          if (next.test(gx, gy)) {
            result = !next.negate;
          } else {
            result = false;
          }
        }
      }
      return result;
    };

    const inBounds = (_x: number, _y: number): boolean => {
      return _x >= 0 && _x < this.width && _y >= 0 && _y < this.height;
    };

    const tileEdits: TileEdit[] = [];
    const bounds = MapSection.bounds(mask, true);
    const sx = bounds.x1, sy = bounds.y1;
    const dx = bounds.x1 + offset.x, dy = offset.y + bounds.y1;
    const width = bounds.x2 - bounds.x1 + 1;
    const height = bounds.y2 - bounds.y1 + 1;

    const source: number[][] = [];
    for (let x = 0; x < width; x++) {
      source[x] = [];
      for (let y = 0; y < height; y++) {
        const gx = x + sx;
        const gy = y + sy;
        if (isPositive(gx, gy)) {
          source[x][y] = this.tiles[gx][gy];
        } else {
          source[x][y] = -1;
        }
      }
    }

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const _sx = sx + x;
        const _sy = sy + y;
        const sId = source[x][y];
        if (sId > 0 && inBounds(_sx, _sy)) {
          tileEdits.push(new TileEdit(_sx, _sy, sId, 0));
        }
      }
    }

    // Go from bottom-right to top-left in order to preserve non-1x1 tiles.
    for (let x = width - 1; x >= 0; x--) {
      for (let y = height - 1; y >= 0; y--) {
        const sId = source[x][y];
        if (sId == -1) {
          continue;
        }
        const _dx = dx + x;
        const _dy = dy + y;
        if (inBounds(_dx, _dy)) {
          let dId = this.tiles[_dx][_dy];
          tileEdits.push(new TileEdit(_dx, _dy, dId, sId));
        }
      }
    }

    return tileEdits;
  }

  /** @override */
  public isDirty(): boolean {
    return this.dirty;
  }

  /** @override */
  public setDirty(flag: boolean, area: MapArea = null): void {
    if (flag != this.dirty) {
      this.dirty = flag;
      if (flag) {
        this._bounds = undefined;
        if (area != null) {
          this.dirtyAreas.push(area);
        }
      } else {
        this.dirtyAreas.length = 0;
      }
    }
  }

  private setAreaDirty(x1: number, y1: number, x2: number, y2: number) {
    if (x1 > this.width - 1 || y1 > this.height - 1 || x2 < 0 || y2 < 0) {
      return;
    }
    if (x1 < 0) {
      x1 = 0;
    }
    if (y1 < 0) {
      y1 = 0;
    }
    if (x2 > this.width - 1) {
      x2 = this.width - 1;
    }
    if (y2 > this.height - 1) {
      y2 = this.height - 1;
    }
    this.dirtyAreas.push(new MapArea(CoordinateType.TILE, x1, y1, x2, y2));
    this.setDirty(true);
  }

  apply(tiles: TileData, area: MapArea = null): void {
    if (area == null) {
      const width = Math.min(this.width, tiles.width);
      const height = Math.min(this.height, tiles.height);
      area = new MapArea(CoordinateType.TILE, 0, 0, width - 1, height - 1);
    } else if (area.type === CoordinateType.PIXEL) {
      area = area.asType(CoordinateType.TILE);
    }
    for (let x = area.x1; x <= area.x2; x++) {
      for (let y = area.y1; y <= area.y2; y++) {
        const next = tiles.tiles[x][y];
        if (next > 0) {
          this.tiles[x][y] = next;
        }
      }
    }
    this.setDirty(true);
  }

  containsDirtyArea(x1: number, y1: number, x2: number, y2: number): boolean {
    if (this.dirtyAreas.length != 0) {
      for (let index = 0; index < this.dirtyAreas.length; index++) {
        const next = this.dirtyAreas[index];
        if (next.x1 > x2 || next.x2 < x1 || next.y1 > y2 || next.y2 < y1) {
          continue;
        }
        return true;
      }
    }
    return false;
  }

  static traceTiles(x1: number, y1: number, x2: number, y2: number): { x: number, y: number }[] {
    if (x1 < -1024 || x1 > 2048
      || y1 < -1024 || y1 > 2048
      || x2 < -1024 || x2 > 2048
      || y2 < -1024 || y2 > 2048) {
      return [];
    }
    if (x1 == x2 && y1 == y2) {
      if ((x1 < 0 || x1 > 1023 || y1 < 0 || y1 > 1023)) {
        return [];
      }
      return [{x: x1, y: y1}];
    }
    return this.tracePixels(x1 * 16, y1 * 16, x2 * 16, y2 * 16, true);
  }

  static tracePixels(x1: number, y1: number, x2: number, y2: number, limit: boolean = false): { x: number, y: number }[] {
    const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
      const a = x1 - x2;
      const b = y1 - y2;
      return Math.sqrt(a * a + b * b);
    };

    const distance = getDistance(x1, y1, x2, y2);
    if (distance === 0) {
      return [];
    }
    const lerpLength = distance * 2;

    if (lerpLength === 0 || isNaN(lerpLength) || !isFinite(lerpLength)) {
      return [];
    }
    const tiles: { x: number, y: number }[] = [];

    for (let index = 0; index <= lerpLength; index++) {
      const lerp = index / lerpLength;
      if (isNaN(lerpLength) || !isFinite(lerpLength)) {
        break;
      }
      const tile = {
        x: Math.floor(Path.lerp(x1, x2, lerp) / 16),
        y: Math.floor(Path.lerp(y1, y2, lerp) / 16)
      };
      if (limit && (tile.x < 0 || tile.x > 1023 || tile.y < 0 || tile.y > 1023)) {
        continue;
      }

      let found = false;
      for (let tIndex = 0; tIndex < tiles.length; tIndex++) {
        let next = tiles[tIndex];
        if (next.x === tile.x && next.y === tile.y) {
          found = true;
          break;
        }
      }

      if (!found) {
        tiles.push(tile);
      }
    }
    return tiles;
  }

  getTiles(copy: boolean = true): number[][] {
    return copy ? this.copy() : this.tiles;
  }

  /** @return {number} Returns the count of non-zero tiles. */
  getTileCount(): number {
    let count = 0;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.tiles[x][y] > 0) {
          count++;
        }
      }
    }
    return count;
  }

  static fromBuffer(buffer: Buffer): TileData {
    let offset = 0;
    let header = '';
    header += String.fromCharCode(buffer.readUInt8(offset++));
    header += String.fromCharCode(buffer.readUInt8(offset++));
    header += String.fromCharCode(buffer.readUInt8(offset++));
    header += String.fromCharCode(buffer.readUInt8(offset++));

    if (header !== 'STIL') {
      throw new Error('The TILEDATA buffer given is not a valid buffer.'
        + ' (Invalid header)');
    }

    const width = buffer.readUInt16LE(offset);
    offset += 2;

    if (width > 1024) {
      throw new Error(`The width of the TILEDATA buffer is too big. (max: 1024, given: ${width})`);
    } else if (width < 0) {
      throw new Error(`The width of the TILEDATA buffer is too small. (min: 1, given: ${width})`);
    }

    let height = buffer.readUInt16LE(offset);
    offset += 2;

    if (height > 1024) {
      throw new Error(`The height of the TILEDATA buffer is too big. (max: 1024, given: ${height})`);
    } else if (height < 0) {
      throw new Error(`The height of the TILEDATA buffer is too small. (min: 1, given: ${height})`);
    }

    const count = buffer.readUInt32LE(offset);
    offset += 4;

    // Make sure that the count is not negative.
    if (count < 0) {
      throw new Error('The tile-count of the TILEDATA buffer is negative.');
    }

    // Construct the expanded array to populate with tile data.
    const data: number[][] = [];
    for (let x = 0; x < width; x++) {
      data[x] = [];
      for (let y = 0; y < height; y++) {
        data[x][y] = 0;
      }
    }

    // If the TILEDATA is not empty, populate the data array.
    if (count !== 0) {
      for (let index = 0; index < count; index++) {
        const i = buffer.readInt32LE(offset);
        offset += 4;
        const tile = (i >> 24 & 0x00ff);
        const y = (i >> 12) & 0x03FF;
        const x = i & 0x03FF;
        data[x][y] = tile;
      }
    }

    return new TileData(data);
  }

  static toBuffer(data: TileData): Buffer {
    let tiles: Tile[] = [];
    // Go through and flatten the raw array into non-zero-based tile profiles.
    for (let y = 0; y < data.height; y++) {
      for (let x = 0; x < data.width; x++) {
        const next = data.tiles[x][y];
        if (next !== 0) {
          tiles.push({x: x, y: y, id: next});
        }
      }
    }

    // (Header) + (Number of tiles) + (Tiles)
    const buffer = Buffer.alloc(12 + (tiles.length * 4));
    let offset = 0;

    // Write the header.
    buffer.writeUInt8('S'.charCodeAt(0), offset++);
    buffer.writeUInt8('T'.charCodeAt(0), offset++);
    buffer.writeUInt8('I'.charCodeAt(0), offset++);
    buffer.writeUInt8('L'.charCodeAt(0), offset++);

    // Width of TileData.
    buffer.writeUInt16LE(data.width, offset);
    offset += 2;
    // Height of TileData.
    buffer.writeUInt16LE(data.height, offset);
    offset += 2;
    // Tile-Count of TileData.
    buffer.writeUInt32LE(tiles.length, offset);
    offset += 4;

    // Go through all tile profiles, convert them to values and store them in
    //   in the buffer.
    for (let index = 0; index < tiles.length; index++) {
      // Format the next tile to be stored in the buffer.
      const next = tiles[index];
      const int = ((next.id & 0x00ff) << 24) | ((next.y & 0x03FF) << 12) | (next.x & 0x03FF);
      // Write the next tile as a integer value.
      buffer.writeInt32LE(int, offset);
      offset += 4;
    }
    return buffer;
  }
}

interface Tile {
  x: number;
  y: number;
  id: number;
}
