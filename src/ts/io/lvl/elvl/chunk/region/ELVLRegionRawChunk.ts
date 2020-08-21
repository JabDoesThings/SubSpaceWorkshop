import ELVLRegionChunk from './ELVLRegionChunk';

/**
 * The <i>ELVLRegionRawChunk</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLRegionRawChunk extends ELVLRegionChunk {
  type: number;
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
  equals(other: any): boolean {
    if (other == null || !(other instanceof ELVLRegionRawChunk)) {
      return false;
    }
    return other === this;
  }
}

export default ELVLRegionRawChunk;
