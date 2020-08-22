/**
 * The <i>Selection</i> class. TODO: Document.
 *
 * @author Jab
 */
export default class Selection {
  type: string;
  id: number | string;

  /**
   * @param {string} type
   * @param {number | string} id
   */
  constructor(type: string, id: number | string) {
    this.type = type;
    this.id = id;
  }
}
