import uuid = require('uuid');
import Unique from './Unique';

/**
 * The <i>UniqueObject</i> class. TODO: Document.
 *
 * @author Jab.
 */
export default abstract class UniqueObject implements Unique {
  private id: string;
  private name: string;

  /**
   * @param {string} name The decorative name of the object.
   * @param {string} id The internal ID of the object. If not provided, a UUID V4 is generated.
   */
  protected constructor(name: string, id: string = null) {
    this.name = name;
    if (id == null) {
      this.id = uuid.v4();
    } else {
      this.id = id;
    }
  }

  /** @override */
  public equals(other: Unique): boolean {
    return other != null
      && other instanceof UniqueObject
      && other.getId() === this.getId();
  }

  /** @override */
  public getName(): string {
    return this.name;
  }

  /** @override */
  public setName(name: string): void {
    this.name = name;
  }

  /** @override */
  public getId(): string {
    return this.id;
  }

  /** @override */
  public setId(id: string): void {
    this.id = id;
  }
}
