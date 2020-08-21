import ELVLChunk from './ELVLChunk';

/**
 * The <i>ELVLAttribute</i> class. TODO: Document.
 *
 * @author Jab
 */
export class ELVLAttribute extends ELVLChunk {
  name: string;
  value: string;

  /**
   * @param {string} name
   * @param {string} value
   */
  constructor(name: string, value: string) {
    super('ATTR');
    this.name = name;
    this.value = value;
    this.validate();
  }

  /** @override */
  equals(next: any): boolean {
    if (next == null || !(next instanceof ELVLAttribute)) {
      return false;
    }
    return next.id == this.id && next.name == this.name && next.value == this.value;
  }

  /** @override */
  validate(): void {
    if (this.name == null) {
      throw new Error("The 'name' field of the ELVLAttribute is null or undefined.");
    } else if (this.value == null) {
      throw new Error("The 'value' field of the ELVLAttribute '" + this.name + "' is null or undefined.");
    }
  }
}

export default ELVLAttribute;
