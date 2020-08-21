/**
 * The <i>ELVLChunk</i> abstract class. TODO: Document.
 *
 * @author Jab
 */
export abstract class ELVLChunk {
  readonly id: string;

  /**
   * @param {string} id
   */
  protected constructor(id: string) {
    this.id = id;
  }

  abstract equals(next: any): boolean;

  abstract validate(): void;
}

export default ELVLChunk;
