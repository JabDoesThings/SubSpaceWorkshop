import ELVLRawChunk from './ELVLRawChunk';

/**
 * The <i>ELVLBookmarks</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLBookmarks extends ELVLRawChunk {

  /**
   * @param {Buffer} data
   */
  constructor(data: Buffer) {
    super('DCBM', data);
  }
}

export default ELVLBookmarks;
