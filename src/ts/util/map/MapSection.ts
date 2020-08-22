import MapArea from './MapArea';
import MapPoint from './MapPoint';
import CoordinateType from './CoordinateType';

/**
 * The <i>MapSection</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class MapSection {
  readonly bounds: MapArea;
  readonly array: boolean[][];
  readonly negate: boolean;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;

  /**
   * @param {number} x
   * @param {number} y
   * @param {boolean[][]} array
   * @param {boolean} invert
   */
  protected constructor(x: number, y: number, array: boolean[][], invert: boolean = false) {
    this.x = x;
    this.y = y;
    this.array = array;
    this.width = array.length;
    this.height = array[0].length;
    this.negate = invert;
    this.bounds = new MapArea(CoordinateType.TILE, x, y, x + this.width - 1, y + this.height - 1);
  }

  clone(): MapSection {
    // Deep-clone the array.
    const array: boolean[][] = [];
    for (let x = 0; x < this.width; x++) {
      array[x] = [];
      for (let y = 0; y < this.height; y++) {
        array[x][y] = this.array[x][y];
      }
    }
    return new MapSection(this.x, this.y, array, this.negate);
  }

  move(x: number, y: number): MapSection {
    let x1 = this.x + x;
    let y1 = this.y + y;
    let x2 = x1 + this.width - 1;
    let y2 = y1 + this.height - 1;
    if (x1 > 1023 || y1 > 1023 || x2 < 0 || y2 < 0) {
      return null;
    }

    let chopTop = y1 < 0;
    let chopLeft = x1 < 0;
    if (x1 < 0) {
      x1 = 0;
    }
    if (y1 < 0) {
      y1 = 0;
    }
    if (x2 > 1023) {
      x2 = 1023;
    }
    if (y2 > 1023) {
      y2 = 1023;
    }

    let calcWidth = x2 - x1 + 1;
    let calcHeight = y2 - y1 + 1;
    let xOffset = chopLeft ? -x1 : 0;
    let yOffset = chopTop ? -y1 : 0;
    const array: boolean[][] = [];
    for (let x = 0; x < calcWidth; x++) {
      array[x] = [];
      for (let y = 0; y < calcHeight; y++) {
        array[x][y] = this.array[x + xOffset][y + yOffset];
      }
    }
    return new MapSection(x1, y1, array, this.negate);
  }

  test(gx: number, gy: number): boolean {
    if (!this.contains(gx, gy)) {
      return false;
    }
    const result = this.array[gx - this.bounds.x1][gy - this.bounds.y1];
    return !this.negate ? result : !result;
  }

  contains(x: number, y: number): boolean {
    return this.bounds.contains(x, y);
  }

  /**
   * Creates a boxed MapSection.
   *
   * @param {number} x1 The 'X' coordinate. (Also the top-left 'X' coordinate)
   * @param {number} y1 The 'Y' coordinate. (Also the top-left 'Y' coordinate)
   * @param {number} x2 The bottom-right 'X' coordinate. (Optional)
   * @param {number} y2 The bottom-right 'Y' coordinate. (Optional)
   * @param invert
   */
  static box(x1: number, y1: number, x2: number = null, y2: number = null, invert: boolean = false): MapSection {
    const xMin = Math.min(x1, x2);
    const yMin = Math.min(y1, y2);
    const xMax = Math.max(x1, x2);
    const yMax = Math.max(y1, y2);
    const width = xMax - xMin + 1;
    const height = yMax - yMin + 1;
    const array = new Array(width);
    for (let x = 0; x < width; x++) {
      array[x] = new Array(height);
      for (let y = 0; y < height; y++) {
        array[x][y] = true;
      }
    }
    return new MapSection(xMin, yMin, array, invert);
  }

  static isPositive(sections: MapSection[], point: MapPoint): boolean {
    // If there are no sections to check, no space is positive.
    if (sections.length === 0) {
      return false;
    }
    // Make sure the coordinate type is set to tile.
    if (point.type !== CoordinateType.TILE) {
      point = point.asType(CoordinateType.TILE);
    }

    let result = false;
    for (let index = 0; index < sections.length; index++) {
      const next = sections[index];
      if (next.contains(point.x, point.y)) {
        if (next.test(point.x, point.y)) {
          result = !next.negate;
        } else {
          result = false;
        }
      }
    }
    return result;
  }

  static bounds(sections: MapSection[], positiveOnly: boolean = true): MapArea {
    let x1 = 1024, y1 = 1024;
    let x2 = -1, y2 = -1;

    for (let index = 0; index < sections.length; index++) {
      const next = sections[index];
      // If only positive space is requested for boundaries, ignore inverted
      //   sections.
      if (positiveOnly && next.negate) {
        continue;
      }
      const nx1 = next.x;
      const ny1 = next.y;
      const nx2 = next.x + next.width - 1;
      const ny2 = next.y + next.height - 1;

      if (nx1 < x1) {
        x1 = nx1;
      }
      if (ny1 < y1) {
        y1 = ny1;
      }
      if (nx2 < x1) {
        x1 = nx2;
      }
      if (ny2 < y1) {
        y1 = ny2;
      }
      if (nx1 > x2) {
        x2 = nx1;
      }
      if (ny1 > y2) {
        y2 = ny1;
      }
      if (nx2 > x2) {
        x2 = nx2;
      }
      if (ny2 > y2) {
        y2 = ny2;
      }
    }
    return new MapArea(CoordinateType.TILE, x1, y1, x2, y2);
  }
}
