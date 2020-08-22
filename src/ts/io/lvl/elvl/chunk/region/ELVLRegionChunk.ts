/**
 * The <i>ELVLRegionChunk</i> abstract class. TODO: Document.
 *
 * @author Jab
 */
export default abstract class ELVLRegionChunk {
  readonly id: string;

  /**
   * @param {string} id
   */
  protected constructor(id: string) {
    this.id = id;
  }
}
