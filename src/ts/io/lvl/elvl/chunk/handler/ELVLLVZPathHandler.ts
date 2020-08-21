import ELVLChunkHandler from './ELVLChunkHandler';
import ELVLLVZPath from '../ELVLLVZPath';

/**
 * The <i>ELVLLVZPathHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLLVZPathHandler extends ELVLChunkHandler<ELVLLVZPath> {

  constructor() {
    super('DCBM');
  }

  /** @override */
  read(buffer: Buffer): ELVLLVZPath {
    return new ELVLLVZPath(buffer);
  }

  /** @override */
  write(chunk: ELVLLVZPath): Buffer {
    return chunk.data;
  }
}

export default ELVLLVZPathHandler;
