import ELVLChunk from './ELVLChunk';

/**
 * The <i>ELVLDCMEHashCode</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class ELVLHashCode extends ELVLChunk {
  hashCode: string;

  /** @param {string} hashCode */
  constructor(hashCode: string) {
    super('DCID');
    if (hashCode == null) {
      throw new Error('The hashCode given is null or undefined.');
    }
    this.hashCode = hashCode;
  }

  /** @override */
  equals(next: any): boolean {
    if (next == null || !(next instanceof ELVLHashCode)) {
      return false;
    }
    return next.hashCode === this.hashCode;
  }

  /** @override */
  validate(): void {
    if (this.hashCode == null) {
      throw new Error('The "hashCode" field for the ELVLDCMEHashCode is null or undefined.');
    } else if (typeof this.hashCode !== 'string') {
      throw new Error(
        `The "hashCode" field for the ELVLDCMEHashCode is not a string. (${this.hashCode} assigned)`
      );
    }
  }
}
