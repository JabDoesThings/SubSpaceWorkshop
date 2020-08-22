import ELVLChunk from './ELVLChunk';

/**
 * The <i>ELVLRawChunk</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ELVLRawChunk extends ELVLChunk {
  data: Buffer;

  /**
   * @param {string} id
   * @param {Buffer} data
   */
  constructor(id: string, data: Buffer) {
    super(id);
    this.data = data;
  }

  /** @override */
  equals(next: any): boolean {
    if (next == null || !(next instanceof ELVLRawChunk)) {
      return false;
    }
    return next === this;
  }

  /** @override */
  validate(): void {
    if (this.data == null) {
      throw new Error('The "data" field of the ELVLRawChunk is null or undefined.');
    }
  }
}
