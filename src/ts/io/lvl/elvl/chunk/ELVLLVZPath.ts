import ELVLRawChunk from './ELVLRawChunk';

/**
 * The <i>ELVLLVZPath</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ELVLLVZPath extends ELVLRawChunk {
  /** @param {Buffer} data */
  constructor(data: Buffer) {
    super('DCLV', data);
  }
}
