import ELVLChunk from '../ELVLChunk';

/**
 * The <i>ELVLChunkHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export default abstract class ELVLChunkHandler<C extends ELVLChunk> {
  id: string;

  protected constructor(id: string) {
    this.id = id;
  }

  abstract read(buffer: Buffer): C;

  abstract write(chunk: C): Buffer;
}
