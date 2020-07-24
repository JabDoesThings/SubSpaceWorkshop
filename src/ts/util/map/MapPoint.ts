import { CoordinateType } from './CoordinateType';

export class MapPoint {

  readonly type: CoordinateType;
  readonly x: number;
  readonly y: number;

  /**
   * @constructor
   *
   * @param {CoordinateType} type The type of coordinates stored.
   * @param {number} x The 'X' coordinate of the point on the map.
   * @param {number} y The 'Y' coordinate of the point on the map.
   */
  constructor(type: CoordinateType, x: number, y: number) {
    this.type = type;
    this.x = x;
    this.y = y;
  }

  mul(x: number, y: number): MapPoint {
    return new MapPoint(this.type, Math.floor(this.x * x), Math.floor(this.x * y));
  }

  div(x: number, y: number): MapPoint {
    return new MapPoint(this.type, Math.floor(this.x / x), Math.floor(this.y / y));
  }

  add(x: number, y: number): MapPoint {
    return new MapPoint(this.type, Math.floor(this.x + x), Math.floor(this.y + y));
  }

  sub(x: number, y: number): MapPoint {
    return new MapPoint(this.type, Math.floor(this.x - x), Math.floor(this.y - y),);
  }

  /**
   * Converts the Boundary coordinates to the specified coordinate type.
   *
   * @param {CoordinateType} type
   */
  asType(type: CoordinateType): MapPoint {
    if (type === CoordinateType.TILE) {
      if (this.type === CoordinateType.TILE) {
        return new MapPoint(CoordinateType.TILE, this.x, this.y);
      } else {
        let x = Math.floor(this.x / 16);
        let y = Math.floor(this.y / 16);
        return new MapPoint(CoordinateType.TILE, x, y);
      }
    } else if (type === CoordinateType.PIXEL) {
      if (this.type === CoordinateType.TILE) {
        let x = this.x * 16;
        let y = this.y * 16;
        return new MapPoint(CoordinateType.PIXEL, x, y);
      } else {
        return new MapPoint(CoordinateType.PIXEL, this.x, this.y);
      }
    }
  }
}
