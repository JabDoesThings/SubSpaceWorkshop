/**
 * The <i>TileEdit</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class TileEdit {
  readonly x: number;
  readonly y: number;
  readonly from: number;
  readonly to: number;

  /**
   * @param {number} x The 'X' coordinate of the tile to edit.
   * @param {number} y The 'Y' coordinate of the tile to edit.
   * @param {number} from The original ID of the tile.
   * @param {number} to The ID to set for the tile.
   */
  constructor(x: number, y: number, from: number, to: number) {
    if (x == null) {
      throw new Error('The x coordinate given is null or undefined.');
    }
    if (y == null) {
      throw new Error('The y coordinate given is null or undefined.');
    }
    if (from == null) {
      throw new Error('The "from" tile ID given is null or undefined.');
    }
    if (to == null) {
      throw new Error('The "to" tile ID given is null or undefined.');
    }
    this.x = x;
    this.y = y;
    this.from = from;
    this.to = to;
  }

  /** @override */
  toString(): string {
    return `{x: ${this.x}, y: ${this.y}, from: ${this.from}, to: ${this.to}}`;
  }
}
