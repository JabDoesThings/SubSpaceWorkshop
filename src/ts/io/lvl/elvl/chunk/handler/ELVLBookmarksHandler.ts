import ELVLChunkHandler from './ELVLChunkHandler';
import ELVLBookmarks from '../ELVLBookmarks';

/**
 * The <i>ELVLBookmarksHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLBookmarksHandler extends ELVLChunkHandler<ELVLBookmarks> {

  constructor() {
    super('DCBM');
  }

  /** @override */
  read(buffer: Buffer): ELVLBookmarks {
    return new ELVLBookmarks(buffer);
  }

  /** @override */
  write(chunk: ELVLBookmarks): Buffer {
    return chunk.data;
  }
}

export default ELVLBookmarksHandler;
