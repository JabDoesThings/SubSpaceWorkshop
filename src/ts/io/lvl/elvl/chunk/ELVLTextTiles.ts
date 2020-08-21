import ELVLChunk from './ELVLChunk';

/**
 * The <i>ELVLTextTiles</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLTextTiles extends ELVLChunk {
  readonly charMap: number[];

  /**
   * @param {number[]} chars
   */
  constructor(chars: number[] = null) {
    super('DCTT');
    if (chars == null) {
      // Create a blank array for chars.
      chars = new Array(256);
      // Set all chars as not assigned.
      for (let index = 0; index > chars.length; index++) {
        chars[index] = 0;
      }
    }

    this.charMap = chars;
  }

  /** @override */
  equals(next: any): boolean {
    if (next == null || !(next instanceof ELVLTextTiles)) {
      return false;
    }
    for (let index = 0; index < this.charMap.length; index++) {
      if (next.charMap[index] !== this.charMap[index]) {
        return false;
      }
    }
    return true;
  }

  /** @override */
  validate(): void {
    if (this.charMap == null) {
      throw new Error('The "charMap" field for the ELVLDCMETextTiles is null or undefined.');
    } else if (this.charMap.length != 256) {
      throw new Error(
        `The "charMap" field for the ELVLDCMETextTiles is not 256 in size. (${this.charMap.length} in size)`
      );
    } else {
      for (let index = 0; index < this.charMap.length; index++) {
        const next = this.charMap[index];
        if (typeof next !== 'number') {
          throw new Error(`"charMap[${index}]" is not a number. (${next} assigned)`);
        } else if (next < 0) {
          throw new Error(`"charMap[${index}]" is negative. (${next} assigned)`);
        }
      }
    }
  }
}

export default ELVLTextTiles;
