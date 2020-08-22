import ELVLRegionChunk from '../../region/ELVLRegionChunk';

/**
 * The <i>ELVLRegionChunkHandler</i> class. TODO: Document.
 *
 * @author Jab
 */
export default abstract class ELVLRegionChunkHandler<C extends ELVLRegionChunk> {

  /** The unique ID of the region. */
  id: string;

  /**
   * @param {string} id The unique ID of the region.
   */
  protected constructor(id: string) {
    this.id = id;
  }

  /**
   * Reads the region bytes.
   *
   * @param buffer The bytes to read.
   */
  abstract read(buffer: Buffer): C;

  /**
   * Writes the region to bytes.
   *
   * @param chunk {? extends ELVLRegionChunk} The region chunk to write to bytes.
   */
  abstract write(chunk: C): Buffer;
}
