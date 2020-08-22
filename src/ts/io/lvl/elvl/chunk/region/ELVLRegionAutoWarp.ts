import ELVLRegionChunk from './ELVLRegionChunk';

/**
 * The <i>ELVLRegionAutoWarp<i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ELVLRegionAutoWarp extends ELVLRegionChunk {
  x: number;
  y: number;
  arena: string;

  /**
   * @constructor
   *
   * @param {number} x The 'x' coordinate to warp a player. If set to -1, this will be the player's current 'x'
   *   coordinate. If set to 0, the 'x' coordinate will be the player's spawn 'x' coordinate. If set to 1-1023, this
   *   will be the coordinate to warp to.
   *
   *  @param {number} y The 'y' coordinate to warp a player. If set to -1, this will be the player's current 'y'
   *   coordinate. If set to 0, the 'y' coordinate will be the player's spawn 'y' coordinate. If set to 1-1023, this
   *   will be the coordinate to warp to.
   *
   * @param {string} arena The arena name to warp to. Set to null not warp to a different arena.
   */
  constructor(x: number, y: number, arena: string = null) {
    super('rAWP');
    this.x = x;
    this.y = y;
    this.arena = arena;
    this.validate();
  }

  /** @override */
  validate(): void {
    if (this.x < -1) {
      throw new Error(`The "x" value given is less than -1. (${this.x} given)`);
    } else if (this.x > 1023) {
      throw new Error(`The "x" value given is greater than 1023. (${this.x} given)`);
    }
    if (this.y < -1) {
      throw new Error(`The "y" value given is less than -1. (${this.y} given)`);
    } else if (this.y > 1023) {
      throw new Error(`The "y" value given is greater than 1023. (${this.y} given)`);
    }
    if (this.arena != null) {
      if (this.arena.length > 16) {
        throw new Error('The "arena" string given is longer than 16 characters.');
      }
    }
  }
}
